import { RuntimeContext } from "@mastra/core/di";

export type CommonRunTimeType = {
  /**
   * @description Agent 名称
   */
  name: string;

  /**
   * @description Agent 指令
   */
  instructions: string;

  /**
   * @description Agent 模型
   */
  model: string;
};

export const createCommonRunTime = ({
  name,
  instructions,
  model,
}: CommonRunTimeType) => {
  const context = new RuntimeContext<CommonRunTimeType>();

  context.set("name", name);
  context.set("instructions", instructions);
  context.set("model", model);

  return context;
};
