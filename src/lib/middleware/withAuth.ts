import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { UserRole, SessionUser } from "@/types";

type Handler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>>; user: SessionUser }
) => Promise<NextResponse>;

export function withAuth(handler: Handler, allowedRoles?: UserRole[]) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const session = await getSession();

    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, { ...context, user: session.user });
  };
}
