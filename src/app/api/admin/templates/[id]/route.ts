import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteTemplate,
  addExerciseToTemplate,
  removeExerciseFromTemplate,
  updateTemplate,
} from "@/lib/services/templateService";
import { getSession } from "@/lib/session";

const AddExerciseSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  sets: z.number().int().min(1),
  reps: z.number().int().min(0),
  durationSeconds: z.number().nullable(),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session.user || (session.user.role !== "admin" && session.user.role !== "trainer")) {
    return null;
  }
  return session.user;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === "addExercise") {
      const parsed = AddExerciseSchema.safeParse(body.exercise);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid exercise", details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const exercise = await addExerciseToTemplate(id, parsed.data);
      return NextResponse.json({ exercise });
    }

    if (body.action === "removeExercise") {
      if (!body.exerciseId) {
        return NextResponse.json({ error: "exerciseId required" }, { status: 400 });
      }
      await removeExerciseFromTemplate(id, body.exerciseId);
      return NextResponse.json({ success: true });
    }

    if (body.action === "rename") {
      if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
      await updateTemplate(id, { name: body.name });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[PUT /api/admin/templates/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await deleteTemplate(id);
  return NextResponse.json({ success: true });
}
