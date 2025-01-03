import { Appbar } from "./components/Appbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Music2 } from "lucide-react";

import { Redirect } from "./components/Redirect";
export default function Home() {
  return (
    <main>
      <Appbar />
      <Redirect />

      <section className="py-12">
        <div className="container px-4 mx-auto">
          <Card className="w-full max-w-3xl mx-auto border-amber-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">Currently Playing</h2>
                  <p className="text-gray-500">Vote on the current track</p>
                </div>
                <Music2 className="w-8 h-8 text-amber-600 animate-bounce" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-lg bg-amber-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Song Title</h3>
                      <p className="text-sm text-gray-500">Artist Name</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="hover:bg-green-100 hover:text-green-700"
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        className="hover:bg-red-100 hover:text-red-700"
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Queue Section */}
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center">Coming Up Next</h2>
            {[1, 2, 3].map((item) => (
              <Card
                key={item}
                className="border-amber-100 hover:border-amber-200 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Upcoming Song {item}</h3>
                        <p className="text-sm text-gray-500">Future Artist</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Votes: +42</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:text-green-700"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:text-red-700"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
