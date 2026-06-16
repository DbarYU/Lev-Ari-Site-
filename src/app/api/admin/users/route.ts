import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "crypto";
import { getAllTrainees, createUser } from "@/lib/services/userService";
import { createTestingWorkout } from "@/lib/services/programService";
import { getSession } from "@/lib/session";
import { User } from "@/types";

const CreateTraineeSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  password: z.string().min(6),
  assignedTrainerId: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user || (session.user.role !== "admin" && session.user.role !== "trainer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const trainees = await getAllTrainees();
    return NextResponse.json({ trainees });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.user || (session.user.role !== "admin" && session.user.role !== "trainer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateTraineeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, displayName, password, assignedTrainerId } = parsed.data;
    const uid = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const newUser: User = {
      uid,
      email,
      passwordHash,
      plainPassword: password,
      role: "trainee",
      displayName,
      assignedTrainerId: assignedTrainerId ?? session.user.uid,
      currentLevel: 0,
      isLevel0Locked: true,
      completedWorkoutsCount: 0,
      testingWorkoutResults: {
        enteredAt: null,
        timeSeconds: 0,
        distanceMeters: 0,
        avgHeartRate: 0,
        rpe: 0,
      },
      integrations: {
        garmin: { connected: false, accessToken: null },
        strava: { connected: false, accessToken: null },
      },
      createdAt: now,
      lastActiveAt: now,
    };

    await createUser(newUser);
    await createTestingWorkout(uid);

    // Return plain password once — admin's responsibility to share it
    return NextResponse.json({
      user: { uid, email, displayName, role: "trainee" },
      temporaryPassword: password,
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
