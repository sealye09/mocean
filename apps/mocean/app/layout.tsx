"use client";

import ToasterProvider from "@/app/context/ToasterProvider";
import AppSidebar from "@/components/app-sidebar";
import { TitleBar } from "@/components/custom/title-bar";
import { SidebarProvider } from "@/components/ui/sidebar";

import "./globals.css";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="flex h-screen flex-col overflow-hidden bg-primary-light-100 font-bricolage-grotesque">
        <TitleBar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <SidebarProvider>
            <ToasterProvider>
              <AppSidebar />
              <main className="h-full min-h-0 flex-1 overflow-hidden">
                {children}
              </main>
            </ToasterProvider>
          </SidebarProvider>
        </div>
      </body>
    </html>
  );
}
