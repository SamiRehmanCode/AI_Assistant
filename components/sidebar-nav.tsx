"use client"

import { Search, Plus, Users, User, Settings, Send, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { ChatSession } from "@/types/chat"
import { getChatSummary } from "@/lib/chat-utils"
import { formatDistanceToNow } from "date-fns"

interface SidebarNavProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onCreateSession: () => void
  isVisible: boolean
  onToggle: () => void
}

export default function SidebarNav({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  isVisible,
  onToggle,
}: SidebarNavProps) {
  return (
    <>
      {/* Mobile sidebar toggle button - visible only on small screens */}
      <button onClick={onToggle} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-md">
        <div className="w-5 h-0.5 bg-white mb-1"></div>
        <div className="w-5 h-0.5 bg-white mb-1"></div>
        <div className="w-5 h-0.5 bg-white"></div>
      </button>

      {/* Sidebar - conditionally shown based on isVisible state */}
      <div
        className={`${isVisible ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 fixed lg:static z-40 w-[280px] lg:w-[350px] h-full bg-black 
        border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center">
            <Image src="/placeholder.svg?height=30&width=30" alt="Poe Logo" width={30} height={30} className="mr-2" />
            <span className="text-2xl font-bold">Poe</span>
          </div>
          <button onClick={onToggle} className="p-2 lg:hidden">
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {/* Explore and Create */}
          <div className="grid grid-cols-2 gap-2 p-4">
            <Link href="#" className="flex items-center gap-2 bg-gray-900 p-4 rounded-lg">
              <Search className="w-6 h-6" />
              <span className="font-medium">Explore</span>
            </Link>
            <button onClick={onCreateSession} className="flex items-center gap-2 bg-gray-900 p-4 rounded-lg">
              <Plus className="w-6 h-6" />
              <span className="font-medium">Create</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="p-4">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-start gap-3 p-2 ${
                    currentSessionId === session.id ? "bg-gray-800" : "hover:bg-gray-800"
                  } rounded-lg cursor-pointer mb-2`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{session.title}</h3>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{getChatSummary(session.messages)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">No chats yet. Create a new one!</div>
            )}

            {sessions.length > 0 && (
              <Link href="#" className="block text-center text-gray-400 hover:text-white py-2 mt-2">
                View all
              </Link>
            )}
          </div>

          {/* Bots and Apps */}
          <div className="p-4 border-t border-gray-800">
            <Link href="#" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 relative">
                  <div className="absolute w-2 h-2 bg-white rounded-full top-0 left-0"></div>
                  <div className="absolute w-2 h-2 bg-white rounded-full top-0 right-0"></div>
                  <div className="absolute w-2 h-2 bg-white rounded-full bottom-0 left-0"></div>
                  <div className="absolute w-2 h-2 bg-white rounded-full bottom-0 right-0"></div>
                </div>
              </div>
              <span className="font-medium">Bots and apps</span>
            </Link>
          </div>

          {/* Creators */}
          <div className="p-4 border-t border-gray-800">
            <Link href="#" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-medium">Creators</span>
            </Link>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-800">
          <Link href="#" className="flex items-center gap-3 p-4 hover:bg-gray-800">
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 p-4 hover:bg-gray-800">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 p-4 hover:bg-gray-800">
            <Send className="w-5 h-5" />
            <span className="font-medium">Send feedback</span>
          </Link>
        </div>
      </div>

      {/* Overlay for mobile - only visible when sidebar is open on mobile */}
      {isVisible && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onToggle}></div>}
    </>
  )
}
