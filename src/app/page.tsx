'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, ChevronRight, Flame, Moon } from 'lucide-react';
import { Card } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { getActiveWorkout, startWorkout } from '@/lib/db';

// Fixed Weekly Schedule in Spanish
const WEEKLY_SCHEDULE = [
  { day: 0, name: 'Lunes', focus: 'Descanso', isRest: true },
  { day: 1, name: 'Martes', focus: 'Pierna (Cuádriceps)', isRest: false },
  { day: 2, name: 'Miércoles', focus: 'Espalda y Bíceps', isRest: false },
  { day: 3, name: 'Jueves', focus: 'Pecho, Hombro, Tríceps', isRest: false },
  { day: 4, name: 'Viernes', focus: 'Descanso', isRest: true },
  { day: 5, name: 'Sábado', focus: 'Pierna (Isquios)', isRest: false },
  { day: 6, name: 'Domingo', focus: 'Mix (Espalda, Hombro, Brazos)', isRest: false },
];

function getTodayIndex(): number {
  const jsDay = new Date().getDay(); // 0 = Sunday
  // Convert to 0 = Monday
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function HomePage() {
  const router = useRouter();
  const [todayIndex] = useState(getTodayIndex());
  const [loading, setLoading] = useState(false);

  const handleDayClick = async (dayIndex: number, focus: string, isRest: boolean) => {
    if (isRest) return; // Don't allow entering rest days

    setLoading(true);

    // Create or get today's workout for this day
    const workoutName = `${WEEKLY_SCHEDULE[dayIndex].name}: ${focus}`;
    const workoutId = await startWorkout(workoutName);

    router.push(`/workout/${workoutId}?day=${dayIndex}&focus=${encodeURIComponent(focus)}`);
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">TITAN LOG</h1>
          <p className="text-sm text-[#71717a]">Tu programa semanal</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#FF0000] flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Today's Highlight */}
      {!WEEKLY_SCHEDULE[todayIndex].isRest && (
        <Card
          onClick={() => handleDayClick(
            todayIndex,
            WEEKLY_SCHEDULE[todayIndex].focus,
            WEEKLY_SCHEDULE[todayIndex].isRest
          )}
          active
          className="mb-6 animate-pulse-red"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#FF0000] flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#FF0000] font-bold uppercase tracking-wide">
                  Hoy - {WEEKLY_SCHEDULE[todayIndex].name}
                </p>
                <h2 className="text-lg font-bold text-white">
                  {WEEKLY_SCHEDULE[todayIndex].focus}
                </h2>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#FF0000]" />
          </div>
        </Card>
      )}

      {/* Weekly Schedule */}
      <h2 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3">
        Programa Semanal
      </h2>

      <StaggerContainer>
        <div className="space-y-2">
          {WEEKLY_SCHEDULE.map((schedule, index) => {
            const isToday = index === todayIndex;

            return (
              <StaggerItem key={schedule.day}>
                <Card
                  onClick={!schedule.isRest ? () => handleDayClick(index, schedule.focus, schedule.isRest) : undefined}
                  active={isToday}
                  className={`
                    ${schedule.isRest ? 'opacity-40' : ''}
                    ${!schedule.isRest ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Day Icon */}
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${isToday ? 'bg-[#FF0000]' : schedule.isRest ? 'bg-[#18181b]' : 'bg-[#27272a]'}
                      `}>
                        {schedule.isRest ? (
                          <Moon className={`w-4 h-4 ${isToday ? 'text-white' : 'text-[#3f3f46]'}`} />
                        ) : (
                          <Dumbbell className={`w-4 h-4 ${isToday ? 'text-white' : 'text-[#a1a1aa]'}`} />
                        )}
                      </div>

                      {/* Day Info */}
                      <div>
                        <p className={`
                          font-semibold
                          ${isToday ? 'text-[#FF0000]' : schedule.isRest ? 'text-[#3f3f46]' : 'text-white'}
                        `}>
                          {schedule.name}
                        </p>
                        <p className={`
                          text-sm
                          ${schedule.isRest ? 'text-[#27272a]' : 'text-[#71717a]'}
                        `}>
                          {schedule.focus}
                        </p>
                      </div>
                    </div>

                    {!schedule.isRest && (
                      <ChevronRight className={`w-4 h-4 ${isToday ? 'text-[#FF0000]' : 'text-[#3f3f46]'}`} />
                    )}
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </div>
      </StaggerContainer>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-8 h-8 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
