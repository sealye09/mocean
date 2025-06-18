import { z } from "zod";

import { ProviderType } from "../../../generated/prisma";
import { prisma } from "./index";

/**
 * 提供商相关的zod校验schemas
 */
const createProviderSchema = z.object({
  type: z.nativeEnum(ProviderType, { message: "无效的提供商类型" }),
  name: z.string().min(1, "提供商名称不能为空"),
  apiKey: z.string().min(1, "API密钥不能为空"),
  apiHost: z.string().url("API地址格式不正确"),
  apiVersion: z.string().nullable().optional(),
  enabled: z.boolean().optional().default(true),
  isSystem: z.boolean().optional().default(false),
  isAuthed: z.boolean().optional().default(false),
  rateLimit: z.number().positive().nullable().optional(),
  isNotSupportArrayContent: z.boolean().optional().default(false),
  notes: z.string().nullable().optional(),
});

const updateProviderSchema = z.object({
  type: z.nativeEnum(ProviderType, { message: "无效的提供商类型" }).optional(),
  name: z.string().min(1, "提供商名称不能为空").optional(),
  apiKey: z.string().min(1, "API密钥不能为空").optional(),
  apiHost: z.string().url("API地址格式不正确").optional(),
  apiVersion: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  isSystem: z.boolean().optional(),
  isAuthed: z.boolean().optional(),
  rateLimit: z.number().positive().nullable().optional(),
  isNotSupportArrayContent: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1, "提供商ID不能为空"),
});

const typeParamSchema = z.object({
  type: z.nativeEnum(ProviderType, { message: "无效的提供商类型" }),
});

// zod类型推导
type CreateProviderInput = z.infer<typeof createProviderSchema>;
type UpdateProviderInput = z.infer<typeof updateProviderSchema>;

/**
 * 获取所有提供商
 * @description 从数据库中获取所有提供商的列表
 * @returns 包含所有提供商信息的数组
 */
const getProviders = async () => {
  const providers = await prisma.provider.findMany({
    include: {
      models: true,
      _count: {
        select: {
          models: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return providers;
};

/**
 * 根据ID获取单个提供商
 * @description 通过提供商ID从数据库中获取特定提供商的详细信息
 * @param id - 提供商的唯一标识符
 * @returns 提供商对象，如果不存在则返回null
 */
const getProviderById = async (id: string) => {
  const provider = await prisma.provider.findUnique({
    where: {
      id,
    },
    include: {
      models: true,
      _count: {
        select: {
          models: true,
        },
      },
    },
  });
  return provider;
};

/**
 * 根据类型获取提供商
 * @description 通过提供商类型获取对应的提供商列表
 * @param type - 提供商类型
 * @returns 符合类型的提供商数组
 */
const getProvidersByType = async (type: ProviderType) => {
  const providers = await prisma.provider.findMany({
    where: {
      type,
    },
    include: {
      models: true,
      _count: {
        select: {
          models: true,
        },
      },
    },
  });
  return providers;
};

/**
 * 获取启用的提供商
 * @description 获取所有启用状态的提供商
 * @returns 启用的提供商数组
 */
const getEnabledProviders = async () => {
  const providers = await prisma.provider.findMany({
    where: {
      enabled: true,
    },
    include: {
      models: true,
      _count: {
        select: {
          models: true,
        },
      },
    },
  });
  return providers;
};

/**
 * 创建新提供商
 * @description 在数据库中创建一个新的提供商记录
 * @param provider - 包含提供商信息的对象
 * @returns 新创建的提供商对象，包含生成的ID和时间戳
 */
const createProvider = async (provider: CreateProviderInput) => {
  const newProvider = await prisma.provider.create({
    data: {
      ...provider,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Parameters<typeof prisma.provider.create>[0]["data"],
    include: {
      models: true,
      _count: {
        select: {
          models: true,
        },
      },
    },
  });
  return newProvider;
};

/**
 * 更新提供商信息
 * @description 根据提供商ID更新数据库中的提供商信息
 * @param id - 要更新的提供商的唯一标识符
 * @param provider - 包含更新信息的对象
 * @returns 更新后的提供商对象
 */
const updateProvider = async (id: string, provider: UpdateProviderInput) => {
  const updatedProvider = await prisma.provider.update({
    where: {
      id,
    },
    data: {
      ...provider,
      updatedAt: new Date(),
    },
    include: {
      models: true,
      _count: {
        select: {
          models: true,
        },
      },
    },
  });
  return updatedProvider;
};

/**
 * 删除提供商
 * @description 根据提供商ID从数据库中删除指定的提供商
 * @param id - 要删除的提供商的唯一标识符
 * @returns 被删除的提供商对象
 */
const deleteProvider = async (id: string) => {
  // 先检查是否有关联的模型
  const providerWithModels = await prisma.provider.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          models: true,
        },
      },
    },
  });

  if (providerWithModels && providerWithModels._count.models > 0) {
    throw new Error(
      `无法删除提供商：仍有 ${providerWithModels._count.models} 个关联的模型`,
    );
  }

  const deletedProvider = await prisma.provider.delete({
    where: {
      id,
    },
  });
  return deletedProvider;
};

/**
 * 切换提供商启用状态
 * @description 切换提供商的启用/禁用状态
 * @param id - 提供商的唯一标识符
 * @returns 更新后的提供商对象
 */
const toggleProviderEnabled = async (id: string) => {
  const provider = await prisma.provider.findUnique({
    where: { id },
    select: { enabled: true },
  });

  if (!provider) {
    throw new Error("提供商不存在");
  }

  const updatedProvider = await prisma.provider.update({
    where: { id },
    data: {
      enabled: !provider.enabled,
      updatedAt: new Date(),
    },
    include: {
      models: true,
      _count: {
        select: {
          models: true,
        },
      },
    },
  });

  return updatedProvider;
};

export {
  getProviders,
  getProviderById,
  getProvidersByType,
  getEnabledProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  toggleProviderEnabled,
  createProviderSchema,
  updateProviderSchema,
  idParamSchema,
  typeParamSchema,
};
