import { useEffect } from "react";

import { useApi } from "@mocean/mastra/apiClient";

import { useStore } from "@/app/store/useStore";
import { ThreadList } from "@/components/thread-list";

const TopicSelect = () => {
  const { activeAgent } = useStore();

  const { topicList, setTopicList } = useStore();

  useEffect(() => {
    if (activeAgent) {
      // setTopicList(activeAgent.topicList);
    }
  }, [activeAgent]);

  return <div>TopicSelect</div>;
};

export default TopicSelect;
