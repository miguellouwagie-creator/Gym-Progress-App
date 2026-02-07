'use client';

import { useEffect, useState } from 'react';
import { Calendar, ChevronRight, Dumbbell } from 'lucide-react';
import { Card } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { getWorkoutHistory, getSetsForWorkout, type Workout } from '@/lib/db';

interface WorkoutLog extends Workout {
    totalSets: number;
}

export default function LogsPage() {
    const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadLogs() {
            const history = await getWorkoutHistory(30);

            const logsWithSets = await Promise.all(
                history.map(async (workout) => {
                    const sets = await getSetsForWorkout(workout.id!);
                    return {
                        ...workout,
                        totalSets: sets.length,
                    };
                })
            );

            setWorkouts(logsWithSets);
            setLoading(false);
        }

        loadLogs();
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-3 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#0A84FF]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Workout Logs</h1>
                    <p className="text-sm text-[#8E8E93]">Your training history</p>
                </div>
            </div>

            {workouts.length === 0 ? (
                <Card className="text-center py-12">
                    <Dumbbell className="w-12 h-12 text-[#636366] mx-auto mb-4" />
                    <p className="text-[#8E8E93]">No workouts logged yet</p>
                    <p className="text-sm text-[#636366] mt-1">Start your first workout from the Home tab</p>
                </Card>
            ) : (
                <StaggerContainer>
                    <div className="space-y-3">
                        {workouts.map((workout) => (
                            <StaggerItem key={workout.id}>
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#2C2C2E] flex items-center justify-center">
                                                <Dumbbell className="w-5 h-5 text-[#0A84FF]" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{workout.routineName}</h3>
                                                <p className="text-sm text-[#8E8E93]">
                                                    {formatDate(workout.date)} · {workout.totalSets} sets
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {workout.completedAt && (
                                                <span className="text-xs text-[#30D158] bg-[#30D158]/10 px-2 py-1 rounded-full">
                                                    Completed
                                                </span>
                                            )}
                                            <ChevronRight className="w-5 h-5 text-[#636366]" />
                                        </div>
                                    </div>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerContainer>
            )}
        </div>
    );
}
