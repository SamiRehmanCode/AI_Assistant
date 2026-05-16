import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
    model: { type: String },
    sequence: { type: Number, required: true },
    latencyMs: { type: Number },
    topicTags: { type: [String], default: [] },
  },
  { timestamps: true },
);

MessageSchema.index({ sessionId: 1, sequence: 1 });
MessageSchema.index({ userId: 1, createdAt: -1 });

export type MessageDocument = mongoose.InferSchemaType<typeof MessageSchema>;

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
