"use client";

import type { ReactNode } from "react";

import { useRouter } from "next/router";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { API_URL } from "@mocean/mastra/apiClient";

import { useMastraRuntime } from "@/hooks/use-mastra-runtime";

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { push } = useRouter();
  const runtime = useMastraRuntime({
    api: `${API_URL}/assistants/chat`,
    onCreateThread: (threadId) => {
      console.log("onCreateThread", threadId);
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
