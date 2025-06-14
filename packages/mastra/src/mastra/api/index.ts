import { agentsApiMethods, useAgentsApi } from "./agents-client";
import { assistantsApiMethods, useAssistantsApi } from "./assistants-client";

export { BASE_URL } from "./base-client";

/**
 * API 客户端统一导出
 * @description 提供所有API客户端的统一入口
 */

// 基础API客户端
export {
  BaseApiClient,
  type ApiResponse,
  type ApiClientConfig,
} from "./base-client";

// 代理相关API
export {
  AgentsApiClient,
  agentsApi,
  agentsApiMethods,
  useAgentsApi,
  type AgentInput,
} from "./agents-client";

// 助手相关API
export {
  AssistantsApiClient,
  assistantsApi,
  assistantsApiMethods,
  useAssistantsApi,
  type AssistantInput,
} from "./assistants-client";

/**
 * 所有API方法的统一导出
 * @description 方便前端一次性导入所有API方法
 */
export const api = {
  agents: agentsApiMethods,
  assistants: assistantsApiMethods,
};

/**
 * 所有React Hook的统一导出
 * @description 方便React应用统一管理API调用
 */
export const useApi = () => ({
  agents: useAgentsApi(),
  assistants: useAssistantsApi(),
});
