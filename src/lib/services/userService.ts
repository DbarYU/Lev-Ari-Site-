import { db } from "@/lib/firebase-admin";
import { User, PublicUser, TestingMetrics } from "@/types";

const USERS_COLLECTION = "users";

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await db.collection(USERS_COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return snap.data() as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const snap = await db
    .collection(USERS_COLLECTION)
    .where("email", "==", email)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as User;
}

export async function getAllTrainees(): Promise<PublicUser[]> {
  const snap = await db
    .collection(USERS_COLLECTION)
    .where("role", "==", "trainee")
    .get();
  return snap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
    const data = doc.data() as User;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _ph, ...publicUser } = data;
    return publicUser as PublicUser;
  });
}

export async function createUser(data: User): Promise<void> {
  await db.collection(USERS_COLLECTION).doc(data.uid).set(data);
}

export async function updateUser(
  uid: string,
  updates: Partial<User>
): Promise<void> {
  await db.collection(USERS_COLLECTION).doc(uid).update(updates);
}

export async function unlockLevel0(
  uid: string,
  testMetrics: TestingMetrics
): Promise<void> {
  await db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .update({
      isLevel0Locked: false,
      currentLevel: 1,
      "testingWorkoutResults.enteredAt": new Date().toISOString(),
      "testingWorkoutResults.timeSeconds": testMetrics.timeSeconds,
      "testingWorkoutResults.distanceMeters": testMetrics.distanceMeters,
      "testingWorkoutResults.avgHeartRate": testMetrics.avgHeartRate,
      "testingWorkoutResults.rpe": testMetrics.rpe,
    });
}

export async function resetToLevel0(uid: string): Promise<void> {
  await db.collection(USERS_COLLECTION).doc(uid).update({
    currentLevel: 0,
    isLevel0Locked: true,
    completedWorkoutsCount: 0,
    "testingWorkoutResults.enteredAt": null,
    "testingWorkoutResults.timeSeconds": 0,
    "testingWorkoutResults.distanceMeters": 0,
    "testingWorkoutResults.avgHeartRate": 0,
    "testingWorkoutResults.rpe": 0,
  });

  // Archive active workouts
  const workoutsSnap = await db
    .collection("workouts")
    .where("assignedTo", "==", uid)
    .where("status", "==", "upcoming")
    .get();

  const batch = db.batch();
  workoutsSnap.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
    batch.update(doc.ref, { status: "missed" });
  });
  await batch.commit();
}

export async function incrementCompletedCount(uid: string): Promise<number> {
  const ref = db.collection(USERS_COLLECTION).doc(uid);
  const newCount = await db.runTransaction(async (tx: FirebaseFirestore.Transaction) => {
    const snap = await tx.get(ref);
    const user = snap.data() as User;
    const next = user.completedWorkoutsCount + 1;
    tx.update(ref, { completedWorkoutsCount: next, lastActiveAt: new Date().toISOString() });
    return next;
  });
  return newCount;
}

export async function promoteUser(uid: string, nextLevel: number): Promise<void> {
  await db.collection(USERS_COLLECTION).doc(uid).update({
    currentLevel: nextLevel,
    completedWorkoutsCount: 0,
  });
}

export async function deleteUser(uid: string): Promise<void> {
  await db.collection(USERS_COLLECTION).doc(uid).delete();
}
