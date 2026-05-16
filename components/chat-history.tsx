import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { Bot, User } from "lucide-react";
import FeedbackPanel from "@/components/feedback-panel";
import { Badge } from "@/components/ui/badge";

interface ChatHistoryProps {
  messages: ChatMessageType[];
}

export default function ChatHistory({ messages }: ChatHistoryProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  const hasTags = (message.topicTags || []).length > 0;

  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`flex flex-col max-w-[75%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
              : "bg-slate-800/50 border border-slate-700/50 text-slate-100"
          }`}
        >
          {message.pending ? (
            <div className="flex space-x-2 items-center py-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>
        <span className="text-xs text-slate-500 mt-1.5 px-1">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </span>
        {!isUser && !message.pending && (
          <div className="mt-1 w-full">
            {hasTags && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.topicTags?.map((tag) => (
                  <Badge
                    key={`${message.id}-${tag}`}
                    variant="secondary"
                    className="bg-slate-800/60 text-slate-300 border border-slate-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <FeedbackPanel
              messageId={message.id}
              initialFeedback={message.feedback}
            />
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
          <User className="w-5 h-5 text-slate-300" />
        </div>
      )}
    </div>
  );
}
