import { afterAll, beforeAll, beforeEach, vi } from "vitest";

import {
  clearTestDatabase,
  closeTestDatabase,
  getPrismaInstance,
  getTestPrisma,
  initTestDatabase
} from "./database";

// Mock server/index.ts 使其使用测试数据库的 PrismaClient
// vi.mock 在模块加载前生效，但 factory 中的 getter 会延迟到实际使用时才取值
// 此时 beforeAll 中的 initTestDatabase 已完成，prismaInstance 已就绪
vi.mock("../../server/index", () => ({
  get prisma() {
    return getPrismaInstance();
  }
}));

// 全局钩子 - 在所有测试前初始化数据库
beforeAll(async () => {
  await initTestDatabase();
}, 60000);

// 全局钩子 - 在所有测试后关闭数据库
afterAll(async () => {
  await closeTestDatabase();
}, 10000);

// 每个测试前清空数据库
beforeEach(async () => {
  await clearTestDatabase();
});

// 导出供测试使用
export { getTestPrisma, clearTestDatabase };
