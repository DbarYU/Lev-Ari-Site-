import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllTemplates, createTemplate } from "@/lib/services/templateService";
import { getSession } from "@/lib/session";
import { WorkoutType } from "@/types";

const WORKOUT_TYPES = ["strength", "mobility", "run", "cardio", "hiit", "flexibility"] as const;

const ExerciseSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  sets: z.number().int().min(1),
  reps: z.number().int().min(0),
  durationSeconds: z.number().nullable(),
});

const CreateTemplateSchema = z.object({
  name: z.string().min(1),
  targetLevel: z.number().int().min(1),
  type: z.enum(WORKOUT_TYPES),
  exercises: z.array(ExerciseSchema).min(1),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user || (session.user.role !== "admin" && session.user.role !== "trainer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const templates = await getAllTemplates();
    return NextResponse.json({ templates });
  } catch (err) {
    console.error("[GET /api/admin/templates]", err);
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
    const parsed = CreateTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, targetLevel, type, exercises } = parsed.data;
    const template = await createTemplate(name, targetLevel, type as WorkoutType, exercises, session.user.uid);
    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/templates]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
