"use client";

import { MessageSquare, MousePointerClick, Sparkles } from "lucide-react";

export default function Chat() {
  return (
    <div className="flex h-full flex-1 items-center justify-center">
      <div className="flex max-w-md flex-col items-center px-6 text-center">
        {/* Icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--brand-primary-50))] dark:bg-[hsl(var(--brand-primary-950))]">
          <MessageSquare className="h-8 w-8 text-[hsl(var(--brand-primary-500))]" />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          开始对话
        </h1>

        {/* Description */}
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          从左侧选择一个 AI 助手，即可开始智能对话
        </p>

        {/* Hints */}
        <div className="flex flex-col gap-3 self-stretch">
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-left">
            <MousePointerClick className="h-4 w-4 shrink-0 text-[hsl(var(--brand-primary-400))]" />
            <span className="text-sm text-muted-foreground">
              点击左侧助手卡片选择助手
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-left">
            <Sparkles className="h-4 w-4 shrink-0 text-[hsl(var(--brand-primary-400))]" />
            <span className="text-sm text-muted-foreground">
              选择话题或新建对话，开始提问
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
