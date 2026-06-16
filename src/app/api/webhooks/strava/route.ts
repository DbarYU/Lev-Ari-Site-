import { NextRequest, NextResponse } from "next/server";

/**
 * Strava webhook receiver — stub.
 * Strava uses GET for webhook verification and POST for event delivery.
 * See: https://developers.strava.com/docs/webhooks/
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = searchParams.get("hub.verify_token");

  if (verifyToken !== process.env.STRAVA_VERIFY_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ "hub.challenge": challenge });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Strava Webhook] Received event:", JSON.stringify(body).slice(0, 200));
    // TODO: Handle object_type=activity events
    // TODO: Call stravaAdapter.syncWorkoutFromActivity()
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Strava Webhook]", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
