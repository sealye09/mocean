"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProvidersSWR } from "@/hooks/useProvidersSWR";

import { PROVIDER_LOGO_MAP } from "./constant";

interface ProviderLayoutProps {
  children: React.ReactNode;
}

/**
 * 提供商页面布局组件
 * @description 包含提供商选择器和页面内容区域
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
   * @param providerType - 提供商类型
   */
  const getProviderIcon = (providerType: string) => {
    const logo =
      PROVIDER_LOGO_MAP[providerType as keyof typeof PROVIDER_LOGO_MAP];
    return logo;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            加载提供商数据中...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Card>
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
    <div className="flex flex-col gap-4 p-6">
      {/* 提供商选择器 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">选择提供商</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Select
              value={selectedProviderId || ""}
              onValueChange={onProviderChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择一个提供商" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex w-full items-center space-x-3">
                      {/* 提供商图标 */}
                      <div className="flex h-6 w-6 items-center justify-center">
                        {getProviderIcon(provider.type) ? (
                          <Image
                            src={getProviderIcon(provider.type)}
                            alt={provider.name}
                            width={24}
                            height={24}
                            className="rounded-sm"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-gradient-to-br from-blue-500 to-purple-600 text-xs text-white">
                            {provider.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* 提供商信息 */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {provider.name}
                          </span>
                          <Badge
                            variant={provider.enabled ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {provider.enabled ? "已启用" : "已禁用"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {provider.type} • {provider.apiHost}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 当前选中的提供商信息 */}
            {selectedProviderId && (
              <div className="mt-4">
                {(() => {
                  const selectedProvider = providers.find(
                    (p) => p.id === selectedProviderId,
                  );
                  if (!selectedProvider) return null;

                  return (
                    <div className="flex items-center space-x-3 rounded-lg bg-muted/20 p-3">
                      <div className="flex h-8 w-8 items-center justify-center">
                        {getProviderIcon(selectedProvider.type) ? (
                          <Image
                            src={getProviderIcon(selectedProvider.type)}
                            alt={selectedProvider.name}
                            width={32}
                            height={32}
                            className="rounded-md"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-sm text-white">
                            {selectedProvider.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">
                          {selectedProvider.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {selectedProvider.type} • {selectedProvider.apiHost}
                        </p>
                      </div>
                      <Badge
                        variant={
                          selectedProvider.enabled ? "default" : "secondary"
                        }
                      >
                        {selectedProvider.enabled ? "已启用" : "已禁用"}
                      </Badge>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 页面内容 */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
