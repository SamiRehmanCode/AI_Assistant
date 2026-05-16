"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { ChatMessage, ChatSession } from "@/types/chat";
import { createMessage } from "@/lib/chat-utils";

function normalizeMessage(message: any): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: new Date(message.timestamp),
    model: message.model,
    pending: Boolean(message.pending),
    latencyMs: message.latencyMs,
    topicTags: message.topicTags || [],
    feedback: message.feedback,
  };
}

function normalizeSession(session: any): ChatSession {
  return {
    id: session.id,
    title: session.title,
    modelId: session.modelId,
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
    summary: session.summary,
    messageCount: session.messageCount,
    messages: (session.messages || []).map(normalizeMessage),
  };
}

export function useChatStore() {
  const { data: authSession } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>("gpt-4o-mini");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const currentSession = useCallback(() => {
    return sessions.find((s) => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  const loadSessions = useCallback(async () => {
    if (!authSession?.user?.email) return;
    const res = await fetch("/api/sessions");
    if (!res.ok) return;
    const payload = await res.json();
    const normalized = (payload.sessions || []).map(normalizeSession);
    setSessions(normalized);
    if (!currentSessionId && normalized.length > 0) {
      setCurrentSessionId(normalized[0].id);
    }
    setIsBootstrapped(true);
  }, [authSession?.user?.email, currentSessionId]);

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (!res.ok) return;
    const payload = await res.json();
    const session = normalizeSession({
      ...payload.session,
      messages: payload.messages,
    });
    if (session.modelId) {
      setActiveModel(session.modelId);
    }
    setSessions((prev) =>
      prev.map((item) => (item.id === sessionId ? session : item)),
    );
  }, []);

  const createSession = useCallback(async () => {
    if (!authSession?.user?.email) return null;
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId: activeModel }),
    });
    if (!res.ok) return null;
    const payload = await res.json();
    const newSession = normalizeSession(payload.session);
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession;
  }, [authSession?.user?.email, activeModel]);

  useEffect(() => {
    if (!authSession?.user?.email) {
      setSessions([]);
      setCurrentSessionId(null);
      setIsBootstrapped(false);
      return;
    }
    if (!isBootstrapped) {
      loadSessions();
    }
  }, [authSession?.user?.email, isBootstrapped, loadSessions]);

  useEffect(() => {
    if (!currentSessionId) return;
    const current = sessions.find((item) => item.id === currentSessionId);
    if (!current) return;
    if (current.messages.length === 0 && (current.messageCount || 0) > 0) {
      loadSessionMessages(currentSessionId);
    }
  }, [currentSessionId, sessions, loadSessionMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !authSession?.user?.email) return;

      let session = currentSession();
      if (!session) {
        session = await createSession();
      }
      if (!session) return;

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
        }),
      );

      setIsLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            content,
            model: activeModel,
          }),
        });
        if (!res.ok) {
          throw new Error("Failed to send message");
        }
        const payload = await res.json();
        const newUserMessage = normalizeMessage(payload.userMessage);
        const newAssistantMessage = normalizeMessage(payload.assistantMessage);

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === session!.id) {
              return {
                ...s,
                title: payload.session.title,
                updatedAt: new Date(payload.session.updatedAt),
                messages: s.messages
                  .filter(
                    (m) =>
                      m.id !== userMessage.id && m.id !== assistantMessage.id,
                  )
                  .concat([newUserMessage, newAssistantMessage]),
                summary: newUserMessage.content,
              };
            }
            return s;
          }),
        );
      } catch (error) {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === session!.id) {
              return {
                ...s,
                messages: s.messages.map((m) => {
                  if (m.id === assistantMessage.id) {
                    return {
                      ...m,
                      content: "Something went wrong while fetching the reply.",
                      pending: false,
                    };
                  }
                  return m;
                }),
              };
            }
            return s;
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession, createSession, activeModel, authSession?.user?.email],
  );

  const selectSession = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId);
      loadSessionMessages(sessionId);
    },
    [loadSessionMessages],
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId);
        setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
    [currentSessionId, sessions],
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
