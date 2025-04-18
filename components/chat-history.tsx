import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface ChatHistoryProps {
  messages: ChatMessageType[];
  activeModel: string;
}

export default function ChatHistory({
  messages,
  activeModel,
}: ChatHistoryProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p>Start a conversation with {activeModel}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 py-4 overflow-y-auto">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}

// Update the ChatMessage component to be more responsive
function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } px-2 sm:px-4`}
    >
      <div
        className={`flex max-w-[85%] sm:max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-purple-600 ml-2" : "bg-gray-700 mr-2"
          }`}
        >
          {isUser ? (
            <span className="text-xs sm:text-sm font-bold">U</span>
          ) : (
            <Image
              src="/placeholder.svg?height=20&width=20"
              alt="Bot"
              width={16}
              height={16}
              className="sm:w-5 sm:h-5"
            />
          )}
        </div>

        <div
          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          <div
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg ${
              isUser ? "bg-purple-600" : "bg-gray-800"
            } overflow-auto max-h-40`}
          >
            {message.pending ? (
              <div className="flex space-x-1 items-center h-5 sm:h-6">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm">{message.content}</p>
            )}
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 mt-1">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
