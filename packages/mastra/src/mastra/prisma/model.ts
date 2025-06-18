import { z } from "zod";

import { ModelType } from "../../../generated/prisma";
import { prisma } from "./index";

/**
 * 模型相关的zod校验schemas
 */
const createModelSchema = z.object({
  id: z.string().min(1, "模型ID不能为空"),
  provider: z.string().min(1, "提供商名称不能为空"),
  name: z.string().min(1, "模型名称不能为空"),
  group: z.string().min(1, "模型分组不能为空"),
  owned_by: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  typeJson: z.array(z.nativeEnum(ModelType)).default([ModelType.text]),
  providerId: z.string().min(1, "提供商ID不能为空"),
});

const updateModelSchema = z.object({
  provider: z.string().min(1, "提供商名称不能为空").optional(),
  name: z.string().min(1, "模型名称不能为空").optional(),
  group: z.string().min(1, "模型分组不能为空").optional(),
  owned_by: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  typeJson: z.array(z.nativeEnum(ModelType)).optional(),
  providerId: z.string().min(1, "提供商ID不能为空").optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1, "模型ID不能为空"),
});

const providerParamSchema = z.object({
  providerId: z.string().min(1, "提供商ID不能为空"),
});

const typeParamSchema = z.object({
  type: z.nativeEnum(ModelType, { message: "无效的模型类型" }),
});

const groupParamSchema = z.object({
  group: z.string().min(1, "模型分组不能为空"),
});

// zod类型推导
type CreateModelInput = z.infer<typeof createModelSchema>;
type UpdateModelInput = z.infer<typeof updateModelSchema>;

/**
 * 获取所有模型
 * @description 从数据库中获取所有模型的列表
 * @returns 包含所有模型信息的数组
 */
const getModels = async () => {
  const models = await prisma.model.findMany({
    include: {
      providerRelation: true,
      assistants: true,
      defaultForAssistants: true,
      knowledgeBases: true,
      assistantSettings: true,
      rerankFor: true,
    },
    orderBy: {
      provider: "asc",
    },
  });

  // 转换typeJson为ModelType[]
  return models.map((model) => ({
    ...model,
    types: JSON.parse(model.typeJson as string) as ModelType[],
  }));
};

/**
 * 根据ID获取单个模型
 * @description 通过模型ID从数据库中获取特定模型的详细信息
 * @param id - 模型的唯一标识符
 * @returns 模型对象，如果不存在则返回null
 */
const getModelById = async (id: string) => {
  const model = await prisma.model.findUnique({
    where: {
      id,
    },
    include: {
      providerRelation: true,
      assistants: true,
      defaultForAssistants: true,
      knowledgeBases: true,
      assistantSettings: true,
      rerankFor: true,
    },
  });

  if (!model) return null;

  // 转换typeJson为ModelType[]
  return {
    ...model,
    types: JSON.parse(model.typeJson as string) as ModelType[],
  };
};

/**
 * 根据提供商ID获取模型
 * @description 通过提供商ID获取对应的模型列表
 * @param providerId - 提供商ID
 * @returns 符合提供商的模型数组
 */
