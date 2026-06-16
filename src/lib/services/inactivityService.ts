import { db } from "@/lib/firebase-admin";
import { InactivityAlert } from "@/types";
import { randomUUID } from "crypto";
import { getMissedWorkouts, updateWorkout } from "./programService";

const COLLECTION = "inactivityAlerts";

export async function runInactivityCheck(): Promise<number> {
  const missedWorkouts = await getMissedWorkouts();
  let created = 0;

  for (const workout of missedWorkouts) {
    // Mark workout as missed
    await updateWorkout(workout.workoutId, { status: "missed" });

    // Check if alert already exists
    const existing = await db
      .collection(COLLECTION)
      .where("workoutId", "==", workout.workoutId)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (existing.empty) {
      const alertId = randomUUID();
      const alert: InactivityAlert = {
        alertId,
        userId: workout.assignedTo,
        workoutId: workout.workoutId,
        missedDate: workout.scheduledDate,
        alertSentAt: new Date().toISOString(),
        resolvedAt: null,
        status: "active",
      };
      await db.collection(COLLECTION).doc(alertId).set(alert);
      created++;
    }
  }
  return created;
}

export async function getActiveAlertsByUser(userId: string): Promise<InactivityAlert[]> {
  const snap = await db
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .where("status", "==", "active")
    .get();
  return snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data() as InactivityAlert);
}

export async function resolveAlertsForUser(userId: string): Promise<void> {
  const alerts = await getActiveAlertsByUser(userId);
  if (alerts.length === 0) return;

  const batch = db.batch();
  alerts.forEach((alert: InactivityAlert) => {
    const ref = db.collection(COLLECTION).doc(alert.alertId);
    batch.update(ref, {
      status: "resolved",
      resolvedAt: new Date().toISOString(),
    });
  });
  await batch.commit();
}
