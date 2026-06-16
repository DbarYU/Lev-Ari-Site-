import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getUserById, updateUser, deleteUser } from "@/lib/services/userService";
import { getSession } from "@/lib/session";

const UpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  assignedTrainerId: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.user || (session.user.role !== "admin" && session.user.role !== "trainer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const user = await getUserById(id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _ph, ...publicUser } = user;
    return NextResponse.json({ user: publicUser });
  } catch (err) {
    console.error("[GET /api/admin/users/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.user || (session.user.role !== "admin" && session.user.role !== "trainer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { newPassword, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest };
    if (newPassword) {
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
      updates.plainPassword = newPassword;
    }
    await updateUser(id, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/users/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    const { id } = await params;
    const user = await getUserById(id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/users/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
