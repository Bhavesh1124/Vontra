'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsLeft, ChevronsRight, Sparkles } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DesktopSidebarProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export default function DesktopSidebar({ isOpen, setOpen }: DesktopSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col lg:bg-background/60 lg:backdrop-blur-lg lg:border-r lg:border-r-white/10 transition-all duration-300 ease-in-out',
        isOpen ? 'lg:w-64' : 'lg:w-20'
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        {isOpen && (
          <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
            <Sparkles className="h-6 w-6 text-primary" />
            Pastel Productivity
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={() => setOpen(!isOpen)} className="ml-auto">
          {isOpen ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
          <span className="sr-only">{isOpen ? 'Collapse sidebar' : 'Expand sidebar'}</span>
        </Button>
      </div>
      <nav className="mt-4 flex-1">
        <ul className="space-y-2 px-4">
          <TooltipProvider delayDuration={0}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
                        pathname === item.href && 'bg-primary/20 text-primary font-semibold',
                        !isOpen && 'justify-center'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className={cn('truncate', !isOpen && 'sr-only')}>{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  {!isOpen && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              </li>
            ))}
          </TooltipProvider>
        </ul>
      </nav>
    </aside>
  );
}
