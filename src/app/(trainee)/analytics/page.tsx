import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/services/userService";
import { getUserHistory } from "@/lib/services/workoutHistoryService";
import { getWorkoutsByUser } from "@/lib/services/programService";
import { AnalyticsClient } from "@/components/trainee/AnalyticsClient";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session.user) redirect("/login");

  const uid = session.user.uid;
  const [user, history, workouts] = await Promise.all([
    getUserById(uid),
    getUserHistory(uid),
    getWorkoutsByUser(uid),
  ]);

  if (!user) redirect("/login");

  const rpeOverTime = history
    .filter((h) => !h.isTestingWorkout)
    .map((h) => ({
      date: h.completedAt.slice(0, 10),
      rpe: h.survey.rpe,
      soreness: h.survey.muscleSoreness,
    }));

  const completedCount = workouts.filter((w) => w.status === "completed").length;
  const missedCount = workouts.filter((w) => w.status === "missed").length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Progress & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Your training trends over time</p>
      </div>

      {user.isLevel0Locked ? (
        <Card>
          <p className="text-center text-gray-400 py-8">
            Analytics will be available once your account is unlocked after your testing workout.
          </p>
        </Card>
      ) : (
        <AnalyticsClient
          rpeOverTime={rpeOverTime}
          currentLevel={user.currentLevel}
          completedWorkoutsCount={user.completedWorkoutsCount}
          completedCount={completedCount}
          missedCount={missedCount}
          testingWorkoutResults={user.testingWorkoutResults}
          integrations={user.integrations}
        />
      )}
    </div>
  );
}
