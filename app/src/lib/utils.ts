import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getTagColorClasses = (tag: string) => {
  let hash = 0;
  if (tag.length === 0) return 'bg-muted text-muted-foreground';
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  const colorVariants = [
    'bg-primary/20 text-primary-foreground hover:bg-primary/30',
    'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30',
    'bg-accent/20 text-accent-foreground hover:bg-accent/30',
    'bg-chart-4/20 text-pink-600 hover:bg-chart-4/30',
    'bg-chart-5/20 text-amber-600 hover:bg-chart-5/30',
  ];

  const index = Math.abs(hash % colorVariants.length);
  return colorVariants[index];
};
