import { NextRequest, NextResponse } from "next/server";
import { getUserById, resetToLevel0 } from "@/lib/services/userService";
import { createTestingWorkout } from "@/lib/services/programService";
import { getSession } from "@/lib/session";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const { id } = await params;
    const user = await getUserById(id);
    if (!user) return NextResponse.json({ error: "Trainee not found" }, { status: 404 });

    await resetToLevel0(id);
    await createTestingWorkout(id);

    return NextResponse.json({ success: true, message: `${user.displayName} reset to Level 0` });
  } catch (err) {
    console.error("[POST /api/admin/users/[id]/reset]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
