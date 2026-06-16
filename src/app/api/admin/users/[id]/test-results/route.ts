import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserById, unlockLevel0 } from "@/lib/services/userService";
import { db } from "@/lib/firebase-admin";
import { getSession } from "@/lib/session";

const TestResultsSchema = z.object({
  timeSeconds: z.number().positive(),
  distanceMeters: z.number().nonnegative(),
  avgHeartRate: z.number().positive(),
  rpe: z.number().min(1).max(10),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.user || (session.user.role !== "admin" && session.user.role !== "trainer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const user = await getUserById(id);
    if (!user) return NextResponse.json({ error: "Trainee not found" }, { status: 404 });
    if (!user.isLevel0Locked) {
      return NextResponse.json(
        { error: "Trainee is already unlocked" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parsed = TestResultsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid test results", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await unlockLevel0(id, parsed.data);
    // Admin assigns a program manually after unlock
    return NextResponse.json({ success: true, unlockedToLevel: 1 });
  } catch (err) {
    console.error("[POST /api/admin/users/[id]/test-results]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
