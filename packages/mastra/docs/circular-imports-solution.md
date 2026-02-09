# 解决 Prisma Zod Generator 循环引用问题

## 问题背景

使用 `prisma-zod-generator` 生成 Zod schemas 时，如果 Prisma schema 中存在双向关系（bidirectional relations），会产生循环导入问题：

```prisma
// Prisma Schema
model Model {
  id        String      @id
  assistants Assistant[] // Model 有多个 Assistant
}

model Assistant {
  id      String @id
  modelId String
  model   Model  @relation(fields: [modelId], references: [id]) // Assistant 属于一个 Model
}
```

生成的 Zod schemas：

```typescript
// Model.schema.ts
import { AssistantSchema } from "./Assistant.schema"; // ← 导入 Assistant
export const ModelSchema = z.object({
  assistants: z.array(z.lazy(() => AssistantSchema)), // 引用 Assistant
});

// Assistant.schema.ts
import { ModelSchema } from "./Model.schema"; // ← 导入 Model
export const AssistantSchema = z.object({
  model: z.lazy(() => ModelSchema), // 引用 Model
});
```

这就形成了循环依赖：**Model → Assistant → Model**，导致：
1. TypeScript 类型推断失败（`ModelSchema` 被推断为 `any`）
2. 运行时可能报错
3. 类型检查崩溃（"Maximum call stack size exceeded"）

## 解决方案概述

核心思路：**在编译时移除循环导入，在运行时用动态 `require()` 解析**。

### 关键策略

1. **检测循环引用**：分析所有 schema 文件，找出互相依赖的文件组
2. **移除静态导入**：删除循环链中的 `import` 语句
3. **运行时动态加载**：在 `z.lazy()` 中使用 `require()` 动态获取 schema
4. **禁用类型检查**：添加 `@ts-nocheck` 避免编译器分析循环类型

## 实现步骤

### 1. 创建修复脚本

创建 `scripts/fix-circular-imports.ts`：

```typescript
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

// 分析单个文件的导入信息
interface FileInfo {
  path: string;
  name: string;
  modelName: string;
  content: string;
  imports: ImportInfo[];
  lazyRefs: string[];
}

// 步骤 1: 解析所有 schema 文件
function getSchemaFiles(): string[] {
  const schemasDir = join(process.cwd(), "generated", "schemas", "models");
  const files = readdirSync(schemasDir);
  return files
    .filter((f) => f.endsWith(".schema.ts"))
    .map((f) => join(schemasDir, f));
}

// 步骤 2: 分析文件中的 import 语句
function parseImports(content: string): ImportInfo[] {
  const imports: ImportInfo[] = [];
  const importRegex = /import\s*\{\s*([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const names = match[1]
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n);
    imports.push({
      source: match[2],
      names,
      fullMatch: match[0],
    });
  }
  return imports;
}

// 步骤 3: 检测循环引用（使用 DFS 算法）
function detectCycles(files: FileInfo[]): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  const cycles = new Map<string, Set<string>>();

  // 构建依赖图
  for (const file of files) {
    const deps = new Set<string>();
    for (const imp of file.imports) {
      if (imp.source.startsWith("./") && imp.source.endsWith(".schema")) {
        const depModel = imp.source.replace("./", "").replace(".schema", "");
        deps.add(depModel);
      }
    }
    graph.set(file.modelName, deps);
    cycles.set(file.modelName, new Set());
  }

  // DFS 检测循环
  function findCycles(
    node: string,
    visited: Set<string>,
    path: Set<string>,
    pathList: string[]
  ) {
    if (path.has(node)) {
      // 发现循环！
      const cycleStart = pathList.indexOf(node);
      const cycleNodes = pathList.slice(cycleStart);
      // 记录循环关系
      for (const n of cycleNodes) {
        for (const other of cycleNodes) {
          if (n !== other) {
            cycles.get(n)!.add(other);
          }
        }
      }
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    path.add(node);
    pathList.push(node);

    const deps = graph.get(node);
    if (deps) {
      for (const dep of deps) {
        findCycles(dep, visited, path, pathList);
      }
    }

    path.delete(node);
    pathList.pop();
  }

  for (const node of graph.keys()) {
    findCycles(node, new Set(), new Set(), []);
  }

  return cycles;
}
```

### 2. 修复循环引用

