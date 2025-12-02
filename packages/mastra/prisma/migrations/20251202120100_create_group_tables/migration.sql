-- CreateTable: Group
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Group_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: ModelGroup
CREATE TABLE "ModelGroup" (
    "modelId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("modelId", "providerId"),
    CONSTRAINT "ModelGroup_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModelGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModelGroup_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_providerId_name_key" ON "Group"("providerId", "name");

-- CreateIndex
CREATE INDEX "Group_providerId_idx" ON "Group"("providerId");

-- CreateIndex
CREATE INDEX "ModelGroup_groupId_idx" ON "ModelGroup"("groupId");

-- CreateIndex
CREATE INDEX "ModelGroup_providerId_idx" ON "ModelGroup"("providerId");

-- DataMigration: 为每个供应商创建默认分组
INSERT INTO "Group" ("id", "name", "providerId", "isDefault", "createdAt", "updatedAt")
SELECT
    lower(hex(randomblob(16))),
    '默认',
    "id",
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Provider";

-- DataMigration: 为现有非空分组创建 Group 记录（排除"默认"，因为已在上一步创建）
INSERT INTO "Group" ("id", "name", "providerId", "isDefault", "createdAt", "updatedAt")
SELECT
    lower(hex(randomblob(16))),
    distinct_groups."group",
    distinct_groups."providerId",
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT "group", "providerId"
    FROM "ModelProvider"
    WHERE "group" IS NOT NULL
      AND "group" != ''
      AND "group" != '默认'
) AS distinct_groups;

-- DataMigration: 迁移数据到 ModelGroup 表
INSERT INTO "ModelGroup" ("modelId", "groupId", "providerId", "createdAt", "updatedAt")
SELECT
    mp."modelId",
    COALESCE(
        (SELECT g."id" FROM "Group" g
         WHERE g."providerId" = mp."providerId"
         AND g."name" = mp."group"),
        (SELECT g."id" FROM "Group" g
         WHERE g."providerId" = mp."providerId"
         AND g."isDefault" = 1)
    ),
    mp."providerId",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "ModelProvider" mp;

-- DropTable: ModelProvider
DROP TABLE "ModelProvider";
