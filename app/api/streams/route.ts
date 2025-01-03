import { prismaClient } from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";

// YouTube URL regex pattern
const YOUTUBE_REGEX =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

// Enhanced schema with validation
const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

// Helper to process thumbnails
function processThumbnails(thumbnails: Array<{ width: number; url: string }>) {
  if (!thumbnails?.length) {
    return {
      smallImg: "https://i.postimg.cc/rFRpNCW4/logo.jpg",
      bigImg: "https://i.postimg.cc/rFRpNCW4/logo.jpg",
    };
  }

  const sortedThumbnails = [...thumbnails].sort((a, b) => a.width - b.width);
  return {
    smallImg:
      sortedThumbnails.length > 1
        ? sortedThumbnails[sortedThumbnails.length - 2].url
        : sortedThumbnails[0].url,
    bigImg: sortedThumbnails[sortedThumbnails.length - 1].url,
  };
}

export async function POST(req: Request) {
  try {
    // Validate request data
    const data = CreateStreamSchema.parse(await req.json());

    // Validate YouTube URL
    const ytMatch = data.url.match(YOUTUBE_REGEX);
    if (!ytMatch) {
      return NextResponse.json(
        {
          message: "Invalid YouTube URL",
        },
        {
          status: 400,
        }
      );
    }

    const extractedId = ytMatch[1];

    // Fetch video details with error handling
    let videoDetails;
    try {
      videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);
      if (!videoDetails?.thumbnail?.thumbnails) {
        throw new Error("Invalid video details response");
      }
    } catch (ytError) {
      console.error("YouTube API Error:", ytError);
      return NextResponse.json(
        {
          message: "Failed to fetch video details",
        },
        {
          status: 400,
        }
      );
    }

    // Process thumbnails
    const { smallImg, bigImg } = processThumbnails(
      videoDetails.thumbnail.thumbnails
    );

    // Create stream record
    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: videoDetails.title || "Untitled Video",
        active: true,
        smallImg,
        bigImg,
      },
    });

    return NextResponse.json({
      ...stream,
      hasUpvoted: false,
      upvotes: 0,
    });
  } catch (error) {
    console.error("Stream creation error:", error);

    return NextResponse.json(
      {
        message: "Failed to create stream",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const creatorId = req.nextUrl.searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json(
        {
          message: "Creator ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const streams = await prismaClient.stream.findMany({
      where: {
        userId: creatorId,
      },
    });

    return NextResponse.json(streams);
  } catch (error) {
    console.error("Stream fetch error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch streams",
      },
      {
        status: 500,
      }
    );
  }
}
