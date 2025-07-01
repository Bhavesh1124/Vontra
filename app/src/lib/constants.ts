import {
  Calendar,
  ListTodo,
  Notebook,
  Timer,
  Wallet,
} from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Planner', icon: ListTodo },
  { href: '/planner', label: 'Timer', icon: Timer },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/notes', label: 'Notes', icon: Notebook },
  { href: '/expenses', label: 'Expenses', icon: Wallet },
];
