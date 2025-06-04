import { AgentModel } from "generated/prisma/models";

import { prisma } from "../index";

const getAgents = async () => {
  const agents = await prisma.agent.findMany();
  return agents;
};

const getAgentById = async (id: string) => {
  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
  });
  return agent;
};

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

const deleteAgent = async (id: string) => {
  const deletedAgent = await prisma.agent.delete({
    where: {
      id,
    },
  });
  return deletedAgent;
};

export { getAgents, getAgentById, createAgent, updateAgent, deleteAgent };
