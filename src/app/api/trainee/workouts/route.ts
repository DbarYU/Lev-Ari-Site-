import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getWorkoutsByUser } from "@/lib/services/programService";
import { getUserById } from "@/lib/services/userService";
import { getActiveAlertsByUser } from "@/lib/services/inactivityService";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "trainee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [workouts, user, activeAlerts] = await Promise.all([
      getWorkoutsByUser(session.user.uid),
      getUserById(session.user.uid),
      getActiveAlertsByUser(session.user.uid),
    ]);

    const upcoming = workouts.filter((w) => w.status === "upcoming");
    const completed = workouts.filter((w) => w.status === "completed");
    const missed = workouts.filter((w) => w.status === "missed");

    return NextResponse.json({
      upcoming,
      completed,
      missed,
      activeAlerts,
      isLevel0Locked: user?.isLevel0Locked ?? true,
      currentLevel: user?.currentLevel ?? 0,
    });
  } catch (err) {
    console.error("[GET /api/trainee/workouts]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
