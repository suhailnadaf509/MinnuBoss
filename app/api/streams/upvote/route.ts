import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
const UpvoteSchema = z.object({
  streamId: z.string(),
  voteType: z.enum(["upvote", "downvote"]),
});
export async function POST(req: Request) {
  const session = await getServerSession();
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }
  try {
    const { streamId, voteType } = UpvoteSchema.parse(await req.json());

    const existingVote = await prismaClient.upvote.findFirst({
      where: { userId: user.id, streamId },
    });

    if (existingVote) {
      if (existingVote.voteType == voteType)
        return NextResponse.json(
          { message: "You have already voted for this stream" },
          { status: 400 }
        );
      await prismaClient.upvote.update({
        where: { id: existingVote.id },
        data: { voteType },
      });
      return NextResponse.json({ message: "Vote updated" });
    }
    await prismaClient.upvote.create({
      data: {
        userId: user.id,
        streamId,
        voteType,
      },
    });
    return NextResponse.json({
      message: "done",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "error while upvoting" },
      { status: 403 }
    );
  }
}
