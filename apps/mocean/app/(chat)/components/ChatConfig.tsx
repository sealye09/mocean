"use client";

import { useState } from "react";

import { AgentModel } from "@mocean/mastra/prismaType";

import { useStore } from "@/app/store/useStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AgentSelect from "./Agent";
import TopicSelect from "./TopicSelect";

const ChatConfig = () => {
  const tabsConfig = [
    {
      value: "assistant",
      label: "助手",
    },
    {
      value: "topic",
      label: "话题",
    },
    {
      value: "setting",
      label: "设置",
    },
  ];

  const { setActiveAgent } = useStore();

  const [activeTab, setActiveTab] = useState<string>(
    tabsConfig[0]?.value || "assistant",
  );

  const onAgentSelect = (agent: AgentModel) => {
    setActiveTab(tabsConfig[1]?.value || "topic");
    setActiveAgent(agent);
  };
  return (
    <Tabs defaultValue={activeTab} className="w-[400px] px-2">
      <TabsList className="w-full">
        {tabsConfig.map((tab) => (
          <TabsTrigger className="flex-1" key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="assistant">
        <AgentSelect onClick={onAgentSelect} />
      </TabsContent>
      <TabsContent value="topic">
        <TopicSelect />
      </TabsContent>
      <TabsContent value="setting">Change your setting here.</TabsContent>
    </Tabs>
  );
};

export default ChatConfig;
