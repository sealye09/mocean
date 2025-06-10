import { AgentModel, TopicModel } from "@mocean/mastra/prismaType";
import { create } from "zustand";

const useStore = create((set) => ({
  /**
   * @description 助手列表
   */
  agentList: [] as AgentModel[],
  setAgentList: (agents: AgentModel[]) => set({ agentList: agents }),

  /**
   * @description 当前助手
   */
  activeAgent: null as AgentModel | null,
  setActiveAgent: (agent: AgentModel) => set({ activeAgent: agent }),

  /**
   * @description 当前助手 对应 话题列表
   */
  topicList: [] as TopicModel[],
  setTopicList: (topics: TopicModel[]) => set({ topicList: topics }),

  /**
   * @description 当前
   */
  activeTopic: null as TopicModel | null,
  setActiveTopic: (topic: TopicModel) => set({ activeTopic: topic }),
}));

export { useStore };
