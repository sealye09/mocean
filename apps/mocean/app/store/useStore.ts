import type { Assistant } from "@mocean/mastra/prismaType";
import type { UIMessage } from "ai";
import { create } from "zustand";

export type Store = {
  /**
   * @description 助手列表
   */
  assistantList: Assistant[];
  setAssistantList: (assistants: Assistant[]) => void;

  /**
   * @description 当前智能体分组
   */
  activeAgentGroup: string | null;
  setActiveAgentGroup: (group: string) => void;

  /**
   * @description 当前助手
   */
  activeAssistant: Assistant | null;
  setActiveAssistant: (assistant: Assistant) => void;

  /**
   * @description 初始化消息
   */
  initialMessages: UIMessage[] | null;
  setInitialMessages: (messages: UIMessage[]) => void;

  /**
   * @description 当前线程
   */
  activeThread: string | null;
  setActiveThread: (thread: string | null) => void;
};

const useStore = create<Store>((set) => ({
  assistantList: [] as Assistant[],
  setAssistantList: (assistants: Assistant[]) =>
    set({ assistantList: assistants }),

  activeAgentGroup: "精选",
  setActiveAgentGroup: (group: string) => set({ activeAgentGroup: group }),

  activeAssistant: null as Assistant | null,
  setActiveAssistant: (assistant: Assistant) =>
    set({ activeAssistant: assistant }),

  initialMessages: [] as UIMessage[],
  setInitialMessages: (messages: UIMessage[]) =>
    set({ initialMessages: messages }),

  activeThread: null as string | null,
  setActiveThread: (thread: string | null) => set({ activeThread: thread })
}));

export { useStore };
