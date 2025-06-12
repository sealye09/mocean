/// <reference lib="dom" />
import { AssistantModel } from "generated/prisma/models";

/**
 * 助手创建和更新的输入类型
 */
export type AssistantInput = Pick<
  AssistantModel,
  | "name"
  | "prompt"
  | "type"
  | "emoji"
  | "description"
  | "enableWebSearch"
  | "webSearchProviderId"
  | "enableGenerateImage"
  | "knowledgeRecognition"
  | "modelId"
  | "defaultModelId"
>;

/**
 * API 响应的基础类型
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * API 客户端配置
 */
export interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

/**
 * 请求选项类型
 */
interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

/**
 * 助手 API 客户端类
 * @description 提供类型安全的助手相关 API 调用方法
 */
export class AssistantsApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || "http://localhost:4111";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  /**
   * 发送 HTTP 请求的通用方法
   * @param endpoint - API 端点
   * @param options - 请求选项
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "网络请求失败" };
    }
  }

  /**
   * 获取所有助手
   * @description 获取系统中所有可用的助手列表
   */
  async getAssistants(): Promise<ApiResponse<AssistantModel[]>> {
    return this.request<AssistantModel[]>("/assistants", {
      method: "GET",
    });
  }

  /**
   * 根据ID获取单个助手
   * @description 通过助手ID获取特定助手的详细信息
   * @param id - 助手的唯一标识符
   */
  async getAssistantById(id: string): Promise<ApiResponse<AssistantModel>> {
    return this.request<AssistantModel>(`/assistants/${id}`, {
      method: "GET",
    });
  }

  /**
   * 创建新助手
   * @description 在系统中创建一个新的助手
   * @param assistantData - 助手信息对象
   */
  async createAssistant(
    assistantData: AssistantInput,
  ): Promise<ApiResponse<AssistantModel>> {
    return this.request<AssistantModel>("/assistants", {
      method: "POST",
      body: JSON.stringify(assistantData),
    });
  }

  /**
   * 更新助手信息
   * @description 更新指定助手的信息
   * @param id - 助手的唯一标识符
   * @param assistantData - 更新的助手信息
   */
  async updateAssistant(
    id: string,
    assistantData: Partial<AssistantInput>,
  ): Promise<ApiResponse<AssistantModel>> {
    return this.request<AssistantModel>(`/assistants/${id}`, {
      method: "PUT",
      body: JSON.stringify(assistantData),
    });
  }

  /**
   * 删除助手
   * @description 删除指定的助手
   * @param id - 助手的唯一标识符
   */
  async deleteAssistant(id: string): Promise<ApiResponse<AssistantModel>> {
    return this.request<AssistantModel>(`/assistants/${id}`, {
      method: "DELETE",
    });
  }
}

/**
 * 默认的助手 API 客户端实例
 */
export const assistantsApi = new AssistantsApiClient();

/**
 * 便捷的函数式 API 调用方法
 * @description 提供更简洁的函数调用方式
 */
export const assistantsApiMethods = {
  /**
   * 获取所有助手
   */
  getAssistants: () => assistantsApi.getAssistants(),

  /**
   * 根据ID获取助手
   * @param id - 助手ID
   */
  getAssistantById: (id: string) => assistantsApi.getAssistantById(id),

  /**
   * 创建助手
   * @param assistantData - 助手数据
   */
  createAssistant: (assistantData: AssistantInput) =>
    assistantsApi.createAssistant(assistantData),

  /**
   * 更新助手
   * @param id - 助手ID
   * @param assistantData - 更新数据
   */
  updateAssistant: (id: string, assistantData: Partial<AssistantInput>) =>
    assistantsApi.updateAssistant(id, assistantData),

  /**
   * 删除助手
   * @param id - 助手ID
   */
  deleteAssistant: (id: string) => assistantsApi.deleteAssistant(id),
};

/**
 * React Hook 风格的 API 调用方法
 * @description 适用于 React 应用的 Hook 风格调用
 */
export const useAssistantsApi = () => {
  return {
    /**
     * 获取所有助手
     */
    getAssistants: assistantsApiMethods.getAssistants,

    /**
     * 根据ID获取助手
     */
    getAssistantById: assistantsApiMethods.getAssistantById,

    /**
     * 创建助手
     */
    createAssistant: assistantsApiMethods.createAssistant,

    /**
     * 更新助手
     */
    updateAssistant: assistantsApiMethods.updateAssistant,

    /**
     * 删除助手
     */
    deleteAssistant: assistantsApiMethods.deleteAssistant,
  };
};

/**
 * 使用示例
 *
 * 基础使用：
 * ```typescript
 * import { assistantsApi } from '@/api/assistants-client';
 *
 * // 获取所有助手
 * const response = await assistantsApi.getAssistants();
 * if (response.data) {
 *   console.log('助手列表:', response.data);
 * } else {
 *   console.error('错误:', response.error);
 * }
 * ```
 *
 * 函数式调用：
 * ```typescript
 * import { assistantsApiMethods } from '@/api/assistants-client';
 *
 * // 创建助手
 * const newAssistant = await assistantsApiMethods.createAssistant({
 *   name: '客服助手',
 *   prompt: '你是一个专业的客服助手',
 *   type: 'assistant',
 *   description: '提供客服支持',
 *   emoji: '🤖'
 * });
 * ```
 *
 * React Hook 使用：
 * ```typescript
 * import { useAssistantsApi } from '@/api/assistants-client';
 *
 * function AssistantComponent() {
 *   const assistantsApi = useAssistantsApi();
 *
 *   const handleCreateAssistant = async () => {
 *     const response = await assistantsApi.createAssistant({
 *       name: '新助手',
 *       prompt: '助手提示词',
 *       type: 'assistant'
 *     });
 *
 *     if (response.data) {
 *       console.log('创建成功:', response.data);
 *     }
 *   };
 *
 *   return <button onClick={handleCreateAssistant}>创建助手</button>;
 * }
 * ```
 */
