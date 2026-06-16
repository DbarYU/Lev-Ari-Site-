import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/services/userService";
import { getWorkoutsByUser } from "@/lib/services/programService";
import { Level0Alert } from "@/components/shared/Level0Alert";
import { WorkoutsClient } from "@/components/trainee/WorkoutsClient";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const session = await getSession();
  if (!session.user) redirect("/login");

  const [user, workouts] = await Promise.all([
    getUserById(session.user.uid),
    getWorkoutsByUser(session.user.uid),
  ]);

  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
        <p className="text-sm text-gray-500 mt-1">Your upcoming and completed sessions</p>
      </div>

      {user.isLevel0Locked && (
        <div className="mb-6">
          <Level0Alert />
        </div>
      )}

      <WorkoutsClient
        workouts={workouts}
        isLevel0Locked={user.isLevel0Locked}
      />
    </div>
  );
}
