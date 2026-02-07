'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Dumbbell, ChevronRight, Clock } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { startWorkout, getWorkoutHistory, type Workout } from '@/lib/db';

export default function HomePage() {
  const router = useRouter();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const history = await getWorkoutHistory(10);
      setRecentWorkouts(history);
      setLoading(false);
    }
    load();
  }, []);

  const handleStartWorkout = async () => {
    const id = await startWorkout('Workout');
    router.push(`/workout/${id}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">TITAN LOG</h1>
          <p className="text-sm text-[#71717a]">Your notebook. Your rules.</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#FF0000] flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Start Workout CTA */}
      <Card
        onClick={handleStartWorkout}
        active
        className="mb-8 py-8"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
          <div className="text-left">
            <p className="text-lg font-bold text-white">Start Workout</p>
            <p className="text-sm text-[#71717a]">Begin a new session</p>
          </div>
        </div>
      </Card>

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <>
          <h2 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3">
            Recent Sessions
          </h2>
          <StaggerContainer>
            <div className="space-y-2">
              {recentWorkouts.map((workout) => (
                <StaggerItem key={workout.id}>
                  <Card
                    onClick={() => router.push(`/workout/${workout.id}`)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#18181b] flex items-center justify-center">
                        <Dumbbell className="w-4 h-4 text-[#a1a1aa]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{workout.name}</p>
                        <div className="flex items-center gap-1 text-xs text-[#71717a]">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(workout.startedAt)}</span>
                          {workout.completedAt && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e]">
                              Done
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#3f3f46]" />
                  </Card>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </>
      )}

      {/* Empty State */}
      {recentWorkouts.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
          <p className="text-[#71717a]">No workouts yet</p>
          <p className="text-sm text-[#3f3f46]">Tap above to begin your journey</p>
        </div>
      )}
    </div>
  );
}
