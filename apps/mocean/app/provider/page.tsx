"use client";

import { useMemo } from "react";

import { useSearchParams } from "next/navigation";

import { Database, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ItemList } from "@/components/ui/item-list";
import { Separator } from "@/components/ui/separator";
import { useModelsByProviderSWR } from "@/hooks/useModelsSWR";
import { useProviderSWR } from "@/hooks/useProvidersSWR";

import { ModelCard } from "./components/ModelCard";

/**
 * 模型数据接口
 */
interface Model {
  id: string;
  name: string;
  group?: string;
  typeJson: string[];
  description?: string;
  owned_by?: string;
}

/**
 * 模型分组接口
 */
interface ModelGroup {
  groupName: string;
  models: Model[];
  count: number;
}

/**
 * 模型列表页面组件
 * @description 展示选中提供商的模型列表，按分组显示
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

  // 按组分组模型
  const modelGroups = useMemo((): ModelGroup[] => {
    if (!models || models.length === 0) return [];

    const groups: Record<string, Model[]> = {};

    models.forEach((model) => {
      const groupName = model.group || "未分组";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(model);
    });

    // 转换为数组并排序
    const sortedGroups = Object.entries(groups)
      .map(([groupName, models]) => ({
        groupName,
        models: models.sort((a, b) => a.name.localeCompare(b.name)),
        count: models.length,
      }))
      .sort((a, b) => {
        // 未分组放最后
        if (a.groupName === "未分组") return 1;
        if (b.groupName === "未分组") return -1;
        return a.groupName.localeCompare(b.groupName);
      });

    return sortedGroups;
  }, [models]);

  /**
   * 模型搜索过滤函数
   * @param model - 模型数据
   * @param searchTerm - 搜索词
   */
  const searchFilter = (model: Model, searchTerm: string): boolean => {
    const term = searchTerm.toLowerCase();
    return (
      model.name.toLowerCase().includes(term) ||
      model.id.toLowerCase().includes(term) ||
      model.description?.toLowerCase().includes(term) ||
      model.owned_by?.toLowerCase().includes(term) ||
      model.typeJson.some((type) => type.toLowerCase().includes(term))
    );
  };

  /**
   * 处理模型点击事件
   * @param model - 被点击的模型
   */
  const onModelClick = (model: Model) => {
    console.log("选中模型:", model.name);
    // 这里可以添加模型选择逻辑
  };

  // 没有选中提供商时的状态
  if (!selectedProviderId) {
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

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">
            加载模型数据中...
          </span>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="mb-2 text-sm text-red-500">加载模型数据失败</p>
          <p className="text-xs text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  // 没有模型的状态
  if (models.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">暂无模型</h3>
          <p className="text-sm text-muted-foreground">
            {provider?.name} 提供商暂无可用模型
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* 头部信息 */}
      <div className="border-b border-border bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm text-white">
                {provider?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold">{provider?.name}</h1>
              <p className="text-sm text-muted-foreground">
                共 {models.length} 个模型，{modelGroups.length} 个分组
              </p>
            </div>
          </div>

          {/* 分组统计 */}
          <div className="flex items-center space-x-2">
            {modelGroups.map((group) => (
              <Badge
                key={group.groupName}
                variant="outline"
                className="text-xs"
              >
                {group.groupName}: {group.count}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* 模型分组列表 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {modelGroups.map((group) => (
            <Collapsible key={group.groupName} defaultOpen={true}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{group.groupName}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {group.count} 个模型
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    点击展开/折叠
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4">
                <ItemList
                  items={group.models}
                  renderItem={(model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      onClick={onModelClick}
                    />
                  )}
                  searchFilter={searchFilter}
                  searchPlaceholder="搜索模型名称、ID、描述或类型..."
                  groupName="模型"
                  showStats={false}
                  gridCols={{
                    default: 1,
                    lg: 2,
                    xl: 3,
                  }}
                />
              </CollapsibleContent>

              {/* 分组间分隔线 */}
              {group !== modelGroups[modelGroups.length - 1] && (
                <Separator className="my-6" />
              )}
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
}
