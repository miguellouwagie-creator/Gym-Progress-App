'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, History, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Card, WeightStepper, RepsStepper } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import {
    getRoutineForDay,
    getLastSetForExercise,
    logSet,
    finishWorkout,
    getSetsForWorkout,
    type ExerciseSet,
} from '@/lib/db';

interface ExerciseData {
    name: string;
    lastSet: ExerciseSet | null;
    currentWeight: number;
    currentReps: number;
    setsLogged: number;
    isExpanded: boolean;
}

export default function WorkoutPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const workoutId = parseInt(id);
    const router = useRouter();
    const searchParams = useSearchParams();

    const routineName = searchParams.get('routine') || 'Workout';
    const dayOfWeek = parseInt(searchParams.get('day') || '0');

    const [exercises, setExercises] = useState<ExerciseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadExercises() {
            const routine = await getRoutineForDay(dayOfWeek);
            if (!routine) {
                router.push('/');
                return;
            }

            // Get previously logged sets for this workout
            const existingSets = await getSetsForWorkout(workoutId);

            // Load last session data for each exercise
            const exerciseData: ExerciseData[] = await Promise.all(
                routine.exercises.map(async (name) => {
                    const lastSet = await getLastSetForExercise(name);
                    const setsForExercise = existingSets.filter(s => s.exerciseName === name);

                    return {
                        name,
                        lastSet,
                        currentWeight: lastSet?.weight || 20,
                        currentReps: lastSet?.reps || 8,
                        setsLogged: setsForExercise.length,
                        isExpanded: false,
                    };
                })
            );

            // Expand first exercise by default
            if (exerciseData.length > 0) {
                exerciseData[0].isExpanded = true;
            }

            setExercises(exerciseData);
            setLoading(false);
        }

        loadExercises();
    }, [dayOfWeek, router, workoutId]);

    const toggleExpand = (index: number) => {
        setExercises(prev => prev.map((ex, i) => ({
            ...ex,
            isExpanded: i === index ? !ex.isExpanded : false,
        })));
    };

    const updateWeight = (index: number, value: number) => {
        setExercises(prev => prev.map((ex, i) =>
            i === index ? { ...ex, currentWeight: value } : ex
        ));
    };

    const updateReps = (index: number, value: number) => {
        setExercises(prev => prev.map((ex, i) =>
            i === index ? { ...ex, currentReps: value } : ex
        ));
    };

    const handleLogSet = async (index: number) => {
        setSaving(true);
        const exercise = exercises[index];

        await logSet(
            workoutId,
            exercise.name,
            exercise.currentWeight,
            exercise.currentReps,
            false
        );

        setExercises(prev => prev.map((ex, i) =>
            i === index ? { ...ex, setsLogged: ex.setsLogged + 1 } : ex
        ));

        setSaving(false);
    };

    const handleFinishWorkout = async () => {
        await finishWorkout(workoutId);
        router.push('/');
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
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.push('/')}
                    className="w-10 h-10 rounded-xl bg-[#1C1C1E] flex items-center justify-center touch-target"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">{routineName}</h1>
                    <p className="text-sm text-[#8E8E93]">{exercises.length} exercises</p>
                </div>
            </div>

            {/* Exercise List */}
            <StaggerContainer>
                <div className="space-y-3">
                    {exercises.map((exercise, index) => (
                        <StaggerItem key={exercise.name}>
                            <Card className="overflow-hidden">
                                {/* Exercise Header (always visible) */}
                                <button
                                    onClick={() => toggleExpand(index)}
                                    className="w-full flex items-center justify-between touch-target"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#0A84FF]/20 flex items-center justify-center">
                                            <span className="text-sm font-bold text-[#0A84FF]">{index + 1}</span>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-white">{exercise.name}</h3>
                                            {exercise.setsLogged > 0 && (
                                                <p className="text-xs text-[#30D158]">
                                                    {exercise.setsLogged} set{exercise.setsLogged > 1 ? 's' : ''} logged
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {exercise.lastSet && !exercise.isExpanded && (
                                            <span className="text-xs text-[#8E8E93]">
                                                {exercise.lastSet.weight}kg × {exercise.lastSet.reps}
                                            </span>
                                        )}
                                        {exercise.isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-[#636366]" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-[#636366]" />
                                        )}
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {exercise.isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-[#38383A]">
                                        {/* Last Session Info */}
                                        {exercise.lastSet && (
                                            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[#2C2C2E]">
                                                <History className="w-4 h-4 text-[#8E8E93]" />
                                                <span className="text-sm text-[#8E8E93]">Last session:</span>
                                                <span className="text-sm font-semibold text-white">
                                                    {exercise.lastSet.weight}kg × {exercise.lastSet.reps} reps
                                                </span>
                                            </div>
                                        )}

                                        {/* Steppers */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <WeightStepper
                                                value={exercise.currentWeight}
                                                onChange={(v) => updateWeight(index, v)}
                                            />
                                            <RepsStepper
                                                value={exercise.currentReps}
                                                onChange={(v) => updateReps(index, v)}
                                            />
                                        </div>

                                        {/* Log Set Button */}
                                        <Button
                                            variant="accent"
                                            size="lg"
                                            onClick={() => handleLogSet(index)}
                                            disabled={saving}
                                        >
                                            <Check className="w-5 h-5" />
                                            Log Set ({exercise.setsLogged + 1})
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </StaggerItem>
                    ))}
                </div>
            </StaggerContainer>

            {/* Finish Workout */}
            <div className="mt-8">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleFinishWorkout}
                    className="glow-primary"
                >
                    Finish Workout
                </Button>
            </div>
        </div>
    );
}
