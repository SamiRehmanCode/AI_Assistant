"use client"

import Image from "next/image"

interface BotSelectorProps {
  activeModel: string
  onSelectModel: (modelId: string) => void
}

export default function BotSelector({ activeModel, onSelectModel }: BotSelectorProps) {
  const bots = [
    { id: "Assistant", name: "Assistant", icon: "/placeholder.svg?height=30&width=30", color: "bg-purple-600" },
    { id: "App-Creator", name: "App-Creator", icon: "/placeholder.svg?height=30&width=30", color: "bg-blue-600" },
    {
      id: "Claude-3.7-Sonnet",
      name: "Claude-3.7-Sonnet",
      icon: "/placeholder.svg?height=30&width=30",
      color: "bg-orange-600",
    },
  ]

  return (
    <div className="flex justify-center gap-2 mb-8 flex-wrap px-2">
      {bots.map((bot) => (
        <div
          key={bot.id}
          className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base ${
            activeModel === bot.id ? "bg-gray-700 ring-2 ring-purple-500" : "bg-gray-800 hover:bg-gray-700"
          } cursor-pointer transition-all`}
          onClick={() => onSelectModel(bot.id)}
        >
          <div className={`w-6 h-6 sm:w-8 sm:h-8 ${bot.color} rounded-full flex items-center justify-center`}>
            <Image
              src={bot.icon || "/placeholder.svg"}
              alt={bot.name}
              width={16}
              height={16}
              className="sm:w-5 sm:h-5"
            />
          </div>
          <span className="truncate max-w-[100px] sm:max-w-none">{bot.name}</span>
        </div>
      ))}
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sm:w-5 sm:h-5"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
    </div>
  )
}