```typescript
function fixFile(
  file: FileInfo,
  cycles: Map<string, Set<string>>
): { fixedContent: string } | null {
  const circularModels = cycles.get(file.modelName);
  if (!circularModels || circularModels.size === 0) {
    return null; // 没有循环引用
  }

  let modified = file.content;

  // 步骤 A: 移除循环引用的 import 语句
  for (const circularModel of circularModels) {
    const schemaName = `${circularModel}Schema`;
    const importRegex = new RegExp(
      `import\\s*\\{[^}]*${schemaName}[^}]*\\}\\s*from\\s*['"]\\./${circularModel}\\.schema['"]\\s*;?\\n?`,
      "g"
    );
    modified = modified.replace(
      importRegex,
      `// Circular import removed: import { ${schemaName} } from './${circularModel}.schema';\n`
    );
  }

  // 步骤 B: 在文件开头添加 @ts-nocheck
  if (!modified.includes("// @ts-nocheck")) {
    modified =
      "// @ts-nocheck - Circular imports resolved with runtime require()\n" +
      modified;
  }

  // 步骤 C: 将 z.lazy(() => XxxSchema) 改为动态 require
  for (const circularModel of circularModels) {
    const schemaName = `${circularModel}Schema`;
    const lazyRegex = new RegExp(
      `z\\.lazy\\(\\(\\)\\s*=>\\s*${schemaName}\\)`,
      "g"
    );
    modified = modified.replace(
      lazyRegex,
      `z.lazy(() => {
      const mod = require('./${circularModel}.schema');
      return mod.${schemaName};
    })`
    );
  }

  return { fixedContent: modified };
}
```

### 3. 在 package.json 中添加脚本

```json
{
  "scripts": {
    "generate": "prisma generate && tsx scripts/fix-circular-imports.ts"
  }
}
```

## 工作原理详解

### 1. 依赖图构建

假设有 3 个文件互相依赖：

```
Model.schema.ts       Assistant.schema.ts       KnowledgeBase.schema.ts
       ↓                        ↓                          ↓
imports Assistant         imports Model              imports Model
imports KnowledgeBase     imports KnowledgeBase      imports Assistant
```

构建出的依赖图：

```
Model → {Assistant, KnowledgeBase}
Assistant → {Model, KnowledgeBase}
KnowledgeBase → {Model, Assistant}
```

### 2. DFS 检测循环

从 Model 开始遍历：

```
路径: [Model]
  ↓ 发现依赖 Assistant
路径: [Model, Assistant]
  ↓ 发现依赖 Model（已在路径中！）
发现循环: [Model, Assistant] → Model 和 Assistant 互相依赖

路径: [Model, Assistant, KnowledgeBase]
  ↓ 发现依赖 Model（已在路径中！）
发现循环: [Model, Assistant, KnowledgeBase] → 三者循环依赖
```

### 3. 修复后的代码对比

**修复前（循环导入）**：

```typescript
// Model.schema.ts
import { AssistantSchema } from "./Assistant.schema"; // ← 静态导入

export const ModelSchema = z.object({
  assistants: z.array(z.lazy(() => AssistantSchema)),
});

// Assistant.schema.ts
import { ModelSchema } from "./Model.schema"; // ← 静态导入

export const AssistantSchema = z.object({
  model: z.lazy(() => ModelSchema),
});
```

**修复后（动态加载）**：

```typescript
// Model.schema.ts
// @ts-nocheck
// Circular import removed: import { AssistantSchema } from './Assistant.schema';

export const ModelSchema = z.object({
  assistants: z.array(
    z.lazy(() => {
      const mod = require("./Assistant.schema"); // ← 动态 require
      return mod.AssistantSchema;
    })
  ),
});

// Assistant.schema.ts
// @ts-nocheck
// Circular import removed: import { ModelSchema } from './Model.schema';

export const AssistantSchema = z.object({
  model: z.lazy(() => {
    const mod = require("./Model.schema"); // ← 动态 require
    return mod.ModelSchema;
  }),
});
```

## 关键要点

### 为什么用 `require()` 而不是 `import`？

1. **时机不同**：`import` 在编译时解析，`require()` 在运行时执行
2. **循环处理**：CommonJS 的 `require()` 有缓存机制，可以处理循环引用
3. **类型安全**：虽然 `require()` 返回 `any`，但我们通过类型注解恢复类型

### 为什么需要 `@ts-nocheck`？

TypeScript 的类型推断会尝试解析所有导入的类型。即使我们用 `require()` 动态加载，如果保留 `import type` 语句，TypeScript 仍然会发现循环并可能崩溃。`@ts-nocheck` 完全禁用类型检查，让编译通过。

### 如何保持类型安全？

在使用 schema 的文件中（如 `assistant.ts`），我们通过类型注解恢复类型：

```typescript
import type { AssistantSchema as AssistantSchemaType } from "generated/schemas/models";

const getAssistantSchema = (): typeof AssistantSchemaType =>
  require("generated/schemas/models").AssistantSchema;

const AssistantSchema = getAssistantSchema(); // 现在 AssistantSchema 有正确类型
```

## 使用流程

1. **修改 Prisma schema** 后运行：
   ```bash
   pnpm generate
   ```

2. **脚本自动执行**：
   - 生成 Zod schemas
   - 检测循环引用
   - 修复循环文件

3. **在代码中使用**：
   ```typescript
   import { ModelSchema } from "generated/schemas/models";
   // ModelSchema 现在有正确的 ZodType 类型，不再是 any
   ```

## 总结

这个方案的核心是：

1. **静态分析**：用 DFS 找出所有循环依赖
2. **编译时移除**：删除导致循环的 `import` 语句
3. **运行时解析**：用 `require()` 在需要时动态加载
4. **类型恢复**：通过显式类型注解保持类型安全

这样既解决了循环引用导致的编译问题，又保持了完整的类型推断能力！
