import { registerApiRoute } from "@mastra/core/server";

import {
  createAgent,
  deleteAgent,
  getAgentById,
  getAgents,
  updateAgent,
} from "../prisma/agents";

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
