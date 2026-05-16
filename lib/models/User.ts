import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String },
    provider: { type: String },
  },
  { timestamps: true }
);

export type UserDocument = mongoose.InferSchemaType<typeof UserSchema>;

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
