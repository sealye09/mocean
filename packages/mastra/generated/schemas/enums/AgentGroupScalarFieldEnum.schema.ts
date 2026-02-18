import * as z from 'zod';

export const AgentGroupScalarFieldEnumSchema = z.enum(['id', 'name', 'label', 'createdAt', 'updatedAt'])

export type AgentGroupScalarFieldEnum = z.infer<typeof AgentGroupScalarFieldEnumSchema>;