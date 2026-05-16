import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import Message from "@/lib/models/Message";
import { getUserByEmail } from "@/lib/user-service";
import { getOpenAIClient } from "@/lib/openai";
import { tagTopics } from "@/lib/topic-tagging";

const DEFAULT_MODEL = "gpt-4o-mini";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const model = typeof body.model === "string" ? body.model : DEFAULT_MODEL;
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";

  if (!content) {
    return NextResponse.json(
      { error: "Message content is required" },
      { status: 400 },
    );
  }

  await connectDb();

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let sessionDoc = null;
  if (sessionId) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }
    sessionDoc = await ChatSession.findOne({
      _id: sessionId,
      userId: user._id,
    });
  }

  if (!sessionDoc) {
    sessionDoc = await ChatSession.create({
      userId: new mongoose.Types.ObjectId(user._id),
      title: "New chat",
      modelId: model,
    });
  }

  const lastMessage = await Message.findOne({ sessionId: sessionDoc._id })
    .sort({ sequence: -1 })
    .select({ sequence: 1 })
    .lean();

  const nextSequence = lastMessage ? lastMessage.sequence + 1 : 0;

  const userMessage = await Message.create({
    userId: new mongoose.Types.ObjectId(user._id),
    sessionId: new mongoose.Types.ObjectId(sessionDoc._id),
    role: "user",
    content,
    sequence: nextSequence,
  });

  const historyDocs = await Message.find({ sessionId: sessionDoc._id })
    .sort({ sequence: -1 })
    .limit(20)
    .lean();

  const history = historyDocs
    .reverse()
    .map((message) => ({ role: message.role, content: message.content }));

  const client = getOpenAIClient();
  const startTime = Date.now();

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. Respond clearly, concisely, and use Markdown when useful.",
      },
      ...history,
    ],
    temperature: 0.5,
    max_tokens: 300,
    top_p: 0.8,
    frequency_penalty: 0.2,
  });

  const latencyMs = Date.now() - startTime;
  const assistantContent =
    response.choices[0]?.message?.content?.trim() ||
    "I'm sorry, I couldn't generate a response.";

  let topicTags: string[] = [];
  try {
    topicTags = await tagTopics(
      `User: ${content}\nAssistant: ${assistantContent}`,
    );
  } catch {
    topicTags = [];
  }

  const assistantMessage = await Message.create({
    userId: new mongoose.Types.ObjectId(user._id),
    sessionId: new mongoose.Types.ObjectId(sessionDoc._id),
    role: "assistant",
    content: assistantContent,
    model,
    sequence: nextSequence + 1,
    latencyMs,
    topicTags,
  });

  if (!sessionDoc.title || sessionDoc.title === "New chat") {
    sessionDoc.title = content.slice(0, 40) || "New chat";
  }
  sessionDoc.modelId = model;
  sessionDoc.updatedAt = new Date();
  await sessionDoc.save();

  return NextResponse.json({
    session: {
      id: String(sessionDoc._id),
      title: sessionDoc.title,
      modelId: sessionDoc.modelId,
      createdAt: sessionDoc.createdAt,
      updatedAt: sessionDoc.updatedAt,
    },
    userMessage: {
      id: String(userMessage._id),
      role: userMessage.role,
      content: userMessage.content,
      model: userMessage.model,
      timestamp: userMessage.createdAt,
      pending: false,
    },
    assistantMessage: {
      id: String(assistantMessage._id),
      role: assistantMessage.role,
      content: assistantMessage.content,
      model: assistantMessage.model,
      timestamp: assistantMessage.createdAt,
      pending: false,
      latencyMs: assistantMessage.latencyMs,
      topicTags: assistantMessage.topicTags || [],
    },
  });
}
