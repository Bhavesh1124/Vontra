import PomodoroTimer from '@/components/pomodoro-timer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TimerPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex items-center justify-center h-full">
        <Card className="w-full max-w-md bg-card/60 backdrop-blur-lg border border-white/10 shadow-glass">
          <CardHeader>
            <CardTitle className="text-center font-headline">Pomodoro Timer</CardTitle>
          </CardHeader>
          <CardContent>
            <PomodoroTimer />
          </CardContent>
        </Card>
    </div>
  );
}
