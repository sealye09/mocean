/*
  Warnings:

  - You are about to drop the column `isNotSupportArrayContent` on the `Provider` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT,
    "apiHost" TEXT,
    "apiVersion" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isAuthed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "isGateway" BOOLEAN NOT NULL DEFAULT false,
    "modelCount" INTEGER DEFAULT 0,
    "docsUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Provider" ("apiHost", "apiKey", "apiVersion", "createdAt", "docsUrl", "enabled", "id", "isAuthed", "isGateway", "isSystem", "modelCount", "name", "notes", "type", "updatedAt") SELECT "apiHost", "apiKey", "apiVersion", "createdAt", "docsUrl", "enabled", "id", "isAuthed", "isGateway", "isSystem", "modelCount", "name", "notes", "type", "updatedAt" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
