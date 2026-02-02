/**
 * ProviderType 更新器类
 *
 * 功能：
 * 1. 从 models.dev API 接口中获取数据
 * 2. 使用 Set 通过 provider id 来进行去重
 * 3. 遍历 Set 中的数据，更新 packages/mastra/prisma/schema.prisma 中的 ProviderType
 * 4. 执行 npx prisma generate
 *
 * 设计原则：
 * - 单一职责原则 (SRP)：每个类/方法只做一件事
 * - 开闭原则 (OCP)：通过配置和扩展点支持新功能
 * - 依赖倒置原则 (DIP)：依赖抽象而非具体实现
 */
import { exec } from "child_process";
import { promises as fs } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { z } from "zod";

const execAsync = promisify(exec);

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==================== 类型定义 ====================

/**
 * Models.dev API 响应模式
 */
const ModelsDevModalitiesSchema = z.object({
  input: z.array(z.string()).optional(),
  output: z.array(z.string()).optional()
});

const ModelsDevLimitSchema = z.object({
  context: z.number().optional(),
  output: z.number().optional()
});

const ModelsDevCostSchema = z.object({
  input: z.number().optional(),
  output: z.number().optional()
});

const ModelsDevModelSchema = z.looseObject({
  id: z.string().optional(),
  context: z.number().optional(),
  limit: ModelsDevLimitSchema.optional(),
  modalities: ModelsDevModalitiesSchema.optional(),
  tool_call: z.boolean().optional(),
  reasoning: z.boolean().optional(),
  cost: ModelsDevCostSchema.optional()
});

const ModelsDevProviderSchema = z.looseObject({
  id: z.string().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
  npm: z.string().optional(),
  models: z.record(z.string(), ModelsDevModelSchema).optional()
});

const ModelsDevResponseSchema = z.record(
  z.string(),
  z.union([z.string(), ModelsDevProviderSchema])
);

type ModelsDevResponse = z.infer<typeof ModelsDevResponseSchema>;

/**
 * 配置接口
 */
interface ProviderTypeUpdaterConfig {
  /** API 端点 URL */
  apiUrl: string;
  /** Schema 文件路径 */
  schemaPath: string;
  /** 工作目录 */
  cwd: string;
}

/**
 * 分类配置
 */
interface CategoryConfig {
  [comment: string]: string[];
}

// ==================== 字符串工具类 ====================

/**
 * 字符串转换工具类
 * 遵循单一职责原则：只负责字符串格式转换
 */
class StringUtils {
  /**
   * 将短横线连接转换为下划线连接
   * @param value - 需要转换的字符串（例如 aa-bb）
   * @returns 转换后的字符串（例如 aa_bb）
   */
  static kebabToSnake(value: string): string {
    return value.replace(/-/g, "_");
  }

  /**
   * 检查字符串是否以数字开头
   * @param value - 要检查的字符串
   * @returns 是否以数字开头
   */
  static startsWithDigit(value: string): boolean {
    return /^\d/.test(value);
  }

  /**
   * 确保标识符有效（不以数字开头）
   * @param value - 原始标识符
   * @param prefix - 数字开头时添加的前缀
   * @returns 有效的标识符
   */
  static ensureValidIdentifier(
    value: string,
    prefix: string = "provider_"
  ): string {
    if (this.startsWithDigit(value)) {
      return `${prefix}${value}`;
    }
    return value;
  }
}

// ==================== Provider ID 映射器 ====================

/**
 * Provider ID 映射器
 * 负责将 API 返回的 provider ID 映射为有效的 ProviderType 枚举值
 */
class ProviderIdMapper {
  /** 特殊映射表 - 处理不规则的命名转换 */
  private readonly specialMapping: Map<string, string> = new Map([
    ["fireworks", "fireworks_ai"],
    ["github", "github_models"],
    ["grok", "xai"],
    ["together", "togetherai"],
    ["zhipu", "zhipuai"],
    ["moonshot", "moonshotai"],
    ["dashscope", "alibaba"],
    ["ollama", "lmstudio"] // Ollama 映射到 LMStudio
  ]);

