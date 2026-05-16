import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import Message from "@/lib/models/Message";
import { getUserByEmail } from "@/lib/user-service";

function trimSummary(value: string | null | undefined) {
  if (!value) return "";
  return value.length > 60 ? `${value.slice(0, 60)}...` : value;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ sessions: [] }, { status: 200 });
  }

  await connectDb();

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ sessions: [] }, { status: 200 });
  }

  const sessions = await ChatSession.find({ userId: user._id })
    .sort({ updatedAt: -1 })
    .lean();

  const sessionIds = sessions.map((doc) => doc._id);

  const lastMessages = sessionIds.length
    ? await Message.aggregate([
        { $match: { sessionId: { $in: sessionIds } } },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: "$sessionId",
            lastMessage: { $last: "$content" },
            messageCount: { $sum: 1 },
          },
        },
      ])
    : [];

  const lastMessageMap = new Map(
    lastMessages.map((entry) => [String(entry._id), entry]),
  );

  const payload = sessions.map((doc) => {
    const summaryEntry = lastMessageMap.get(String(doc._id));
    return {
      id: String(doc._id),
      title: doc.title,
      modelId: doc.modelId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      summary: trimSummary(summaryEntry?.lastMessage),
      messageCount: summaryEntry?.messageCount ?? 0,
    };
  });

  return NextResponse.json({ sessions: payload });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title : "New chat";
  const modelId = typeof body.modelId === "string" ? body.modelId : undefined;

  await connectDb();

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const created = await ChatSession.create({
    userId: new mongoose.Types.ObjectId(user._id),
    title,
    modelId,
  });

  return NextResponse.json({
    session: {
      id: String(created._id),
      title: created.title,
      modelId: created.modelId,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      summary: "",
      messageCount: 0,
    },
  });
}
