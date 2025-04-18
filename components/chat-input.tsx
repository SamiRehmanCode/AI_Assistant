"use client"

import { Plus, Mic, ArrowRight } from "lucide-react"
import { useState, type FormEvent } from "react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full px-2 sm:px-0">
      <div className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-gray-900 rounded-xl">
        <button type="button" className="p-1 sm:p-2 hover:bg-gray-800 rounded-full" disabled={isLoading}>
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Start a new chat"
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-sm sm:text-base"
          disabled={isLoading}
        />
        <button type="button" className="p-1 sm:p-2 hover:bg-gray-800 rounded-full" disabled={isLoading}>
          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          type="submit"
          className={`p-1 sm:p-2 ${isLoading ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"} rounded-full`}
          disabled={isLoading || !input.trim()}
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </form>
  )
}
