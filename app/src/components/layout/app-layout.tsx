'use client';

import React from 'react';
import DesktopSidebar from './desktop-sidebar';
import BottomNav from './bottom-nav';
import Header from './header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DesktopSidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out lg:ml-0 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        } pb-16 lg:pb-0`}
      >
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
