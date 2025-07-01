'use client';
import { useMemo, useState, useEffect, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/app-context';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { PlusCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const transactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  item: z.string().min(2, 'Item name must be at least 2 characters.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  category: z.string().min(1, 'Please select a category.'),
});

const expenseCategories = ['Food', 'Transport', 'Study', 'Entertainment', 'Bills', 'Other'];
const incomeCategories = ['Salary', 'Gift', 'Investment', 'Other'];

function AddTransactionForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { addTransaction } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      item: '',
      amount: '' as any,
      category: '',
    },
  });

  const transactionType = form.watch('type');
  
  useEffect(() => {
    form.setValue('category', '');
  }, [transactionType, form]);

  function onSubmit(values: z.infer<typeof transactionSchema>) {
    const newTransaction = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...values,
    };
    addTransaction(newTransaction);
    toast({
      title: `${values.type === 'expense' ? 'Expense' : 'Income'} Added`,
      description: `${values.item}: ₹${values.amount.toFixed(2)}`,
    });
    setOpen(false);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Transaction Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="expense" id="expense" />
                    </FormControl>
                    <FormLabel htmlFor="expense" className="font-normal">Expense</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="income" id="income" />
                    </FormControl>
                    <FormLabel htmlFor="income" className="font-normal">Income</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="item"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item / Source</FormLabel>
              <FormControl>
                <Input placeholder={transactionType === 'expense' ? 'e.g., Coffee' : 'e.g., Monthly Salary'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" step="0.01" {...field} value={field.value ?? ''}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(transactionType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Add Transaction</Button>
      </form>
    </Form>
  );
}

const StatCard = ({ title, value, icon, description }: { title: string, value: ReactNode, icon: ReactNode, description: ReactNode }) => (
    <Card className="bg-card/70 backdrop-blur-lg border border-white/10 shadow-glass">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
)

const chartConfig = {
  amount: { label: 'Amount' },
  'Food': { label: 'Food', color: 'hsl(var(--chart-1))' },
  'Transport': { label: 'Transport', color: 'hsl(var(--chart-2))' },
  'Study': { label: 'Study', color: 'hsl(var(--chart-3))' },
  'Entertainment': { label: 'Entertainment', color: 'hsl(var(--chart-4))' },
  'Bills': { label: 'Bills', color: 'hsl(var(--chart-5))' },
  'Other': { label: 'Other', color: 'hsl(var(--chart-2))' },
};

export default function ExpensesPage() {
  const { transactions, monthlyBudget, setMonthlyBudget } = useAppContext();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { totalIncome, totalExpenses, remainingBudget } = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const remainingBudget = monthlyBudget - totalExpenses;
    return { totalIncome, totalExpenses, remainingBudget };
  }, [transactions, monthlyBudget]);

  const expenseChartData = useMemo(() => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      fill: chartConfig[category as keyof typeof chartConfig]?.color || 'hsl(var(--chart-5))',
    }));
  }, [transactions]);

  const formatTransactionDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };
  
  const budgetPercentage = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Expense Tracker
          </h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/80 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Add a New Transaction</DialogTitle>
              </DialogHeader>
              <AddTransactionForm setOpen={setIsAddOpen} />
            </DialogContent>
          </Dialog>
        </div>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold font-headline mb-4">Monthly Overview</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                 <Card className="bg-card/70 backdrop-blur-lg border border-white/10 shadow-glass">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                        <div className='relative'>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                            <Input 
                                type="number"
                                value={monthlyBudget}
                                onChange={(e) => setMonthlyBudget(Number(e.target.value) || 0)}
                                className="w-28 h-8 text-right font-bold text-lg pr-3 pl-6"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{remainingBudget.toFixed(2)} Left</div>
                        <p className="text-xs text-muted-foreground">
                            ₹{totalExpenses.toFixed(2)} of ₹{monthlyBudget.toFixed(2)} spent
                        </p>
                        <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                           <div className={cn("h-2.5 rounded-full", budgetPercentage > 90 ? "bg-destructive" : "bg-primary")} style={{ width: `${Math.min(budgetPercentage, 100)}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
                <StatCard 
                    title="Total Income"
                    value={<span className="text-green-500">+₹{totalIncome.toFixed(2)}</span>}
                    description="This month"
                    icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                />
                 <StatCard 
                    title="Total Expenses"
                    value={<span className="text-red-500">-₹{totalExpenses.toFixed(2)}</span>}
                    description="This month"
                    icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
                />
            </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Card className="bg-card/70 backdrop-blur-lg border border-white/10 shadow-glass">
              <CardHeader>
                <CardTitle>Spending Summary</CardTitle>
                <CardDescription>Your expenses by category.</CardDescription>
              </CardHeader>
              <CardContent>
              {expenseChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
                  <PieChart>
                    <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={expenseChartData} dataKey="amount" nameKey="category" innerRadius={60} outerRadius={120}>
                      {expenseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  No expense data to display.
                </div>
              )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
              <Card className="bg-card/70 backdrop-blur-lg border border-white/10 shadow-glass h-full">
                  <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>Your last 10 transactions.</CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[400px] overflow-y-auto">
                      <Table>
                          <TableHeader>
                              <TableRow className="hover:bg-transparent">
                                  <TableHead>Item</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.length > 0 ? (
                              transactions.slice(0, 10).map(tx => (
                                  <TableRow key={tx.id} className="hover:bg-muted/50">
                                      <TableCell className="font-medium">
                                          <div>{tx.item}</div>
                                          <div className="text-xs text-muted-foreground">{tx.category}</div>
                                      </TableCell>
                                      <TableCell>{formatTransactionDate(tx.date)}</TableCell>
                                      <TableCell className={cn(
                                          "text-right font-bold",
                                           tx.type === 'expense' ? 'text-red-500' : 'text-green-500'
                                       )}>
                                        {tx.type === 'expense' ? '-' : '+'}₹{tx.amount.toFixed(2)}
                                      </TableCell>
                                  </TableRow>
                              ))
                             ) : (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        No transactions yet.
                                    </TableCell>
                                </TableRow>
                             )}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </>
  );
}
