-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'assistant',
    "emoji" TEXT,
    "description" TEXT,
    "enableWebSearch" BOOLEAN NOT NULL DEFAULT false,
    "webSearchProviderId" TEXT,
    "enableGenerateImage" BOOLEAN NOT NULL DEFAULT false,
    "knowledgeRecognition" TEXT,
    "modelId" TEXT,
    "defaultModelId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assistant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Assistant_defaultModelId_fkey" FOREIGN KEY ("defaultModelId") REFERENCES "Model" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'agent',
    "emoji" TEXT,
    "description" TEXT,
    "groupJson" JSONB,
    "enableWebSearch" BOOLEAN NOT NULL DEFAULT false,
    "webSearchProviderId" TEXT,
    "enableGenerateImage" BOOLEAN NOT NULL DEFAULT false,
    "knowledgeRecognition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "prompt" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "isNameManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
    "assistantId" TEXT,
    "agentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Topic_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Topic_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "origin_name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "ext" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "tokens" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "owned_by" TEXT,
    "description" TEXT,
    "typeJson" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "AssistantSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contextCount" INTEGER NOT NULL,
    "temperature" REAL NOT NULL,
    "topP" REAL NOT NULL,
    "maxTokens" INTEGER,
    "enableMaxTokens" BOOLEAN NOT NULL DEFAULT false,
    "streamOutput" BOOLEAN NOT NULL DEFAULT true,
    "hideMessages" BOOLEAN NOT NULL DEFAULT false,
    "customParameters" JSONB,
    "reasoning_effort" TEXT,
    "qwenThinkMode" BOOLEAN,
    "toolUseMode" TEXT,
    "assistantId" TEXT,
    "agentId" TEXT,
    "defaultModelId" TEXT,
    CONSTRAINT "AssistantSettings_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AssistantSettings_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AssistantSettings_defaultModelId_fkey" FOREIGN KEY ("defaultModelId") REFERENCES "Model" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeBase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "description" TEXT,
    "documentCount" INTEGER,
    "chunkSize" INTEGER,
    "chunkOverlap" INTEGER,
    "threshold" REAL,
    "version" INTEGER NOT NULL,
    "modelId" TEXT NOT NULL,
    "rerankModelId" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "KnowledgeBase_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KnowledgeBase_rerankModelId_fkey" FOREIGN KEY ("rerankModelId") REFERENCES "Model" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uniqueId" TEXT,
    "uniqueIdsJson" JSONB,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "remark" TEXT,
    "processingStatus" TEXT,
    "processingProgress" REAL,
    "processingError" TEXT,
    "retryCount" INTEGER,
    "baseId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "KnowledgeItem_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "KnowledgeBase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCPServer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "baseUrl" TEXT,
    "command" TEXT,
    "registryUrl" TEXT,
    "argsJson" JSONB,
    "env" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "disabledToolsJson" JSONB,
    "configSample" JSONB,
    "headers" JSONB,
    "searchKey" TEXT,
    "provider" TEXT,
    "providerUrl" TEXT,
    "logoUrl" TEXT,
    "tagsJson" JSONB,
    "timeout" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MCPAssistantServer" (
    "assistantId" TEXT NOT NULL,
    "mcpServerId" TEXT NOT NULL,

    PRIMARY KEY ("assistantId", "mcpServerId"),
    CONSTRAINT "MCPAssistantServer_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MCPAssistantServer_mcpServerId_fkey" FOREIGN KEY ("mcpServerId") REFERENCES "MCPServer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCPAgentServer" (
    "agentId" TEXT NOT NULL,
    "mcpServerId" TEXT NOT NULL,

    PRIMARY KEY ("agentId", "mcpServerId"),
    CONSTRAINT "MCPAgentServer_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MCPAgentServer_mcpServerId_fkey" FOREIGN KEY ("mcpServerId") REFERENCES "MCPServer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCPTool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputSchema" JSONB NOT NULL,
    "serverId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MCPTool_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "MCPServer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCPPrompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "arguments" JSONB,
    "serverId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MCPPrompt_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "MCPServer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCPResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "text" TEXT,
    "blob" TEXT,
    "serverId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MCPResource_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "MCPServer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCPConfigSample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "command" TEXT NOT NULL,
    "argsJson" JSONB,
    "env" JSONB,
    "serverId" TEXT NOT NULL,
    CONSTRAINT "MCPConfigSample_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "MCPServer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuickPhrase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_AssistantToKnowledgeBase" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AssistantToKnowledgeBase_A_fkey" FOREIGN KEY ("A") REFERENCES "Assistant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AssistantToKnowledgeBase_B_fkey" FOREIGN KEY ("B") REFERENCES "KnowledgeBase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AgentToKnowledgeBase" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AgentToKnowledgeBase_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AgentToKnowledgeBase_B_fkey" FOREIGN KEY ("B") REFERENCES "KnowledgeBase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AssistantSettings_assistantId_key" ON "AssistantSettings"("assistantId");

-- CreateIndex
CREATE UNIQUE INDEX "AssistantSettings_agentId_key" ON "AssistantSettings"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "MCPConfigSample_serverId_key" ON "MCPConfigSample"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "_AssistantToKnowledgeBase_AB_unique" ON "_AssistantToKnowledgeBase"("A", "B");

-- CreateIndex
CREATE INDEX "_AssistantToKnowledgeBase_B_index" ON "_AssistantToKnowledgeBase"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToKnowledgeBase_AB_unique" ON "_AgentToKnowledgeBase"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToKnowledgeBase_B_index" ON "_AgentToKnowledgeBase"("B");
