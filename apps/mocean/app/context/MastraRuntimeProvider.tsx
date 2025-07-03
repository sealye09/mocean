"use client";

import type { ReactNode } from "react";

import { useRouter } from "next/navigation";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { API_URL } from "@mocean/mastra/apiClient";

import { useMastraRuntime } from "@/hooks/use-mastra-runtime";

import { useStore } from "../store/useStore";

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const router = useRouter();
  const { activeAssistant, initialMessages, activeThread } = useStore();

  const runtime = useMastraRuntime({
    api: `${API_URL}/assistants/chat`,
    onCreateThread: (threadId) => {
      router.push(`/${activeAssistant?.id}/${threadId}`);
    },
    initialMessages: initialMessages || [],
    threadId: activeThread || undefined,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
