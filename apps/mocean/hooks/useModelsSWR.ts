import { useModelsApi } from "@mocean/mastra/apiClient";
import useSWR from "swr";

/**
 * 使用 SWR 的模型数据获取 hooks
 * @description 在前端应用层提供带缓存的数据获取功能
 */

// ==================== 基础版本（不包含关联信息） ====================

/**
 * 获取所有模型列表（基础版本）- 使用 SWR
 */
export function useModels() {
  const { getModels } = useModelsApi();

  const { data, error, isLoading, mutate } = useSWR(
    "models-base",
    async () => {
      const result = await getModels();
      return result?.data || [];
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      errorRetryCount: 3,
      errorRetryInterval: 5000
    }
  );

  return {
    models: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 获取单个模型（基础版本）- 使用 SWR
 */
export function useModel(id: string | null) {
  const { getModelById } = useModelsApi();

  const { data, error, isLoading, mutate } = useSWR(
    id ? `model-base-${id}` : null,
    async () => {
      if (!id) return null;
      const result = await getModelById(id);
      return result?.data || null;
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000
    }
  );

  return {
    model: data,
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 根据提供商ID获取模型列表（基础版本）- 使用 SWR
 */
export function useModelsByProvider(providerId: string | null) {
  const { getModelsByProvider } = useModelsApi();

  const { data, error, isLoading, mutate } = useSWR(
    providerId ? `models-base-provider-${providerId}` : null,
    async () => {
      if (!providerId) return [];
      const result = await getModelsByProvider(providerId);
      return result?.data || [];
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 3000
    }
  );

  return {
    models: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 根据分组获取模型列表（基础版本）- 使用 SWR
 */
export function useModelsByGroup(group: string | null) {
  const { getModelsByGroup } = useModelsApi();

  const { data, error, isLoading, mutate } = useSWR(
    group ? `models-base-group-${group}` : null,
    async () => {
      if (!group) return [];
      const result = await getModelsByGroup(group);
      return result?.data || [];
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 3000
    }
  );

  return {
    models: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

// ==================== WithProviders 版本（包含提供商信息） ====================

/**
 * 获取所有模型列表（包含提供商信息）- 使用 SWR
 */
export function useModelsWithProviders() {
  const { getModelsWithProviders } = useModelsApi();

  const { data, error, isLoading, mutate } = useSWR(
    "models-with-providers",
    async () => {
      const result = await getModelsWithProviders();
      return result?.data || [];
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      errorRetryCount: 3,
      errorRetryInterval: 5000
    }
  );

  return {
    models: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 获取单个模型（包含提供商信息）- 使用 SWR
 */
export function useModelWithProviders(id: string | null) {
  const { getModelWithProvidersById } = useModelsApi();

  const { data, error, isLoading, mutate } = useSWR(
    id ? `model-with-providers-${id}` : null,
    async () => {
      if (!id) return null;
      const result = await getModelWithProvidersById(id);
      return result?.data || null;
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000
    }
  );

  return {
    model: data,
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 根据提供商ID获取模型列表（包含提供商信息）- 使用 SWR
 */
export function useModelsByProviderWithProviders(providerId: string | null) {
  const { getModelsByProviderWithProviders } = useModelsApi();

  const { data, error, isLoading, mutate } = useSWR(
    providerId ? `models-provider-with-providers-${providerId}` : null,
    async () => {
      if (!providerId) return [];
      const result = await getModelsByProviderWithProviders(providerId);
      return result?.data || [];
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 3000
    }
  );

  return {
    models: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 根据分组获取模型列表（包含提供商信息）- 使用 SWR
 */
export function useModelsByGroupWithProviders(group: string | null) {
  const { getModelsByGroupWithProviders } = useModelsApi();

  const { data, error, isLoading, mutate } = useSWR(
    group ? `models-group-with-providers-${group}` : null,
    async () => {
      if (!group) return [];
      const result = await getModelsByGroupWithProviders(group);
      return result?.data || [];
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 3000
    }
  );

  return {
    models: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

// ==================== 增强的 hooks（结合 CRUD 操作和 SWR 缓存） ====================

/**
 * 增强的模型 API hooks - 结合 CRUD 操作和 SWR 缓存
 * 默认使用 WithProviders 版本
 */
export function useModelsWithActions() {
  const { models, isLoading, error, refresh } = useModelsWithProviders();
  const { createModel, updateModel, deleteModel } = useModelsApi();

  return {
    // SWR 数据
    models,
    isLoading,
    error,

    // CRUD 操作（带缓存更新）
    async create(data: Parameters<typeof createModel>[0]) {
      try {
        const result = await createModel(data);
        if (result) {
          await refresh();
        }
        return result;
      } catch (error) {
        console.error("创建模型失败:", error);
        throw error;
      }
    },

    async update(id: string, data: Parameters<typeof updateModel>[1]) {
      try {
        const result = await updateModel(id, data);
        if (result) {
          await refresh();
        }
        return result;
      } catch (error) {
        console.error("更新模型失败:", error);
        throw error;
      }
    },

    async remove(id: string) {
      try {
        const result = await deleteModel(id);
        if (result) {
          await refresh();
        }
        return result;
      } catch (error) {
        console.error("删除模型失败:", error);
        throw error;
      }
    },

    // 手动刷新
    refresh
  };
}
