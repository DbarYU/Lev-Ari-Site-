"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Workout } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CheckCircle, Clock, XCircle, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";

interface WorkoutsClientProps {
  workouts: Workout[];
  isLevel0Locked: boolean;
}

const STATUS_ICON = {
  upcoming: <Clock className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  missed: <XCircle className="h-4 w-4 text-red-400" />,
};

const STATUS_BADGE: Record<string, "info" | "success" | "danger"> = {
  upcoming: "info",
  completed: "success",
  missed: "danger",
};

export function WorkoutsClient({ workouts, isLevel0Locked }: WorkoutsClientProps) {
  const router = useRouter();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");

  // Survey state
  const [rpe, setRpe] = useState(7);
  const [soreness, setSoreness] = useState(3);
  const [injuryFlag, setInjuryFlag] = useState(false);
  const [injuryNotes, setInjuryNotes] = useState("");
  const [notes, setNotes] = useState("");

  const upcoming = workouts.filter((w) => w.status === "upcoming");
  const completed = workouts.filter((w) => w.status === "completed");
  const displayed = tab === "upcoming" ? upcoming : completed;

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    if (!completingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/trainee/workouts/${completingId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rpe,
          muscleSoreness: soreness,
          injuryFlag,
          injuryNotes: injuryFlag ? injuryNotes : null,
          notes: notes || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompletingId(null);
        if (data.promoted) {
          alert("Congratulations! You have been promoted to the next level!");
        }
        router.refresh();
      } else {
        alert(data.error ?? "Failed to mark workout complete");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {(["upcoming", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Completed (${completed.length})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400 py-8">
            {tab === "upcoming" ? "No upcoming workouts." : "No completed workouts yet."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayed.map((workout) => (
            <Card key={workout.workoutId}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {STATUS_ICON[workout.status]}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{workout.name}</h3>
                      {workout.isTestingWorkout && (
                        <Badge variant="warning">Testing</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(workout.scheduledDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_BADGE[workout.status]}>
                    {workout.status}
                  </Badge>
                  {workout.status === "upcoming" && !isLevel0Locked && !workout.isTestingWorkout && (
                    <Button
                      size="sm"
                      onClick={() => setCompletingId(workout.workoutId)}
                    >
                      Mark Done
                    </Button>
                  )}
                </div>
              </div>

              {/* Exercises toggle */}
              <button
                onClick={() => setExpandedId(expandedId === workout.workoutId ? null : workout.workoutId)}
                className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                {expandedId === workout.workoutId ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""}
              </button>

              {expandedId === workout.workoutId && (
                <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                  {workout.exercises.map((ex) => (
                    <div key={ex.exerciseId} className="flex items-center gap-2 text-sm">
                      <Dumbbell className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800">{ex.name}</span>
                      <span className="text-gray-400">
                        {ex.durationSeconds
                          ? `${ex.durationSeconds}s`
                          : `${ex.sets} × ${ex.reps} reps`}
                      </span>
                      {ex.notes && <span className="text-gray-400 italic text-xs ml-1">— {ex.notes}</span>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Post-workout survey modal */}
      <Modal
        open={!!completingId}
        onClose={() => setCompletingId(null)}
        title="Post-Workout Survey"
      >
        <form onSubmit={handleComplete} className="space-y-5">
          {/* RPE */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              RPE — Effort Rating <span className="text-gray-400">(1–10)</span>
            </label>
            <div className="flex items-center gap-3 mt-2">
              <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="flex-1 accent-blue-600" />
              <span className="w-8 text-center font-bold text-blue-700 text-lg">{rpe}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Very easy</span><span>Maximum effort</span>
            </div>
          </div>

          {/* Muscle Soreness */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Muscle Soreness <span className="text-gray-400">(1–5)</span>
            </label>
            <div className="flex items-center gap-3 mt-2">
              <input type="range" min={1} max={5} value={soreness} onChange={(e) => setSoreness(Number(e.target.value))} className="flex-1 accent-purple-600" />
              <span className="w-8 text-center font-bold text-purple-700 text-lg">{soreness}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>None</span><span>Severe</span>
            </div>
          </div>

          {/* Injury flag */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="injuryFlag"
              checked={injuryFlag}
              onChange={(e) => setInjuryFlag(e.target.checked)}
              className="h-4 w-4 accent-red-600 rounded"
            />
            <label htmlFor="injuryFlag" className="text-sm font-medium text-gray-700">
              Flag an injury or pain
            </label>
          </div>

          {injuryFlag && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Injury Notes <span className="text-red-500">*</span></label>
              <textarea
                className="rounded-lg border border-red-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                value={injuryNotes}
                onChange={(e) => setInjuryNotes(e.target.value)}
                rows={2}
                placeholder="Describe what happened..."
                required
              />
            </div>
          )}

          {/* General notes */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">General Notes <span className="text-gray-400">(optional)</span></label>
            <textarea
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="How did it go?"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={loading} className="flex-1">Submit & Complete</Button>
            <Button type="button" variant="outline" onClick={() => setCompletingId(null)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
