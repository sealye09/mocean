import { registerApiRoute } from "@mastra/core/server";

import {
  createAgent,
  deleteAgent,
  getAgentById,
  getAgents,
  updateAgent,
} from "../prisma/agent";

/**
 * 获取所有代理的路由处理器
 * @description 返回系统中所有可用的代理列表
 */
const getAgentsRouter = registerApiRoute("/agents", {
  method: "GET",
  handler: async () => {
    try {
      const agents = await getAgents();
      return new Response(JSON.stringify(agents), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "获取代理列表失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 根据ID获取单个代理的路由处理器
 * @description 通过代理ID获取特定代理的详细信息
 * @param c - Mastra上下文对象，包含请求信息
 */
const getAgentByIdRouter = registerApiRoute("/agents/:id", {
  method: "GET",
  handler: async (c) => {
    try {
      const id = c.req.param("id");
      const agent = await getAgentById(id);

      if (!agent) {
        return new Response(JSON.stringify({ error: "代理不存在" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(agent), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "获取代理失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 创建新代理的路由处理器
 * @description 接收代理数据并在系统中创建新的代理
 * @param c - Mastra上下文对象，包含请求信息
 */
const createAgentRouter = registerApiRoute("/agents", {
  method: "POST",
  handler: async (c) => {
    try {
      const agentData = await c.req.json();
      const newAgent = await createAgent(agentData);
      return new Response(JSON.stringify(newAgent), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "创建代理失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 更新代理的路由处理器
 * @description 接收代理ID和更新数据，修改指定代理的信息
 * @param c - Mastra上下文对象，包含请求信息
 */
const updateAgentRouter = registerApiRoute("/agents/:id", {
  method: "PUT",
  handler: async (c) => {
    try {
      const id = c.req.param("id");
      const agentData = await c.req.json();
      const updatedAgent = await updateAgent(id, agentData);
      return new Response(JSON.stringify(updatedAgent), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "更新代理失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 删除代理的路由处理器
 * @description 根据代理ID删除指定的代理
 * @param c - Mastra上下文对象，包含请求信息
 */
const deleteAgentRouter = registerApiRoute("/agents/:id", {
  method: "DELETE",
  handler: async (c) => {
    try {
      const id = c.req.param("id");
      const deletedAgent = await deleteAgent(id);
      return new Response(JSON.stringify(deletedAgent), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "删除代理失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

// const chatWithAgent = registerApiRoute("/agents/chat", {
//   method: "POST",
//   handler: async (c) => {
//     const { agentId, message } = (await c.req.json()) as {
//       agentId: string;
//       message: string;
//     };
//     const agent = await getAgentById(agentId);

//     return DynamicAgent.stream(message, {
//       runtimeContext: createCommonRunTime({
//         name: agent.name,
//         instructions: agent.prompt,
//         model: agent.
//       }),
//     });
//   },
// });

/**
 * 代理相关路由的导出数组
 * @description 包含所有代理相关API路由的数组，用于在应用程序中注册这些路由
 */
export const agentsRouter = [
  getAgentsRouter,
  getAgentByIdRouter,
  createAgentRouter,
  updateAgentRouter,
  deleteAgentRouter,
];

/**
 * API 请求示例
 *
 * 1. 获取所有代理
 * GET /agents
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/agents', {
 *   method: 'GET',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 * const agents = await response.json();
 * ```
 *
 * 响应示例：
 * ```json
 * [
 *   {
 *     "id": "agent-123",
 *     "name": "客服助手",
 *     "description": "专业的客服代理",
 *     "prompt": "你是一个专业的客服助手...",
 *     "type": "customer_service",
 *     "emoji": "🤖",
 *     "enableWebSearch": true,
 *     "createdAt": "2024-01-01T00:00:00.000Z"
 *   }
 * ]
 * ```
 *
 * 2. 根据ID获取单个代理
 * GET /agents/:id
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/agents/agent-123', {
 *   method: 'GET',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 * const agent = await response.json();
 * ```
 *
 * 3. 创建新代理
 * POST /agents
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/agents', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     name: "销售助手",
 *     description: "专业的销售代理",
 *     prompt: "你是一个专业的销售助手，擅长产品推荐和客户沟通...",
 *     type: "sales",
 *     emoji: "💼",
 *     enableWebSearch: false,
 *     enableGenerateImage: true,
 *     knowledgeRecognition: true
 *   })
 * });
 * const newAgent = await response.json();
 * ```
 *
 * 4. 更新代理
 * PUT /agents/:id
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/agents/agent-123', {
 *   method: 'PUT',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     name: "高级客服助手",
 *     description: "升级版的客服代理",
 *     prompt: "你是一个高级客服助手，具备更强的问题解决能力...",
 *     enableWebSearch: true,
 *     enableGenerateImage: false
 *   })
 * });
 * const updatedAgent = await response.json();
 * ```
 *
 * 5. 删除代理
 * DELETE /agents/:id
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/agents/agent-123', {
 *   method: 'DELETE',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 * const deletedAgent = await response.json();
 * ```
 *
 * 错误响应示例：
 * ```json
 * {
 *   "error": "代理不存在"
 * }
 * ```
 *
 * 使用 curl 命令示例：
 *
 * 获取所有代理：
 * ```bash
 * curl -X GET http://localhost:4111/agents \
 *   -H "Content-Type: application/json"
 * ```
 *
 * 创建代理：
 * ```bash
 * curl -X POST http://localhost:4111/agents \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "测试代理",
 *     "description": "这是一个测试代理",
 *     "prompt": "你是一个测试助手",
 *     "type": "general",
 *     "emoji": "🧪"
 *   }'
 * ```
 *
 * 更新代理：
 * ```bash
 * curl -X PUT http://localhost:4111/agents/agent-123 \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "更新后的代理",
 *     "description": "更新后的描述"
 *   }'
 * ```
 *
 * 删除代理：
 * ```bash
 * curl -X DELETE http://localhost:4111/agents/agent-123 \
 *   -H "Content-Type: application/json"
 * ```
 */
