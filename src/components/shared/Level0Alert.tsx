import { AlertTriangle } from "lucide-react";

export function Level0Alert() {
  return (
    <div className="rounded-xl border-2 border-red-400 bg-red-50 p-6 flex gap-4 items-start">
      <AlertTriangle className="h-7 w-7 text-red-500 shrink-0 mt-0.5" />
      <div>
        <h2 className="text-lg font-bold text-red-700">החשבון נעול — רמה 0 (הצטרפות)</h2>
        <p className="mt-1 text-sm text-red-600">
          החשבון שלך נעול בהמתנה לאימון הערכה ראשוני. אנא השלם את אימון ההערכה המוקצה,
          והמאמן שלך יזין את התוצאות ויפתח את החשבון כדי שתוכל להתחיל את תוכנית האימון שלך.
        </p>
        <p className="mt-2 text-xs text-red-500 font-medium">
          פנה למאמן שלך אם אימון ההערכה אינו מופיע למטה.
        </p>
      </div>
    </div>
  );
}
