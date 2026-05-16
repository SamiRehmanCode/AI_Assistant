"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type FeedbackState = {
  rating?: number;
  correctness?: boolean;
  length?: "short" | "ok" | "long";
};

export default function FeedbackPanel({
  messageId,
  initialFeedback,
}: {
  messageId: string;
  initialFeedback?: FeedbackState;
}) {
  const [rating, setRating] = useState<number | undefined>(
    initialFeedback?.rating,
  );
  const [correctness, setCorrectness] = useState<boolean | undefined>(
    initialFeedback?.correctness,
  );
  const [length, setLength] = useState<"short" | "ok" | "long" | undefined>(
    initialFeedback?.length,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setRating(initialFeedback?.rating);
    setCorrectness(initialFeedback?.correctness);
    setLength(initialFeedback?.length);
  }, [
    initialFeedback?.rating,
    initialFeedback?.correctness,
    initialFeedback?.length,
  ]);

  const saveFeedback = async (next: FeedbackState) => {
    setIsSaving(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, ...next }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRating = (value: number) => {
    if (value === rating) return;
    setRating(value);
    saveFeedback({ rating: value, correctness, length });
  };

  const handleCorrectness = (value: boolean) => {
    if (value === correctness) return;
    setCorrectness(value);
    saveFeedback({ rating, correctness: value, length });
  };

  const handleLength = (value: "short" | "ok" | "long") => {
    if (value === length) return;
    setLength(value);
    saveFeedback({ rating, correctness, length: value });
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleRating(value)}
            className={`transition-colors ${
              rating && value <= rating ? "text-amber-400" : "text-slate-500"
            }`}
            disabled={isSaving}
            aria-label={`Rate ${value}`}
          >
            <Star className="h-4 w-4" fill="currentColor" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleCorrectness(true)}
          className={`px-2 py-1 rounded-full border text-[11px] transition-colors ${
            correctness === true
              ? "border-emerald-400 text-emerald-300"
              : "border-slate-700 text-slate-400"
          }`}
          disabled={isSaving}
        >
          Correct
        </button>
        <button
          type="button"
          onClick={() => handleCorrectness(false)}
          className={`px-2 py-1 rounded-full border text-[11px] transition-colors ${
            correctness === false
              ? "border-rose-400 text-rose-300"
              : "border-slate-700 text-slate-400"
          }`}
          disabled={isSaving}
        >
          Incorrect
        </button>
      </div>

      <div className="flex items-center gap-2">
        {(
          [
            { value: "short", label: "Too short" },
            { value: "ok", label: "Just right" },
            { value: "long", label: "Too long" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleLength(option.value)}
            className={`px-2 py-1 rounded-full border text-[11px] transition-colors ${
              length === option.value
                ? "border-sky-400 text-sky-300"
                : "border-slate-700 text-slate-400"
            }`}
            disabled={isSaving}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
