export type UserRole = "admin" | "trainer" | "trainee";
export type WorkoutStatus = "upcoming" | "completed" | "missed";
export type WorkoutType = "strength" | "mobility" | "run" | "cardio" | "hiit" | "flexibility";
export type IntegrationSource = "garmin" | "strava";

export interface WeeklySlot {
  type: WorkoutType;
  count: number;
}

export interface TestingWorkoutResults {
  enteredAt: string | null;
  timeSeconds: number;
  distanceMeters: number;
  avgHeartRate: number;
  rpe: number;
}

export interface IntegrationConfig {
  connected: boolean;
  accessToken: string | null;
}

export interface User {
  uid: string;
  email: string;
  passwordHash: string;
  plainPassword: string;
  role: UserRole;
  displayName: string;
  assignedTrainerId: string | null;
  currentLevel: number;
  isLevel0Locked: boolean;
  completedWorkoutsCount: number;
  testingWorkoutResults: TestingWorkoutResults;
  integrations: {
    garmin: IntegrationConfig;
    strava: IntegrationConfig;
  };
  createdAt: string;
  lastActiveAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface TemplateExercise {
  exerciseId: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  durationSeconds: number | null;
}

export interface WorkoutTemplate {
  templateId: string;
  name: string;
  targetLevel: number;
  type: WorkoutType;
  exercises: TemplateExercise[];
  createdBy: string;
  createdAt: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sourceBucketId: string | null;
  name: string;
  sets: number;
  reps: number;
  durationSeconds: number | null;
  notes: string;
}

export interface Workout {
  workoutId: string;
  programId: string;
  name: string;
  scheduledDate: string;
  assignedTo: string;
  status: WorkoutStatus;
  isTestingWorkout: boolean;
  exercises: WorkoutExercise[];
  createdAt: string;
  completedAt: string | null;
}

export interface Program {
  programId: string;
  name: string;
  description: string;
  weeklySchedule: WeeklySlot[];
  createdBy: string;
  createdAt: string;
}

export interface PostWorkoutSurvey {
  rpe: number;
  muscleSoreness: number;
  injuryFlag: boolean;
  injuryNotes: string | null;
  notes: string | null;
}

export interface TestingMetrics {
  timeSeconds: number;
  distanceMeters: number;
  avgHeartRate: number;
  rpe: number;
}

export interface ExternalSync {
  source: IntegrationSource | null;
  externalActivityId: string | null;
  syncedAt: string | null;
}

export interface WorkoutHistory {
  historyId: string;
  workoutId: string;
  userId: string;
  completedAt: string;
  isTestingWorkout: boolean;
  survey: PostWorkoutSurvey;
  testingMetrics: TestingMetrics | null;
  externalSync: ExternalSync;
}

export interface InactivityAlert {
  alertId: string;
  userId: string;
  workoutId: string;
  missedDate: string;
  alertSentAt: string;
  resolvedAt: string | null;
  status: "active" | "resolved";
}

export interface SessionUser {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
}

export interface IronSessionData {
  user?: SessionUser;
}
