"use client";

import { useEffect } from "react";

import { useStore } from "@/app/store/useStore";
import { useAssistantsSWR } from "@/hooks/useAssistantsSWR";

export default function Chat() {
  const { assistants, isLoading, error } = useAssistantsSWR();
  const { setAssistantList } = useStore();

  // 统一处理数据更新
  useEffect(() => {
    if (error) {
      console.error("获取助手列表失败:", error);
      // 出错时设置空列表
      setAssistantList([]);
    } else if (assistants && assistants.length > 0) {
      setAssistantList(assistants);
    } else if (!isLoading) {
      // 如果没有数据且不在加载中，设置空列表
      setAssistantList([]);
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
      <div>選擇助手</div>
    </div>
  );
}
