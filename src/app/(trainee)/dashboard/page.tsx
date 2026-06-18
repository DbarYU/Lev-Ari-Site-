import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/services/userService";
import { getWorkoutsByUser } from "@/lib/services/programService";
import { getActiveAlertsByUser } from "@/lib/services/inactivityService";
import { Level0Alert } from "@/components/shared/Level0Alert";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Dumbbell, AlertCircle, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.user) redirect("/login");

  const [user, workouts, alerts] = await Promise.all([
    getUserById(session.user.uid),
    getWorkoutsByUser(session.user.uid),
    getActiveAlertsByUser(session.user.uid),
  ]);

  if (!user) redirect("/login");

  const upcoming = workouts.filter((w) => w.status === "upcoming");
  const completed = workouts.filter((w) => w.status === "completed");
  const nextWorkout = upcoming[0] ?? null;
  const worksToNextLevel = 2 - (user.completedWorkoutsCount % 2);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          שלום, {user.displayName} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">סקירת האימונים שלך</p>
      </div>

      {user.isLevel0Locked && (
        <div className="mb-6">
          <Level0Alert />
        </div>
      )}

      {alerts.length > 0 && !user.isLevel0Locked && (
        <Card variant="warning" className="mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">
                {alerts.length > 1 ? `${alerts.length} אימונים שלא בוצעו` : "אימון שלא בוצע"}
              </p>
              <p className="text-sm text-amber-700">חזור למסלול — השלם את האימונים הפתוחים!</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Trophy className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.currentLevel}</p>
              <p className="text-xs text-gray-500">רמה נוכחית</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Dumbbell className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completed.length}</p>
              <p className="text-xs text-gray-500">אימונים הושלמו</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {user.isLevel0Locked ? "–" : worksToNextLevel}
              </p>
              <p className="text-xs text-gray-500">לרמה הבאה</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcoming.length}</p>
              <p className="text-xs text-gray-500">אימונים קרובים</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Next workout */}
      {nextWorkout && (
        <Card className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            האימון הבא
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{nextWorkout.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(nextWorkout.scheduledDate).toLocaleDateString("he-IL", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {nextWorkout.exercises.length} תרגילים
              </p>
            </div>
            {nextWorkout.isTestingWorkout && (
              <Badge variant="warning">אימון הערכה</Badge>
            )}
          </div>
        </Card>
      )}

      {/* Level progress bar */}
      {!user.isLevel0Locked && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            התקדמות ברמה
          </h2>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">רמה {user.currentLevel}</span>
            <span className="text-gray-500">
              {user.completedWorkoutsCount % 2}/2 אימונים לרמה {user.currentLevel + 1}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${((user.completedWorkoutsCount % 2) / 2) * 100}%` }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
