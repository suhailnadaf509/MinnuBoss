import { prismaClient } from "@/app/lib/db";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await prismaClient.user.findFirst({
      where: {
        email: session?.user?.email ?? "",
      },
    });
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const streams = await prismaClient.stream.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        upvotes: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    return NextResponse.json({
      streams: streams.map(({ _count, ...rest }) => ({
        ...rest,
        upvotes: _count.upvotes,
        haveUpvoted: rest.upvotes.length ? true : false,
      })),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
