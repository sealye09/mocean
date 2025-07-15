"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { Brain, Database, Eye, Loader2, Search, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useModelsByProviderSWR } from "@/hooks/useModelsSWR";
import { useProviderSWR } from "@/hooks/useProvidersSWR";

import { getModelLogo } from "./constant";

/**
 * 模型类型图标映射
 */
const MODEL_TYPE_ICONS = {
  text: Brain,
  vision: Eye,
  embedding: Database,
  reasoning: Zap,
  function_calling: Zap,
  web_search: Search,
} as const;

/**
 * 获取模型类型的颜色样式
 * @param type - 模型类型
 */
const getModelTypeColor = (type: string) => {
  const colorMap = {
    text: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
    vision: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
    embedding: "bg-green-100 text-green-600 dark:bg-green-900/30",
    reasoning: "bg-orange-100 text-orange-600 dark:bg-orange-900/30",
    function_calling: "bg-red-100 text-red-600 dark:bg-red-900/30",
    web_search: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30",
  };
  return (
    colorMap[type as keyof typeof colorMap] ||
    "bg-gray-100 text-gray-600 dark:bg-gray-900/30"
  );
};

/**
 * 获取模型类型的中文名称
 * @param type - 模型类型
 */
const getModelTypeName = (type: string) => {
  const nameMap = {
    text: "文本",
    vision: "视觉",
    embedding: "向量",
    reasoning: "推理",
    function_calling: "函数调用",
    web_search: "网络搜索",
  };
  return nameMap[type as keyof typeof nameMap] || type;
};

/**
 * 模型列表页面组件
 * @description 展示选中提供商的模型列表
 */
export default function ProviderPage() {
  const searchParams = useSearchParams();
  const selectedProviderId = searchParams.get("provider");

  const { provider, isLoading: providerLoading } =
    useProviderSWR(selectedProviderId);
  const {
    models,
    isLoading: modelsLoading,
    error,
  } = useModelsByProviderSWR(selectedProviderId);

  const isLoading = providerLoading || modelsLoading;

  // 没有选中提供商时的状态
  if (!selectedProviderId) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">选择提供商</h3>
              <p className="text-sm text-muted-foreground">
                请在上方选择一个提供商来查看其可用的模型列表
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                加载模型数据中...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="mb-2 text-sm text-red-500">加载模型数据失败</p>
              <p className="text-xs text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 没有模型的状态
  if (models.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">暂无模型</h3>
              <p className="text-sm text-muted-foreground">
                {provider?.name} 提供商暂无可用模型
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 提供商信息摘要 */}
      {provider && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {provider.name} 的模型列表
            </CardTitle>
            <CardDescription>共 {models.length} 个可用模型</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* 模型列表 */}
      <div className="grid gap-4">
        {models.map((model) => {
          const modelLogo = getModelLogo(model.id);
          const modelTypes = Array.isArray(model.typeJson)
            ? model.typeJson
            : [];

          return (
            <Card
              key={model.id}
              className="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="flex w-full items-start space-x-4">
                  {/* 模型图标 */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
                    {modelLogo ? (
                      <Image
                        src={modelLogo}
                        alt={model.name}
                        width={48}
                        height={48}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-lg text-white">
                        {model.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* 模型信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <CardTitle className="text-base transition-colors group-hover:text-primary">
                        {model.name}
                      </CardTitle>
                      {model.owned_by && (
                        <Badge variant="outline" className="text-xs">
                          {model.owned_by}
                        </Badge>
                      )}
                    </div>

                    <div className="mb-2 flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        模型ID:
                      </span>
                      <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {model.id}
                      </code>
                    </div>

                    {model.description && (
                      <CardDescription className="mb-3 text-sm">
                        {model.description}
                      </CardDescription>
                    )}

                    {/* 模型类型标签 */}
                    <div className="mb-2 flex flex-wrap gap-2">
                      {modelTypes.map((type: string) => {
                        const Icon =
                          MODEL_TYPE_ICONS[
                            type as keyof typeof MODEL_TYPE_ICONS
                          ] || Brain;
                        return (
                          <Badge
                            key={type}
                            variant="secondary"
                            className={`text-xs ${getModelTypeColor(type)}`}
                          >
                            <Icon className="mr-1 h-3 w-3" />
                            {getModelTypeName(type)}
                          </Badge>
                        );
                      })}
                    </div>

                    {/* 模型分组 */}
                    {model.group && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          分组:
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {model.group}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
