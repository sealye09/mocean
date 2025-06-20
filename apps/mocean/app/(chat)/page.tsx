"use client";

import { useEffect } from "react";

import { Thread } from "@/components/thread";
import { useAssistantsSWR } from "@/hooks/useAssistantsSWR";

import { useStore } from "../store/useStore";

export default function Chat() {
  const { assistants, isLoading, error } = useAssistantsSWR();
  const { setAssistantList } = useStore();

  // 默认助手配置
  const defaultAssistant = {
    id: "1",
    name: "默认助手",
    description: "我是默认助手，你可以和我对话",
    prompt: "",
    type: "assistant" as const,
    emoji: "",
    enableWebSearch: false,
    webSearchProviderId: "",
    enableGenerateImage: false,
    knowledgeRecognition: "",
    modelId: "",
    defaultModelId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 统一处理数据更新
  useEffect(() => {
    if (error) {
      console.error("获取助手列表失败:", error);
      // 即使出错也显示默认助手
      setAssistantList([defaultAssistant]);
    } else if (assistants && assistants.length > 0) {
      setAssistantList([...assistants, defaultAssistant]);
    } else if (!isLoading) {
      // 如果没有数据且不在加载中，只设置默认助手
      setAssistantList([defaultAssistant]);
    }
  }, [assistants, isLoading, error, setAssistantList]);

  // 加载状态显示
  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex-1">
      <Thread />
    </div>
  );
}
