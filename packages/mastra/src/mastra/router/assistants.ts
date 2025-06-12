import { registerApiRoute } from "@mastra/core/server";

import {
  createAssistant,
  deleteAssistant,
  getAssistantById,
  getAssistants,
  updateAssistant,
} from "../prisma/assistant";

/**
 * 获取所有助手的路由处理器
 * @description 返回系统中所有可用的助手列表
 */
const getAssistantsRouter = registerApiRoute("/assistants", {
  method: "GET",
  handler: async () => {
    try {
      const assistants = await getAssistants();
      return new Response(JSON.stringify(assistants), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "获取助手列表失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 根据ID获取单个助手的路由处理器
 * @description 通过助手ID获取特定助手的详细信息
 * @param c - Mastra上下文对象，包含请求信息
 */
const getAssistantByIdRouter = registerApiRoute("/assistants/:id", {
  method: "GET",
  handler: async (c) => {
    try {
      const id = c.req.param("id");
      const assistant = await getAssistantById(id);

      if (!assistant) {
        return new Response(JSON.stringify({ error: "助手不存在" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(assistant), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "获取助手失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 创建新助手的路由处理器
 * @description 接收助手数据并在系统中创建新的助手
 * @param c - Mastra上下文对象，包含请求信息
 */
const createAssistantRouter = registerApiRoute("/assistants", {
  method: "POST",
  handler: async (c) => {
    try {
      const assistantData = await c.req.json();
      const newAssistant = await createAssistant(assistantData);
      return new Response(JSON.stringify(newAssistant), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "创建助手失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 更新助手的路由处理器
 * @description 接收助手ID和更新数据，修改指定助手的信息
 * @param c - Mastra上下文对象，包含请求信息
 */
const updateAssistantRouter = registerApiRoute("/assistants/:id", {
  method: "PUT",
  handler: async (c) => {
    try {
      const id = c.req.param("id");
      const assistantData = await c.req.json();
      const updatedAssistant = await updateAssistant(id, assistantData);
      return new Response(JSON.stringify(updatedAssistant), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "更新助手失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 删除助手的路由处理器
 * @description 根据助手ID删除指定的助手
 * @param c - Mastra上下文对象，包含请求信息
 */
const deleteAssistantRouter = registerApiRoute("/assistants/:id", {
  method: "DELETE",
  handler: async (c) => {
    try {
      const id = c.req.param("id");
      const deletedAssistant = await deleteAssistant(id);
      return new Response(JSON.stringify(deletedAssistant), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "删除助手失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 助手相关路由的导出数组
 * @description 包含所有助手相关API路由的数组，用于在应用程序中注册这些路由
 */
export const assistantsRouter = [
  getAssistantsRouter,
  getAssistantByIdRouter,
  createAssistantRouter,
  updateAssistantRouter,
  deleteAssistantRouter,
];

/**
 * API 请求示例
 *
 * 1. 获取所有助手
 * GET /assistants
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/assistants', {
 *   method: 'GET',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 * const assistants = await response.json();
 * ```
 *
 * 响应示例：
 * ```json
 * [
 *   {
 *     "id": "assistant-123",
 *     "name": "客服助手",
 *     "description": "专业的客服助手",
 *     "prompt": "你是一个专业的客服助手...",
 *     "type": "assistant",
 *     "emoji": "🤖",
 *     "enableWebSearch": true,
 *     "modelId": "model-456",
 *     "createdAt": "2024-01-01T00:00:00.000Z"
 *   }
 * ]
 * ```
 *
 * 2. 根据ID获取单个助手
 * GET /assistants/:id
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/assistants/assistant-123', {
 *   method: 'GET',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 * const assistant = await response.json();
 * ```
 *
 * 3. 创建新助手
 * POST /assistants
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/assistants', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     name: "销售助手",
 *     description: "专业的销售助手",
 *     prompt: "你是一个专业的销售助手，擅长产品推荐和客户沟通...",
 *     type: "assistant",
 *     emoji: "💼",
 *     enableWebSearch: false,
 *     enableGenerateImage: true,
 *     knowledgeRecognition: "on"
 *   })
 * });
 * const newAssistant = await response.json();
 * ```
 *
 * 4. 更新助手
 * PUT /assistants/:id
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/assistants/assistant-123', {
 *   method: 'PUT',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     name: "高级客服助手",
 *     description: "升级版的客服助手",
 *     prompt: "你是一个高级客服助手，具备更强的问题解决能力...",
 *     enableWebSearch: true,
 *     enableGenerateImage: false
 *   })
 * });
 * const updatedAssistant = await response.json();
 * ```
 *
 * 5. 删除助手
 * DELETE /assistants/:id
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/assistants/assistant-123', {
 *   method: 'DELETE',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 * const deletedAssistant = await response.json();
 * ```
 *
 * 错误响应示例：
 * ```json
 * {
 *   "error": "助手不存在"
 * }
 * ```
 *
 * 使用 curl 命令示例：
 *
 * 获取所有助手：
 * ```bash
 * curl -X GET http://localhost:4111/assistants \
 *   -H "Content-Type: application/json"
 * ```
 *
 * 创建助手：
 * ```bash
 * curl -X POST http://localhost:4111/assistants \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "测试助手",
 *     "description": "这是一个测试助手",
 *     "prompt": "你是一个测试助手",
 *     "type": "assistant",
 *     "emoji": "🧪"
 *   }'
 * ```
 *
 * 更新助手：
 * ```bash
 * curl -X PUT http://localhost:4111/assistants/assistant-123 \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "更新后的助手",
 *     "description": "更新后的描述"
 *   }'
 * ```
 *
 * 删除助手：
 * ```bash
 * curl -X DELETE http://localhost:4111/assistants/assistant-123 \
 *   -H "Content-Type: application/json"
 * ```
 */
