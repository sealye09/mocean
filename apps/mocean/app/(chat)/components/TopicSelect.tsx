import { useStore } from "@/app/store/useStore";
import { useAssistantThreadsSWR } from "@/hooks/useAssistantsSWR";

import ThreadList from "./thead/ThreadList";

const TopicSelect = () => {
  const { activeAssistant } = useStore();

  const { threads } = useAssistantThreadsSWR(activeAssistant?.id || null);

  return (
    <div className="h-full w-full">
      123
      {threads.length}
      <ThreadList threads={threads || []} />
    </div>
  );
};

export default TopicSelect;
