"use client";

import { MyRuntimeProvider } from "@/app/context/MastraRuntimeProvider";

import ChatConfig from "./components/ChatConfig";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MyRuntimeProvider>
      <div className="flex h-full pt-2">
        <ChatConfig />
        {children}
      </div>
    </MyRuntimeProvider>
  );
};

export default ChatLayout;
