export type MessageRole = "user" | "assistant" | "system";

export interface MessageFeedback {
  rating?: number;
  correctness?: boolean;
  length?: "short" | "ok" | "long";
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  model?: string;
  pending?: boolean;
  latencyMs?: number;
  topicTags?: string[];
  feedback?: MessageFeedback;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  modelId?: string;
  summary?: string;
  messageCount?: number;
}
