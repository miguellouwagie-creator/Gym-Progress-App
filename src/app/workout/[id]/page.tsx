'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Check, Trash2, History, Pencil, X } from 'lucide-react';
import { Button, Card, WeightStepper, RepsStepper } from '@/components/ui';
import {
    db,
    searchExercises,
    logSet,
    getSetsForWorkout,
    getPreviousSetsForExercise,
    finishWorkout,
    updateSet,
    deleteSet,
    getExercisesForDay,
    type ExerciseSet,
    type Exercise,
    type Workout,
} from '@/lib/db';

interface SetRow {
    id?: number;
    weight: number;
    reps: number;
    isNew?: boolean;
    isDirty?: boolean;
}

interface ExerciseBlock {
    name: string;
    sets: SetRow[];
    previousSets: { weight: number; reps: number }[];
    isEditing?: boolean;
    originalName?: string;
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

    const dayIndex = parseInt(searchParams.get('day') || '0');
    const focus = searchParams.get('focus') || 'Entrenamiento';

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [exercises, setExercises] = useState<ExerciseBlock[]>([]);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [suggestions, setSuggestions] = useState<Exercise[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function load() {
            const w = await db.workouts.get(workoutId);
            if (!w) {
                router.push('/');
                return;
            }
            setWorkout(w);

            const sets = await getSetsForWorkout(workoutId);
            const grouped = new Map<string, ExerciseSet[]>();

            sets.forEach(set => {
                const group = grouped.get(set.exerciseName) || [];
                group.push(set);
                grouped.set(set.exerciseName, group);
            });

            const blocks: ExerciseBlock[] = [];
            for (const [name, exerciseSets] of grouped) {
                const previous = await getPreviousSetsForExercise(name, workoutId);
                blocks.push({
                    name,
                    originalName: name,
                    sets: exerciseSets.map(s => ({
                        id: s.id,
                        weight: s.weight,
                        reps: s.reps,
                        isNew: false,
                        isDirty: false,
                    })),
                    previousSets: previous.map(s => ({ weight: s.weight, reps: s.reps })),
                    isEditing: false,
                });
            }

            if (blocks.length === 0) {
                const dayExercises = await getExercisesForDay(dayIndex);
                for (const ex of dayExercises.slice(0, 5)) {
                    const previous = await getPreviousSetsForExercise(ex.name, workoutId);
                    if (previous.length > 0) {
                        blocks.push({
                            name: ex.name,
                            originalName: ex.name,
                            sets: [{ weight: previous[0].weight, reps: previous[0].reps, isNew: true, isDirty: false }],
                            previousSets: previous.map(s => ({ weight: s.weight, reps: s.reps })),
                            isEditing: false,
                        });
                    }
                }
            }

            setExercises(blocks);
            setLoading(false);
        }
        load();
    }, [workoutId, router, dayIndex]);

    useEffect(() => {
        async function search() {
            if (newExerciseName.length > 0) {
                const results = await searchExercises(newExerciseName, 5);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } else {
                const dayExercises = await getExercisesForDay(dayIndex);
                setSuggestions(dayExercises.slice(0, 5));
                setShowSuggestions(false);
            }
        }
        search();
    }, [newExerciseName, dayIndex]);

    const addExercise = async (name: string) => {
        if (!name.trim()) return;

        if (exercises.some(e => e.name.toLowerCase() === name.toLowerCase())) {
            setNewExerciseName('');
            setShowSuggestions(false);
            return;
        }

        const previous = await getPreviousSetsForExercise(name, workoutId);
        const defaultWeight = previous[0]?.weight || 20;
        const defaultReps = previous[0]?.reps || 8;

        setExercises(prev => [...prev, {
            name: name.trim(),
            originalName: name.trim(),
            sets: [{ weight: defaultWeight, reps: defaultReps, isNew: true, isDirty: false }],
            previousSets: previous.map(s => ({ weight: s.weight, reps: s.reps })),
            isEditing: false,
        }]);

        setNewExerciseName('');
        setShowSuggestions(false);
    };

    const addSet = (exerciseIndex: number) => {
        setExercises(prev => prev.map((ex, i) => {
            if (i !== exerciseIndex) return ex;
            const lastSet = ex.sets[ex.sets.length - 1] || { weight: 20, reps: 8 };
            return {
                ...ex,
                sets: [...ex.sets, { weight: lastSet.weight, reps: lastSet.reps, isNew: true, isDirty: false }],
            };
        }));
    };

    const updateSetValue = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
        setExercises(prev => prev.map((ex, i) => {
            if (i !== exerciseIndex) return ex;
            return {
                ...ex,
                sets: ex.sets.map((s, j) =>
                    j === setIndex ? { ...s, [field]: value, isDirty: true } : s
                ),
            };
        }));
    };

    const handleDeleteSet = async (exerciseIndex: number, setIndex: number) => {
        const ex = exercises[exerciseIndex];
        const set = ex.sets[setIndex];

        if (set.id) {
            await deleteSet(set.id);
        }

        setExercises(prev => prev.map((e, i) => {
            if (i !== exerciseIndex) return e;
            const newSets = e.sets.filter((_, j) => j !== setIndex);
            return { ...e, sets: newSets };
        }).filter(e => e.sets.length > 0));
    };

    const handleDeleteExercise = async (exerciseIndex: number) => {
        const ex = exercises[exerciseIndex];

        const deletePromises = ex.sets
            .filter(set => set.id)
            .map(set => deleteSet(set.id!));

        await Promise.all(deletePromises);
        setExercises(prev => prev.filter((_, i) => i !== exerciseIndex));
    };

    const startRenameExercise = (exerciseIndex: number) => {
        setExercises(prev => prev.map((ex, i) =>
            i === exerciseIndex ? { ...ex, isEditing: true } : ex
        ));
    };

    const cancelRenameExercise = (exerciseIndex: number) => {
        setExercises(prev => prev.map((ex, i) =>
            i === exerciseIndex ? { ...ex, isEditing: false, name: ex.originalName || ex.name } : ex
        ));
    };

    const confirmRenameExercise = async (exerciseIndex: number, newName: string) => {
        if (!newName.trim()) return;

        const ex = exercises[exerciseIndex];
        const trimmedName = newName.trim();

        const updatePromises = ex.sets
            .filter(set => set.id)
            .map(set => db.sets.update(set.id!, { exerciseName: trimmedName }));

        await Promise.all(updatePromises);

        setExercises(prev => prev.map((e, i) =>
            i === exerciseIndex ? { ...e, name: trimmedName, originalName: trimmedName, isEditing: false } : e
        ));
    };

    // CRITICAL FIX: Use Promise.all to wait for ALL DB operations
    const handleFinish = async () => {
        setIsSaving(true);

        try {
            const promises: Promise<number | void>[] = [];

            // Loop through ALL blocks and ALL sets
            for (const block of exercises) {
                // Skip empty blocks
                if (block.sets.length === 0) continue;

                for (const set of block.sets) {
                    if (set.id) {
                        // Update existing set
                        promises.push(updateSet(set.id, set.weight, set.reps));
                    } else {
                        // Create new set
                        promises.push(logSet(workoutId, block.name, set.weight, set.reps, dayIndex));
                    }
                }
            }

            // CRITICAL: Wait for ALL DB operations to finish
            await Promise.all(promises);

            // Mark workout as complete
            await finishWorkout(workoutId);

            // ONLY THEN navigate
            router.push('/');
        } catch (error) {
            console.error("Save failed:", error);
            alert("Error guardando. Intenta de nuevo.");
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.push('/')}
                    className="w-10 h-10 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center justify-center"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-white">{focus}</h1>
                    <p className="text-xs text-[#71717a]">{workout?.name}</p>
                </div>
                <Button variant="primary" size="sm" onClick={handleFinish} disabled={isSaving}>
                    {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            Guardar
                        </>
                    )}
                </Button>
            </div>

            {/* Add Exercise Input */}
            <div className="relative mb-6">
                <input
                    ref={inputRef}
                    type="text"
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') addExercise(newExerciseName);
                    }}
                    placeholder="Añadir ejercicio (ej: Sentadillas)"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-4 py-3 text-white placeholder:text-[#3f3f46] focus:border-[#FF0000] transition-colors"
                />

                {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#09090b] border border-[#27272a] rounded-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                        {suggestions.map((ex) => (
                            <button
                                key={ex.id}
                                onClick={() => addExercise(ex.name)}
                                className="w-full px-4 py-3 text-left text-white hover:bg-[#18181b] transition-colors border-b border-[#27272a] last:border-0 flex items-center gap-2"
                            >
                                <History className="w-3 h-3 text-[#71717a]" />
                                {ex.name}
                            </button>
                        ))}
                        {newExerciseName && !suggestions.some(s => s.name.toLowerCase() === newExerciseName.toLowerCase()) && (
                            <button
                                onClick={() => addExercise(newExerciseName)}
                                className="w-full px-4 py-3 text-left text-[#FF0000] hover:bg-[#18181b] transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Crear "{newExerciseName}"
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Exercise Blocks */}
            <div className="space-y-4">
                {exercises.map((exercise, exerciseIndex) => (
                    <Card key={`${exercise.name}-${exerciseIndex}`}>
                        {/* Exercise Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 flex-1">
                                {exercise.isEditing ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="text"
                                            value={exercise.name}
                                            onChange={(e) => {
                                                setExercises(prev => prev.map((ex, i) =>
                                                    i === exerciseIndex ? { ...ex, name: e.target.value } : ex
                                                ));
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') confirmRenameExercise(exerciseIndex, exercise.name);
                                                if (e.key === 'Escape') cancelRenameExercise(exerciseIndex);
                                            }}
                                            autoFocus
                                            className="flex-1 bg-[#18181b] border border-[#FF0000] rounded px-2 py-1 text-white font-bold focus:outline-none"
                                        />
                                        <button
                                            onClick={() => confirmRenameExercise(exerciseIndex, exercise.name)}
                                            className="w-8 h-8 rounded flex items-center justify-center text-[#22c55e] hover:bg-[#22c55e]/10"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => cancelRenameExercise(exerciseIndex)}
                                            className="w-8 h-8 rounded flex items-center justify-center text-[#71717a] hover:bg-[#71717a]/10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-white">{exercise.name}</h3>
                                        <button
                                            onClick={() => startRenameExercise(exerciseIndex)}
                                            className="w-6 h-6 rounded flex items-center justify-center text-[#71717a] hover:text-white hover:bg-[#27272a]"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => addSet(exerciseIndex)}
                                    className="text-xs text-[#FF0000] font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-[#FF0000]/10"
                                >
                                    <Plus className="w-3 h-3" />
                                    Set
                                </button>
                                <button
                                    onClick={() => handleDeleteExercise(exerciseIndex)}
                                    className="w-8 h-8 rounded flex items-center justify-center text-[#ef4444] hover:bg-[#ef4444]/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Previous Stats */}
                        {exercise.previousSets.length > 0 && (
                            <p className="text-xs text-[#DC2626] mb-3 flex items-center gap-1">
                                <History className="w-3 h-3" />
                                Anterior: {exercise.previousSets.map(s => `${s.weight}kg × ${s.reps}`).join(' | ')}
                            </p>
                        )}

                        {/* Sets */}
                        <div className="space-y-2">
                            {exercise.sets.map((set, setIndex) => (
                                <div
                                    key={setIndex}
                                    className={`
                    flex items-center gap-2 p-2 rounded-lg bg-[#18181b]
                    ${set.isDirty ? 'border border-[#FF0000]/30' : ''}
                  `}
                                >
                                    <span className="w-6 text-center text-xs text-[#71717a] font-mono">
                                        {setIndex + 1}
                                    </span>

                                    <div className="flex-1">
                                        <WeightStepper
                                            value={set.weight}
                                            onChange={(v) => updateSetValue(exerciseIndex, setIndex, 'weight', v)}
                                        />
                                    </div>

                                    <span className="text-[#3f3f46] text-lg">×</span>

                                    <div className="flex-1">
                                        <RepsStepper
                                            value={set.reps}
                                            onChange={(v) => updateSetValue(exerciseIndex, setIndex, 'reps', v)}
                                        />
                                    </div>

                                    <button
                                        onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                                        className="w-8 h-8 rounded flex items-center justify-center text-[#ef4444] hover:bg-[#ef4444]/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {exercises.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-[#3f3f46]">Escribe un ejercicio arriba para comenzar</p>
                </div>
            )}

            {/* Saving Overlay */}
            {isSaving && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[#FF0000] font-bold animate-pulse">GUARDANDO...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
