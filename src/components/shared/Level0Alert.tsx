import { AlertTriangle } from "lucide-react";

export function Level0Alert() {
  return (
    <div className="rounded-xl border-2 border-red-400 bg-red-50 p-6 flex gap-4 items-start">
      <AlertTriangle className="h-7 w-7 text-red-500 shrink-0 mt-0.5" />
      <div>
        <h2 className="text-lg font-bold text-red-700">Account Locked — Level 0 Onboarding</h2>
        <p className="mt-1 text-sm text-red-600">
          Your account is currently locked pending your baseline testing workout. Please complete
          the assigned testing workout and your coach will review the results and unlock your
          account to begin your training program.
        </p>
        <p className="mt-2 text-xs text-red-500 font-medium">
          Contact your coach if your testing workout is not visible below.
        </p>
      </div>
    </div>
  );
}
