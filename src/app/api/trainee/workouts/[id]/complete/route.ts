import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getWorkoutById, markWorkoutCompleted } from "@/lib/services/programService";
import { saveWorkoutHistory } from "@/lib/services/workoutHistoryService";
import { level0LockCheck, Level0LockError } from "@/lib/middleware/level0Lock";
import { checkAndPromote } from "@/lib/services/autoPromotionService";
import { resolveAlertsForUser } from "@/lib/services/inactivityService";

const SurveySchema = z.object({
  rpe: z.number().int().min(1).max(10),
  muscleSoreness: z.number().int().min(1).max(5),
  injuryFlag: z.boolean(),
  injuryNotes: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "trainee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const workout = await getWorkoutById(id);

    if (!workout) return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    if (workout.assignedTo !== session.user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (workout.status === "completed") {
      return NextResponse.json({ error: "Workout already completed" }, { status: 409 });
    }

    await level0LockCheck(session.user.uid);

    const body = await req.json();
    const parsed = SurveySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid survey data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const survey = {
      ...parsed.data,
      injuryNotes: parsed.data.injuryNotes ?? null,
      notes: parsed.data.notes ?? null,
    };

    await saveWorkoutHistory(
      id,
      session.user.uid,
      survey,
      workout.isTestingWorkout
    );
    await markWorkoutCompleted(id);
    await resolveAlertsForUser(session.user.uid);

    let promoted = false;
    if (!workout.isTestingWorkout) {
      promoted = await checkAndPromote(session.user.uid);
    }

    return NextResponse.json({ success: true, promoted });
  } catch (err) {
    if (err instanceof Level0LockError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[POST /api/trainee/workouts/[id]/complete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
