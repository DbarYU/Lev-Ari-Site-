import { db } from "@/lib/firebase-admin";
import { WorkoutTemplate, TemplateExercise, WorkoutType } from "@/types";
import { randomUUID } from "crypto";

const COLLECTION = "workoutTemplates";

export async function getAllTemplates(): Promise<WorkoutTemplate[]> {
  const snap = await db.collection(COLLECTION).get();
  return snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data() as WorkoutTemplate);
}

export async function getTemplatesByLevelAndType(
  level: number,
  type: WorkoutType
): Promise<WorkoutTemplate[]> {
  const snap = await db
    .collection(COLLECTION)
    .where("targetLevel", "==", level)
    .where("type", "==", type)
    .get();
  return snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data() as WorkoutTemplate);
}

export async function getTemplateById(id: string): Promise<WorkoutTemplate | null> {
  const snap = await db.collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as WorkoutTemplate;
}

export async function createTemplate(
  name: string,
  targetLevel: number,
  type: WorkoutType,
  exercises: Omit<TemplateExercise, "exerciseId">[],
  createdBy: string
): Promise<WorkoutTemplate> {
  const templateId = randomUUID();
  const template: WorkoutTemplate = {
    templateId,
    name,
    targetLevel,
    type,
    exercises: exercises.map((ex) => ({ ...ex, exerciseId: randomUUID() })),
    createdBy,
    createdAt: new Date().toISOString(),
  };
  await db.collection(COLLECTION).doc(templateId).set(template);
  return template;
}

export async function updateTemplate(
  id: string,
  updates: Partial<WorkoutTemplate>
): Promise<void> {
  await db.collection(COLLECTION).doc(id).update(updates);
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.collection(COLLECTION).doc(id).delete();
}

export async function addExerciseToTemplate(
  templateId: string,
  exercise: Omit<TemplateExercise, "exerciseId">
): Promise<TemplateExercise> {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template not found");
  const newExercise: TemplateExercise = { ...exercise, exerciseId: randomUUID() };
  await db.collection(COLLECTION).doc(templateId).update({
    exercises: [...template.exercises, newExercise],
  });
  return newExercise;
}

export async function removeExerciseFromTemplate(
  templateId: string,
  exerciseId: string
): Promise<void> {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template not found");
  await db.collection(COLLECTION).doc(templateId).update({
    exercises: template.exercises.filter((e) => e.exerciseId !== exerciseId),
  });
}

/** Pick one random template for a given level+type. Returns null if none exist. */
export async function pickRandomTemplate(
  level: number,
  type: WorkoutType
): Promise<WorkoutTemplate | null> {
  const templates = await getTemplatesByLevelAndType(level, type);
  if (templates.length === 0) return null;
  return templates[Math.floor(Math.random() * templates.length)];
}
