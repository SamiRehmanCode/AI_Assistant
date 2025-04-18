import type { ChatMessage, ChatSession, MessageRole } from "@/types/chat"

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// Create a new chat message
export function createMessage(role: MessageRole, content: string, model?: string): ChatMessage {
  return {
    id: generateId(),
    role,
    content,
    timestamp: new Date(),
    model,
    pending: role === "assistant",
  }
}

// Create a new chat session
export function createChatSession(title = "New chat"): ChatSession {
  return {
    id: generateId(),
    title,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// Mock AI response function
export async function getMockAIResponse(message: string, model: string): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

  const responses: Record<string, string[]> = {
    Assistant: [
      "I'm here to help! What would you like to know?",
      "That's an interesting question. Let me think about that.",
      "I can definitely help you with that.",
      "Here's what I found about your question.",
    ],
    "App-Creator": [
      "I can help you build an app. What kind of app are you thinking of?",
      "Let's design that application together. What features do you need?",
      "I'll help you create the code for your application.",
      "Here's a structure I recommend for your app.",
    ],
    "Claude-3.7-Sonnet": [
      "I'd be happy to explore that topic with you in depth.",
      "That's a fascinating question with several dimensions to consider.",
      "Let me provide a comprehensive analysis of your question.",
      "I can offer several perspectives on this matter.",
    ],
  }

  const modelResponses = responses[model] || responses["Assistant"]
  return modelResponses[Math.floor(Math.random() * modelResponses.length)]
}

// Get a summary of the chat (for sidebar display)
export function getChatSummary(messages: ChatMessage[]): string {
  if (messages.length === 0) return "Start a new conversation"

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
  if (lastUserMessage) {
    return lastUserMessage.content.length > 60
      ? `${lastUserMessage.content.substring(0, 60)}...`
      : lastUserMessage.content
  }

  return "New conversation"
}
