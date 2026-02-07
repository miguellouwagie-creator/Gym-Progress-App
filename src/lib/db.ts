import Dexie, { type EntityTable } from 'dexie';

// ============================================================================
// TYPES
// ============================================================================

export interface Workout {
  id?: number;
  date: string; // ISO date string (YYYY-MM-DD)
  name: string; // User-defined name
  startedAt: string;
  completedAt?: string;
}

export interface ExerciseSet {
  id?: number;
  workoutId: number;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  timestamp: string;
}

export interface Exercise {
  id?: number;
  name: string; // User-created, lowercase for matching
  createdAt: string;
  lastUsedAt: string;
}

// ============================================================================
// DATABASE - TABULA RASA (No Pre-seeded Data)
// ============================================================================

class TitanLogDB extends Dexie {
  workouts!: EntityTable<Workout, 'id'>;
  sets!: EntityTable<ExerciseSet, 'id'>;
  exercises!: EntityTable<Exercise, 'id'>;

  constructor() {
    super('TitanLogDB');

    this.version(2).stores({
      workouts: '++id, date, name, startedAt',
      sets: '++id, workoutId, exerciseName, timestamp',
      exercises: '++id, name, lastUsedAt',
    });
  }
}

export const db = new TitanLogDB();

// ============================================================================
// EXERCISE HELPERS - ON-THE-FLY CREATION
// ============================================================================

/**
 * Get or create an exercise by name.
 * If it doesn't exist, creates it instantly.
 */
export async function getOrCreateExercise(name: string): Promise<Exercise> {
  const normalized = name.trim();
  if (!normalized) throw new Error('Exercise name required');

  // Search case-insensitive
  const existing = await db.exercises
    .filter(e => e.name.toLowerCase() === normalized.toLowerCase())
    .first();

  if (existing) {
    // Update last used
    await db.exercises.update(existing.id!, { lastUsedAt: new Date().toISOString() });
    return existing;
  }

  // Create new exercise on-the-fly
  const id = await db.exercises.add({
    name: normalized,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  });

  return { id: id as number, name: normalized, createdAt: new Date().toISOString(), lastUsedAt: new Date().toISOString() };
}

/**
 * Search exercises for autocomplete.
 * Returns most recently used first.
 */
export async function searchExercises(query: string, limit: number = 10): Promise<Exercise[]> {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    // Return most recent exercises
    return db.exercises.orderBy('lastUsedAt').reverse().limit(limit).toArray();
  }

  const all = await db.exercises.toArray();
  return all
    .filter(e => e.name.toLowerCase().includes(normalized))
    .sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime())
    .slice(0, limit);
}

// ============================================================================
// WORKOUT HELPERS
// ============================================================================

export async function startWorkout(name: string = 'Workout'): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  const id = await db.workouts.add({
    date: today,
    name,
    startedAt: new Date().toISOString(),
  });

  return id as number;
}

export async function finishWorkout(workoutId: number): Promise<void> {
  await db.workouts.update(workoutId, {
    completedAt: new Date().toISOString(),
  });
}

export async function getActiveWorkout(): Promise<Workout | null> {
  // Find workout started today that isn't completed
  const today = new Date().toISOString().split('T')[0];
  const workouts = await db.workouts
    .where('date')
    .equals(today)
    .filter(w => !w.completedAt)
    .toArray();

  return workouts[0] || null;
}

export async function getWorkoutHistory(limit: number = 50): Promise<Workout[]> {
  return db.workouts
    .orderBy('startedAt')
    .reverse()
    .limit(limit)
    .toArray();
}

// ============================================================================
// SET HELPERS
// ============================================================================

export async function logSet(
  workoutId: number,
  exerciseName: string,
  weight: number,
  reps: number
): Promise<number> {
  // Ensure exercise exists
  await getOrCreateExercise(exerciseName);

  // Count existing sets for this exercise in this workout
  const existingSets = await db.sets
    .where('workoutId')
    .equals(workoutId)
    .filter(s => s.exerciseName.toLowerCase() === exerciseName.toLowerCase())
    .count();

  const id = await db.sets.add({
    workoutId,
    exerciseName,
    setNumber: existingSets + 1,
    weight,
    reps,
    timestamp: new Date().toISOString(),
  });

  return id as number;
}

export async function updateSet(
  setId: number,
  weight: number,
  reps: number
): Promise<void> {
  await db.sets.update(setId, { weight, reps });
}

export async function deleteSet(setId: number): Promise<void> {
  await db.sets.delete(setId);
}

export async function getSetsForWorkout(workoutId: number): Promise<ExerciseSet[]> {
  return db.sets
    .where('workoutId')
    .equals(workoutId)
    .sortBy('timestamp');
}

/**
 * Get the previous session's sets for a specific exercise.
 * Used to show "Previous: 100kg x 8" in red.
 */
export async function getPreviousSetsForExercise(
  exerciseName: string,
  excludeWorkoutId?: number
): Promise<ExerciseSet[]> {
  const normalized = exerciseName.toLowerCase();

  // Get all sets for this exercise, excluding current workout
  const allSets = await db.sets
    .filter(s => s.exerciseName.toLowerCase() === normalized)
    .toArray();

  // Filter out current workout and group by workoutId
  const previousSets = allSets.filter(s => s.workoutId !== excludeWorkoutId);

  if (previousSets.length === 0) return [];

  // Find the most recent workout that had this exercise
  const sortedByTime = previousSets.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const lastWorkoutId = sortedByTime[0]?.workoutId;
  if (!lastWorkoutId) return [];

  // Return all sets from that workout for this exercise
  return previousSets
    .filter(s => s.workoutId === lastWorkoutId)
    .sort((a, b) => a.setNumber - b.setNumber);
}

// ============================================================================
// STATS
// ============================================================================

export async function getTotalWorkouts(): Promise<number> {
  return db.workouts.count();
}

export async function getTotalSets(): Promise<number> {
  return db.sets.count();
}

export async function getExerciseCount(): Promise<number> {
  return db.exercises.count();
}
