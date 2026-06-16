import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getProgramById,
  updateProgram,
  deleteProgram,
  assignProgramToUser,
} from "@/lib/services/programService";
import { getSession } from "@/lib/session";

const UpdateProgramSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

const AssignSchema = z.object({
  action: z.literal("assign"),
  userId: z.string().min(1),
  startDate: z.string().datetime(),
});


async function checkAdmin() {
  const session = await getSession();
  if (!session.user || (session.user.role !== "admin" && session.user.role !== "trainer")) {
    return null;
  }
  return session.user;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const program = await getProgramById(id);
  if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ program });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === "assign") {
      const parsed = AssignSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid request", details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const workouts = await assignProgramToUser(
        id,
        parsed.data.userId,
        new Date(parsed.data.startDate)
      );
      return NextResponse.json({ workouts });
    }

    const parsed = UpdateProgramSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    await updateProgram(id, parsed.data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/admin/programs/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { id } = await params;
  await deleteProgram(id);
  return NextResponse.json({ success: true });
}
