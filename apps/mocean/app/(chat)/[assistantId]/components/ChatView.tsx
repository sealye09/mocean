import { FC } from "react";

import { UIMessage } from "ai";

import { MastraRuntimeProvider } from "@/app/context/MastraRuntimeProvider";
import { Thread } from "@/components/thread";

interface ChatViewProps {
  messages?: UIMessage[];
}

const ChatView: FC<ChatViewProps> = ({ messages = [] }) => {
  return (
    <MastraRuntimeProvider messages={messages}>
      <Thread />
    </MastraRuntimeProvider>
  );
};

export default ChatView;
