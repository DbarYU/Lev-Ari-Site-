import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/services/userService";
import { getUserHistory } from "@/lib/services/workoutHistoryService";
import { getWorkoutsByUser } from "@/lib/services/programService";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "trainee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const uid = session.user.uid;
    const [user, history, workouts] = await Promise.all([
      getUserById(uid),
      getUserHistory(uid),
      getWorkoutsByUser(uid),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Build chart-ready data
    const rpeOverTime = history
      .filter((h) => !h.isTestingWorkout)
      .map((h) => ({
        date: h.completedAt.slice(0, 10),
        rpe: h.survey.rpe,
        muscleSoreness: h.survey.muscleSoreness,
      }));

    const levelHistory = history
      .filter((h) => !h.isTestingWorkout)
      .map((h, idx) => ({
        date: h.completedAt.slice(0, 10),
        completionNumber: idx + 1,
      }));

    const completedCount = workouts.filter((w) => w.status === "completed").length;
    const missedCount = workouts.filter((w) => w.status === "missed").length;

    return NextResponse.json({
      currentLevel: user.currentLevel,
      isLevel0Locked: user.isLevel0Locked,
      completedWorkoutsCount: user.completedWorkoutsCount,
      workoutsToNextLevel: 2 - (user.completedWorkoutsCount % 2),
      testingWorkoutResults: user.testingWorkoutResults,
      stats: { completedCount, missedCount, totalHistory: history.length },
      rpeOverTime,
      levelHistory,
    });
  } catch (err) {
    console.error("[GET /api/trainee/progress]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
