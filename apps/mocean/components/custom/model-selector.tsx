"use client";

import { memo } from "react";

import Image from "next/image";

import { renderProviderAvatar as RenderProviderAvatar } from "@/app/provider/components/CustomerIcon";
import { getModelLogo } from "@/app/provider/constant";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { ModelSelectorProps, useModelSelector } from "./useModelSelector";

/**
 * 模型选择器组件
 *
 * @description 树状下拉选择器，支持按供应商分组选择模型
 * @param props - 组件属性
 * @returns 模型选择器组件
 *
 * @example
 * ```tsx
 * <ModelSelector
 *   providers={providers}
 *   value={selectedModel}
 *   onChange={onModelChange}
 * />
 * ```
 */

const ModelSelectorComponent = ({
  providers,
  value,
  onChange,
  className,
}: ModelSelectorProps) => {
  const {
    providersWithGroups,
    open,
    setOpen,
    selectedProvider,
    onSelectModel,
  } = useModelSelector({
    providers,
    value,
    onChange,
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="link"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "hover:to-brand-secondary/10 h-10 justify-between gap-2 border-brand-primary/20 py-0 !no-underline hover:border-brand-primary/40 hover:from-brand-primary/10 focus-visible:outline-none focus-visible:ring-0",
            className,
          )}
          onClick={() => setOpen(!open)}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 shrink-0">
                <RenderProviderAvatar provider={selectedProvider} />
              </div>
              <span className="truncate text-sm font-medium">
                {value.modelName}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">选择模型</span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="overflow-y-auto"
        align="start"
        side="top"
        sideOffset={-4}
      >
        {providersWithGroups.map((provider) => (
          <DropdownMenuSub key={provider.id}>
            <DropdownMenuSubTrigger className="gap-2">
              <div className="h-5 w-5 shrink-0">
                <RenderProviderAvatar provider={provider} />
              </div>
              <span className="font-medium">{provider.name}</span>
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent className="p-0">
              <ScrollArea className="h-52">
                <div className="p-2">
                  {provider.modelGroups.length > 0 ? (
                    provider.modelGroups.map((group, groupIndex) => (
                      <div
                        key={group.groupName}
                        className={cn(
                          "relative rounded-md border border-border/50 bg-muted/20 p-2 pb-1",
                          groupIndex > 0 && "mt-3",
                        )}
                      >
                        <div className="space-y-0.5">
                          {group.models.map((model) => (
                            <DropdownMenuItem
                              key={model.id}
                              className={cn(
                                "cursor-pointer gap-2 rounded-sm",
                                value?.modelId === model.id &&
                                  "bg-brand-primary/10 font-medium text-brand-primary",
                              )}
                              onSelect={() => onSelectModel(provider, model)}
                            >
                              <div className="h-4 w-4 shrink-0">
                                <Image
                                  src={
                                    getModelLogo(
                                      model.id as keyof typeof getModelLogo,
                                    ) ?? ""
                                  }
                                  alt={model.name}
                                  width={14}
                                  height={14}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <span className="truncate text-sm">
                                {model.name}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </div>
                        <span className="absolute -bottom-1 right-1 text-[10px] leading-none text-brand-primary/60">
                          {group.groupName}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      暂无模型
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}

        {providersWithGroups.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            暂无可用供应商
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * 导出用 React.memo 包裹的组件，避免不必要的重渲染
 *
 * @description 当 props 没有变化时，组件不会重新渲染
 */
export const ModelSelector = memo(ModelSelectorComponent);