const getModelsByProvider = async (providerId: string) => {
  const models = await prisma.model.findMany({
    where: {
      providerId,
    },
    include: {
      providerRelation: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // 转换typeJson为ModelType[]
  return models.map((model) => ({
    ...model,
    types: JSON.parse(model.typeJson as string) as ModelType[],
  }));
};

/**
 * 根据模型类型获取模型
 * @description 通过模型类型获取对应的模型列表
 * @param type - 模型类型
 * @returns 符合类型的模型数组
 */
const getModelsByType = async (type: ModelType) => {
  const models = await prisma.model.findMany({
    where: {
      typeJson: {
        string_contains: type,
      },
    },
    include: {
      providerRelation: true,
    },
  });

  // 转换typeJson为ModelType[]
  return models.map((model) => ({
    ...model,
    types: JSON.parse(model.typeJson as string) as ModelType[],
  }));
};

/**
 * 根据分组获取模型
 * @description 通过模型分组获取对应的模型列表
 * @param group - 模型分组
 * @returns 符合分组的模型数组
 */
const getModelsByGroup = async (group: string) => {
  const models = await prisma.model.findMany({
    where: {
      group,
    },
    include: {
      providerRelation: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // 转换typeJson为ModelType[]
  return models.map((model) => ({
    ...model,
    types: JSON.parse(model.typeJson as string) as ModelType[],
  }));
};

/**
 * 创建新模型
 * @description 在数据库中创建一个新的模型记录
 * @param model - 包含模型信息的对象
 * @returns 新创建的模型对象
 */
const createModel = async (model: CreateModelInput) => {
  // 验证提供商是否存在
  const provider = await prisma.provider.findUnique({
    where: { id: model.providerId },
  });

  if (!provider) {
    throw new Error("指定的提供商不存在");
  }

  const newModel = await prisma.model.create({
    data: {
      ...model,
      typeJson: JSON.stringify(model.typeJson),
    } as Parameters<typeof prisma.model.create>[0]["data"],
    include: {
      providerRelation: true,
    },
  });

  return {
    ...newModel,
    types: JSON.parse(newModel.typeJson as string) as ModelType[],
  };
};

/**
 * 更新模型信息
 * @description 根据模型ID更新数据库中的模型信息
 * @param id - 要更新的模型的唯一标识符
 * @param model - 包含更新信息的对象
 * @returns 更新后的模型对象
 */
const updateModel = async (id: string, model: UpdateModelInput) => {
  // 如果提供了providerId，验证提供商是否存在
  if (model.providerId) {
    const provider = await prisma.provider.findUnique({
      where: { id: model.providerId },
    });

    if (!provider) {
      throw new Error("指定的提供商不存在");
    }
  }

  const updateData: Parameters<typeof prisma.model.update>[0]["data"] = {
    ...model,
  };

  // 如果有typeJson，转换为JSON字符串
  if (model.typeJson) {
    updateData.typeJson = JSON.stringify(model.typeJson);
  }

  const updatedModel = await prisma.model.update({
    where: {
      id,
    },
    data: updateData,
    include: {
      providerRelation: true,
    },
  });

  return {
    ...updatedModel,
    types: JSON.parse(updatedModel.typeJson as string) as ModelType[],
  };
};

/**
 * 删除模型
 * @description 根据模型ID从数据库中删除指定的模型
 * @param id - 要删除的模型的唯一标识符
 * @returns 被删除的模型对象
 */
const deleteModel = async (id: string) => {
  // 先检查是否有关联的助手或知识库
  const modelWithRelations = await prisma.model.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          assistants: true,
          defaultForAssistants: true,
          knowledgeBases: true,
          assistantSettings: true,
          rerankFor: true,
        },
      },
    },
  });

  if (modelWithRelations) {
    const { _count } = modelWithRelations;
    const totalRelations =
      _count.assistants +
      _count.defaultForAssistants +
      _count.knowledgeBases +
      _count.assistantSettings +
      _count.rerankFor;

    if (totalRelations > 0) {
      throw new Error(`无法删除模型：仍有 ${totalRelations} 个关联的记录`);
    }
  }

  const deletedModel = await prisma.model.delete({
    where: {
      id,
    },
  });

  return {
    ...deletedModel,
    types: JSON.parse(deletedModel.typeJson as string) as ModelType[],
  };
};

/**
 * 批量创建模型
 * @description 批量创建多个模型记录
 * @param models - 模型信息数组
 * @returns 创建结果统计
 */
const createManyModels = async (models: CreateModelInput[]) => {
  // 验证所有提供商是否存在
  const providerIds = [...new Set(models.map((m) => m.providerId))];
  const providers = await prisma.provider.findMany({
    where: {
      id: { in: providerIds },
    },
    select: { id: true },
  });

  const existingProviderIds = new Set(providers.map((p) => p.id));
  const missingProviders = providerIds.filter(
    (id) => !existingProviderIds.has(id),
  );

  if (missingProviders.length > 0) {
    throw new Error(`以下提供商不存在: ${missingProviders.join(", ")}`);
  }

  // 转换数据
  const createData = models.map((model) => ({
    ...model,
    typeJson: JSON.stringify(model.typeJson),
  })) as Parameters<typeof prisma.model.createMany>[0]["data"];

  const result = await prisma.model.createMany({
    data: createData,
  });

  return result;
};

export {
  getModels,
  getModelById,
  getModelsByProvider,
  getModelsByType,
  getModelsByGroup,
  createModel,
  updateModel,
  deleteModel,
  createManyModels,
  createModelSchema,
  updateModelSchema,
  idParamSchema,
  providerParamSchema,
  typeParamSchema,
  groupParamSchema,
};
