import { useAssistantsApi } from "@mocean/mastra/apiClient";
import useSWR from "swr";

/**
 * 使用 SWR 的助手数据获取 hooks
 * @description 在前端应用层提供带缓存的数据获取功能
 */

/**
 * 获取所有助手列表 - 使用 SWR
 */
export function useAssistantsSWR() {
  const { getAssistants } = useAssistantsApi();

  const { data, error, isLoading, mutate } = useSWR(
    "assistants",
    async () => {
      const result = await getAssistants();
      return result?.data || [];
    },
    {
      // 配置选项
      refreshInterval: 0, // 不自动刷新
      revalidateOnFocus: false, // 焦点时不重新验证
      revalidateOnReconnect: true, // 重连时重新验证
      dedupingInterval: 60000, // 60秒内的重复请求会被去重
      errorRetryCount: 3, // 错误重试次数
      errorRetryInterval: 5000, // 重试间隔
    },
  );

  return {
    assistants: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * 获取单个助手 - 使用 SWR
 */
export function useAssistantSWR(id: string | null) {
  const { getAssistantById } = useAssistantsApi();

  const { data, error, isLoading, mutate } = useSWR(
    id ? `assistant-${id}` : null,
    async () => {
      if (!id) return null;
      const result = await getAssistantById(id);
      return result?.data || null;
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    },
  );

  return {
    assistant: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * 增强的助手 API hooks - 结合 CRUD 操作和 SWR 缓存
 */
export function useAssistantsWithActions() {
  const { assistants, isLoading, error, refresh } = useAssistantsSWR();
  const { createAssistant, updateAssistant, deleteAssistant } =
    useAssistantsApi();

  return {
    // SWR 数据
    assistants,
    isLoading,
    error,

    // CRUD 操作（带缓存更新）
    async create(data: Parameters<typeof createAssistant>[0]) {
      try {
        const result = await createAssistant(data);
        if (result) {
          // 创建成功后，刷新缓存
          refresh();
        }
        return result;
      } catch (error) {
        console.error("创建助手失败:", error);
        throw error;
      }
    },

    async update(id: string, data: Parameters<typeof updateAssistant>[1]) {
      try {
        const result = await updateAssistant(id, data);
        if (result) {
          // 更新成功后，刷新缓存
          refresh();
        }
        return result;
      } catch (error) {
        console.error("更新助手失败:", error);
        throw error;
      }
    },

    async remove(id: string) {
      try {
        const result = await deleteAssistant(id);
        if (result) {
          // 删除成功后，刷新缓存
          refresh();
        }
        return result;
      } catch (error) {
        console.error("删除助手失败:", error);
        throw error;
      }
    },

    // 手动刷新
    refresh,
  };
}
