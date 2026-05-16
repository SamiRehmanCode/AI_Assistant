"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-9 w-24 rounded-full bg-slate-800/60 animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-medium hover:bg-emerald-400 transition-colors"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="h-8 w-8 rounded-full border border-slate-700"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-slate-700" />
        )}
        <span className="text-sm text-slate-200 hidden sm:inline">
          {session.user.name || "User"}
        </span>
      </div>
      <button
        onClick={() => signOut()}
        className="px-3 py-1.5 text-xs rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
