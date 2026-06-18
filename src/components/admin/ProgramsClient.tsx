"use client";
import { useState } from "react";
import { Program, PublicUser, WeeklySlot, WorkoutType } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, BookOpen, UserCheck, Trash2, X } from "lucide-react";

interface ProgramsClientProps {
  initialPrograms: Program[];
  trainees: PublicUser[];
}

const WORKOUT_TYPES: WorkoutType[] = ["strength", "mobility", "run", "cardio", "hiit", "flexibility"];

const TYPE_LABELS: Record<WorkoutType, string> = {
  strength: "כוח",
  mobility: "ניידות",
  run: "ריצה",
  cardio: "קרדיו",
  hiit: "HIIT",
  flexibility: "גמישות",
};

const typeColors: Record<WorkoutType, "info" | "success" | "warning" | "default" | "danger"> = {
  strength: "success",
  mobility: "warning",
  run: "info",
  cardio: "info",
  hiit: "danger",
  flexibility: "default",
};

export function ProgramsClient({ initialPrograms, trainees }: ProgramsClientProps) {
  const [programs, setPrograms] = useState(initialPrograms);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySlot[]>([{ type: "strength", count: 2 }]);

  const [assignUserId, setAssignUserId] = useState("");
  const [assignStartDate, setAssignStartDate] = useState(new Date().toISOString().slice(0, 10));

  function addSlot() {
    setWeeklySchedule((prev) => [...prev, { type: "run", count: 1 }]);
  }

  function removeSlot(index: number) {
    setWeeklySchedule((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: keyof WeeklySlot, value: string | number) {
    setWeeklySchedule((prev) =>
      prev.map((slot, i) => i === index ? { ...slot, [field]: field === "count" ? Number(value) : value } : slot)
    );
  }

  const totalSessionsPerWeek = weeklySchedule.reduce((sum, s) => sum + s.count, 0);

  async function handleCreateProgram(e: React.FormEvent) {
    e.preventDefault();
    if (weeklySchedule.length === 0) { alert("הוסף לפחות סוג אימון אחד ללוח השבועי."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: pName, description: pDesc, weeklySchedule }),
      });
      const data = await res.json();
      if (res.ok) {
        setPrograms((prev) => [data.program, ...prev]);
        setPName(""); setPDesc(""); setWeeklySchedule([{ type: "strength", count: 2 }]);
        setShowCreate(false);
      } else {
        alert(data.error ?? "שגיאה ביצירת תוכנית");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(e: React.FormEvent, programId: string) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/programs/${programId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", userId: assignUserId, startDate: new Date(assignStartDate).toISOString() }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`שויחו ${data.workouts.length} אימונים בהצלחה!`);
        setShowAssign(null);
        setAssignUserId("");
      } else {
        alert(data.error ?? "שגיאה בשיוך תוכנית");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProgram(programId: string, programName: string) {
    if (!confirm(`למחוק את "${programName}"? פעולה זו אינה הפיכה.`)) return;
    const res = await fetch(`/api/admin/programs/${programId}`, { method: "DELETE" });
    if (res.ok) {
      setPrograms((prev) => prev.filter((p) => p.programId !== programId));
    } else {
      const data = await res.json();
      alert(data.error ?? "שגיאה במחיקה");
    }
  }

  const selectedProgram = programs.find((p) => p.programId === showAssign);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">תוכניות</h1>
          <p className="text-sm text-gray-500 mt-1">תבניות שבועיות. תרגילים נבחרים אקראית מרמת המתאמן בעת השיוך.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          תוכנית חדשה
        </Button>
      </div>

      {programs.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400 py-8">אין תוכניות עדיין. צור תוכנית להתחלת שיוך אימונים.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const totalSessions = program.weeklySchedule.reduce((s, sl) => s + sl.count, 0);
            return (
              <Card key={program.programId}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 shrink-0">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{program.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{totalSessions} אימונים/שבוע</p>
                  </div>
                  <button onClick={() => handleDeleteProgram(program.programId, program.name)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0" title="מחק תוכנית">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {program.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{program.description}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {program.weeklySchedule.map((slot, i) => (
                    <span key={i} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      slot.type === "strength" ? "bg-green-100 text-green-700" :
                      slot.type === "run" || slot.type === "cardio" ? "bg-blue-100 text-blue-700" :
                      slot.type === "hiit" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {slot.count}× {TYPE_LABELS[slot.type]}
                    </span>
                  ))}
                </div>

                <Button size="sm" variant="outline" className="w-full" onClick={() => { setShowAssign(program.programId); setAssignUserId(""); }}>
                  <UserCheck className="h-3.5 w-3.5" />
                  שייך למתאמן
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create program modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="יצירת תוכנית חדשה">
        <form onSubmit={handleCreateProgram} className="space-y-5">
          <Input label="שם התוכנית" value={pName} onChange={(e) => setPName(e.target.value)} required placeholder="לדוגמה: 3 ימים/שבוע — כוח ובריאות" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">תיאור <span className="text-gray-400">(אופציונלי)</span></label>
            <textarea className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={2} placeholder="למי מיועדת התוכנית?" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">לוח שבועי</label>
              <span className="text-xs text-gray-400">{totalSessionsPerWeek} אימונים/שבוע</span>
            </div>
            <div className="space-y-2">
              {weeklySchedule.map((slot, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={slot.type} onChange={(e) => updateSlot(i, "type", e.target.value)}>
                    {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => updateSlot(i, "count", Math.max(1, slot.count - 1))} className="h-8 w-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center text-lg font-medium">−</button>
                    <span className="w-6 text-center text-sm font-semibold text-gray-800">{slot.count}</span>
                    <button type="button" onClick={() => updateSlot(i, "count", Math.min(7, slot.count + 1))} className="h-8 w-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center text-lg font-medium">+</button>
                  </div>
                  <button type="button" onClick={() => removeSlot(i)} className="text-gray-300 hover:text-red-500 transition-colors"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addSlot} className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <Plus className="h-3.5 w-3.5" />
              הוסף סוג אימון
            </button>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={loading} className="flex-1">צור תוכנית</Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>ביטול</Button>
          </div>
        </form>
      </Modal>

      {/* Assign modal */}
      <Modal open={!!showAssign} onClose={() => setShowAssign(null)} title={`שיוך — ${selectedProgram?.name ?? ""}`}>
        <form onSubmit={(e) => handleAssign(e, showAssign!)} className="space-y-4">
          {selectedProgram && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-2">תרגילים ייבחרו אקראית מרמת המתאמן עבור כל סוג אימון:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedProgram.weeklySchedule.map((slot, i) => (
                  <Badge key={i} variant={typeColors[slot.type]}>{slot.count}× {TYPE_LABELS[slot.type]}</Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">בחר מתאמן</label>
            <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} required>
              <option value="">בחר מתאמן...</option>
              {trainees.map((t) => (
                <option key={t.uid} value={t.uid}>{t.displayName} — רמה {t.currentLevel}</option>
              ))}
            </select>
          </div>
          <Input label="תאריך התחלה" type="date" value={assignStartDate} onChange={(e) => setAssignStartDate(e.target.value)} required />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">שייך תוכנית</Button>
            <Button type="button" variant="outline" onClick={() => setShowAssign(null)}>ביטול</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
