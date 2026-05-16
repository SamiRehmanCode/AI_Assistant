"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-md w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Sign in to continue</h1>
        <p className="text-sm text-slate-400 mt-2">
          Use Google to access your chat sessions and analytics dashboard.
        </p>
        <button
          onClick={() => signIn("google")}
          className="mt-6 w-full px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
