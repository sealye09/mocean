import type { Group, Model, Provider } from "@mocean/mastra/prismaType";

export type FullProvider = Provider & {
  groups: Array<Group & { models: Model[] }>;
};
