import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "generated/prisma/client";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件相对于 packages/mastra 目录的位置
// 从 src/mastra/server 向上两级到 packages/mastra
const mastraDir = join(__dirname, "..", "..", "..");
const defaultDbPath = join(mastraDir, "db", "prisma.db");

const adapter = new PrismaBetterSqlite3({
  url: process.env.PRISMA_DATABASE_URL || defaultDbPath
});

export const prisma = new PrismaClient({ adapter });
