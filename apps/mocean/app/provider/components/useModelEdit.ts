import { useCallback, useEffect, useMemo } from "react";

import type { Model } from "@mocean/mastra/prismaType";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";

import { useModelActions } from "@/hooks/useModelsSWR";

/**
 * 编辑模型对话框属性
 */
export interface EditModelProps {
  /** 要编辑的模型 */
  model: Model | null;
  /** 供应商ID */
  providerId: string | null;
  /** 对话框打开状态 */
  open: boolean;
  /** 状态变更回调 */
  onOpenChange: (open: boolean) => void;
  /** 成功回调 */
  onSuccess?: () => Promise<unknown>;
  /** 分组列表 */
  groups: Array<{ id: string; name: string; isDefault?: boolean }>;
  /** 分组是否加载中 */
  groupsLoading?: boolean;
}

const abilityMap = {
  supportsTools: "supportsTools",
  supportsReasoning: "supportsReasoning",
  supportsImage: "supportsImage",
  supportsVideo: "supportsVideo",
  supportsAudio: "supportsAudio",
  supportsEmbedding: "supportsEmbedding"
} as const;

export type ModelEditForm = Record<keyof typeof abilityMap, boolean> & {
  name: string;
  groupId: string;
  description: string;
};

/**
 * 根据模型生成表单初始值
 */
const getFormDefaultValues = (model: Model | null): ModelEditForm => ({
  name: model?.name || "",
  groupId: model?.groupId || "",
  description: model?.description || "",
  supportsTools: model?.supportsTools || false,
  supportsReasoning: model?.supportsReasoning || false,
  supportsImage: model?.supportsImage || false,
  supportsVideo: model?.supportsVideo || false,
  supportsAudio: model?.supportsAudio || false,
  supportsEmbedding: model?.supportsEmbedding || false
});

export const useModelEdit = ({
  model,
  open,
  onOpenChange,
  onSuccess,
  groups: propGroups,
  groupsLoading: propGroupsLoading
}: EditModelProps) => {
  const { update } = useModelActions(onSuccess);

  /**
   * 模型能力
   */
  const modelAbility = useMemo(() => {
    return Object.entries(abilityMap)
      .filter(([key]) => model?.[key as keyof Model])
      .map(([, value]) => value);
  }, [model]);

  /**
   * 表单提交
   */
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting }
  } = useForm<ModelEditForm>({
    defaultValues: getFormDefaultValues(model)
  });

  /**
   * 当 model 发生变化时，同步更新表单值
   */
  useEffect(() => {
    if (model) {
      reset(getFormDefaultValues(model));
    }
  }, [model, reset]);

  /**
   * 处理表单提交
   */
  const onSubmit: SubmitHandler<ModelEditForm> = useCallback(
    async (data: ModelEditForm) => {
      try {
        if (!model) {
          return;
        }

        const updateData = {
          ...model,
          name: data.name.trim(),
          groupId: data.groupId,
          description: data.description.trim()
        };

        await update(model.id, updateData);
        onOpenChange(false);
      } catch (error: unknown) {
        console.error("更新供应商配置失败:", error);
        throw error;
      }
    },
    [model, update, onOpenChange]
  );

  return {
    model,
    open,
    groups: propGroups,
    modelAbility,
    groupsLoading: propGroupsLoading,
    isSubmitting,
    onOpenChange,
    register,
    control,
    onSubmit,
    handleSubmit
  };
};
