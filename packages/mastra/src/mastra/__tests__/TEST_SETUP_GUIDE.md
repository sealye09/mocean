# 测试基础设施排错全记录

> 本文档记录了 `packages/mastra` 测试套件从全部失败到全部通过的完整修复过程。
> 涉及 7 个独立问题，按**从浅到深**的顺序组织。

---

## 目录

1. [全景概览：测试架构是怎么回事](#1-全景概览)
2. [第一层：数据库表不存在](#2-第一层数据库表不存在)
3. [第二层：Prisma CLI 参数不兼容](#3-第二层prisma-cli-参数不兼容)
4. [第三层：测试代码查的是生产库](#4-第三层测试代码查的是生产库)
5. [第四层：路由注册方式错误](#5-第四层路由注册方式错误)
6. [第五层：路由顺序导致路径冲突](#6-第五层路由顺序导致路径冲突)
7. [第六层：服务端函数缺少数据转换](#7-第六层服务端函数缺少数据转换)
8. [第七层：多文件并行导致数据竞争](#8-第七层多文件并行导致数据竞争)
9. [修改文件清单](#9-修改文件清单)

---

## 1. 全景概览

### 测试架构图

```
┌──────────────────────────────────────────────────┐
│                  vitest 测试运行器                  │
│                                                    │
│  vitest.config.ts ──→ vitest.setup.ts              │
│       (配置)            (全局钩子)                   │
│                            │                       │
│                    ┌───────┴────────┐              │
│                    │   database.ts   │              │
│                    │  (数据库管理)     │              │
│                    └───────┬────────┘              │
│                            │                       │
│              ┌─────────────┼─────────────┐        │
│              │             │             │         │
│        provider.test.ts  providers.test.ts  ...   │
│         (server 层)      (router 层)               │
│              │             │                       │
│              └──────┬──────┘                       │
│                     │                              │
│              server/provider.ts                    │
│              (业务逻辑)                              │
│                     │                              │
│              server/index.ts                       │
│              (PrismaClient 单例)                    │
│                     │                              │
│                 SQLite 数据库                       │
└──────────────────────────────────────────────────┘
```

### 比喻：餐厅厨房

把整个测试系统想象成一个**餐厅厨房**：

| 概念 | 比喻 |
|------|------|
| `vitest.config.ts` | 厨房的规章制度（几个灶台、几个厨师） |
| `vitest.setup.ts` | 每天开工前的准备工作（洗灶台、备食材） |
| `database.ts` | 储藏室管理员（负责进货、清点、清空） |
| `server/index.ts` | 厨房里唯一的冰箱（所有厨师共用） |
| `server/provider.ts` | 菜谱（从冰箱取食材、加工、出菜） |
| `test 文件` | 食客点单（验证菜品是否合格） |
| `SQLite 数据库文件` | 食材本身 |

---

## 2. 第一层：数据库表不存在

### 症状

```
The table `main.Provider` does not exist in the current database.
```

### 原因

原始代码使用了 **内存数据库** (`:memory:`)：

```ts
// ❌ 旧代码
const TEST_DB_URL = ":memory:";
```

`prisma db push` 是一个**独立的子进程**。它和测试进程各自打开了一个 `:memory:` 数据库——但内存数据库的生命周期绑定在创建它的进程上。

### 比喻

> 这就像两个人各自在脑海中想象了一个仓库。A 往自己想象的仓库里放了货架（建表），B 去自己想象的仓库里找货架——当然找不到，因为它们是两个完全不同的"仓库"。

### 修复

改为**文件数据库**，两个进程访问同一个文件：

```ts
// ✅ 新代码
const TEST_DB_PATH = join(TEST_DB_DIR, "test.db");
const TEST_DB_URL = `file:${TEST_DB_PATH}`;
```

**关键文件**：`__tests__/setup/database.ts`

---

## 3. 第二层：Prisma CLI 参数不兼容

### 症状

```
unknown or unexpected option: --skip-generate
```

### 原因

项目使用 Prisma v7.3.0，该版本的 `prisma db push` 不再支持 `--skip-generate` 参数。同时，schema 文件中没有配置 `url` 字段，需要通过 `--url` 参数显式指定数据库地址。

### 旧代码 vs 新代码

```bash
# ❌ 旧代码：使用不存在的参数 + 错误的环境变量名
npx prisma db push --schema "..." --skip-generate
# 环境变量：PRISMA_DATABASE_URL（Prisma 不认识这个名字）

# ✅ 新代码：移除无效参数 + 使用 --url 直接指定
npx prisma db push --schema "..." --accept-data-loss --url "file:/.../test.db"
```

### 比喻

> 就像你对快递员说"请走 3 号门"，但这栋楼根本没有 3 号门。快递员只能站在门口不知所措，而你的包裹（数据库表）永远无法送达。

**关键文件**：`__tests__/setup/database.ts`

---

## 4. 第三层：测试代码查的是生产库

### 症状

```
expected [] to deeply equal []  // 本该为空却有 104 条数据
expected to have length 3 but got 104
```

### 原因

系统中存在**两个独立的 PrismaClient**：

```
测试用 PrismaClient ──→ db/test.db   （测试数据写入这里）
服务端 PrismaClient ──→ db/prisma.db  （查询从这里读取）
```

测试通过 `providerFactory.create(prisma, ...)` 往 `test.db` 写数据，但 `providerServer.getProviders()` 内部调用的是 `server/index.ts` 导出的 PrismaClient，它连接的是 `prisma.db`（生产库）。

### 比喻

> 你往 A 仓库放了 3 箱苹果，然后跑到 B 仓库去清点——发现里面有 104 箱旧货。放和查走的是不同的门，自然对不上。

### 修复

通过 `vi.mock` 替换 `server/index.ts` 的导出，让服务端函数也使用测试数据库：

```ts
// vitest.setup.ts
vi.mock("../../server/index", () => ({
  get prisma() {
    return getPrismaInstance(); // 返回测试用的 PrismaClient
  }
}));
```

这里使用了 **getter**（`get prisma()`）而不是普通属性，是因为 `vi.mock` 的工厂函数在 `beforeAll` 之前就会执行，此时数据库还没初始化。getter 会延迟到实际使用时才取值，届时 `initTestDatabase()` 已经完成。

### 比喻

> 原来厨房有两个冰箱：一个旧的（生产库）、一个新的（测试库）。厨师习惯性地打开旧冰箱取食材。我们用 `vi.mock` 把旧冰箱的门换成了新冰箱的门——厨师以为自己还在用旧冰箱，实际上拿到的是新冰箱里的食材。

**关键文件**：`__tests__/setup/vitest.setup.ts`、`__tests__/setup/database.ts`

---

## 5. 第五层：路由注册方式错误

### 症状

```
Cannot read properties of undefined (reading 'map')
```

所有 19 个路由测试全部报这个错。

### 原因

`registerApiRoute()` 返回的是一个**普通对象**：

```ts
{
  path: "/customApi/providers",
  method: "GET",
  handler: async (c) => { ... },
  middleware: [],
  // ...
}
```

但测试代码把它当成 **Hono 子应用** 来挂载：

```ts
// ❌ 旧代码
app.route(route.path, route); // route 不是 Hono 实例，没有 .routes 属性
```

### 比喻

> 你拿到了一张**菜谱卡片**（{path, method, handler}），但你试图把这张卡片当成一个**完整的厨师**（Hono 子应用）来使用。卡片不会做菜，它只是描述了怎么做菜。

### 修复

正确地从对象中提取信息并注册：

```ts
// ✅ 新代码
for (const route of providersRouter) {
  const method = route.method.toLowerCase() as "get" | "post" | "put" | "delete";
  app.on(method, route.path, ...(route.middleware || []), route.handler);
}
```

**关键文件**：`__tests__/unit/router/providers.test.ts`

---

## 6. 第六层：路由顺序导致路径冲突

### 症状

```
GET /customApi/providers/with-models → 404
```

### 原因

Hono 按注册顺序匹配路由。原来的注册顺序：

```
1. GET /customApi/providers          ← 精确匹配
2. GET /customApi/providers/enabled   ← 精确匹配
3. GET /customApi/providers/:id       ← 参数匹配 ⚠️
4. ...
6. GET /customApi/providers/with-models ← 永远匹配不到！
```

当请求 `/providers/with-models` 到达时，第 3 条 `/:id` 先匹配成功，`id = "with-models"`。后面的精确路径永远不会被触达。

### 比喻

> 想象一条公路有两个收费站：第一个写着"所有车辆"（`:id`），第二个写着"仅限红色轿车"（`/with-models`）。所有车在第一个收费站就被拦下了，红色轿车根本到不了第二个收费站。

### 修复

调整路由注册顺序——**精确路径在前，参数路径在后**：

```ts
const providersRouter = [
  // 1. 精确路径（无参数）
  getProvidersRouter,             // /providers
  getProvidersWithModelsRouter,   // /providers/with-models
  getEnabledProvidersRouter,      // /providers/enabled
  getEnabledProvidersWithModelsRouter, // /providers/enabled/with-models

  // 2. 带前缀的参数路径（不会与 :id 冲突）
  getProvidersByTypeRouter,       // /providers/type/:type
  getProvidersByModelRouter,      // /providers/by-model/:modelId

  // 3. 参数化路径（:id）放最后
  getProviderByIdRouter,          // /providers/:id
  getProviderWithModelsByIdRouter, // /providers/:id/with-models
  // ...写操作
];
```

**关键文件**：`router/providers.ts`

---

## 7. 第七层：服务端函数缺少数据转换

### 症状

```
expected data[0].models to have length 1 but got undefined
```

### 原因

数据库中模型（Model）是通过**分组（Group）**挂在提供商（Provider）下的：

```
Provider
  └── groups[]
        └── models[]
```

大部分 "WithModels" 函数都做了**扁平化处理**：

```ts
// ✅ getProvidersWithModels（正确）
return providers.map((provider) => ({
  ...provider,
  models: extractModelsFromGroups(provider.groups), // 从所有组中提取模型
  _count: { models: countModelsFromGroups(provider.groups) }
}));
```

但 `getEnabledProvidersWithModels` 漏掉了这一步：

```ts
// ❌ 旧代码
return providers; // 直接返回，没有 models 字段
```

### 比喻

> 其他厨师都会把虾仁从虾壳（groups）里剥出来再装盘，但有一个厨师直接把带壳的虾端上桌了。食客（测试）期望直接吃到虾仁（`models`），却只看到了虾壳（`groups[].models[]`）。

### 修复

```ts
// ✅ 新代码
return providers.map((provider) => ({
  ...provider,
  models: extractModelsFromGroups(provider.groups),
  _count: { models: countModelsFromGroups(provider.groups) }
}));
```

**关键文件**：`server/provider.ts`

---

## 8. 第八层：多文件并行导致数据竞争

### 症状

单独运行每个测试文件全部通过，但两个文件一起运行时随机失败：

```
expected to have length 3 but got 2  // 数据莫名消失
expected to have length 2 but got 3  // 数据莫名多出
```

且每次失败的测试不同（非确定性失败）。

### 原因

vitest v2 中 `threads: false` 并不意味着"单线程"。它只是将默认的 `threads` 池切换为 `forks` 池。两个测试文件仍然在**不同的 fork 进程**中并行运行：

```
┌─────────── Fork 1 ──────────┐   ┌─────────── Fork 2 ──────────┐
│ provider.test.ts             │   │ providers.test.ts            │
│                              │   │                              │
│ beforeEach: DELETE * FROM... │   │ beforeEach: DELETE * FROM... │
│ test: INSERT 3 rows          │   │ test: INSERT 2 rows          │
│ test: SELECT → 期望 3 条      │   │ test: SELECT → 期望 2 条     │
│                              │   │                              │
└──────────┬───────────────────┘   └──────────┬───────────────────┘
           │                                   │
           └──────────┬────────────────────────┘
                      │
               ┌──────┴──────┐
               │   test.db    │  ← 两个进程同时读写同一个文件！
               └─────────────┘
```

Fork 1 刚插入 3 条数据，Fork 2 的 `beforeEach` 就把它们删了。Fork 1 查询时只剩 2 条。

### 比喻

> 两个厨师（进程）共用一个冰箱（数据库文件），但没有沟通。A 往冰箱放了 3 盒鸡蛋，B 清理冰箱时把其中 1 盒扔了，A 回头一看："我明明放了 3 盒，怎么只剩 2 盒？"

### 修复

强制所有测试在**同一个进程**中**串行执行**：

```ts
// vitest.config.ts
{
  fileParallelism: false,  // 测试文件不并行
  pool: "forks",
  poolOptions: {
    forks: {
      singleFork: true     // 只用一个 fork 进程
    }
  },
  maxConcurrency: 1         // 同一文件内的测试也串行
}
```

这样所有测试共享同一个进程、同一个 PrismaClient、同一个数据库连接，`beforeEach` 的清理和测试的数据操作严格串行，不会互相干扰。

**关键文件**：`vitest.config.ts`

---

## 9. 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `vitest.config.ts` | `threads: false` → `fileParallelism: false` + `singleFork: true` |
| `__tests__/setup/database.ts` | 内存数据库 → 文件数据库；修正 CLI 参数；添加 `getPrismaInstance()`；添加 `initialized` 防重复初始化 |
| `__tests__/setup/vitest.setup.ts` | 添加 `vi.mock("../../server/index")` 注入测试 PrismaClient |
| `router/providers.ts` | 调整路由注册顺序（精确路径在前、参数路径在后） |
| `server/provider.ts` | `getEnabledProvidersWithModels` 添加 models 扁平化逻辑 |
| `__tests__/unit/router/providers.test.ts` | `app.route()` → `app.on()`；`response.json()` → `response.text()` 用于错误响应 |

---

## 附录：问题排查思路

遇到测试失败时，可以按以下顺序排查：

```
1. 表/Schema 存在吗？
   → 看错误是否包含 "table does not exist"
   → 检查 prisma db push 是否成功执行

2. 数据写到哪了？读的又是哪？
   → 对比测试 PrismaClient 和业务 PrismaClient 的连接地址
   → 数据量异常（过多/过少）通常是"写A读B"的信号

3. 路由能匹配到吗？
   → 404 响应通常意味着路由未注册或被其他路由抢先匹配
   → 检查路由注册方式和顺序

4. 返回的数据结构对吗？
   → undefined 通常意味着字段名不对或数据未转换
   → 对比 Schema 定义和实际返回值

5. 测试之间互相干扰吗？
   → 单独运行通过、一起运行失败 = 隔离问题
   → 非确定性失败 = 并发竞争
   → 检查进程模型和数据库连接共享方式
```