  /**
   * 映射 provider ID 到有效的枚举值
   * @param providerId - API 返回的 provider ID
   * @returns 有效的 ProviderType 枚举值
   */
  map(providerId: string): string {
    // 1. 检查特殊映射表
    if (this.specialMapping.has(providerId)) {
      return this.specialMapping.get(providerId);
    }

    // 2. 默认转换：kebab-case -> snake_case
    let result = StringUtils.kebabToSnake(providerId);

    // 3. 确保不以数字开头
    result = StringUtils.ensureValidIdentifier(result);

    return result;
  }

  /**
   * 添加自定义映射
   * @param providerId - 原始 provider ID
   * @param mappedType - 映射后的类型
   */
  addMapping(providerId: string, mappedType: string): void {
    this.specialMapping.set(providerId, mappedType);
  }
}

// ==================== API 客户端 ====================

/**
 * Models.dev API 客户端
 * 负责与外部 API 通信
 */
class ModelsDevApiClient {
  constructor(private readonly apiUrl: string) {}

  /**
   * 获取 API 数据
   * @returns 解析后的 API 响应数据
   * @throws 当 API 请求失败时
   */
  async fetchData(): Promise<ModelsDevResponse> {
    console.log("🔍 正在从 models.dev API 获取数据...");

    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as ModelsDevResponse;
      return ModelsDevResponseSchema.parse(data);
    } catch (error) {
      console.error("❌ 获取 models.dev 数据失败:", error);
      throw error;
    }
  }
}

// ==================== Provider 类型提取器 ====================

/**
 * Provider 类型提取器
 * 负责从 API 数据中提取唯一的 ProviderType
 */
class ProviderTypeExtractor {
  constructor(private readonly mapper: ProviderIdMapper) {}

  /**
   * 从 API 数据中提取所有唯一的 ProviderType
   * @param apiData - API 响应数据
   * @returns 去重后的 ProviderType 集合
   */
  extract(apiData: ModelsDevResponse): Set<string> {
    console.log("\n🔍 提取供应商类型...");

    const providerTypes = new Set<string>();

    for (const [providerId, providerData] of Object.entries(apiData)) {
      // 跳过字符串类型的值（别名或引用）
      if (typeof providerData === "string") {
        console.log(`  ⏭️  ${providerId}: 别名引用，跳过`);
        continue;
      }

      if (!providerData || typeof providerData !== "object") {
        console.warn(`  ⚠️  ${providerId}: 数据格式无效，跳过`);
        continue;
      }

      // 映射 provider ID 到枚举值
      const providerType = this.mapper.map(providerId);
      providerTypes.add(providerType);

      console.log(`  ✅ ${providerId} -> ${providerType}`);
    }

    console.log(`\n📊 统计: 找到 ${providerTypes.size} 个唯一的供应商类型`);

    return providerTypes;
  }
}

// ==================== Schema 文件更新器 ====================

/**
 * Schema 文件更新器
 * 负责更新 prisma/schema.prisma 文件中的 ProviderType 枚举
 */
class SchemaUpdater {
  /** 默认分类配置 */
  private readonly defaultCategories: CategoryConfig = {
    "  // 主流供应商": [
      "openai",
      "openai_compatible",
      "anthropic",
      "google",
      "gemini",
      "deepseek",
      "groq",
      "mistral"
    ],
    "  // 网关供应商": ["netlify", "openrouter", "vercel"],
    "  // 中国供应商": [
      "qwenlm",
      "alibaba",
      "alibaba_cn",
      "zhipuai",
      "moonshotai",
      "moonshotai_cn",
      "modelscope"
    ],
    "  // Azure 和其他": ["azure_openai", "xai", "xai_cn"]
  };

  constructor(
    private readonly schemaPath: string,
    private readonly categories: CategoryConfig = {}
  ) {}

