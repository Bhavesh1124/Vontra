'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Plus } from 'lucide-react';
import { useAppContext, type Task } from '@/context/app-context';

const hourlySlots = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 6;
  return `${String(hour).padStart(2, '0')}:00`;
}); // 6 AM to 8 PM

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { tasks, setTasks } = useAppContext();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [currentTask, setCurrentTask] = useState<Task>({ title: '', notes: '', completed: false });

  const handleSlotClick = (time: string) => {
    if (!date) return;
    const dateKey = date.toISOString().split('T')[0];
    const existingTask = tasks[dateKey]?.[time] || { title: '', notes: '', completed: false };
    
    setSelectedSlot({ date, time });
    setCurrentTask(existingTask);
    setIsDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!selectedSlot) return;
    const { date, time } = selectedSlot;
    const dateKey = date.toISOString().split('T')[0];
    
    setTasks(prevTasks => {
      const dayTasks = prevTasks[dateKey] || {};
      const updatedDayTasks = {
        ...dayTasks,
        [time]: currentTask,
      };

      if (!currentTask.title && !currentTask.notes) {
        delete updatedDayTasks[time];
      }

      const newTasks = { ...prevTasks };

      if (Object.keys(updatedDayTasks).length > 0) {
        newTasks[dateKey] = updatedDayTasks;
      } else {
        delete newTasks[dateKey];
      }

      return newTasks;
    });

    setIsDialogOpen(false);
    setSelectedSlot(null);
    setCurrentTask({ title: '', notes: '', completed: false });
  };
  
  const handleToggleComplete = (dateKey: string, time: string) => {
    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      if (newTasks[dateKey] && newTasks[dateKey][time]) {
        newTasks[dateKey] = {
          ...newTasks[dateKey],
          [time]: {
            ...newTasks[dateKey][time],
            completed: !newTasks[dateKey][time].completed,
          },
        };
      }
      return newTasks;
    });
  };

  const selectedDateKey = date ? date.toISOString().split('T')[0] : '';
  const tasksForSelectedDate = tasks[selectedDateKey] || {};

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline mb-8">
          Calendar & Schedule
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-card/70 backdrop-blur-lg border border-white/10 shadow-glass">
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="p-4"
                  classNames={{
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                    day_today: "bg-accent text-accent-foreground",
                  }}
                />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="bg-card/70 backdrop-blur-lg border border-white/10 shadow-glass">
              <CardHeader>
                <CardTitle className="font-headline">
                  {date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                  {hourlySlots.map((time) => {
                    const task = tasksForSelectedDate[time];
                    return (
                      <div key={time} className="flex items-stretch border-t border-dashed border-border/50 pt-4">
                        <span className="w-20 text-sm text-muted-foreground pt-2">{time}</span>
                        <div 
                          onClick={() => handleSlotClick(time)}
                          className={cn(
                            "flex-1 min-h-[4rem] rounded-md transition-all duration-300 flex items-center justify-between cursor-pointer",
                            task ? "bg-muted/50" : "bg-muted/20 hover:bg-muted/40",
                            task?.completed && "bg-secondary/40 opacity-60"
                          )}
                        >
                          <div className="flex-1 p-3 h-full flex flex-col justify-center">
                            {task ? (
                              <>
                                <p className={cn("font-semibold text-sm text-foreground", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{task.notes}</p>
                              </>
                            ) : (
                               <span className="text-sm text-muted-foreground/80 flex items-center gap-2"><Plus className="h-4 w-4" /> Add task</span>
                            )}
                          </div>
                          {task && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="mr-2 flex-shrink-0 rounded-full" 
                                onClick={(e) => { e.stopPropagation(); handleToggleComplete(selectedDateKey, time); }}
                            >
                                {task.completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                                <span className="sr-only">Mark as complete</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{currentTask.title ? 'Edit Task' : 'Add Task'}</DialogTitle>
            <DialogDescription>
              {selectedSlot && `For ${new Date(selectedSlot.date).toLocaleDateString()} at ${selectedSlot.time}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={currentTask.title}
                onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                className="col-span-3"
                placeholder="Task title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={currentTask.notes}
                onChange={(e) => setCurrentTask({ ...currentTask, notes: e.target.value })}
                className="col-span-3"
                placeholder="Add some notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveTask}>Save Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
