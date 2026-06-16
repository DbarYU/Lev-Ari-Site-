"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, LayoutDashboard, LineChart, Users, Layers, BookOpen, LogOut, ClipboardList } from "lucide-react";
import { SessionUser } from "@/types";

interface NavBarProps {
  user: SessionUser;
}

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const traineeLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/workouts", label: "Workouts", icon: Dumbbell },
    { href: "/analytics", label: "Progress", icon: LineChart },
  ];

  const adminLinks = [
    { href: "/admin/trainees", label: "Trainees", icon: Users },
    { href: "/admin/templates", label: "Workout Templates", icon: ClipboardList },
    { href: "/admin/programs", label: "Programs", icon: BookOpen },
  ];

  const links = user.role === "trainee" ? traineeLinks : adminLinks;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <Dumbbell className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-bold text-gray-900">FitCoach</span>
      </div>

      <div className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-gray-900 truncate">{user.displayName}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </nav>
  );
}
