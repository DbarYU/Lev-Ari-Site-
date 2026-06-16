import { NextRequest, NextResponse } from "next/server";
import { runInactivityCheck } from "@/lib/services/inactivityService";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const created = await runInactivityCheck();
    return NextResponse.json({
      success: true,
      alertsCreated: created,
      ranAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[CRON /api/cron/inactivity]", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
