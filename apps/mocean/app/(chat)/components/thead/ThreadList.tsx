import { StorageThreadType } from "@mocean/mastra/apiClient";

interface ThreadListProps {
  threads: StorageThreadType[];
}

const ThreadList = ({ threads }: ThreadListProps) => {
  return (
    <div>
      {threads.map((thread) => (
        <div key={thread.id}>{thread.id}</div>
      ))}
    </div>
  );
};

export default ThreadList;