  /**
   * 更新 schema.prisma 文件
   * @param providerTypes - 要添加的供应商类型集合
   */
  async update(providerTypes: Set<string>): Promise<void> {
    console.log("\n📝 更新 schema.prisma 文件...");

    try {
      const schemaContent = await fs.readFile(this.schemaPath, "utf-8");
      const { enumStartIndex, enumEndIndex } =
        this.findEnumRange(schemaContent);
      const existingTypes = this.extractExistingTypes(
        schemaContent,
        enumStartIndex,
        enumEndIndex
      );

      console.log(`  📋 现有类型数量: ${existingTypes.size}`);

      // 合并新旧类型
      const allTypes = new Set([...existingTypes, ...providerTypes]);
      const sortedTypes = Array.from(allTypes).sort();

      console.log(`  📋 合并后类型数量: ${sortedTypes.length}`);

      // 找出新增的类型
      const newTypes = sortedTypes.filter((type) => !existingTypes.has(type));
      this.logNewTypes(newTypes);

      // 构建新的枚举定义
      const newEnumContent = this.buildEnumContent(sortedTypes);

      // 替换旧的枚举定义
      const newSchemaContent =
        schemaContent.substring(0, enumStartIndex) +
        newEnumContent +
        schemaContent.substring(enumEndIndex + 1);

      await fs.writeFile(this.schemaPath, newSchemaContent, "utf-8");
      console.log(`  ✅ schema.prisma 文件已更新`);
    } catch (error) {
      console.error("  ❌ 更新 schema.prisma 失败:", error);
      throw error;
    }
  }

  /**
   * 查找枚举定义的范围
   */
  private findEnumRange(schemaContent: string): {
    enumStartIndex: number;
    enumEndIndex: number;
  } {
    const enumStartRegex = /enum\s+ProviderType\s*{/;
    const enumStartMatch = schemaContent.match(enumStartRegex);

    if (!enumStartMatch || enumStartMatch.index === undefined) {
      throw new Error("无法在 schema.prisma 中找到 ProviderType 枚举定义");
    }

    const enumStartIndex = enumStartMatch.index;
    let braceCount = 0;
    let enumEndIndex = -1;

    for (let i = enumStartIndex; i < schemaContent.length; i++) {
      if (schemaContent[i] === "{") braceCount++;
      if (schemaContent[i] === "}") {
        braceCount--;
        if (braceCount === 0) {
          enumEndIndex = i;
          break;
        }
      }
    }

    if (enumEndIndex === -1) {
      throw new Error("无法找到 ProviderType 枚举的结束位置");
    }

    return { enumStartIndex, enumEndIndex };
  }

  /**
   * 提取现有的枚举类型
   */
  private extractExistingTypes(
    schemaContent: string,
    enumStartIndex: number,
    enumEndIndex: number
  ): Set<string> {
    const enumContent = schemaContent.substring(
      enumStartIndex,
      enumEndIndex + 1
    );
    const existingTypes = new Set<string>();
    const typeRegex = /^\s*([a-z_][a-z0-9_]*)/gm;
    let match;

    while ((match = typeRegex.exec(enumContent)) !== null) {
      const typeName = match[1];
      if (typeName !== "enum" && typeName !== "ProviderType") {
        existingTypes.add(typeName);
      }
    }

    return existingTypes;
  }

  /**
   * 记录新增的类型
   */
  private logNewTypes(newTypes: string[]): void {
    if (newTypes.length > 0) {
      console.log(`  ✨ 新增类型 (${newTypes.length}个):`);
      newTypes.forEach((type) => console.log(`     - ${type}`));
    } else {
      console.log(`  ℹ️  没有新增类型`);
    }
  }

  /**
   * 构建枚举内容
   */
  private buildEnumContent(sortedTypes: string[]): string {
    const lines = ["enum ProviderType {"];
    const categories = { ...this.defaultCategories, ...this.categories };
    const addedTypes = new Set<string>();

    // 添加带分类的类型
    for (const [comment, types] of Object.entries(categories)) {
      const matchingTypes = types.filter((type) => sortedTypes.includes(type));
      if (matchingTypes.length > 0) {
        lines.push(comment);
        matchingTypes.forEach((type) => {
          lines.push(`  ${type}`);
          addedTypes.add(type);
        });
      }
    }

    // 添加未分类的其他类型
    const uncategorizedTypes = sortedTypes.filter(
      (type) => !addedTypes.has(type)
    );
    if (uncategorizedTypes.length > 0) {
      lines.push("  // 其他供应商");
      uncategorizedTypes.forEach((type) => {
        lines.push(`  ${type}`);
      });
    }

    lines.push("}");
    return lines.join("\n");
  }
}

// ==================== Prisma 生成器 ====================

/**
 * Prisma 客户端生成器
 * 负责执行 prisma generate 命令
 */
class PrismaClientGenerator {
  constructor(private readonly cwd: string) {}

