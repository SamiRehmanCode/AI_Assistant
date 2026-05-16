import Link from "next/link";
import { Fraunces, Space_Grotesk } from "next/font/google";
import AnalyticsDashboard from "@/components/analytics-dashboard";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export default function AnalyticsPage() {
  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_45%),radial-gradient(circle_at_30%_40%,_rgba(251,146,60,0.2),_transparent_55%)] bg-slate-50 text-slate-900`}
    >
      <div className="max-w-6xl mx-auto px-6 py-10 font-[var(--font-body)]">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Analytics suite
              </span>
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-[var(--font-display)] text-slate-900">
              Conversation intelligence dashboard
            </h1>
            <p className="mt-3 text-sm md:text-base text-slate-500 max-w-2xl">
              Track topic performance, response accuracy, and session dynamics
              with real-time MongoDB analytics and feedback signals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors"
            >
              Back to chat
            </Link>
          </div>
        </header>

        <section className="mt-10">
          <AnalyticsDashboard />
        </section>
      </div>
    </div>
  );
}
