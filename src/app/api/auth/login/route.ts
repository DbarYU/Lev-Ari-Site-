import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getUserByEmail } from "@/lib/services/userService";
import { getSession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.string(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Admin login — password-only, checked against env variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && password === adminPassword) {
      const session = await getSession();
      session.user = {
        uid: "admin",
        email: "admin",
        role: "admin",
        displayName: "Admin",
      };
      await session.save();
      return NextResponse.json({
        user: { uid: "admin", email: "admin", role: "admin", displayName: "Admin" },
      });
    }

    // Trainee login — looked up in Firestore by email
    const user = await getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.user = {
      uid: user.uid,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    };
    await session.save();

    return NextResponse.json({
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        currentLevel: user.currentLevel,
        isLevel0Locked: user.isLevel0Locked,
      },
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
