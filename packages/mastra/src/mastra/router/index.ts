import { agentsRouter } from "./agents";
import { assistantsRouter } from "./assistants";
import { modelsRouter } from "./models";
import { providersRouter } from "./providers";

const apiRoutes = [
  ...agentsRouter,
  ...assistantsRouter,
  ...providersRouter,
  ...modelsRouter,
];

export { apiRoutes };
