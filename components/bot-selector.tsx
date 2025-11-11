"use client"

import { ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface BotSelectorProps {
  activeModel: string
  onSelectModel: (modelId: string) => void
}

export default function BotSelector({ activeModel, onSelectModel }: BotSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const models = [
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast and efficient" },
    { id: "gpt-4", name: "GPT-4", description: "Most capable" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Advanced reasoning" },
  ]

  const activeModelInfo = models.find((m) => m.id === activeModel) || models[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-colors text-sm"
      >
        <span className="text-slate-300">{activeModelInfo.name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onSelectModel(model.id)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors ${
                activeModel === model.id ? "bg-slate-700/30" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium text-sm">{model.name}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{model.description}</div>
                </div>
                {activeModel === model.id && (
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
