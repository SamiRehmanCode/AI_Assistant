"use client";

import Image from "next/image";
import SidebarNav from "@/components/sidebar-nav";
import BotSelector from "@/components/bot-selector";
import ChatInput from "@/components/chat-input";
import ChatHistory from "@/components/chat-history";
import { useChatStore } from "@/hooks/use-chat-store";
import { useEffect } from "react";

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
    changeModel,
    toggleSidebar,
  } = useChatStore();

  // Create a session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createSession();
    }
  }, [sessions.length, createSession]);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <SidebarNav
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onCreateSession={createSession}
        isVisible={sidebarVisible}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pt-14 lg:pt-0">
        <div className="w-full max-w-3xl mx-auto flex flex-col h-full px-2 sm:px-4">
          {!currentSession || currentSession.messages.length === 0 ? (
            <>
              {/* Logo - Show only when no messages */}
              <div className="mt-8 sm:mt-16 mb-8 sm:mb-12">
                <div className="flex items-center justify-center">
                  <Image
                    src="/placeholder.svg?height=60&width=60"
                    alt="Poe Logo"
                    width={40}
                    height={40}
                    className="mr-3 sm:mr-4 sm:w-[60px] sm:h-[60px]"
                  />
                  <span className="text-4xl sm:text-6xl font-bold">Poe</span>
                </div>
              </div>

              {/* Bot Selector */}
              <BotSelector
                activeModel={activeModel}
                onSelectModel={changeModel}
              />
            </>
          ) : (
            <div className="flex-1 overflow-y-auto py-2 sm:py-4">
              {/* Chat History */}
              <ChatHistory
                messages={currentSession.messages}
                activeModel={activeModel}
              />
            </div>
          )}

          {/* Chat Input */}
          <div className="w-full mb-4 sm:mb-6 mt-auto">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>

          {/* Official Bots Section - Show only when no messages */}
          {(!currentSession || currentSession.messages.length === 0) && (
            <div className="w-full mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-3 sm:mb-4 px-2">
                <h2 className="text-lg sm:text-xl font-bold">Official bots</h2>
                <a
                  href="#"
                  className="text-purple-400 hover:underline text-sm sm:text-base"
                >
                  See all
                </a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 px-2">
                {/* Bot placeholders */}
                {[1, 2, 3, 4].map((bot) => (
                  <div
                    key={bot}
                    className="h-16 sm:h-24 bg-gray-800 rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
