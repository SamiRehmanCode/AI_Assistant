import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import Feedback from "@/lib/models/Feedback";
import Message from "@/lib/models/Message";
import { getUserByEmail } from "@/lib/user-service";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const messageId = typeof body.messageId === "string" ? body.messageId : "";
  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? body.rating
      : undefined;
  const correctness =
    typeof body.correctness === "boolean" ? body.correctness : undefined;
  const length =
    body.length === "short" || body.length === "ok" || body.length === "long"
      ? body.length
      : undefined;

  if (!messageId || !isValidObjectId(messageId)) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  await connectDb();

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const message = await Message.findOne({ _id: messageId, userId: user._id });
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const feedback = await Feedback.findOneAndUpdate(
    { messageId: message._id, userId: user._id },
    {
      rating,
      correctness,
      length,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return NextResponse.json({
    feedback: {
      rating: feedback.rating ?? undefined,
      correctness: feedback.correctness ?? undefined,
      length: feedback.length ?? undefined,
    },
  });
}
