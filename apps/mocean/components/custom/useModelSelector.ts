import { useCallback, useMemo, useState } from "react";

import { EnabledProvidersResult } from "@mocean/mastra/apiClient";
import { Model, Provider } from "@mocean/mastra/prismaType";

/**
 * 模型分组接口
 */
export interface ModelGroup {
  groupName: string;
  models: Model[];
  count: number;
}

/**
 * 选择项接口
 */
interface ModelSelection {
  providerId: string;
  providerName: string;
  modelId: string;
  modelName: string;
}

/**
 * 组件属性接口
 */
export interface ModelSelectorProps {
  /** 供应商列表 */
  providers: EnabledProvidersResult;
  /** 当前选中的模型 */
  value?: ModelSelection;
  /** 选择变更回调 */
  onChange: (selection: ModelSelection) => void;
  /** 自定义类名 */
  className?: string;
}

export const useModelSelector = ({
  providers,
  value,
  onChange,
}: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);

  /**
   * 按组分组模型
   *
   * @description 将模型列表按模型-供应商分组分组并排序
   * @param models - 模型列表
   * @param groupList - 分组关系列表（从 provider.models 获取）
   * @returns 分组后的模型数组
   */
  const transformModelGroups = useCallback(
    ({
      models,
      groupList,
    }: {
      models: EnabledProvidersResult[0]["modelList"];
      groupList: {
        providerId: string;
        modelId: string;
        group: string | null;
      }[];
    }): ModelGroup[] => {
      if (!models || models.length === 0) return [];

      const groups: Record<string, Model[]> = {};

      models.forEach((model) => {
        // 根据 groupList 获取当前模型的分组
        const groupRelation = groupList.find((g) => g.modelId === model.id);
        const groupName = groupRelation?.group || "未分组";

        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(model);
      });

      return Object.entries(groups)
        .map(([groupName, models]) => ({
          groupName,
          models: models.sort((a, b) => a.name.localeCompare(b.name)),
          count: models.length,
        }))
        .sort((a, b) => {
          if (a.groupName === "未分组") return 1;
          if (b.groupName === "未分组") return -1;
          return a.groupName.localeCompare(b.groupName);
        });
    },
    [],
  );

  /**
   * 缓存所有供应商的分组模型
   *
   * @description 使用 useMemo 避免每次渲染都重新计算分组
   */
  const providersWithGroups = useMemo(() => {
    return providers.map((provider) => ({
      ...provider,
      modelGroups: transformModelGroups({
        models: provider.modelList,
        groupList: provider.models,
      }),
    }));
  }, [providers, transformModelGroups]);

  /**
   * 缓存选中的 provider
   *
   * @description 使用 useMemo 避免每次渲染都查找 provider
   */
  const selectedProvider = useMemo(() => {
    if (!value) {
      return undefined;
    }
    return providers.find((p) => p.id === value.providerId);
  }, [providers, value]);

  /**
   * 处理模型选择
   *
   * @description 使用 useCallback 避免每次渲染都创建新函数
   * @param provider - 供应商信息
   * @param model - 模型信息
   */
  const onSelectModel = useCallback(
    (provider: Provider, model: Model) => {
      onChange({
        providerId: provider.id,
        providerName: provider.name,
        modelId: model.id,
        modelName: model.name,
      });
      setOpen(false);
    },
    [onChange],
  );

  return {
    open,
    providersWithGroups,
    setOpen,
    selectedProvider,
    onSelectModel,
  };
};
