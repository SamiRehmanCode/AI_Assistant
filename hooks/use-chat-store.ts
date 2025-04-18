"use client";

import { useState, useCallback } from "react";
import type { ChatSession } from "@/types/chat";
import { createChatSession, createMessage } from "@/lib/chat-utils";
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.key,
});

async function chatWithGPT(input: string, model: string) {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "Only respond briefly. Be cost-efficient.",
      },
      {
        role: "user",
        content: input,
      },
    ],
    max_tokens: 50,
    temperature: 0.5,
    top_p: 0.7,
    frequency_penalty: 0.2,
    presence_penalty: 0,
  });

  return response.choices[0].message.content;
}

export function useChatStore() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>("gpt-3.5-turbo");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const currentSession = useCallback(() => {
    return sessions.find((s) => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  const createSession = useCallback(() => {
    const newSession = createChatSession();
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession;
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      let session = currentSession();
      if (!session) {
        session = createSession();
      }

      const userMessage = createMessage("user", content);
      const assistantMessage = createMessage("assistant", "", activeModel);

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === session!.id) {
            return {
              ...s,
              messages: [...s.messages, userMessage, assistantMessage],
              updatedAt: new Date(),
            };
          }
          return s;
        })
      );

      setIsLoading(true);
      try {
        const response = await chatWithGPT(content, activeModel);

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === session!.id) {
              return {
                ...s,
                messages: s.messages.map((m) => {
                  if (m.id === assistantMessage.id) {
                    return {
                      ...m,
                      content: response,
                      pending: false,
                    };
                  }
                  return m;
                }),
                updatedAt: new Date(),
              };
            }
            return s;
          })
        );
      } catch (error) {
        console.error("Error getting AI response:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession, createSession, activeModel]
  );

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(sessions.length > 1 ? sessions[0].id : null);
      }
    },
    [currentSessionId, sessions]
  );

  const changeModel = useCallback((modelId: string) => {
    setActiveModel(modelId);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);

  return {
    sessions,
    currentSession: currentSession(),
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
  };
}
