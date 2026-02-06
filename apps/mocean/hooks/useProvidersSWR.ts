import type {
  // 基础类型
  EnabledProvidersResult, // WithModels 类型
  EnabledProvidersWithModelsResult,
  ProviderResult,
  ProviderWithModelsResult,
  ProvidersByTypeResult,
  ProvidersByTypeWithModelsResult,
  ProvidersResult,
  ProvidersWithModelsResult
} from "@mocean/mastra/apiClient";
import { useProvidersApi } from "@mocean/mastra/apiClient";
import type { ProviderType } from "@mocean/mastra/prismaType";
import useSWR from "swr";

/**
 * SWR 默认配置
 */
const defaultSWRConfig = {
  refreshInterval: 0,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000,
  errorRetryCount: 3,
  errorRetryInterval: 5000
};

// ==================== 基础版本（不包含关联模型）====================

/**
 * 获取所有提供商列表（基础版本）- 使用 SWR
 */
export function useProviders() {
  const { getProviders } = useProvidersApi();

  const { data, error, isLoading, mutate } = useSWR<ProvidersResult, Error>(
    "providers",
    async () => {
      const result = await getProviders();
      return result?.data || [];
    },
    defaultSWRConfig
  );

  return {
    providers: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 获取启用的提供商列表（基础版本）- 使用 SWR
 */
export function useEnabledProviders() {
  const { getEnabledProviders } = useProvidersApi();

  const { data, error, isLoading, mutate } = useSWR<
    EnabledProvidersResult,
    Error
  >(
    "providers-enabled",
    async () => {
      const result = await getEnabledProviders();
      return result?.data || [];
    },
    defaultSWRConfig
  );

  return {
    providers: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 获取单个提供商（基础版本）- 使用 SWR
 */
export function useProvider(id: string | null) {
  const { getProviderById } = useProvidersApi();

  const { data, error, isLoading, mutate } = useSWR<
    ProviderResult | null,
    Error
  >(
    id ? `provider-${id}` : null,
    async () => {
      if (!id) return null;
      const result = await getProviderById(id);
      return result?.data || null;
    },
    defaultSWRConfig
  );

  return {
    provider: data,
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 根据类型获取提供商列表（基础版本）- 使用 SWR
 */
export function useProvidersByType(type: string | null) {
  const { getProvidersByType } = useProvidersApi();

  const { data, error, isLoading, mutate } = useSWR<
    ProvidersByTypeResult,
    Error
  >(
    type ? `providers-type-${type}` : null,
    async () => {
      if (!type) return [];
      const result = await getProvidersByType(type as ProviderType);
      return result?.data || [];
    },
    {
      ...defaultSWRConfig,
      dedupingInterval: 30000
    }
  );

  return {
    providers: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

// ==================== WithModels 版本（包含模型列表）====================

/**
 * 获取所有提供商列表（包含模型）- 使用 SWR
 */
export function useProvidersWithModels() {
  const { getProvidersWithModels } = useProvidersApi();

  const { data, error, isLoading, mutate } = useSWR<
    ProvidersWithModelsResult,
    Error
  >(
    "providers-with-models",
    async () => {
      const result = await getProvidersWithModels();
      return result?.data || [];
    },
    defaultSWRConfig
  );

  return {
    providers: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 获取启用的提供商列表（包含模型）- 使用 SWR
 */
export function useEnabledProvidersWithModels() {
  const { getEnabledProvidersWithModels } = useProvidersApi();

  const { data, error, isLoading, mutate } = useSWR<
    EnabledProvidersWithModelsResult,
    Error
  >(
    "providers-enabled-with-models",
    async () => {
      const result = await getEnabledProvidersWithModels();
      return result?.data || [];
    },
    defaultSWRConfig
  );

  return {
    providers: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 获取单个提供商（包含模型）- 使用 SWR
 */
export function useProviderWithModels(id: string | null) {
  const { getProviderWithModelsById } = useProvidersApi();

  const { data, error, isLoading, mutate } = useSWR<
    ProviderWithModelsResult | null,
    Error
  >(
    id ? `provider-with-models-${id}` : null,
    async () => {
      if (!id) return null;
      const result = await getProviderWithModelsById(id);
      return result?.data || null;
    },
    defaultSWRConfig
  );

  return {
    provider: data,
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 根据类型获取提供商列表（包含模型）- 使用 SWR
 */
export function useProvidersByTypeWithModels(type: string | null) {
  const { getProvidersByTypeWithModels } = useProvidersApi();

  const { data, error, isLoading, mutate } = useSWR<
    ProvidersByTypeWithModelsResult,
    Error
  >(
    type ? `providers-type-with-models-${type}` : null,
    async () => {
      if (!type) return [];
      const result = await getProvidersByTypeWithModels(type as ProviderType);
      return result?.data || [];
    },
    {
      ...defaultSWRConfig,
      dedupingInterval: 30000
    }
  );

  return {
    providers: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}

/**
 * 增强的提供商 API hooks - 结合 CRUD 操作和 SWR 缓存
 */
export function useProvidersWithActions() {
  const { providers, isLoading, error, refresh } = useProvidersWithModels();
  const {
    createProvider,
    updateProvider,
    deleteProvider,
    toggleProviderEnabled
  } = useProvidersApi();

  const create = async (data: Parameters<typeof createProvider>[0]) => {
    try {
      const result = await createProvider(data);
      if (result) {
        await refresh();
      }
      return result;
    } catch (err) {
      console.error("创建提供商失败:", err);
      throw err;
    }
  };

  const update = async (
    id: string,
    data: Parameters<typeof updateProvider>[1]
  ) => {
    try {
      const result = await updateProvider(id, data);
      if (result) {
        await refresh();
      }
      return result;
    } catch (err) {
      console.error("更新提供商失败:", err);
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      const result = await deleteProvider(id);
      if (result) {
        await refresh();
      }
      return result;
    } catch (err) {
      console.error("删除提供商失败:", err);
      throw err;
    }
  };

  const toggleEnabled = async (id: string) => {
    try {
      const result = await toggleProviderEnabled(id);
      if (result) {
        await refresh();
      }
      return result;
    } catch (err) {
      console.error("切换提供商状态失败:", err);
      throw err;
    }
  };

  return {
    // SWR 数据
    providers,
    isLoading,
    error,

    // 手动刷新
    refresh,

    // CRUD 操作
    create,
    update,
    remove,
    toggleEnabled
  };
}
