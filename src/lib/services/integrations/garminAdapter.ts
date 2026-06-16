/**
 * Garmin Connect API adapter — stub for future integration.
 * Replace no-op implementations with real Garmin Health API calls.
 * Docs: https://developer.garmin.com/health-api/overview/
 */

export interface GarminActivity {
  activityId: string;
  startTime: string;
  durationSeconds: number;
  distanceMeters: number;
  avgHeartRate: number;
  activityType: string;
}

export async function connect(_userId: string, _authCode: string): Promise<void> {
  // TODO: Exchange authCode for Garmin OAuth tokens and store in users.integrations.garmin
  console.warn("[GarminAdapter] connect() not yet implemented");
}

export async function fetchActivities(_userId: string): Promise<GarminActivity[]> {
  // TODO: Call Garmin Health API /wellness-api/rest/activities endpoint
  console.warn("[GarminAdapter] fetchActivities() not yet implemented");
  return [];
}

export async function syncWorkoutFromActivity(
  _userId: string,
  _workoutId: string,
  _activityId: string
): Promise<void> {
  // TODO: Fetch activity details and update workoutHistory.externalSync
  console.warn("[GarminAdapter] syncWorkoutFromActivity() not yet implemented");
}

export async function disconnect(_userId: string): Promise<void> {
  // TODO: Revoke token and clear users.integrations.garmin
  console.warn("[GarminAdapter] disconnect() not yet implemented");
}
