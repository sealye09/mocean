import { registerApiRoute } from "@mastra/core/server";

import { getAgents } from "../prisma/agents";

export const agentsRouter = registerApiRoute("/get-agents", {
  method: "GET",

  handler: async (req) => {
    try {
      const agents = await getAgents();

      return req.json(agents);
    } catch (error) {
      return req.json({ error }, 500);
    }
  },
});
