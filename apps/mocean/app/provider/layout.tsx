"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Loader2, Settings } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ItemCard } from "@/components/ui/item-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useProvidersSWR } from "@/hooks/useProvidersSWR";

import { PROVIDER_LOGO_MAP } from "./constant";

interface ProviderLayoutProps {
  children: React.ReactNode;
}

/**
 * 提供商页面布局组件
 * @description 左侧提供商列表，右侧详细内容的分栏布局
 */
export default function ProviderLayout({ children }: ProviderLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProviderId = searchParams.get("provider");

  const { providers, isLoading, error } = useProvidersSWR();

  /**
   * 处理提供商选择变化
   * @param providerId - 选中的提供商ID
   */
  const onProviderChange = (providerId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("provider", providerId);
    router.push(`/provider?${params.toString()}`);
  };

  /**
   * 根据提供商类型获取图标
   * @param providerName - 提供商名称
   */
  const getProviderIcon = (providerName: string) => {
    const logo =
      PROVIDER_LOGO_MAP[providerName as keyof typeof PROVIDER_LOGO_MAP];
    return logo;
  };

  /**
   * 渲染提供商头像
   * @param providerName - 提供商名称
   */
  const renderProviderAvatar = (providerName: string) => {
    const logo = getProviderIcon(providerName);

    if (logo) {
      return (
        <Image
          src={logo}
          alt={providerName}
          width={40}
          height={40}
          className="rounded-lg"
        />
      );
    }

    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm text-white">
        {providerName.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">
            加载提供商数据中...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96">
          <CardContent className="py-8">
            <div className="text-center">
              <p className="mb-2 text-sm text-red-500">加载提供商数据失败</p>
              <p className="text-xs text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* 左侧提供商列表 */}
      <div className="flex w-80 flex-col border-r border-border bg-card">
        <div className="p-4">
          <div className="mb-4 flex items-center space-x-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">提供商配置</h2>
          </div>
          <Separator />
        </div>

        <ScrollArea className="h-0 flex-1">
          <div className="space-y-2 p-4">
            {providers.map((provider) => (
              <ItemCard
                key={provider.id}
                title={provider.name}
                avatar={renderProviderAvatar(provider.name)}
                selected={selectedProviderId === provider.id}
                onClick={() => onProviderChange(provider.id)}
                className="h-auto min-h-0"
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 bg-background">{children}</div>
    </div>
  );
}
