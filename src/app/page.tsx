import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function RootPage() {
  const session = await getSession();

  if (!session.user) {
    redirect("/login");
  }

  if (session.user.role === "trainee") {
    redirect("/dashboard");
  }

  redirect("/admin/trainees");
}
