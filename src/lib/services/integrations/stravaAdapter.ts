/**
 * Strava API adapter — stub for future integration.
 * Replace no-op implementations with real Strava API v3 calls.
 * Docs: https://developers.strava.com/docs/reference/
 */

export interface StravaActivity {
  id: number;
  name: string;
  startDate: string;
  elapsedTime: number;
  distance: number;
  averageHeartrate: number;
  type: string;
}

export async function connect(_userId: string, _authCode: string): Promise<void> {
  // TODO: Exchange authCode for Strava OAuth tokens and store in users.integrations.strava
  console.warn("[StravaAdapter] connect() not yet implemented");
}

export async function fetchActivities(_userId: string): Promise<StravaActivity[]> {
  // TODO: Call GET /athlete/activities with Bearer token
  console.warn("[StravaAdapter] fetchActivities() not yet implemented");
  return [];
}

export async function syncWorkoutFromActivity(
  _userId: string,
  _workoutId: string,
  _activityId: number
): Promise<void> {
  // TODO: Fetch activity details and update workoutHistory.externalSync
  console.warn("[StravaAdapter] syncWorkoutFromActivity() not yet implemented");
}

export async function disconnect(_userId: string): Promise<void> {
  // TODO: Deauthorize token and clear users.integrations.strava
  console.warn("[StravaAdapter] disconnect() not yet implemented");
}
