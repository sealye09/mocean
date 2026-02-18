import * as z from 'zod';

export const MCPAgentServerSchema = z.object({

  agentId: z.string(),

  mcpServerId: z.string(),
});

export type MCPAgentServerType = z.infer<typeof MCPAgentServerSchema>;
