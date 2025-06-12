import { agentsRouter } from "./agents";
import { assistantsRouter } from "./assistants";

const apiRoutes = [...agentsRouter, ...assistantsRouter];

export { apiRoutes };
