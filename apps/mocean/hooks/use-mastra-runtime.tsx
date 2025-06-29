"use client";

import { useRef } from "react";

import { useChat } from "@ai-sdk/react";
import { useVercelUseChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Message, UIMessage, generateId } from "ai";

import { useStore } from "@/app/store/useStore";

// 提取 useVercelUseChatRuntime 的第二个参数类型
type VercelUseChatAdapter = Parameters<typeof useVercelUseChatRuntime>[1];

// 提取 experimental_prepareRequestBody 返回值类型
export type PrepareRequestBodyReturnType = {
  id: string;
  threadId: string;
  messages: UIMessage[];
  assistantId?: string;
  requestBody: Record<string, unknown>;
  requestData: Record<string, unknown>;
};

/**
 * mastra的兼容
 * @param param0
 * @returns
 */
export function useMastraRuntime({
  threadId,
  initialMessages,
  api,
  adapter,
  onCreateThread,
  body,
}: {
  threadId?: string;
  initialMessages?: Message[];
  api: string;
  body?: object;
  onCreateThread?: (threadId: string) => void;
  adapter?: VercelUseChatAdapter;
}) {
  const threadIdRef = useRef(threadId || generateId());
  const chat = useChat({
    api,
    initialMessages,
    body,
    onFinish() {
      if (threadIdRef.current !== threadId) {
        onCreateThread?.(threadIdRef.current);
      }
    },
    experimental_prepareRequestBody: ({
      id,
      messages,
      requestData,
      requestBody,
    }) => {
      const assistantId = useStore.getState().activeAssistant?.id;
      return Object.assign(
        { id },
        requestBody,
        requestData,
        { threadId: threadIdRef.current },
        { messages: [messages[messages.length - 1]] },
        { assistantId },
      );
    },
  });

  const runtime = useVercelUseChatRuntime(chat, adapter);

  return runtime;
}
