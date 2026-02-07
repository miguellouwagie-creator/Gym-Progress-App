import Dexie, { type EntityTable } from 'dexie';

// ============================================================================
// TYPES
// ============================================================================

export interface Workout {
  id?: number;
  date: string; // ISO date string (YYYY-MM-DD)
  routineName: string;
  completedAt?: string; // ISO timestamp when finished
}

export interface ExerciseSet {
  id?: number;
  workoutId: number;
  exerciseName: string;
  weight: number;
  reps: number;
  isDropSet: boolean;
  timestamp: string; // ISO timestamp
}

export interface Exercise {
  id?: number;
  name: string;
  muscleGroup: string;
}

export interface RoutineExercise {
  id?: number;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  routineName: string;
  exerciseName: string;
  order: number;
}

// ============================================================================
// DATABASE
// ============================================================================

class TitanLogDB extends Dexie {
  workouts!: EntityTable<Workout, 'id'>;
  sets!: EntityTable<ExerciseSet, 'id'>;
  exercises!: EntityTable<Exercise, 'id'>;
  routineExercises!: EntityTable<RoutineExercise, 'id'>;

  constructor() {
    super('TitanLogDB');

    this.version(1).stores({
      workouts: '++id, date, routineName',
      sets: '++id, workoutId, exerciseName, timestamp',
      exercises: '++id, name, muscleGroup',
      routineExercises: '++id, dayOfWeek, routineName, exerciseName',
    });
  }
}

export const db = new TitanLogDB();

// ============================================================================
// SEED DATA - 7-Day Workout Split
// ============================================================================

const WEEKLY_ROUTINE = [
  {
    dayOfWeek: 0, // Monday
    routineName: 'Push Day',
    exercises: ['Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Lateral Raises', 'Tricep Pushdowns', 'Skull Crushers'],
  },
  {
    dayOfWeek: 1, // Tuesday
    routineName: 'Pull Day',
    exercises: ['Deadlift', 'Barbell Rows', 'Lat Pulldowns', 'Face Pulls', 'Barbell Curls', 'Hammer Curls'],
  },
  {
    dayOfWeek: 2, // Wednesday
    routineName: 'Leg Day',
    exercises: ['Squats', 'Romanian Deadlifts', 'Leg Press', 'Leg Curls', 'Calf Raises', 'Leg Extensions'],
  },
  {
    dayOfWeek: 3, // Thursday
    routineName: 'Upper Body',
    exercises: ['Incline Bench Press', 'Cable Rows', 'Dumbbell Shoulder Press', 'Pull-ups', 'Dips', 'Face Pulls'],
  },
  {
    dayOfWeek: 4, // Friday
    routineName: 'Lower Body',
    exercises: ['Front Squats', 'Hip Thrusts', 'Walking Lunges', 'Leg Press', 'Seated Calf Raises', 'Leg Curls'],
  },
  {
    dayOfWeek: 5, // Saturday
    routineName: 'Arms & Core',
    exercises: ['Barbell Curls', 'Tricep Dips', 'Preacher Curls', 'Overhead Tricep Extension', 'Cable Crunches', 'Hanging Leg Raises'],
  },
  {
    dayOfWeek: 6, // Sunday
    routineName: 'Rest Day',
    exercises: [],
  },
];

export async function seedDatabase() {
  const count = await db.routineExercises.count();
  if (count > 0) return; // Already seeded

  // Seed routine exercises
  for (const day of WEEKLY_ROUTINE) {
    for (let i = 0; i < day.exercises.length; i++) {
      await db.routineExercises.add({
        dayOfWeek: day.dayOfWeek,
        routineName: day.routineName,
        exerciseName: day.exercises[i],
        order: i,
      });
    }
    // For rest day, add a placeholder
    if (day.exercises.length === 0) {
      await db.routineExercises.add({
        dayOfWeek: day.dayOfWeek,
        routineName: day.routineName,
        exerciseName: '',
        order: 0,
      });
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDayOfWeek(): number {
  const jsDay = new Date().getDay(); // 0 = Sunday
  return jsDay === 0 ? 6 : jsDay - 1; // Convert to 0 = Monday
}

export async function getRoutineForDay(dayOfWeek: number) {
  const exercises = await db.routineExercises
    .where('dayOfWeek')
    .equals(dayOfWeek)
    .sortBy('order');

  if (exercises.length === 0) return null;

  return {
    routineName: exercises[0].routineName,
    exercises: exercises.filter(e => e.exerciseName !== '').map(e => e.exerciseName),
  };
}

export async function getLastSetForExercise(exerciseName: string): Promise<ExerciseSet | null> {
  const sets = await db.sets
    .where('exerciseName')
    .equals(exerciseName)
    .reverse()
    .sortBy('timestamp');

  return sets[0] || null;
}

export async function getTodayWorkout(): Promise<Workout | null> {
  const today = new Date().toISOString().split('T')[0];
  const workouts = await db.workouts.where('date').equals(today).toArray();
  return workouts[0] || null;
}

export async function startWorkout(routineName: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  // Check if workout already exists
  const existing = await getTodayWorkout();
  if (existing?.id) return existing.id;

  // Create new workout
  const id = await db.workouts.add({
    date: today,
    routineName,
  });
  return id as number;
}

export async function logSet(
  workoutId: number,
  exerciseName: string,
  weight: number,
  reps: number,
  isDropSet: boolean = false
): Promise<number> {
  const id = await db.sets.add({
    workoutId,
    exerciseName,
    weight,
    reps,
    isDropSet,
    timestamp: new Date().toISOString(),
  });
  return id as number;
}

export async function finishWorkout(workoutId: number): Promise<void> {
  await db.workouts.update(workoutId, {
    completedAt: new Date().toISOString(),
  });
}

export async function getWorkoutHistory(limit: number = 30): Promise<Workout[]> {
  return await db.workouts
    .orderBy('date')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getSetsForWorkout(workoutId: number): Promise<ExerciseSet[]> {
  return await db.sets
    .where('workoutId')
    .equals(workoutId)
    .toArray();
}
