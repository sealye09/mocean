/*
  Warnings:

  - You are about to drop the column `provider` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `Model` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ModelProvider" (
    "modelId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,

    PRIMARY KEY ("modelId", "providerId"),
    CONSTRAINT "ModelProvider_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModelProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Model" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "owned_by" TEXT,
    "description" TEXT,
    "typeJson" JSONB NOT NULL
);
INSERT INTO "new_Model" ("description", "group", "id", "name", "owned_by", "typeJson") SELECT "description", "group", "id", "name", "owned_by", "typeJson" FROM "Model";
DROP TABLE "Model";
ALTER TABLE "new_Model" RENAME TO "Model";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
