import { RuntimeContext } from "@mastra/core/di";

import { AssistantDetailResult } from "../server/assistant";

export type CommonRunTimeType = {
  assistant: AssistantDetailResult;
};

export const createCommonRunTime = ({ assistant }: CommonRunTimeType) => {
  const context = new RuntimeContext<CommonRunTimeType>();

  context.set("assistant", assistant);

  return context;
};
