"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  avgMs: { label: "Avg response", color: "#0f766e" },
  avgRating: { label: "Avg rating", color: "#d97706" },
  accuracyRate: { label: "Accuracy", color: "#0ea5e9" },
};

type AnalyticsResponse = {
  totals: {
    sessions: number;
    messages: number;
    avgResponseMs: number;
    avgRating: number;
    accuracyRate: number;
  };
  topicPerformance: {
    topic: string;
    messages: number;
    avgRating: number;
    accuracyRate: number;
  }[];
  positionPerformance: {
    position: "start" | "middle" | "end";
    messages: number;
    avgRating: number;
    accuracyRate: number;
  }[];
  responseTimeTrend: { day: string; avgMs: number; count: number }[];
  recentFeedback: {
    messageId: string;
    rating?: number;
    correctness?: boolean;
    length?: string;
    createdAt: string;
    topicTags?: string[];
    latencyMs?: number;
    snippet?: string;
  }[];
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [focus, setFocus] = useState<"rating" | "accuracy">("rating");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/analytics")
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load analytics");
        }
        return res.json();
      })
      .then((payload) => {
        if (active) {
          setData(payload);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Sign in to view analytics.");
          setData(null);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const topicData = useMemo(
    () =>
      (data?.topicPerformance || []).map((entry) => ({
        ...entry,
        accuracyRate: Math.round(entry.accuracyRate * 100),
      })),
    [data],
  );
  const positionData = useMemo(
    () =>
      (data?.positionPerformance || []).map((entry) => ({
        ...entry,
        accuracyRate: Math.round(entry.accuracyRate * 100),
      })),
    [data],
  );
  const responseData = useMemo(
    () =>
      (data?.responseTimeTrend || []).map((entry) => ({
        ...entry,
        avgMs: Math.round(entry.avgMs),
      })),
    [data],
  );

  const stats = data?.totals;

  if (error) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-2 border-0 bg-white/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-[var(--font-display)] text-slate-800">
              Conversation pulse
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Sessions
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {stats?.sessions ?? 0}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Messages
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {stats?.messages ?? 0}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Avg response
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {stats ? `${Math.round(stats.avgResponseMs)}ms` : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Accuracy
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {stats ? `${Math.round(stats.accuracyRate * 100)}%` : "-"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3 border-0 bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-[var(--font-display)] text-slate-800">
              Response time trend
            </CardTitle>
            <div className="text-xs text-slate-500">Last 30 days</div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-44">
              <LineChart data={responseData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="avgMs"
                  stroke="var(--color-avgMs)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-[var(--font-display)] text-slate-900">
            Performance breakouts
          </h2>
          <p className="text-sm text-slate-500">
            Topic momentum, accuracy, and session positioning.
          </p>
        </div>
        <div className="flex gap-2 rounded-full bg-white/80 p-1 shadow-sm">
          <button
            onClick={() => setFocus("rating")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              focus === "rating" ? "bg-slate-900 text-white" : "text-slate-500"
            }`}
          >
            Rating focus
          </button>
          <button
            onClick={() => setFocus("accuracy")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              focus === "accuracy"
                ? "bg-slate-900 text-white"
                : "text-slate-500"
            }`}
          >
            Accuracy focus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg font-[var(--font-display)] text-slate-800">
              Topic performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-60">
              <BarChart data={topicData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="topic" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey={focus === "rating" ? "avgRating" : "accuracyRate"}
                  fill={
                    focus === "rating"
                      ? "var(--color-avgRating)"
                      : "var(--color-accuracyRate)"
                  }
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg font-[var(--font-display)] text-slate-800">
              Session positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-60">
              <BarChart data={positionData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="position" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey={focus === "rating" ? "avgRating" : "accuracyRate"}
                  fill={
                    focus === "rating"
                      ? "var(--color-avgRating)"
                      : "var(--color-accuracyRate)"
                  }
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-white/80">
        <CardHeader>
          <CardTitle className="text-lg font-[var(--font-display)] text-slate-800">
            Recent feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Correctness</TableHead>
                <TableHead>Length</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.recentFeedback || []).map((row) => (
                <TableRow key={row.messageId}>
                  <TableCell className="max-w-[240px] text-slate-700">
                    {row.snippet || "-"}
                  </TableCell>
                  <TableCell>{row.rating ?? "-"}</TableCell>
                  <TableCell>
                    {row.correctness === true
                      ? "Correct"
                      : row.correctness === false
                        ? "Incorrect"
                        : "-"}
                  </TableCell>
                  <TableCell>{row.length || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(row.topicTags || []).map((tag) => (
                        <Badge
                          key={`${row.messageId}-${tag}`}
                          variant="secondary"
                          className="bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.latencyMs ? `${Math.round(row.latencyMs)}ms` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
