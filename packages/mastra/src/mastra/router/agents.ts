import { registerApiRoute } from "@mastra/core/server";
import { z } from "zod";

import { PREFIX } from "../api/base-client";
import {
  createAgent,
  createAgentSchema,
  deleteAgent,
  getAgentByGroup,
  getAgentById,
  getAgents,
  groupParamSchema,
  idParamSchema,
  updateAgent,
  updateAgentSchema,
} from "../server/agent";

/**
 * 获取所有智能体的路由处理器
 * @description 返回系统中所有可用的智能体列表
 */
const getAgentsRouter = registerApiRoute(`${PREFIX}/agents`, {
  method: "GET",
  handler: async () => {
    try {
      const agents = await getAgents();
      return new Response(JSON.stringify(agents), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error, message: "获取智能体列表失败" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});

/**
 * 根据ID获取单个智能体的路由处理器
 * @description 通过智能体ID获取特定智能体的详细信息
 * @param c - Mastra上下文对象，包含请求信息
 */
const getAgentByIdRouter = registerApiRoute(`${PREFIX}/agents/:id`, {
  method: "GET",
  handler: async (c) => {
    try {
      // 参数校验
      const { id } = idParamSchema.parse({
        id: c.req.param("id"),
      });

      const agent = await getAgentById(id);

      if (!agent) {
        return new Response(JSON.stringify({ error: "智能体不存在" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(agent), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            error: "参数校验失败",
            details: error.errors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response(
        JSON.stringify({ error, message: "获取智能体失败" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});

/**
 * 创建新智能体的路由处理器
 * @description 接收智能体数据并在系统中创建新的智能体
 * @param c - Mastra上下文对象，包含请求信息
 */
const createAgentRouter = registerApiRoute(`${PREFIX}/agents`, {
  method: "POST",
  handler: async (c) => {
    try {
      const rawData = await c.req.json();

      // 参数校验
      const agentData = createAgentSchema.parse(rawData);

      const newAgent = await createAgent(agentData);
      return new Response(JSON.stringify(newAgent), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            error: "参数校验失败",
            details: error.errors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response(JSON.stringify({ error: "创建智能体失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 更新智能体的路由处理器
 * @description 接收智能体ID和更新数据，修改指定智能体的信息
 * @param c - Mastra上下文对象，包含请求信息
 */
const updateAgentRouter = registerApiRoute(`${PREFIX}/agents/:id`, {
  method: "PUT",
  handler: async (c) => {
    try {
      // 参数校验
      const { id } = idParamSchema.parse({
        id: c.req.param("id"),
      });

      const rawData = await c.req.json();
      const agentData = updateAgentSchema.parse(rawData);

      const updatedAgent = await updateAgent(id, agentData);
      return new Response(JSON.stringify(updatedAgent), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            error: "参数校验失败",
            details: error.errors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response(JSON.stringify({ error: "更新智能体失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

/**
 * 删除智能体的路由处理器
 * @description 根据智能体ID删除指定的智能体
 * @param c - Mastra上下文对象，包含请求信息
 */
const deleteAgentRouter = registerApiRoute(`${PREFIX}/agents/:id`, {
  method: "DELETE",
  handler: async (c) => {
    try {
      // 参数校验
      const { id } = idParamSchema.parse({
        id: c.req.param("id"),
      });

      const deletedAgent = await deleteAgent(id);
      return new Response(JSON.stringify(deletedAgent), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            error: "参数校验失败",
            details: error.errors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response(JSON.stringify({ error: "删除智能体失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

const getAgentByGroupRouter = registerApiRoute(
  `${PREFIX}/agents/group/:group`,
  {
    method: "GET",
    handler: async (c) => {
      try {
        const { group } = groupParamSchema.parse(c.req.param("group"));
        const agents = await getAgentByGroup(group);
        if (!agents) {
          return new Response(JSON.stringify({ error: "分组不存在" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(agents), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error, message: "获取智能体失败" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    },
  },
);

/**
/**
 * 智能体相关路由的导出数组
 * @description 包含所有智能体相关API路由的数组，用于在应用程序中注册这些路由
 */
export const agentsRouter = [
  getAgentsRouter,
  getAgentByIdRouter,
  createAgentRouter,
  updateAgentRouter,
  deleteAgentRouter,
  getAgentByGroupRouter,
];

/**
 * API 请求示例
 *
 * 1. 获取所有智能体
 * GET /api/agents
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/api/agents', {
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
 *     "description": "专业的客服智能体",
 *     "prompt": "你是一个专业的客服助手...",
 *     "type": "agent",
 *     "emoji": "🤖",
 *     "groupJson": "[\"职业\", \"商业\"]",
 *     "enableWebSearch": true,
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "settings": null
 *   }
 * ]
 * ```
 *
 * 2. 根据ID获取单个智能体
 * GET /api/agents/:id
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/api/agents/agent-123', {
 *   method: 'GET',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 * const agent = await response.json();
 * ```
 *
 * 3. 创建新智能体
 * POST /api/agents
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/api/agents', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     name: "销售助手",
 *     description: "专业的销售智能体",
 *     prompt: "你是一个专业的销售助手，擅长产品推荐和客户沟通...",
 *     type: "agent",
 *     emoji: "💼",
 *     groupJson: "[\"职业\", \"商业\"]",
 *     enableWebSearch: false,
 *     enableGenerateImage: true,
 *     knowledgeRecognition: "on"
 *   })
 * });
 * const newAgent = await response.json();
 * ```
 *
 * 4. 更新智能体
 * PUT /api/agents/:id
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/api/agents/agent-123', {
 *   method: 'PUT',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     name: "高级客服助手",
 *     description: "升级版的客服智能体",
 *     prompt: "你是一个高级客服助手，具备更强的问题解决能力...",
 *     enableWebSearch: true,
 *     enableGenerateImage: false
 *   })
 * });
 * const updatedAgent = await response.json();
 * ```
 *
 * 5. 删除智能体
 * DELETE /api/agents/:id
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/api/agents/agent-123', {
 *   method: 'DELETE',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 * const deletedAgent = await response.json();
 * ```
 *
 * 6. 与智能体聊天
 * POST /api/agents/chat
 *
 * 示例请求：
 * ```javascript
 * const response = await fetch('http://localhost:4111/api/agents/chat', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     agentId: "agent-123",
 *     message: "你好，我需要帮助"
 *   })
 * });
 * // 这个端点返回流式响应
 * const reader = response.body?.getReader();
 * ```
 *
 * 错误响应示例：
 * ```json
 * {
 *   "error": "参数校验失败",
 *   "details": [
 *     {
 *       "code": "too_small",
 *       "minimum": 1,
 *       "type": "string",
 *       "inclusive": true,
 *       "exact": false,
 *       "message": "智能体名称不能为空",
 *       "path": ["name"]
 *     }
 *   ]
 * }
 * ```
 *
 * 使用 curl 命令示例：
 *
 * 获取所有智能体：
 * ```bash
 * curl -X GET http://localhost:4111/api/agents \
 *   -H "Content-Type: application/json"
 * ```
 *
 * 创建智能体：
 * ```bash
 * curl -X POST http://localhost:4111/api/agents \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "测试智能体",
 *     "description": "这是一个测试智能体",
 *     "prompt": "你是一个测试助手",
 *     "type": "agent",
 *     "emoji": "🧪",
 *     "groupJson": "[\"测试\", \"工具\"]"
 *   }'
 * ```
 *
 * 更新智能体：
 * ```bash
 * curl -X PUT http://localhost:4111/api/agents/agent-123 \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "更新后的智能体",
 *     "description": "更新后的描述"
 *   }'
 * ```
 *
 * 删除智能体：
 * ```bash
 * curl -X DELETE http://localhost:4111/api/agents/agent-123 \
 *   -H "Content-Type: application/json"
 * ```
 *
 * 与智能体聊天：
 * ```bash
 * curl -X POST http://localhost:4111/api/agents/chat \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "agentId": "agent-123",
 *     "message": "你好，我需要帮助"
 *   }' \
 *   --no-buffer
 * ```
 */
