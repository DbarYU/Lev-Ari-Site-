"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TestingWorkoutResults, User } from "@/types";
import { Trophy, Dumbbell, Target, Activity } from "lucide-react";

interface AnalyticsClientProps {
  rpeOverTime: { date: string; rpe: number; soreness: number }[];
  currentLevel: number;
  completedWorkoutsCount: number;
  completedCount: number;
  missedCount: number;
  testingWorkoutResults: TestingWorkoutResults;
  integrations: User["integrations"];
}

const PIE_COLORS = ["#3b82f6", "#f87171"];

export function AnalyticsClient({
  rpeOverTime,
  currentLevel,
  completedWorkoutsCount,
  completedCount,
  missedCount,
  testingWorkoutResults,
  integrations,
}: AnalyticsClientProps) {
  const worksToNextLevel = 2 - (completedWorkoutsCount % 2);
  const pieData = [
    { name: "Completed", value: completedCount },
    { name: "Missed", value: missedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Current Level", value: currentLevel, icon: Trophy, color: "bg-blue-50 text-blue-600" },
          { label: "Completed", value: completedCount, icon: Dumbbell, color: "bg-green-50 text-green-600" },
          { label: "Missed", value: missedCount, icon: Target, color: "bg-red-50 text-red-600" },
          { label: "To Next Level", value: worksToNextLevel, icon: Activity, color: "bg-purple-50 text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* RPE / Soreness chart */}
      {rpeOverTime.length > 0 ? (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Effort & Soreness Over Time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rpeOverTime} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rpe" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="RPE (1–10)" />
              <Line type="monotone" dataKey="soreness" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} name="Soreness (1–5)" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <Card>
          <p className="text-center text-gray-400 py-8 text-sm">
            Complete workouts to see your effort trends here.
          </p>
        </Card>
      )}

      {/* Completion pie chart */}
      {(completedCount + missedCount) > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Workout Completion Rate</h2>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx={75} cy={75} innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-700">Completed: <strong>{completedCount}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <span className="text-sm text-gray-700">Missed: <strong>{missedCount}</strong></span>
              </div>
              {(completedCount + missedCount) > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {Math.round((completedCount / (completedCount + missedCount)) * 100)}% completion rate
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Testing workout baseline */}
      {testingWorkoutResults.enteredAt && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Baseline Testing Results</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Time", value: `${Math.round(testingWorkoutResults.timeSeconds / 60)}m ${testingWorkoutResults.timeSeconds % 60}s` },
              { label: "Distance", value: `${testingWorkoutResults.distanceMeters}m` },
              { label: "Avg Heart Rate", value: `${testingWorkoutResults.avgHeartRate} bpm` },
              { label: "RPE", value: `${testingWorkoutResults.rpe}/10` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Integration status */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Device Integrations</h2>
        <div className="flex gap-4">
          {[
            { name: "Garmin", connected: integrations.garmin.connected },
            { name: "Strava", connected: integrations.strava.connected },
          ].map(({ name, connected }) => (
            <div key={name} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2">
              <span className="text-sm font-medium text-gray-700">{name}</span>
              <Badge variant={connected ? "success" : "default"}>
                {connected ? "Connected" : "Coming Soon"}
              </Badge>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Garmin and Strava sync will be available in a future update.</p>
      </Card>
    </div>
  );
}
