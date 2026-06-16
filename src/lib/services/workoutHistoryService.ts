import { db } from "@/lib/firebase-admin";
import { WorkoutHistory, PostWorkoutSurvey, TestingMetrics } from "@/types";
import { randomUUID } from "crypto";

const COLLECTION = "workoutHistory";

export async function saveWorkoutHistory(
  workoutId: string,
  userId: string,
  survey: PostWorkoutSurvey,
  isTestingWorkout = false,
  testingMetrics: TestingMetrics | null = null
): Promise<WorkoutHistory> {
  const historyId = randomUUID();
  const record: WorkoutHistory = {
    historyId,
    workoutId,
    userId,
    completedAt: new Date().toISOString(),
    isTestingWorkout,
    survey,
    testingMetrics: isTestingWorkout ? testingMetrics : null,
    externalSync: {
      source: null,
      externalActivityId: null,
      syncedAt: null,
    },
  };
  await db.collection(COLLECTION).doc(historyId).set(record);
  return record;
}

export async function getUserHistory(userId: string): Promise<WorkoutHistory[]> {
  const snap = await db
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .orderBy("completedAt", "desc")
    .get();
  return snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data() as WorkoutHistory);
}

export async function getHistoryForWorkout(
  workoutId: string
): Promise<WorkoutHistory | null> {
  const snap = await db
    .collection(COLLECTION)
    .where("workoutId", "==", workoutId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as WorkoutHistory;
}
