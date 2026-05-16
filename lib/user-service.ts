import User from "@/lib/models/User";
import { connectDb } from "@/lib/db";

export async function upsertUser(params: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  provider?: string;
}) {
  if (!params.email) {
    throw new Error("User email is required");
  }

  await connectDb();

  const updated = await User.findOneAndUpdate(
    { email: params.email.toLowerCase() },
    {
      name: params.name || undefined,
      image: params.image || undefined,
      provider: params.provider || undefined,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return updated;
}

export async function getUserByEmail(email: string) {
  await connectDb();
  return User.findOne({ email: email.toLowerCase() });
}
