"use client";

import { useState } from "react";

import { useEnabledProvidersSWR } from "@/hooks/useProvidersSWR";

import { ModelSelector } from "./model-selector";

/**
 * 工具栏组件
 *
 * @description 提供模型选择等工具栏功能
 * @returns 工具栏组件
 */
export function Toolbar() {
  const { providers } = useEnabledProvidersSWR();
  const [selectedModel, setSelectedModel] = useState<{
    providerId: string;
    providerName: string;
    modelId: string;
    modelName: string;
  }>();

  /**
   * 处理模型选择变更
   *
   * @param selection - 选择的模型信息
   */
  const onModelChange = (selection: {
    providerId: string;
    providerName: string;
    modelId: string;
    modelName: string;
  }) => {
    setSelectedModel(selection);
    // TODO: 处理模型选择逻辑
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <ModelSelector
        providers={providers}
        value={selectedModel}
        onChange={onModelChange}
      />
    </div>
  );
}
