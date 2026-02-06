"use client";

import { Database } from "lucide-react";

/**
 * 供应商默认页面
 * @description 当没有选择具体供应商时显示提示信息
 */
export default function ProviderPage() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">选择提供商</h3>
        <p className="text-sm text-muted-foreground">
          请在左侧选择一个提供商来查看其可用的模型列表
        </p>
      </div>
    </div>
  );
}
