'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, ChevronRight, Flame } from 'lucide-react';
import { Card } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { getRoutineForDay, getDayOfWeek, startWorkout } from '@/lib/db';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DayRoutine {
  dayOfWeek: number;
  dayName: string;
  routineName: string;
  exercises: string[];
  isToday: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [weeklyRoutine, setWeeklyRoutine] = useState<DayRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutine() {
      const today = getDayOfWeek();
      const routines: DayRoutine[] = [];

      for (let i = 0; i < 7; i++) {
        const routine = await getRoutineForDay(i);
        routines.push({
          dayOfWeek: i,
          dayName: DAYS[i],
          routineName: routine?.routineName || 'Rest Day',
          exercises: routine?.exercises || [],
          isToday: i === today,
        });
      }

      setWeeklyRoutine(routines);
      setLoading(false);
    }

    loadRoutine();
  }, []);

  const handleStartWorkout = async (day: DayRoutine) => {
    if (day.routineName === 'Rest Day') return;

    const workoutId = await startWorkout(day.routineName);
    router.push(`/workout/${workoutId}?routine=${encodeURIComponent(day.routineName)}&day=${day.dayOfWeek}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const todayRoutine = weeklyRoutine.find(d => d.isToday);

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#30D158] flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Titan Log</h1>
          <p className="text-sm text-[#8E8E93]">Your weekly schedule</p>
        </div>
      </div>

      {/* Today's Highlight */}
      {todayRoutine && todayRoutine.routineName !== 'Rest Day' && (
        <Card
          glow="primary"
          className="mb-6 animate-pulse-glow"
          onClick={() => handleStartWorkout(todayRoutine)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#0A84FF]" />
              </div>
              <div>
                <p className="text-xs text-[#0A84FF] font-semibold uppercase tracking-wide">
                  Today's Workout
                </p>
                <h2 className="text-xl font-bold text-white">{todayRoutine.routineName}</h2>
                <p className="text-sm text-[#8E8E93]">
                  {todayRoutine.exercises.length} exercises
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-[#0A84FF]" />
          </div>
        </Card>
      )}

      {/* Weekly Schedule */}
      <h3 className="text-sm font-semibold text-[#8E8E93] uppercase tracking-wide mb-3">
        This Week
      </h3>

      <StaggerContainer>
        <div className="space-y-3">
          {weeklyRoutine.map((day) => (
            <StaggerItem key={day.dayOfWeek}>
              <Card
                onClick={day.routineName !== 'Rest Day' ? () => handleStartWorkout(day) : undefined}
                className={`
                  ${day.isToday ? 'ring-1 ring-[#0A84FF]/50' : ''}
                  ${day.routineName === 'Rest Day' ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Day indicator */}
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex flex-col items-center justify-center
                        ${day.isToday ? 'bg-[#0A84FF]' : 'bg-[#2C2C2E]'}
                      `}
                    >
                      <span className={`text-xs font-medium ${day.isToday ? 'text-white/80' : 'text-[#8E8E93]'}`}>
                        {day.dayName.slice(0, 3)}
                      </span>
                    </div>

                    {/* Routine info */}
                    <div>
                      <h4 className="font-semibold text-white">{day.routineName}</h4>
                      <p className="text-sm text-[#8E8E93]">
                        {day.exercises.length > 0
                          ? `${day.exercises.length} exercises`
                          : 'Recovery day'}
                      </p>
                    </div>
                  </div>

                  {day.routineName !== 'Rest Day' && (
                    <ChevronRight className="w-5 h-5 text-[#636366]" />
                  )}
                </div>
              </Card>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>
    </div>
  );
}
