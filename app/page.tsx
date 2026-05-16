"use client";

import SidebarNav from "@/components/sidebar-nav";
import BotSelector from "@/components/bot-selector";
import ChatInput from "@/components/chat-input";
import ChatHistory from "@/components/chat-history";
import AuthButton from "@/components/auth-button";
import { useChatStore } from "@/hooks/use-chat-store";
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const {
    sessions,
    currentSession,
    currentSessionId,
    activeModel,
    isLoading,
    sidebarVisible,
    createSession,
    sendMessage,
    selectSession,
    deleteSession,
    changeModel,
    toggleSidebar,
  } = useChatStore();

  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <SidebarNav
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onCreateSession={() => void createSession()}
        onDeleteSession={deleteSession}
        isVisible={sidebarVisible}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-950/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {session?.user && (
                <Link
                  href="/analytics"
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                >
                  Analytics
                </Link>
              )}
              <BotSelector
                activeModel={activeModel}
                onSelectModel={changeModel}
              />
              <AuthButton />
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden h-70%">
          {!session?.user ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="max-w-lg">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-lime-400 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-slate-950" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  Sign in to unlock your AI workspace
                </h2>
                <p className="text-slate-400 mt-3">
                  Connect with Google to store sessions, collect feedback, and
                  view analytics.
                </p>
                <div className="mt-6 flex justify-center">
                  <AuthButton />
                </div>
              </div>
            </div>
          ) : !currentSession || currentSession.messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-27">
              <div className="text-center max-w-2xl">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                    How can I help you today?
                  </h2>
                  <p className="text-slate-400 text-lg">
                    Start a conversation and let AI assist you with anything you
                    need.
                  </p>
                </div>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                  {[
                    {
                      title: "Write code",
                      desc: "Get help with programming tasks",
                    },
                    {
                      title: "Explain concepts",
                      desc: "Learn something new today",
                    },
                    {
                      title: "Creative writing",
                      desc: "Generate stories or content",
                    },
                    {
                      title: "Problem solving",
                      desc: "Work through complex issues",
                    },
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(suggestion.title)}
                      className="p-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-xl text-left transition-all hover:border-violet-500/50 group"
                    >
                      <div className="text-white font-medium mb-1 group-hover:text-violet-400 transition-colors">
                        {suggestion.title}
                      </div>
                      <div className="text-slate-500 text-sm">
                        {suggestion.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ChatHistory messages={currentSession.messages} />
            </div>
          )}

          {/* Chat Input */}
          <div className="border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <ChatInput
                onSendMessage={sendMessage}
                isLoading={isLoading}
                disabled={!session?.user}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
