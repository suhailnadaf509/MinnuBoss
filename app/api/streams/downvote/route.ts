import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
const UpvoteSchema = z.object({
  streamId: z.string(),
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
    const data = UpvoteSchema.parse(await req.json());
    await prismaClient.upvote.delete({
      where: {
        streamId_userId: {
          userId: user.id,
          streamId: data.streamId,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "error while downvoting" },
      { status: 403 }
    );
  }
}
