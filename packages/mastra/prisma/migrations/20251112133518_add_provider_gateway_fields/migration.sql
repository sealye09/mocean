-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Model" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "owned_by" TEXT,
    "description" TEXT,
    "typeJson" JSONB NOT NULL,
    "contextLength" INTEGER,
    "supportsTools" BOOLEAN NOT NULL DEFAULT false,
    "supportsReasoning" BOOLEAN NOT NULL DEFAULT false,
    "supportsImage" BOOLEAN NOT NULL DEFAULT false,
    "supportsAudio" BOOLEAN NOT NULL DEFAULT false,
    "supportsVideo" BOOLEAN NOT NULL DEFAULT false,
    "inputPricePerMillion" REAL,
    "outputPricePerMillion" REAL
);
INSERT INTO "new_Model" ("description", "group", "id", "name", "owned_by", "typeJson") SELECT "description", "group", "id", "name", "owned_by", "typeJson" FROM "Model";
DROP TABLE "Model";
ALTER TABLE "new_Model" RENAME TO "Model";
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
    "rateLimit" INTEGER,
    "isNotSupportArrayContent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "isGateway" BOOLEAN NOT NULL DEFAULT false,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "modelCount" INTEGER DEFAULT 0,
    "officialWebsite" TEXT,
    "apiKeyUrl" TEXT,
    "docsUrl" TEXT,
    "modelsUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Provider" ("apiHost", "apiKey", "apiVersion", "createdAt", "enabled", "id", "isAuthed", "isNotSupportArrayContent", "isSystem", "name", "notes", "rateLimit", "type", "updatedAt") SELECT "apiHost", "apiKey", "apiVersion", "createdAt", "enabled", "id", "isAuthed", "isNotSupportArrayContent", "isSystem", "name", "notes", "rateLimit", "type", "updatedAt" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
