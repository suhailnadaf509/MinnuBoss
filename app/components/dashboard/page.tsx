"use client";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ThumbsUp,
  ThumbsDown,
  PawPrintIcon as Paw,
  Share2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { toast } from "@/hooks/use-toast";
// Helper function to extract video ID from YouTube URL

function getYouTubeVideoId(url: string) {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
interface VideoItem {
  id: string;
  type: string;
  url: string;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  active: boolean;
  userId: string;
  upvotes: number;
  haveUpvoted: boolean;
  haveDownvoted: boolean;
}
const Refresh_Interval = 20 * 1000;
export default function CatMusicQueue() {
  const [userId, setUserId] = useState<string | null>(null); // New state for userId

  const [userName, setUserName] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [currentVideo, setCurrentVideo] = useState<string>("dQw4w9WgXcQ"); // Default video
  const [isLoading, setIsLoading] = useState(true);
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const fetchStreams = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/streams/my", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to view your streams",
          variant: "destructive",
        });
        return;
      }

      if (res.status === 404) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      if (!res.ok)
        throw new Error(`Failed to fetch streams: ${res.statusText}`);

      const { streams, userVotes } = await res.json(); // Destructure to get the streams array
      console.log("Received streams:", streams);
      console.log("Received user votes:", userVotes);

      if (!Array.isArray(streams)) {
        console.error("Streams is not an array:", streams);
        setQueue([]);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Invalid data format received from server",
          variant: "destructive",
        });
        return;
      }
      const updatedStreams = streams.map((stream) => {
        const userVote = userVotes?.find(
          (vote: { streamId: string; voteType: string }) =>
            vote.streamId === stream.id
        );
        return {
          ...stream,
          voteType: userVote?.voteType || null, // Add voteType or null if no vote exists
        };
      });

      const sortedData = [...updatedStreams].sort(
        (a, b) => b.upvotes - a.upvotes
      );
      setQueue(sortedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching streams:", error);
      setQueue([]);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to load streams. Please try again.",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, Refresh_Interval);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    // Simulate fetching user data from API
    const fetchUserData = async () => {
      try {
        const session = await getSession(); // Fetch session data
        console.log("Session Data:", session); // Debug response
        setUserName(session?.user?.email || "user");
        setUserId(session?.user?.id || null); // Use email or fallback
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };

    fetchUserData();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to add videos to the queue",
        variant: "destructive",
      });
      return;
    }
    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/streams/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          url: videoUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to add stream");

      await fetchStreams(); // Refresh the queue
      setVideoUrl("");
      toast({
        title: "Success",
        description: "Video added to queue!",
      });
    } catch (error) {
      console.error("Error adding stream:", error);
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (
    id: string,
    increment: number,
    isUpvote: boolean
  ) => {
    try {
      const updatedQueue = queue.map((item) =>
        item.id === id
          ? {
              ...item,
              upvotes: item.upvotes + increment,
              haveUpvoted: isUpvote ? true : item.haveUpvoted, // Track upvote
              haveDownvoted: !isUpvote ? true : item.haveDownvoted, // Track downvote
            }
          : item
      );

      setQueue(updatedQueue.sort((a, b) => b.upvotes - a.upvotes));

      const upvotes = updatedQueue.find((item) => item.id === id)?.upvotes ?? 0;

      const res = await fetch("/api/streams/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId: id, upvotes }),
      });

      if (!res.ok) throw new Error("Failed to update vote");
    } catch (error) {
      console.error("Error updating vote:", error);
      toast({
        title: "Error",
        description: "Failed to update vote. Please try again.",
        variant: "destructive",
      });
      fetchStreams(); // Sync with the backend
    }
  };

  const usernames = userName.split("@")[0];
  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Ginger Cat Radio",
        text: "Join me in the Ginger Cat Radio! Vote for your favorite songs!",
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard if Web Share API is not available
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The page URL has been copied to your clipboard.",
      });
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-orange-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Cat ears decoration */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl">
        <div className="relative w-full">
          <div className="absolute -top-2 -left-8 w-16 h-16 bg-orange-200 rounded-full transform -rotate-45"></div>
          <div className="absolute -top-2 -right-8 w-16 h-16 bg-orange-200 rounded-full transform rotate-45"></div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto pt-20 px-4 space-y-8">
        {/* Share Button */}
        <div className="absolute top-4 right-4 md:right-8">
          <Button
            onClick={handleShare}
            variant="ghost"
            size="icon"
            className="bg-white/80 hover:bg-white shadow-sm"
          >
            <Share2 className="w-5 h-5 text-orange-600" />
            <span className="sr-only">Share</span>
          </Button>
        </div>

        <div className="text-2xl text-orange-700 font-medium mb-6 text-center">
          Welcome back, {usernames}! 🐱
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-800 flex items-center justify-center gap-2">
            <Paw className="w-8 h-8" />
            Ginger Cat Radio
            <Paw className="w-8 h-8" />
          </h1>
          <p className="text-orange-600 mt-2">Purr-fect Music Selection</p>
        </div>

        {/* Current Video Player */}
        <Card className="p-4 bg-white/80 backdrop-blur shadow-xl">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentVideo}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
        </Card>

        {/* Video Submission */}
        <Card className="p-4 bg-white/80 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-orange-800">
              Add to Queue
            </h2>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Paste YouTube URL here..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSubmit}
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
              >
                Add
              </Button>
            </div>
            {videoUrl && getYouTubeVideoId(videoUrl) && (
              <div className="aspect-video w-full max-w-sm mx-auto">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                    videoUrl
                  )}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            )}
          </form>
        </Card>

        {/* Queue */}
        <Card className="p-4 bg-white/80 backdrop-blur">
          <h2 className="text-xl font-semibold text-orange-800 mb-4">Queue</h2>
          <div className="space-y-4">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-white"
              >
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleVote(item.id, 1, item.haveUpvoted ? false : true)
                    }
                    disabled={item.haveUpvoted || item.haveDownvoted} // Disable if the user has voted (upvoted or downvoted)
                    className={`text-orange-500 hover:text-orange-600 hover:bg-orange-50 p-2 h-auto ${
                      item.haveUpvoted || item.haveDownvoted
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <ThumbsUp className="w-8 h-8" />
                  </Button>
                  <span className="font-bold text-orange-800 text-lg">
                    {item.upvotes}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleVote(item.id, -1, item.haveDownvoted ? false : true)
                    }
                    disabled={item.haveDownvoted || item.haveUpvoted} // Disable if the user has voted (downvoted or upvoted)
                    className={`text-orange-500 hover:text-orange-600 hover:bg-orange-50 p-2 h-auto ${
                      item.haveDownvoted || item.haveUpvoted
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <ThumbsDown className="w-8 h-8" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  {item.smallImg ? (
                    <img
                      src={item.smallImg}
                      alt={`Thumbnail for ${item.title}`}
                      className="w-full max-w-[200px] rounded-lg"
                    />
                  ) : (
                    <div className="aspect-video w-full max-w-[200px] bg-gray-100 flex items-center justify-center rounded-lg">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-orange-800 truncate">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cat tail decoration */}
        <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-16 h-32 bg-orange-200 rounded-tl-full"></div>
        </div>
      </div>
    </div>
  );
}
