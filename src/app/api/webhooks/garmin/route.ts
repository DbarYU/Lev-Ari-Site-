import { NextRequest, NextResponse } from "next/server";

/**
 * Garmin webhook receiver — stub.
 * Garmin will POST activity data here after user connects their account.
 * See: https://developer.garmin.com/health-api/overview/
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Garmin Webhook] Received payload:", JSON.stringify(body).slice(0, 200));
    // TODO: Validate Garmin signature header
    // TODO: Parse activity and call garminAdapter.syncWorkoutFromActivity()
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Garmin Webhook]", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
