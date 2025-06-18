/// <reference lib="dom" />
import { ModelType } from "generated/prisma/enums";
import { ModelModel } from "generated/prisma/models";

import { ApiClientConfig, ApiResponse, BaseApiClient } from "./base-client";

/**
 * 模型创建和更新的输入类型
 */
export type ModelInput = Pick<
  ModelModel,
  | "id"
  | "provider"
  | "name"
  | "group"
  | "owned_by"
  | "description"
  | "typeJson"
  | "providerId"
>;

/**
 * 模型创建输入类型（包含类型数组）
 */
export type ModelCreateInput = Omit<ModelInput, "typeJson"> & {
  types: ModelType[];
};

/**
 * 批量创建结果类型
 */
export type BatchCreateResult = {
  count: number;
};

/**
 * 模型 API 客户端类
 * @description 提供类型安全的模型相关 API 调用方法
 */
export class ModelsApiClient extends BaseApiClient {
  constructor(config: ApiClientConfig = {}) {
    super(config);
  }

  /**
   * 获取所有模型
   * @description 获取系统中所有可用的模型列表
   */
  async getModels(): Promise<ApiResponse<ModelModel[]>> {
    return this.get<ModelModel[]>("/models");
  }

  /**
   * 根据ID获取单个模型
   * @description 通过模型ID获取特定模型的详细信息
   * @param id - 模型的唯一标识符
   */
  async getModelById(id: string): Promise<ApiResponse<ModelModel>> {
    return this.get<ModelModel>(`/models/${id}`);
  }

  /**
   * 根据提供商ID获取模型
   * @description 通过提供商ID获取对应的模型列表
   * @param providerId - 提供商ID
   */
  async getModelsByProvider(
    providerId: string,
  ): Promise<ApiResponse<ModelModel[]>> {
    return this.get<ModelModel[]>(`/models/provider/${providerId}`);
  }

  /**
   * 根据类型获取模型
   * @description 通过模型类型获取对应的模型列表
   * @param type - 模型类型
   */
  async getModelsByType(type: ModelType): Promise<ApiResponse<ModelModel[]>> {
    return this.get<ModelModel[]>(`/models/type/${type}`);
  }

  /**
   * 根据分组获取模型
   * @description 通过模型分组获取对应的模型列表
   * @param group - 模型分组
   */
  async getModelsByGroup(group: string): Promise<ApiResponse<ModelModel[]>> {
    return this.get<ModelModel[]>(`/models/group/${group}`);
  }

  /**
   * 创建新模型
   * @description 在系统中创建一个新的模型
   * @param modelData - 模型信息对象
   */
  async createModel(
    modelData: ModelCreateInput,
  ): Promise<ApiResponse<ModelModel>> {
    // 转换types数组为typeJson
    const data = {
      ...modelData,
      typeJson: modelData.types,
    };
    return this.post<ModelModel>("/models", data);
  }

  /**
   * 批量创建模型
   * @description 批量创建多个模型
   * @param modelsData - 模型信息数组
   */
  async createManyModels(
    modelsData: ModelCreateInput[],
  ): Promise<ApiResponse<BatchCreateResult>> {
    // 转换types数组为typeJson
    const data = modelsData.map((model) => ({
      ...model,
      typeJson: model.types,
    }));
    return this.post<BatchCreateResult>(
      "/models/batch",
      data as unknown as Record<string, unknown>,
    );
  }

  /**
   * 更新模型信息
   * @description 更新指定模型的信息
   * @param id - 模型的唯一标识符
   * @param modelData - 更新的模型信息
   */
  async updateModel(
    id: string,
    modelData: Partial<ModelCreateInput>,
  ): Promise<ApiResponse<ModelModel>> {
    // 如果有types字段，转换为typeJson
    const data = modelData.types
      ? { ...modelData, typeJson: modelData.types }
      : modelData;
    return this.put<ModelModel>(`/models/${id}`, data);
  }

  /**
   * 删除模型
   * @description 删除指定的模型
   * @param id - 模型的唯一标识符
   */
  async deleteModel(id: string): Promise<ApiResponse<ModelModel>> {
    return this.delete<ModelModel>(`/models/${id}`);
  }
}

/**
 * 默认的模型 API 客户端实例
 */
export const modelsApi = new ModelsApiClient();

/**
 * 便捷的函数式 API 调用方法
 * @description 提供更简洁的函数调用方式
 */
export const modelsApiMethods = {
  /**
   * 获取所有模型
   */
  getModels: () => modelsApi.getModels(),

  /**
   * 根据ID获取模型
   * @param id - 模型ID
   */
  getModelById: (id: string) => modelsApi.getModelById(id),

  /**
   * 根据提供商ID获取模型
   * @param providerId - 提供商ID
   */
  getModelsByProvider: (providerId: string) =>
    modelsApi.getModelsByProvider(providerId),

  /**
   * 根据类型获取模型
   * @param type - 模型类型
   */
  getModelsByType: (type: ModelType) => modelsApi.getModelsByType(type),

  /**
   * 根据分组获取模型
   * @param group - 模型分组
   */
  getModelsByGroup: (group: string) => modelsApi.getModelsByGroup(group),

  /**
   * 创建模型
   * @param modelData - 模型数据
   */
  createModel: (modelData: ModelCreateInput) =>
    modelsApi.createModel(modelData),

  /**
   * 批量创建模型
   * @param modelsData - 模型数据数组
   */
  createManyModels: (modelsData: ModelCreateInput[]) =>
    modelsApi.createManyModels(modelsData),

  /**
   * 更新模型
   * @param id - 模型ID
   * @param modelData - 更新数据
   */
  updateModel: (id: string, modelData: Partial<ModelCreateInput>) =>
    modelsApi.updateModel(id, modelData),

  /**
   * 删除模型
   * @param id - 模型ID
   */
  deleteModel: (id: string) => modelsApi.deleteModel(id),
};

/**
 * React Hook 风格的 API 调用方法
 * @description 适用于 React 应用的 Hook 风格调用
 */
export const useModelsApi = () => {
  return {
    getModels: modelsApi.getModels.bind(modelsApi),
    getModelById: modelsApi.getModelById.bind(modelsApi),
    getModelsByProvider: modelsApi.getModelsByProvider.bind(modelsApi),
    getModelsByType: modelsApi.getModelsByType.bind(modelsApi),
    getModelsByGroup: modelsApi.getModelsByGroup.bind(modelsApi),
    createModel: modelsApi.createModel.bind(modelsApi),
    createManyModels: modelsApi.createManyModels.bind(modelsApi),
    updateModel: modelsApi.updateModel.bind(modelsApi),
    deleteModel: modelsApi.deleteModel.bind(modelsApi),
  };
};
