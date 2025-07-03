import { useRouter } from "next/navigation";

import { StorageThreadType } from "@mocean/mastra/apiClient";

import { useStore } from "@/app/store/useStore";
import { useAssistantThreadsSWR } from "@/hooks/useAssistantsSWR";

import ThreadList from "./thead/ThreadList";

const ThreadSelect = () => {
  const { activeAssistant } = useStore();

  const router = useRouter();

  const { threads } = useAssistantThreadsSWR(activeAssistant?.id || null);

  const onCreateThread = () => {
    if (!activeAssistant) {
      return;
    }

    router.push(`${activeAssistant.id}`);
  };

  const onThreadClick = (thread: StorageThreadType) => {
    router.push(`${activeAssistant?.id}/${thread.id}`);
  };

  return (
    <div className="h-full w-full">
      <ThreadList
        threads={threads || []}
        onCreateThread={onCreateThread}
        onThreadClick={onThreadClick}
      />
    </div>
  );
};

export default ThreadSelect;
