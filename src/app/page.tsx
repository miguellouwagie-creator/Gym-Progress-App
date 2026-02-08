'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, ChevronRight, Flame, Moon, Plus } from 'lucide-react';
import { Card } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { getOrResumeWorkout } from '@/lib/db';

// He eliminado "isRest" como bloqueo. Ahora es solo visual.
const WEEKLY_SCHEDULE = [
  { day: 0, name: 'Lunes', focus: 'Descanso / Ajustar', isVisualRest: true },
  { day: 1, name: 'Martes', focus: 'Pierna (Cuádriceps)', isVisualRest: false },
  { day: 2, name: 'Miércoles', focus: 'Espalda y Bíceps', isVisualRest: false },
  { day: 3, name: 'Jueves', focus: 'Pecho, Hombro, Tríceps', isVisualRest: false },
  { day: 4, name: 'Viernes', focus: 'Descanso / Ajustar', isVisualRest: true },
  { day: 5, name: 'Sábado', focus: 'Pierna (Isquios)', isVisualRest: false },
  { day: 6, name: 'Domingo', focus: 'Mix (Espalda, Hombro, Brazos)', isVisualRest: false },
];

function getTodayIndex(): number {
  const jsDay = new Date().getDay(); // 0 = Domingo en JS
  // Convertimos para que 0 sea Lunes
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function HomePage() {
  const router = useRouter();
  const [todayIndex] = useState(getTodayIndex());
  const [loading, setLoading] = useState(false);

  const handleDayClick = async (dayIndex: number, focus: string) => {
    setLoading(true);

    // Resume existing uncompleted workout for today, or create new one
    const workoutName = `${WEEKLY_SCHEDULE[dayIndex].name}: ${focus}`;
    const workoutId = await getOrResumeWorkout(dayIndex, workoutName);

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

      {/* Tarjeta de HOY (Siempre visible y activa) */}
      <Card
        onClick={() => handleDayClick(
          todayIndex,
          WEEKLY_SCHEDULE[todayIndex].focus
        )}
        active
        className="mb-6 animate-pulse-red border-l-4 border-l-[#FF0000]"
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
          <div className="bg-[#FF0000]/20 p-2 rounded-full">
            <Plus className="w-5 h-5 text-[#FF0000]" />
          </div>
        </div>
      </Card>

      {/* Lista Semanal Completa */}
      <h2 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3">
        Configurar / Entrenar
      </h2>

      <StaggerContainer>
        <div className="space-y-2">
          {WEEKLY_SCHEDULE.map((schedule, index) => {
            const isToday = index === todayIndex;

            return (
              <StaggerItem key={schedule.day}>
                <Card
                  // AHORA SÍ: El click funciona siempre, incluso en descanso
                  onClick={() => handleDayClick(index, schedule.focus)}
                  active={isToday}
                  className={`
                    cursor-pointer hover:border-[#FF0000]/50 transition-colors
                    ${schedule.isVisualRest ? 'opacity-60 border-dashed' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Icono del día */}
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${isToday ? 'bg-[#FF0000]' : schedule.isVisualRest ? 'bg-[#18181b] border border-[#27272a]' : 'bg-[#27272a]'}
                      `}>
                        {schedule.isVisualRest ? (
                          <Moon className={`w-4 h-4 ${isToday ? 'text-white' : 'text-[#3f3f46]'}`} />
                        ) : (
                          <Dumbbell className={`w-4 h-4 ${isToday ? 'text-white' : 'text-[#a1a1aa]'}`} />
                        )}
                      </div>

                      {/* Información */}
                      <div>
                        <p className={`
                          font-semibold
                          ${isToday ? 'text-[#FF0000]' : schedule.isVisualRest ? 'text-[#71717a]' : 'text-white'}
                        `}>
                          {schedule.name}
                        </p>
                        <p className={`
                          text-sm
                          ${schedule.isVisualRest ? 'text-[#3f3f46]' : 'text-[#71717a]'}
                        `}>
                          {schedule.focus}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isToday ? 'text-[#FF0000]' : 'text-[#3f3f46]'}`} />
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </div>
      </StaggerContainer>

      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#FF0000] font-bold animate-pulse">CARGANDO SESIÓN...</p>
          </div>
        </div>
      )}
    </div>
  );
}
