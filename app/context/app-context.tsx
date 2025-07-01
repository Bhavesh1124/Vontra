'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Interfaces
export interface Task {
  title: string;
  notes: string;
  completed: boolean;
}

export interface Tasks {
  [date: string]: {
    [time: string]: Task;
  };
}

export interface Transaction {
    id: number;
    item: string;
    category: string;
    amount: number;
    date: string;
    type: 'expense' | 'income';
}

export interface Note {
  id: number;
  title: string;
  content: string;
  tag: string;
}

// App State Interface
interface AppState {
  pomodoroSessionsCompleted: number;
  setPomodoroSessionsCompleted: React.Dispatch<React.SetStateAction<number>>;
  pomodoroGoal: number;
  setPomodoroGoal: React.Dispatch<React.SetStateAction<number>>;
  focusDuration: number;
  setFocusDuration: React.Dispatch<React.SetStateAction<number>>;
  breakDuration: number;
  setBreakDuration: React.Dispatch<React.SetStateAction<number>>;
  tasks: Tasks;
  setTasks: React.Dispatch<React.SetStateAction<Tasks>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (transaction: Transaction) => void;
  monthlyBudget: number;
  setMonthlyBudget: React.Dispatch<React.SetStateAction<number>>;
  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: number) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

// Custom hook for localStorage to make state sticky
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
        const stickyValue = window.localStorage.getItem(key);
        if (stickyValue !== null) {
          setValue(JSON.parse(stickyValue));
        }
    } catch (e) {
        console.error(`Could not load state for ${key} from localStorage`, e);
    }
    setIsHydrated(true);
  }, [key]);

  useEffect(() => {
    if (isHydrated) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Could not save state for ${key} to localStorage`, e);
        }
    }
  }, [key, value, isHydrated]);

  return [value, setValue];
}

export function AppWrapper({ children }: { children: ReactNode }) {
  const [pomodoroSessionsCompleted, setPomodoroSessionsCompleted] = useStickyState(0, 'pastel-pomodoro-sessions');
  const [pomodoroGoal, setPomodoroGoal] = useStickyState(8, 'pastel-pomodoro-goal');
  const [focusDuration, setFocusDuration] = useStickyState(25, 'pastel-focus-duration');
  const [breakDuration, setBreakDuration] = useStickyState(5, 'pastel-break-duration');
  const todayKey = new Date().toISOString().split('T')[0];
  const [tasks, setTasks] = useStickyState<Tasks>({
    [todayKey]: {
      '09:00': { title: 'Team Standup', notes: 'Daily sync meeting', completed: false },
      '14:00': { title: 'Focus Work', notes: 'Work on feature X', completed: true },
    }
  }, 'pastel-tasks');
  const [transactions, setTransactions] = useStickyState<Transaction[]>([], 'pastel-transactions');
  const [monthlyBudget, setMonthlyBudget] = useStickyState(1000, 'pastel-monthly-budget');
  const [notes, setNotes] = useStickyState<Note[]>([
     { id: 1, title: 'Biology Revision', content: 'Spaced repetition is key for remembering all the complex biological terms and processes. Review flashcards daily.', tag: '#biology' },
     { id: 2, title: 'Meeting Prep', content: 'Prepare slides for the project update meeting. Include progress charts and next steps.', tag: '#meeting' },
     { id: 3, title: 'Shopping List', content: 'Milk, bread, eggs, and of course, more pastel highlighters.', tag: '#personal' },
     { id: 4, title: 'Physics Formulas', content: 'E=mc^2, F=ma, and all the others for the upcoming exam.', tag: '#physics' },
  ], 'pastel-notes');
  
  const { toast } = useToast();

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => {
        const updatedTransactions = [transaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        if (transaction.type === 'expense' && monthlyBudget > 0) {
          const totalSpending = updatedTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          const spendingPercentage = totalSpending / monthlyBudget;
    
          if (spendingPercentage > 1) {
            toast({
              variant: "destructive",
              title: "Budget Alert",
              description: "You have exceeded your monthly budget.",
            })
          } else if (spendingPercentage >= 0.9) {
             toast({
              variant: "destructive",
              title: "Budget Alert",
              description: `You have spent 90% of your budget.`,
            })
          }
        }
        return updatedTransactions;
    });
  }, [monthlyBudget, toast, setTransactions]);

  const addNote = (note: Omit<Note, 'id'>) => {
    const newNote = { ...note, id: Date.now() };
    setNotes(prev => [newNote, ...prev]);
    toast({ title: 'Note added successfully!' });
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(note => note.id === updatedNote.id ? updatedNote : note));
    toast({ title: 'Note updated successfully!' });
  };

  const deleteNote = (id: number) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast({ title: 'Note deleted.', variant: "destructive" });
  };


  const state: AppState = {
    pomodoroSessionsCompleted,
    setPomodoroSessionsCompleted,
    pomodoroGoal,
    setPomodoroGoal,
    focusDuration,
    setFocusDuration,
    breakDuration,
    setBreakDuration,
    tasks,
    setTasks,
    transactions,
    setTransactions,
    addTransaction,
    monthlyBudget,
    setMonthlyBudget,
    notes,
    addNote,
    updateNote,
    deleteNote,
  };

  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppWrapper');
  }
  return context;
}
