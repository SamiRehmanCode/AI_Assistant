import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import Message from "@/lib/models/Message";
import Feedback from "@/lib/models/Feedback";
import { getUserByEmail } from "@/lib/user-service";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  if (!isValidObjectId(sessionId)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  await connectDb();

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const sessionDoc = await ChatSession.findOne({
    _id: sessionId,
    userId: user._id,
  }).lean();

  if (!sessionDoc) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const messages = await Message.find({ sessionId: sessionDoc._id })
    .sort({ sequence: 1 })
    .lean();

  const messageIds = messages.map((msg) => msg._id);
  const feedbacks = messageIds.length
    ? await Feedback.find({
        userId: user._id,
        messageId: { $in: messageIds },
      }).lean()
    : [];

  const feedbackMap = new Map(
    feedbacks.map((feedback) => [String(feedback.messageId), feedback]),
  );

  const payloadMessages = messages.map((message) => {
    const feedback = feedbackMap.get(String(message._id));
    return {
      id: String(message._id),
      role: message.role,
      content: message.content,
      model: message.model,
      timestamp: message.createdAt,
      pending: false,
      latencyMs: message.latencyMs,
      topicTags: message.topicTags || [],
      feedback: feedback
        ? {
            rating: feedback.rating ?? undefined,
            correctness: feedback.correctness ?? undefined,
            length: feedback.length ?? undefined,
          }
        : undefined,
    };
  });

  return NextResponse.json({
    session: {
      id: String(sessionDoc._id),
      title: sessionDoc.title,
      modelId: sessionDoc.modelId,
      createdAt: sessionDoc.createdAt,
      updatedAt: sessionDoc.updatedAt,
    },
    messages: payloadMessages,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  if (!isValidObjectId(sessionId)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  await connectDb();

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const sessionDoc = await ChatSession.findOne({
    _id: sessionId,
    userId: user._id,
  }).lean();

  if (!sessionDoc) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const messages = await Message.find({ sessionId: sessionDoc._id })
    .select({ _id: 1 })
    .lean();

  const messageIds = messages.map((message) => message._id);

  if (messageIds.length) {
    await Feedback.deleteMany({ messageId: { $in: messageIds } });
  }

  await Message.deleteMany({ sessionId: sessionDoc._id });
  await ChatSession.deleteOne({ _id: sessionDoc._id });

  return NextResponse.json({ ok: true });
}
