import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { execSync } from "child_process";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { PrismaClient } from "generated/prisma/client";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 使用文件数据库，这样 prisma db push（独立进程）和 PrismaClient 能访问同一个库
const mastraDir = join(__dirname, "..", "..", "..", "..");
const TEST_DB_DIR = join(mastraDir, "db");
const TEST_DB_PATH = join(TEST_DB_DIR, "test.db");
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

// 全局 Prisma 实例
let prismaInstance: PrismaClient | null = null;

/**
 * 同步获取已初始化的 Prisma 实例（供 vi.mock 使用）
 * 必须在 initTestDatabase 之后调用
 */
export function getPrismaInstance(): PrismaClient {
  if (!prismaInstance) {
    throw new Error(
      "Test database not initialized. Call initTestDatabase() first."
    );
  }
  return prismaInstance;
}

/**
 * 获取测试用 Prisma 客户端
 */
export async function getTestPrisma(): Promise<PrismaClient> {
  if (prismaInstance) {
    return prismaInstance;
  }

  const adapter = new PrismaBetterSqlite3({
    url: TEST_DB_PATH
  });

  prismaInstance = new PrismaClient({
    adapter
  });

  await prismaInstance.$connect();

  return prismaInstance;
}

/**
 * 初始化测试数据库 schema
 * 使用 prisma db push 同步 schema 到测试数据库文件
 */
let initialized = false;

export async function initTestDatabase(): Promise<void> {
  // 避免多个测试文件重复初始化（setupFiles 的 beforeAll 每个文件都会调用）
  if (initialized) {
    return;
  }

  // 确保 db 目录存在
  if (!existsSync(TEST_DB_DIR)) {
    mkdirSync(TEST_DB_DIR, { recursive: true });
  }

  // 清理旧的测试数据库（如果存在）
  if (existsSync(TEST_DB_PATH)) {
    try {
      unlinkSync(TEST_DB_PATH);
    } catch {
      // 文件可能被占用，忽略
    }
  }

  const schemaPath = join(mastraDir, "prisma", "schema.prisma");

  // 使用 --url 直接指定数据库地址，避免依赖 schema 中的 url 字段
  try {
    execSync(
      `npx prisma db push --schema "${schemaPath}" --accept-data-loss --url "${TEST_DB_URL}"`,
      {
        cwd: mastraDir,
        stdio: "pipe"
      }
    );
  } catch {
    // 如果 DB 文件已存在且 schema 已同步（如另一个测试文件先初始化了），忽略错误
    if (!existsSync(TEST_DB_PATH)) {
      throw new Error("Failed to initialize test database");
    }
  }

  // 建表完成后再创建 PrismaClient 连接
  await getTestPrisma();
  initialized = true;
}

/**
 * 清空所有表数据（保留 schema）
 * 动态查询 sqlite_master 获取表名，无需手动维护列表
 */
export async function clearTestDatabase(): Promise<void> {
  const prisma = await getTestPrisma();

  const tables = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type='table'
     AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'`
  );

  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF");

  for (const { name } of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${name}"`);
    } catch {
      // 忽略
    }
  }

  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");
}

/**
 * 关闭数据库连接
 * 注意：不删除 DB 文件，因为其他测试文件可能还需要使用同一个 DB
 */
export async function closeTestDatabase(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}
