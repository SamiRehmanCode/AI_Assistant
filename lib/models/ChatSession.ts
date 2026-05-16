import mongoose, { Schema } from "mongoose";

const ChatSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New chat", trim: true },
    modelId: { type: String },
  },
  { timestamps: true },
);

ChatSessionSchema.index({ userId: 1, updatedAt: -1 });

export type ChatSessionDocument = mongoose.InferSchemaType<
  typeof ChatSessionSchema
>;

const ChatSession =
  mongoose.models.ChatSession ||
  mongoose.model("ChatSession", ChatSessionSchema);

export default ChatSession;
