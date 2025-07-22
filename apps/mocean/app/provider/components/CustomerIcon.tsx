import Image from "next/image";

import { PROVIDER_LOGO_MAP } from "../constant";

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
export const renderProviderAvatar = (providerName: string) => {
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
