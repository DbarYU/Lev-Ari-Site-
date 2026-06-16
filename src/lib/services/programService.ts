import { db } from "@/lib/firebase-admin";
import { Program, Workout, WorkoutExercise, WeeklySlot } from "@/types";
import { randomUUID } from "crypto";
import { pickRandomTemplate } from "./templateService";
import { getUserById } from "./userService";

const PROGRAMS = "programs";
const WORKOUTS = "workouts";

export async function getAllPrograms(): Promise<Program[]> {
  const snap = await db.collection(PROGRAMS).orderBy("createdAt", "desc").get();
  return snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data() as Program);
}

export async function getProgramById(id: string): Promise<Program | null> {
  const snap = await db.collection(PROGRAMS).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as Program;
}

export async function createProgram(
  data: Omit<Program, "programId" | "createdAt">
): Promise<Program> {
  const programId = randomUUID();
  const program: Program = {
    ...data,
    programId,
    createdAt: new Date().toISOString(),
  };
  await db.collection(PROGRAMS).doc(programId).set(program);
  return program;
}

export async function updateProgram(
  id: string,
  updates: Partial<Program>
): Promise<void> {
  await db.collection(PROGRAMS).doc(id).update(updates);
}

export async function deleteProgram(id: string): Promise<void> {
  await db.collection(PROGRAMS).doc(id).delete();
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  const snap = await db.collection(WORKOUTS).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as Workout;
}

export async function getWorkoutsByUser(userId: string): Promise<Workout[]> {
  const snap = await db
    .collection(WORKOUTS)
    .where("assignedTo", "==", userId)
    .orderBy("scheduledDate")
    .get();
  return snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data() as Workout);
}

export async function createWorkout(
  data: Omit<Workout, "workoutId" | "createdAt" | "completedAt">
): Promise<Workout> {
  const workoutId = randomUUID();
  const workout: Workout = {
    ...data,
    workoutId,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };
  await db.collection(WORKOUTS).doc(workoutId).set(workout);
  return workout;
}

export async function updateWorkout(
  id: string,
  updates: Partial<Workout>
): Promise<void> {
  await db.collection(WORKOUTS).doc(id).update(updates);
}

export async function markWorkoutCompleted(workoutId: string): Promise<void> {
  await db.collection(WORKOUTS).doc(workoutId).update({
    status: "completed",
    completedAt: new Date().toISOString(),
  });
}

/**
 * Assigns a program to a trainee.
 * Reads the trainee's current level, then for each slot in the program's
 * weeklySchedule, randomly selects exercises from the matching bucket
 * (level + type) and creates workout documents spread across days.
 */
export async function assignProgramToUser(
  programId: string,
  userId: string,
  startDate: Date
): Promise<Workout[]> {
  const program = await getProgramById(programId);
  if (!program) throw new Error("Program not found");

  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const userLevel = user.currentLevel || 1;
  const workouts: Workout[] = [];
  let dayOffset = 0;

  // Expand weekly schedule into individual workout sessions
  const sessions: WeeklySlot[] = [];
  for (const slot of program.weeklySchedule) {
    for (let i = 0; i < slot.count; i++) {
      sessions.push(slot);
    }
  }

  // Spread sessions evenly with 1 rest day between each
  for (const session of sessions) {
    const template = await pickRandomTemplate(userLevel, session.type);

    const workoutExercises: WorkoutExercise[] = (template?.exercises ?? []).map((ex) => ({
      exerciseId: ex.exerciseId,
      sourceBucketId: null,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      durationSeconds: ex.durationSeconds,
      notes: ex.description,
    }));

    const scheduledDate = new Date(startDate);
    scheduledDate.setDate(scheduledDate.getDate() + dayOffset);

    const workoutName = template
      ? template.name
      : `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} (no template found for Level ${userLevel})`;

    const workout = await createWorkout({
      programId,
      name: workoutName,
      scheduledDate: scheduledDate.toISOString(),
      assignedTo: userId,
      status: "upcoming",
      isTestingWorkout: false,
      exercises: workoutExercises,
    });

    workouts.push(workout);
    dayOffset += 1;
  }

  return workouts;
}

export async function createTestingWorkout(userId: string): Promise<Workout> {
  const workoutId = randomUUID();
  const workout: Workout = {
    workoutId,
    programId: "testing",
    name: "Testing Workout — Baseline Assessment",
    scheduledDate: new Date().toISOString(),
    assignedTo: userId,
    status: "upcoming",
    isTestingWorkout: true,
    exercises: [
      {
        exerciseId: "test-run",
        sourceBucketId: null,
        name: "Endurance Run",
        sets: 1,
        reps: 1,
        durationSeconds: 1200,
        notes: "Run at a comfortable pace for as long as possible. Track time, distance, and heart rate.",
      },
    ],
    completedAt: null,
    createdAt: new Date().toISOString(),
  };
  await db.collection(WORKOUTS).doc(workoutId).set(workout);
  return workout;
}

export async function getMissedWorkouts(): Promise<Workout[]> {
  const now = new Date().toISOString();
  const snap = await db
    .collection(WORKOUTS)
    .where("status", "==", "upcoming")
    .where("scheduledDate", "<", now)
    .get();
  return snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data() as Workout);
}
