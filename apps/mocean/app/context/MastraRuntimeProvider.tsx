"use client";

import type { ReactNode } from "react";

import {
  AssistantRuntimeProvider,
  type ChatModelAdapter,
  useLocalRuntime,
} from "@assistant-ui/react";
import { API_URL } from "@mocean/mastra/apiClient";

import { useStore } from "../store/useStore";

const MyModelAdapter: ChatModelAdapter = {
  async run({ messages, abortSignal }) {
    const { activeAssistant } = useStore.getState();

    // TODO replace with your own API
    const result = await fetch(`${API_URL}/assistants/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // forward the messages in the chat to the API
      body: JSON.stringify({
        messages,
        assistantId: activeAssistant?.id,
      }),
      // if the user hits the "cancel" button or escape keyboard key, cancel the request
      signal: abortSignal,
    });

    const data = await result.json();
    return {
      content: [
        {
          type: "text",
          text: data.text,
        },
      ],
    };
  },
};

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const runtime = useLocalRuntime(MyModelAdapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
