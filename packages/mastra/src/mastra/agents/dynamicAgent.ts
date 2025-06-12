import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { RuntimeContext } from "@mastra/core/di";

import { CommonRunTimeType } from "../runtime/CommonRunTime";

export const DynamicAgent = new Agent({
  name: "DynamicAgent",

  instructions: async ({ runtimeContext }) => {
    const fullTypeRuntimeContext =
      runtimeContext as RuntimeContext<CommonRunTimeType>;

    const instructions = fullTypeRuntimeContext.get("instructions");

    return instructions;
  },

  model: async ({ runtimeContext }) => {
    const fullTypeRuntimeContext =
      runtimeContext as RuntimeContext<CommonRunTimeType>;

    const model = fullTypeRuntimeContext.get("model");

    return openai(model);
  },
});
