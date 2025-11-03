/**
 * 模型选择 - 树状
 * 供应商-》模型
 *
 *
 */
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useEnabledProvidersSWR } from "@/hooks/useProvidersSWR";

export const ToolBar = () => {
  const { providers } = useEnabledProvidersSWR();
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>模型</MenubarTrigger>
        <MenubarContent>
          {providers.map((provider) => (
            <MenubarSub key={provider.id}>
              <MenubarSubTrigger>{provider.name}</MenubarSubTrigger>
              <MenubarSubContent>
                {provider.modelList.map((model) => (
                  <MenubarItem key={model.id}>{model.name}</MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>
          ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
