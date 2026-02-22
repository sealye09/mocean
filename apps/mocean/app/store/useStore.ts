import type { UIMessage } from "ai";
import { create } from "zustand";

export type Store = {
  /**
   * @description 当前助手的 ID
   */
  activeAssistantId: string | null;
  setActiveAssistantId: (id: string | null) => void;

  /**
   * @description 初始化消息
   */
  initialMessages: UIMessage[] | null;
  setInitialMessages: (messages: UIMessage[]) => void;

  /**
   * @description 当前线程
   */
  activeThreadId: string | null;
  setActiveThreadId: (thread: string | null) => void;
};

const useStore = create<Store>((set) => ({
  activeAssistantId: null as string | null,
  setActiveAssistantId: (id: string | null) => set({ activeAssistantId: id }),

  initialMessages: [] as UIMessage[],
  setInitialMessages: (messages: UIMessage[]) =>
    set({ initialMessages: messages }),

  activeThreadId: null as string | null,
  setActiveThreadId: (threadId: string | null) =>
    set({ activeThreadId: threadId })
}));

export { useStore };
