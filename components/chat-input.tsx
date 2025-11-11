"use client"

import { Send, Paperclip } from "lucide-react"
import { useState, type FormEvent, useRef, useEffect } from "react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [input])

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="flex items-end gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus-within:border-violet-500/50 transition-colors">
        <button
          type="button"
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-300"
          disabled={isLoading}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 resize-none min-h-[24px] max-h-32 py-1.5"
          disabled={isLoading}
          rows={1}
        />
        
        <button
          type="submit"
          className={`p-2 rounded-lg transition-all ${
            isLoading || !input.trim()
              ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/20"
          }`}
          disabled={isLoading || !input.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        AI can make mistakes. Verify important information.
      </p>
    </form>
  )
}
