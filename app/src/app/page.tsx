'use client';
import { useMemo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Target, Wallet } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { isToday, parseISO } from 'date-fns';

const StatCard = ({ title, value, icon, description }: { title: string, value: ReactNode, icon: ReactNode, description: ReactNode }) => (
    <Card className="bg-card/70 backdrop-blur-lg border border-white/10 shadow-glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
)

export default function HomePage() {
  const { pomodoroSessionsCompleted, pomodoroGoal, tasks, transactions } = useAppContext();

  const todaysTasks = useMemo(() => {
    const todayKey = new Date().toISOString().split('T')[0];
    const tasksForToday = tasks[todayKey] || {};
    const totalTasks = Object.keys(tasksForToday).length;
    const completedTasks = Object.values(tasksForToday).filter(task => task.completed).length;
    return { totalTasks, completedTasks };
  }, [tasks]);

  const expensesToday = useMemo(() => {
    return transactions
      .filter(transaction => transaction.type === 'expense' && isToday(parseISO(transaction.date)))
      .reduce((total, expense) => total + expense.amount, 0);
  }, [transactions]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline mb-8">
        Daily Planner
      </h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold font-headline mb-4">Today's Overview</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard 
            title="Pomodoros Completed"
            value={`${pomodoroSessionsCompleted} of ${pomodoroGoal}`}
            description="Keep up the great work!"
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard 
            title="Tasks Done"
            value={`${todaysTasks.completedTasks} of ${todaysTasks.totalTasks}`}
            description="You're on a roll!"
            icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard 
            title="Expenses Today"
            value={`$${expensesToday.toFixed(2)}`}
            description="On track with your budget."
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      </section>
    </div>
  );
}
