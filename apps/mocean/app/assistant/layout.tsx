"use client";

import { useState } from "react";
import { AgentGroupSelect } from "./components/AgentGroupSelect";

const AssistantLayout = ({ children }: { children: React.ReactNode }) => {
  const [selectedGroup, setSelectedGroup] = useState("精选");

  const handleGroupSelect = (group: string) => {
    setSelectedGroup(group);
    console.log("选择的分组:", group);
  };

  return (
    <div className="flex gap-6 p-6 bg-background h-screen overflow-hidden">
      {/* 左侧 - Agent分组选择器 */}
      <div className="w-80 flex-shrink-0 h-full">
        <AgentGroupSelect
          selectedGroup={selectedGroup}
          onGroupSelect={handleGroupSelect}
        />
      </div>

      {/* 右侧 - 主要内容区域 */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default AssistantLayout;
