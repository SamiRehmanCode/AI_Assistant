import mongoose, { Schema } from "mongoose";

const FeedbackSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true },
    rating: { type: Number, min: 1, max: 5 },
    correctness: { type: Boolean },
    length: { type: String, enum: ["short", "ok", "long"] },
  },
  { timestamps: true },
);

FeedbackSchema.index({ messageId: 1, userId: 1 }, { unique: true });

export type FeedbackDocument = mongoose.InferSchemaType<typeof FeedbackSchema>;

const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

export default Feedback;
