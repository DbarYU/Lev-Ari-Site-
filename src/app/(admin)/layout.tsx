import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { NavBar } from "@/components/shared/NavBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.user) redirect("/login");
  if (session.user.role === "trainee") redirect("/dashboard");

  return (
    <div className="flex h-screen bg-gray-50">
      <NavBar user={session.user} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
