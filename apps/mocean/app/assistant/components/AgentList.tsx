"use client";

import { useState } from "react";

import { AgentModel } from "@mocean/mastra/prismaType";
import { Filter } from "lucide-react";

import { AgentDetailDialog } from "@/app/assistant/components/AgentDetailDialog";
import { ItemList } from "@/components/ui/item-list";

import { AgentCard } from "./AgentCard";

export interface AgentListProps {
  agents: AgentModel[];
  selectedGroup?: string | null;
  isLoading?: boolean;
  onCreateAssistant?: (agent: AgentModel) => Promise<boolean>;
  isCreatingAssistant?: boolean;
  className?: string;
}

/**
 * 智能体列表组件
 * @description 根据选中的分组过滤和显示智能体列表，支持搜索和详情查看功能
 *
 * @param agents - 智能体数组
 * @param [selectedGroup] - 当前选中的分组
 * @param [isLoading] - 是否正在加载
 * @param [onCreateAssistant] - 创建助手时的回调函数
 * @param [isCreatingAssistant] - 是否正在创建助手
 * @param [className] - 自定义样式类名
 *
 * @example
 * // 显示智能体列表
 * <AgentList
 *   agents={agentList}
 *   selectedGroup="精选"
 *   onCreateAssistant={(agent) => createAssistant(agent)}
 * />
 */
export const AgentList: React.FC<AgentListProps> = ({
  agents,
  selectedGroup = null,
  isLoading = false,
  onCreateAssistant,
  isCreatingAssistant = false,
  className = "",
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentModel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * 检查智能体是否属于指定分组
   * @param agent - 智能体对象
   * @param group - 分组名称
   * @returns 是否属于该分组
   */
  const isAgentInGroup = (agent: AgentModel, group: string): boolean => {
    if (!agent.groupJson) return false;

    try {
      let groupData;

      // 如果是字符串，先解析 JSON
      if (typeof agent.groupJson === "string") {
        groupData = JSON.parse(agent.groupJson);
      } else {
        groupData = agent.groupJson;
      }

      // 处理解析后的数据
      if (Array.isArray(groupData)) {
        return groupData.some(
          (item) => typeof item === "string" && item === group,
        );
      } else if (typeof groupData === "string") {
        return groupData === group;
      } else if (typeof groupData === "object" && groupData !== null) {
        return String(groupData) === group;
      }

      return false;
    } catch {
      return false;
    }
  };

  /**
   * 分组过滤函数
   * @param agent - 智能体对象
   * @param selectedGroup - 选中的分组
   * @returns 是否通过过滤
   */
  const groupFilter = (
    agent: AgentModel,
    selectedGroup: string | null,
  ): boolean => {
    if (!selectedGroup) return true;
    return isAgentInGroup(agent, selectedGroup);
  };

  /**
   * 搜索过滤函数
   * @param agent - 智能体对象
   * @param searchTerm - 搜索词
   * @returns 是否通过过滤
   */
  const searchFilter = (agent: AgentModel, searchTerm: string): boolean => {
    const term = searchTerm.toLowerCase().trim();
    return (
      agent.name.toLowerCase().includes(term) ||
      agent.description?.toLowerCase().includes(term) ||
      agent.type?.toLowerCase().includes(term) ||
      agent.prompt?.toLowerCase().includes(term)
    );
  };

  /**
   * 处理智能体选择
   * @param agent - 被选中的智能体
   */
  const onAgentCardSelect = (agent: AgentModel) => {
    setSelectedAgent(agent);
    setIsDialogOpen(true);
  };

  /**
   * 关闭对话框
   */
  const onCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAgent(null);
  };

  return (
    <div className={className}>
      <ItemList
        items={agents}
        renderItem={(agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onSelect={onAgentCardSelect}
            className="h-full"
          />
        )}
        searchFilter={searchFilter}
        groupFilter={groupFilter}
        selectedGroup={selectedGroup}
        searchPlaceholder="搜索智能体名称、描述或提示词..."
        groupName="智能体"
        loading={isLoading}
        loadingText="加载智能体中..."
        emptyState={{
          icon: <Filter className="h-6 w-6 text-muted-foreground" />,
          title: "暂无智能体",
          description: "暂时没有任何智能体",
        }}
        gridCols={{
          default: 1,
          lg: 2,
          xl: 3,
          "2xl": 4,
        }}
      />

      {/* 智能体详情对话框 */}
      <AgentDetailDialog
        agent={selectedAgent}
        isOpen={isDialogOpen}
        onClose={onCloseDialog}
        onCreateAssistant={onCreateAssistant}
        isCreatingAssistant={isCreatingAssistant}
      />
    </div>
  );
};
