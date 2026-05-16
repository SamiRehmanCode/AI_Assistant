import { getOpenAIClient } from "@/lib/openai";

const DEFAULT_TAGGER_MODEL = "gpt-4o-mini";

function normalizeTags(tags: string[]) {
  const cleaned = tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
  return Array.from(new Set(cleaned)).slice(0, 6);
}

function safeParseTagArray(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeTags(parsed.map(String));
      }
    } catch {
      return [];
    }
  }

  const bracketStart = trimmed.indexOf("[");
  const bracketEnd = trimmed.lastIndexOf("]");
  if (bracketStart !== -1 && bracketEnd !== -1 && bracketEnd > bracketStart) {
    try {
      const parsed = JSON.parse(trimmed.slice(bracketStart, bracketEnd + 1));
      if (Array.isArray(parsed)) {
        return normalizeTags(parsed.map(String));
      }
    } catch {
      return [];
    }
  }

  return [];
}

export async function tagTopics(content: string) {
  const client = getOpenAIClient();
  const model = process.env.TOPIC_TAGGER_MODEL || DEFAULT_TAGGER_MODEL;

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "Return 3 to 6 concise topic tags for the user/assistant exchange. Output only a JSON array of strings.",
      },
      {
        role: "user",
        content,
      },
    ],
    temperature: 0.2,
    max_tokens: 80,
  });

  const raw = response.choices[0]?.message?.content || "[]";
  return safeParseTagArray(raw);
}
