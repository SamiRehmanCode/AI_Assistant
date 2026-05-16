"use client";

import { Plus, MessageSquare, Trash2, Sparkles } from "lucide-react";
import type { ChatSession } from "@/types/chat";
import { getChatSummary } from "@/lib/chat-utils";
import { formatDistanceToNow } from "date-fns";

interface SidebarNavProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void | Promise<void>;
  onDeleteSession: (sessionId: string) => void | Promise<void>;
  isVisible: boolean;
  onToggle: () => void;
}

export default function SidebarNav({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isVisible,
  onToggle,
}: SidebarNavProps) {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`${
          isVisible ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static z-40 w-72 h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                AI Assistant
              </span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={onCreateSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg transition-all text-white font-medium shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    currentSessionId === session.id
                      ? "bg-slate-800/70 border border-violet-500/30"
                      : "hover:bg-slate-800/30 border border-transparent"
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <MessageSquare
                      className={`w-4 h-4 ${
                        currentSessionId === session.id
                          ? "text-violet-400"
                          : "text-slate-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {getChatSummary(session.messages, session.summary) ||
                        "No messages yet"}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {formatDistanceToNow(session.updatedAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700/50 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8 px-4">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat to begin</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="text-xs text-slate-500 text-center">
            <p>Built with AI assistance</p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isVisible && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={onToggle}
        ></div>
      )}
    </>
  );
}
