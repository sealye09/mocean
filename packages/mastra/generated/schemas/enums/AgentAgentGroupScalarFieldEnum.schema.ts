import * as z from 'zod';

export const AgentAgentGroupScalarFieldEnumSchema = z.enum(['agentId', 'agentGroupId'])

export type AgentAgentGroupScalarFieldEnum = z.infer<typeof AgentAgentGroupScalarFieldEnumSchema>;