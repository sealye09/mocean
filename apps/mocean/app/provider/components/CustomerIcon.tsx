import { FC } from "react";

import Image, { StaticImageData } from "next/image";

import { PROVIDER_LOGO_MAP } from "../constant";

/**
 * 根据提供商类型获取图标
 * @param providerName - 提供商名称
 */
export const getProviderIcon = (providerName: string): StaticImageData => {
  const logo =
    PROVIDER_LOGO_MAP[providerName as keyof typeof PROVIDER_LOGO_MAP];
  return logo;
};

interface RenderProviderAvatarProps {
  providerName: string;
  width?: number;
  height?: number;
}

/**
 * 渲染提供商头像
 * @param providerName - 提供商名称
 */
export const renderProviderAvatar: FC<RenderProviderAvatarProps> = ({
  providerName,
  width,
  height,
}) => {
  const logo = getProviderIcon(providerName);

  if (logo) {
    return (
      <Image
        src={logo}
        alt={providerName}
        width={width || 40}
        height={height || 40}
        className="rounded-lg"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand text-sm text-white">
      {providerName.charAt(0).toUpperCase()}
    </div>
  );
};
