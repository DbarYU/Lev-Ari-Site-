import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllPrograms, createProgram } from "@/lib/services/programService";
import { getSession } from "@/lib/session";

const WORKOUT_TYPES = ["strength", "mobility", "run", "cardio", "hiit", "flexibility"] as const;

const CreateProgramSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  weeklySchedule: z.array(
    z.object({
      type: z.enum(WORKOUT_TYPES),
      count: z.number().int().min(1).max(7),
    })
  ).min(1),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user || (session.user.role !== "admin" && session.user.role !== "trainer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const programs = await getAllPrograms();
    return NextResponse.json({ programs });
  } catch (err) {
    console.error("[GET /api/admin/programs]", err);
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
    const parsed = CreateProgramSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const program = await createProgram({
      ...parsed.data,
      createdBy: session.user.uid,
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/programs]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
