'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const currentNavItem = NAV_ITEMS.find((item) => item.href === pathname);
  const title = currentNavItem ? currentNavItem.label : 'Pastel Productivity';

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-card/80 px-4 shadow-sm backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:hidden">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="-m-2.5 p-2.5 text-foreground lg:hidden">
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex-1 text-lg font-semibold leading-6 text-foreground">{title}</div>
    </header>
  );
}
