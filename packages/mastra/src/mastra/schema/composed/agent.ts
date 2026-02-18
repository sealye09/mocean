/**
 * Composed Agent Schemas
 * 通过组合基础 schema 来构建含关联关系的完整类型
 * 避免循环引用，按需在业务层组装
 */
import {
  AgentAgentGroupSchema,
  AgentGroupSchema,
  AgentSchema,
  AssistantSettingsSchema
} from "generated/schemas/models";
import z from "zod";

// Agent 完整 Schema（含 settings）
export const AgentFullSchema = AgentSchema.extend({
  settings: AssistantSettingsSchema.nullish()
});

// AgentGroup 完整 Schema（含 agents 关联，每项含 agent 信息）
export const AgentGroupWithAgentsSchema = AgentGroupSchema.extend({
  agents: z.array(
    AgentAgentGroupSchema.pick({
      agentId: true,
      agentGroupId: true
    }).extend({
      agent: AgentSchema
    })
  )
});

export type AgentFullType = z.infer<typeof AgentFullSchema>;
export type AgentGroupWithAgentsType = z.infer<
  typeof AgentGroupWithAgentsSchema
>;