  /**
   * 执行 prisma generate 命令
   */
  async generate(): Promise<void> {
    console.log("\n🔧 执行 npx prisma generate...");

    try {
      const { stdout, stderr } = await execAsync("npx prisma generate", {
        cwd: this.cwd
      });

      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }

      console.log("✅ Prisma 客户端已重新生成");
    } catch (error) {
      console.error("❌ 执行 prisma generate 失败:", error);
      throw error;
    }
  }
}

// ==================== 主类：ProviderType 更新器 ====================

/**
 * ProviderType 更新器主类
 * 协调各个组件完成 ProviderType 枚举的更新流程
 */
export class ProviderTypeUpdater {
  private readonly apiClient: ModelsDevApiClient;
  private readonly typeExtractor: ProviderTypeExtractor;
  private readonly schemaUpdater: SchemaUpdater;
  private readonly prismaGenerator: PrismaClientGenerator;
  private readonly mapper: ProviderIdMapper;

  constructor(config: Partial<ProviderTypeUpdaterConfig> = {}) {
    const finalConfig: ProviderTypeUpdaterConfig = {
      apiUrl: config.apiUrl ?? "https://models.dev/api.json",
      schemaPath:
        config.schemaPath ?? join(__dirname, "..", "prisma", "schema.prisma"),
      cwd: config.cwd ?? join(__dirname, "..")
    };

    this.mapper = new ProviderIdMapper();
    this.apiClient = new ModelsDevApiClient(finalConfig.apiUrl);
    this.typeExtractor = new ProviderTypeExtractor(this.mapper);
    this.schemaUpdater = new SchemaUpdater(finalConfig.schemaPath);
    this.prismaGenerator = new PrismaClientGenerator(finalConfig.cwd);
  }

  /**
   * 获取 Provider ID 映射器（用于添加自定义映射）
   */
  getMapper(): ProviderIdMapper {
    return this.mapper;
  }

  /**
   * 执行完整的更新流程
   */
  async run(): Promise<void> {
    try {
      console.log("🚀 开始更新 ProviderType 枚举...\n");

      // 1. 从 API 获取数据
      const apiData = await this.apiClient.fetchData();

      // 2. 提取所有唯一的 ProviderType
      const providerTypes = this.typeExtractor.extract(apiData);

      // 3. 更新 schema.prisma
      await this.schemaUpdater.update(providerTypes);

      // 4. 执行 prisma generate
      await this.prismaGenerator.generate();

      console.log("\n✅ ProviderType 枚举更新完成！");
    } catch (error) {
      console.error("\n❌ 执行过程中出现错误:", error);
      throw error;
    }
  }

  /**
   * 仅提取 Provider 类型（不更新文件）
   */
  async extractTypes(): Promise<Set<string>> {
    const apiData = await this.apiClient.fetchData();
    return this.typeExtractor.extract(apiData);
  }

  /**
   * 仅更新 schema 文件（不调用 API）
   */
  async updateSchemaOnly(providerTypes: Set<string>): Promise<void> {
    await this.schemaUpdater.update(providerTypes);
  }

  /**
   * 仅执行 prisma generate
   */
  async generatePrismaClient(): Promise<void> {
    await this.prismaGenerator.generate();
  }
}

// ==================== 命令行入口 ====================

/**
 * 主执行函数（向后兼容）
 */
async function main(): Promise<void> {
  const updater = new ProviderTypeUpdater();
  await updater.run();
}

// 执行主函数
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();

// 导出所有类和类型
export {
  StringUtils,
  ProviderIdMapper,
  ModelsDevApiClient,
  ProviderTypeExtractor,
  SchemaUpdater,
  PrismaClientGenerator,
  ProviderTypeUpdaterConfig,
  CategoryConfig,
  ModelsDevResponse
};
