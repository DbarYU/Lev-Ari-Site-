"use client";
import { useState } from "react";
import { PublicUser } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { UserPlus, TestTube, RotateCcw, Eye, EyeOff, KeyRound, Trash2 } from "lucide-react";

interface TraineesClientProps {
  initialTrainees: PublicUser[];
}

export function TraineesClient({ initialTrainees }: TraineesClientProps) {
  const [trainees, setTrainees] = useState(initialTrainees);
  const [showCreate, setShowCreate] = useState(false);
  const [showTestResults, setShowTestResults] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [testTime, setTestTime] = useState("");
  const [testDistance, setTestDistance] = useState("");
  const [testHR, setTestHR] = useState("");
  const [testRPE, setTestRPE] = useState("");

  const [newResetPassword, setNewResetPassword] = useState("");

  async function handleCreateTrainee(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, displayName: newName, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        const created = {
          ...data.user,
          plainPassword: data.temporaryPassword,
          isLevel0Locked: true,
          currentLevel: 0,
          completedWorkoutsCount: 0,
        } as PublicUser;
        setTrainees((prev) => [...prev, created]);
        setNewEmail(""); setNewName(""); setNewPassword("");
        setShowCreate(false);
        setShowCredentials(data.user.uid);
      } else {
        alert(data.error ?? "שגיאה ביצירת מתאמן");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleTestResults(e: React.FormEvent, userId: string) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/test-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeSeconds: parseInt(testTime),
          distanceMeters: parseFloat(testDistance),
          avgHeartRate: parseInt(testHR),
          rpe: parseInt(testRPE),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTrainees((prev) =>
          prev.map((t) => t.uid === userId ? { ...t, isLevel0Locked: false, currentLevel: 1 } : t)
        );
        setShowTestResults(null);
        setTestTime(""); setTestDistance(""); setTestHR(""); setTestRPE("");
      } else {
        alert(data.error ?? "שגיאה בשמירת תוצאות");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent, userId: string) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newResetPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setTrainees((prev) =>
          prev.map((t) => t.uid === userId ? { ...t, plainPassword: newResetPassword } : t)
        );
        setShowResetPassword(null);
        setNewResetPassword("");
      } else {
        alert(data.error ?? "שגיאה בשינוי סיסמה");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTrainee(userId: string, name: string) {
    if (!confirm(`למחוק את ${name} לצמיתות? פעולה זו אינה הפיכה.`)) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setTrainees((prev) => prev.filter((t) => t.uid !== userId));
    } else {
      alert(data.error ?? "שגיאה במחיקה");
    }
  }

  async function handleReset(userId: string, name: string) {
    if (!confirm(`לאפס את ${name} לרמה 0? כל האימונים הפעילים יארכבו.`)) return;
    const res = await fetch(`/api/admin/users/${userId}/reset`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setTrainees((prev) =>
        prev.map((t) => t.uid === userId ? { ...t, currentLevel: 0, isLevel0Locked: true, completedWorkoutsCount: 0 } : t)
      );
    } else {
      alert(data.error ?? "שגיאה באיפוס");
    }
  }

  const selectedTrainee = trainees.find(
    (t) => t.uid === showTestResults || t.uid === showCredentials || t.uid === showResetPassword
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">מתאמנים</h1>
          <p className="text-sm text-gray-500 mt-1">{trainees.length} מתאמנים סה״כ</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <UserPlus className="h-4 w-4" />
          מתאמן חדש
        </Button>
      </div>

      <Card>
        {trainees.length === 0 ? (
          <p className="text-center text-gray-400 py-8">אין מתאמנים עדיין. צור מתאמן חדש להתחלה.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right pb-3 font-medium text-gray-600">שם</th>
                  <th className="text-right pb-3 font-medium text-gray-600">אימייל</th>
                  <th className="text-right pb-3 font-medium text-gray-600">סיסמה</th>
                  <th className="text-right pb-3 font-medium text-gray-600">רמה</th>
                  <th className="text-right pb-3 font-medium text-gray-600">סטטוס</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trainees.map((trainee) => (
                  <tr key={trainee.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{trainee.displayName}</td>
                    <td className="py-3 text-gray-600">{trainee.email}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-800 text-xs">
                          {revealedPasswords[trainee.uid] ? (trainee.plainPassword ?? "—") : "••••••••"}
                        </span>
                        <button
                          onClick={() => setRevealedPasswords((prev) => ({ ...prev, [trainee.uid]: !prev[trainee.uid] }))}
                          className="text-gray-400 hover:text-gray-700 transition-colors"
                          title={revealedPasswords[trainee.uid] ? "הסתר" : "הצג"}
                        >
                          {revealedPasswords[trainee.uid] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => setShowResetPassword(trainee.uid)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="שנה סיסמה"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-blue-700">רמה {trainee.currentLevel}</span>
                    </td>
                    <td className="py-3">
                      {trainee.isLevel0Locked ? (
                        <Badge variant="danger">נעול — רמה 0</Badge>
                      ) : (
                        <Badge variant="success">פעיל</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {trainee.isLevel0Locked && (
                          <Button size="sm" variant="outline" onClick={() => setShowTestResults(trainee.uid)}>
                            <TestTube className="h-3.5 w-3.5" />
                            תוצאות הערכה
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleReset(trainee.uid, trainee.displayName)} title="איפוס לרמה 0">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteTrainee(trainee.uid, trainee.displayName)} title="מחק מתאמן" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create trainee modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="יצירת מתאמן חדש">
        <form onSubmit={handleCreateTrainee} className="space-y-4">
          <Input label="שם מלא" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="ישראל ישראלי" />
          <Input label="כתובת אימייל" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="israel@example.com" />
          <Input label="סיסמה" type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="לפחות 6 תווים" minLength={6} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">צור מתאמן</Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>ביטול</Button>
          </div>
          <p className="text-xs text-gray-500">המתאמן יהיה נעול ברמה 0 עד שתזין את תוצאות אימון ההערכה.</p>
        </form>
      </Modal>

      {/* View credentials modal */}
      <Modal open={!!showCredentials} onClose={() => setShowCredentials(null)} title={`פרטי כניסה — ${selectedTrainee?.displayName ?? ""}`}>
        <div className="space-y-3">
          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">אימייל</span>
              <span className="font-medium text-gray-900">{selectedTrainee?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">סיסמה</span>
              <span className="font-mono font-medium text-gray-900">{selectedTrainee?.plainPassword}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">העבר פרטים אלה ישירות למתאמן.</p>
          <Button className="w-full" onClick={() => setShowCredentials(null)}>סגור</Button>
        </div>
      </Modal>

      {/* Reset password modal */}
      <Modal open={!!showResetPassword} onClose={() => { setShowResetPassword(null); setNewResetPassword(""); }} title={`שינוי סיסמה — ${selectedTrainee?.displayName ?? ""}`}>
        <form onSubmit={(e) => handleResetPassword(e, showResetPassword!)} className="space-y-4">
          <Input label="סיסמה חדשה" type="text" value={newResetPassword} onChange={(e) => setNewResetPassword(e.target.value)} required placeholder="לפחות 6 תווים" minLength={6} autoFocus />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">עדכן סיסמה</Button>
            <Button type="button" variant="outline" onClick={() => { setShowResetPassword(null); setNewResetPassword(""); }}>ביטול</Button>
          </div>
        </form>
      </Modal>

      {/* Test results modal */}
      <Modal open={!!showTestResults} onClose={() => setShowTestResults(null)} title={`תוצאות הערכה — ${selectedTrainee?.displayName ?? ""}`}>
        <form onSubmit={(e) => handleTestResults(e, showTestResults!)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="זמן (שניות)" type="number" value={testTime} onChange={(e) => setTestTime(e.target.value)} required placeholder="לדוגמה: 1200" min="1" />
            <Input label="מרחק (מטרים)" type="number" value={testDistance} onChange={(e) => setTestDistance(e.target.value)} required placeholder="לדוגמה: 3000" min="0" />
            <Input label="דופק ממוצע (פ/ד)" type="number" value={testHR} onChange={(e) => setTestHR(e.target.value)} required placeholder="לדוגמה: 145" min="1" />
            <Input label="מאמץ נתפס (1–10)" type="number" value={testRPE} onChange={(e) => setTestRPE(e.target.value)} required placeholder="לדוגמה: 7" min="1" max="10" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">פתח מתאמן ← רמה 1</Button>
            <Button type="button" variant="outline" onClick={() => setShowTestResults(null)}>ביטול</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
