"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ThumbsUp,
  ThumbsDown,
  Music2,
  PawPrintIcon as Paw,
} from "lucide-react";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

export function Appbar() {
  const session = useSession();
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <div className="flex justify-between bg-amber-100 px-10">
        <div className="text-sm">MinnuBoss</div>
        <div>
          {!session.data?.user && (
            <button
              className="m-2 p-2 bg-amber-600 hover:bg-amber-700 rounded-xl  text-white text-2xl"
              onClick={() => signIn()}
            >
              Signin
            </button>
          )}
          {session.data?.user && (
            <button
              className="m-2 p-2 bg-amber-200 hover:bg-amber-400"
              onClick={() => signOut()}
            >
              logout
            </button>
          )}
        </div>
      </div>
      <section className="relative overflow-hidden bg-amber-100">
        <div className="container px-4 py-12 mx-auto">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-200">
                <Paw className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-medium text-amber-700">
                  Purrfect Music Selection
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Let Minnu <span className="text-amber-600">Choose</span> Your
                Tunes
              </h1>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Democracy meets feline intuition. Vote on songs and let our
                ginger mascot guide your musical journey.
              </p>
              <Button className="bg-amber-600 hover:bg-amber-700">
                Start Voting
              </Button>
            </div>
            <div className="relative aspect-square">
              <div className="absolute inset-0 rounded-full bg-amber-200/50 animate-pulse" />
              <Image
                src="/logo.jpg"
                alt="Ginger cat mascot"
                width={500}
                height={500}
                className="relative rounded-full shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
