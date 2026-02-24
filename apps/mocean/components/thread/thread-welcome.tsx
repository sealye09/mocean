import type { FC } from "react";

import Image from "next/image";

import { ThreadPrimitive } from "@assistant-ui/react";

import PromptBoxBG from "@/assets/images/app/PromptBoxBg.png";
import PromptBoxStar from "@/assets/images/app/PromptBoxStar.png";

const suggestions = [
  { title: "帮我写一篇文章" },
  { title: "帮我写代码" },
  { title: "给我一些创意" }
];

export const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex w-full max-w-2xl flex-grow flex-col items-center justify-center px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground">Hi，你好！</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          今天有什么可以帮你的吗？
        </p>

        <div className="mt-8 flex w-full items-center gap-3">
          {suggestions.map((item) => (
            <ThreadPrimitive.Suggestion
              key={item.title}
              prompt={item.title}
              asChild
            >
              <button className="relative flex h-[14.75rem] w-[13.75rem] flex-1 flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent">
                <Image src={PromptBoxBG} alt="" fill className="object-cover" />
                <div className="relative z-10 flex h-full flex-col p-4">
                  <Image
                    src={PromptBoxStar}
                    alt=""
                    className="h-[2.5rem] w-[2.5rem]"
                  />
                  <p className="mt-auto pt-6 text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                </div>
              </button>
            </ThreadPrimitive.Suggestion>
          ))}
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
};
