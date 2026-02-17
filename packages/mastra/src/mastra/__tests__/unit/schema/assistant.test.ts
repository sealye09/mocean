import { describe, expect, it } from "vitest";

import {
  assistantIdParamSchema,
  assistantThreadIdParamSchema,
  chatWithAssistantSchema,
  createAssistantSchema,
  updateAssistantSchema
} from "../../../schema/assistant";

describe("Assistant Schema Validation", () => {
  // ─── createAssistantSchema ─────────────────────────────
  describe("createAssistantSchema", () => {
    const validData = {
      name: "My Assistant",
      prompt: "You are a helpful assistant",
      modelId: "model-1",
      providerId: "provider-1"
    };

    it("应通过最小有效数据验证", () => {
      const result = createAssistantSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("应填充默认值", () => {
      const result = createAssistantSchema.parse(validData);
      expect(result.type).toBe("assistant");
      expect(result.enableWebSearch).toBe(false);
      expect(result.enableGenerateImage).toBe(false);
    });

    it("name 为空字符串时应失败", () => {
      const result = createAssistantSchema.safeParse({
        ...validData,
        name: ""
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((i) =>
          i.path.includes("name")
        );
        expect(nameError?.message).toBe("助手名称不能为空");
      }
    });

    it("prompt 为空字符串时应失败", () => {
      const result = createAssistantSchema.safeParse({
        ...validData,
        prompt: ""
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const promptError = result.error.issues.find((i) =>
          i.path.includes("prompt")
        );
        expect(promptError?.message).toBe("提示词不能为空");
      }
    });

    it("缺少 name 时应失败", () => {
      const { name: _, ...noName } = validData;
      const result = createAssistantSchema.safeParse(noName);
      expect(result.success).toBe(false);
    });

    it("缺少 prompt 时应失败", () => {
      const { prompt: _, ...noPrompt } = validData;
      const result = createAssistantSchema.safeParse(noPrompt);
      expect(result.success).toBe(false);
    });

    it("应接受可选字段", () => {
      const result = createAssistantSchema.safeParse({
        ...validData,
        emoji: "🤖",
        description: "A helpful assistant",
        enableWebSearch: true,
        enableGenerateImage: true,
        knowledgeRecognition: "on",
        defaultModelId: "model-2",
        webSearchProviderId: "search-provider-1"
      });
      expect(result.success).toBe(true);
    });

    it("type 可以自定义", () => {
      const result = createAssistantSchema.parse({
        ...validData,
        type: "agent"
      });
      expect(result.type).toBe("agent");
    });
  });

  // ─── updateAssistantSchema ─────────────────────────────
  describe("updateAssistantSchema", () => {
    it("所有字段都是可选的", () => {
      const result = updateAssistantSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("应通过部分更新验证", () => {
      const result = updateAssistantSchema.safeParse({ name: "New Name" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("New Name");
      }
    });

    it("name 为空字符串时应失败", () => {
      const result = updateAssistantSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((i) =>
          i.path.includes("name")
        );
        expect(nameError?.message).toBe("助手名称不能为空");
      }
    });

    it("应接受多字段更新", () => {
      const result = updateAssistantSchema.safeParse({
        name: "Updated",
        prompt: "New prompt",
        description: "New desc",
        enableWebSearch: true,
        modelId: "model-2"
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject({
          name: "Updated",
          prompt: "New prompt",
          description: "New desc",
          enableWebSearch: true,
          modelId: "model-2"
        });
      }
    });
  });

  // ─── assistantIdParamSchema ────────────────────────────
  describe("assistantIdParamSchema", () => {
    it("应通过有效 assistantId", () => {
      const result = assistantIdParamSchema.safeParse({
        assistantId: "abc-123"
      });
      expect(result.success).toBe(true);
    });

    it("assistantId 为空字符串时应失败", () => {
      const result = assistantIdParamSchema.safeParse({ assistantId: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("助手ID不能为空");
      }
    });

    it("缺少 assistantId 时应失败", () => {
      const result = assistantIdParamSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ─── assistantThreadIdParamSchema ──────────────────────
  describe("assistantThreadIdParamSchema", () => {
    it("应通过有效参数", () => {
      const result = assistantThreadIdParamSchema.safeParse({
        assistantId: "a-1",
        threadId: "t-1"
      });
      expect(result.success).toBe(true);
    });

    it("缺少 threadId 时应失败", () => {
      const result = assistantThreadIdParamSchema.safeParse({
        assistantId: "a-1"
      });
      expect(result.success).toBe(false);
    });

    it("threadId 为空字符串时应失败", () => {
      const result = assistantThreadIdParamSchema.safeParse({
        assistantId: "a-1",
        threadId: ""
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const err = result.error.issues.find((i) =>
          i.path.includes("threadId")
        );
        expect(err?.message).toBe("线程ID不能为空");
      }
    });
  });

  // ─── chatWithAssistantSchema ───────────────────────────
  describe("chatWithAssistantSchema", () => {
    it("应通过有效聊天数据", () => {
      const result = chatWithAssistantSchema.safeParse({
        assistantId: "a-1",
        messages: [{ role: "user", content: "hello" }]
      });
      expect(result.success).toBe(true);
    });

    it("threadId 是可选的", () => {
      const result = chatWithAssistantSchema.safeParse({
        assistantId: "a-1",
        messages: [],
        threadId: "t-1"
      });
      expect(result.success).toBe(true);
    });

    it("缺少 assistantId 时应失败", () => {
      const result = chatWithAssistantSchema.safeParse({
        messages: []
      });
      expect(result.success).toBe(false);
    });

    it("assistantId 为空字符串时应失败", () => {
      const result = chatWithAssistantSchema.safeParse({
        assistantId: "",
        messages: []
      });
      expect(result.success).toBe(false);
    });

    it("缺少 messages 时应失败", () => {
      const result = chatWithAssistantSchema.safeParse({
        assistantId: "a-1"
      });
      expect(result.success).toBe(false);
    });

    it("messages 可以为空数组", () => {
      const result = chatWithAssistantSchema.safeParse({
        assistantId: "a-1",
        messages: []
      });
      expect(result.success).toBe(true);
    });
  });
});
