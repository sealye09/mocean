/*
  Warnings:

  - You are about to drop the column `group` on the `Model` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ModelProvider" ADD COLUMN "group" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Model" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "owned_by" TEXT,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "contextLength" INTEGER,
    "supportsAttachments" BOOLEAN NOT NULL DEFAULT false,
    "supportsTools" BOOLEAN NOT NULL DEFAULT false,
    "supportsReasoning" BOOLEAN NOT NULL DEFAULT false,
    "supportsImage" BOOLEAN NOT NULL DEFAULT false,
    "supportsAudio" BOOLEAN NOT NULL DEFAULT false,
    "supportsVideo" BOOLEAN NOT NULL DEFAULT false,
    "supportsEmbedding" BOOLEAN NOT NULL DEFAULT false,
    "inputPricePerMillion" REAL,
    "outputPricePerMillion" REAL
);
INSERT INTO "new_Model" ("contextLength", "description", "id", "inputPricePerMillion", "isSystem", "name", "outputPricePerMillion", "owned_by", "supportsAttachments", "supportsAudio", "supportsEmbedding", "supportsImage", "supportsReasoning", "supportsTools", "supportsVideo") SELECT "contextLength", "description", "id", "inputPricePerMillion", "isSystem", "name", "outputPricePerMillion", "owned_by", "supportsAttachments", "supportsAudio", "supportsEmbedding", "supportsImage", "supportsReasoning", "supportsTools", "supportsVideo" FROM "Model";
DROP TABLE "Model";
ALTER TABLE "new_Model" RENAME TO "Model";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
