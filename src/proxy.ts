import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { IronSessionData } from "@/types";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return res;
  }

  // Cron route — validated by secret token, not session
  if (pathname.startsWith("/api/cron")) {
    return res;
  }

  // Reset-db route — validated by x-reset-secret header inside the handler
  if (pathname.startsWith("/api/admin/reset-db")) {
    return res;
  }

  // Webhook stubs — no auth required
  if (pathname.startsWith("/api/webhooks")) {
    return res;
  }

  const session = await getIronSession<IronSessionData>(req, res, sessionOptions);

  if (!session.user) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = session.user;

  // Admin routes — only admin/trainer
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (role !== "admin" && role !== "trainer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Trainee routes — only trainee
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/workouts") || pathname.startsWith("/analytics")) {
    if (role !== "trainee") {
      return NextResponse.redirect(new URL("/admin/trainees", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
