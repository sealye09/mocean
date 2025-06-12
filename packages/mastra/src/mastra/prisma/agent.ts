import { AgentModel } from "generated/prisma/models";

import { prisma } from "./index";

/**
 * 获取所有代理
 * @description 从数据库中获取所有代理的列表
 * @returns 包含所有代理信息的数组
 */
const getAgents = async () => {
  const agents = await prisma.agent.findMany();
  return agents;
};

/**
 * 根据ID获取单个代理
 * @description 通过代理ID从数据库中获取特定代理的详细信息
 * @param id - 代理的唯一标识符
 * @returns 代理对象，如果不存在则返回null
 */
const getAgentById = async (id: string) => {
  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
  });
  return agent;
};

/**
 * 创建新代理
 * @description 在数据库中创建一个新的代理记录
 * @param agent - 包含代理信息的对象，包括名称、描述、提示词等必要字段
 * @returns 新创建的代理对象，包含生成的ID和时间戳
 */
const createAgent = async (
  agent: Pick<
    AgentModel,
    | "name"
    | "description"
    | "prompt"
    | "type"
    | "emoji"
    | "groupJson"
    | "enableWebSearch"
    | "webSearchProviderId"
    | "enableGenerateImage"
    | "knowledgeRecognition"
  >,
) => {
  const newAgent = await prisma.agent.create({
    data: {
      ...agent,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  return newAgent;
};

/**
 * 更新代理信息
 * @description 根据代理ID更新数据库中的代理信息
 * @param id - 要更新的代理的唯一标识符
 * @param agent - 包含更新信息的对象，包括名称、描述、提示词等字段
 * @returns 更新后的代理对象
 */
const updateAgent = async (
  id: string,
  agent: Pick<
    AgentModel,
    | "name"
    | "description"
    | "prompt"
    | "type"
    | "emoji"
    | "groupJson"
    | "enableWebSearch"
    | "webSearchProviderId"
    | "enableGenerateImage"
    | "knowledgeRecognition"
  >,
) => {
  const updatedAgent = await prisma.agent.update({
    where: {
      id,
    },
    data: {
      ...agent,
      updatedAt: new Date(),
    },
  });
  return updatedAgent;
};

/**
 * 删除代理
 * @description 根据代理ID从数据库中删除指定的代理
 * @param id - 要删除的代理的唯一标识符
 * @returns 被删除的代理对象
 */
const deleteAgent = async (id: string) => {
  const deletedAgent = await prisma.agent.delete({
    where: {
      id,
    },
  });
  return deletedAgent;
};

export { getAgents, getAgentById, createAgent, updateAgent, deleteAgent };
