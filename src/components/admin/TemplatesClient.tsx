"use client";
import { useState } from "react";
import { WorkoutTemplate, WorkoutType, TemplateExercise } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, ChevronDown, ChevronUp, Dumbbell, Trash2, Layers } from "lucide-react";

interface TemplatesClientProps {
  initialTemplates: WorkoutTemplate[];
}

const WORKOUT_TYPES: WorkoutType[] = ["strength", "mobility", "run", "cardio", "hiit", "flexibility"];

const typeColors: Record<WorkoutType, "info" | "success" | "warning" | "default" | "danger"> = {
  strength: "success",
  mobility: "warning",
  run: "info",
  cardio: "info",
  hiit: "danger",
  flexibility: "default",
};

export function TemplatesClient({ initialTemplates }: TemplatesClientProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddExercise, setShowAddExercise] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Create form
  const [tName, setTName] = useState("");
  const [tLevel, setTLevel] = useState("1");
  const [tType, setTType] = useState<WorkoutType>("strength");
  const [tExercises, setTExercises] = useState<Omit<TemplateExercise, "exerciseId">[]>([
    { name: "", description: "", sets: 3, reps: 10, durationSeconds: null },
  ]);

  // Add exercise to existing template
  const [exName, setExName] = useState("");
  const [exDesc, setExDesc] = useState("");
  const [exSets, setExSets] = useState("3");
  const [exReps, setExReps] = useState("10");
  const [exDuration, setExDuration] = useState("");

  function addCreateRow() {
    setTExercises((prev) => [...prev, { name: "", description: "", sets: 3, reps: 10, durationSeconds: null }]);
  }

  function removeCreateRow(i: number) {
    setTExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateCreateRow(i: number, field: keyof Omit<TemplateExercise, "exerciseId">, value: string | number | null) {
    setTExercises((prev) =>
      prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex)
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const validExercises = tExercises.filter((ex) => ex.name.trim());
    if (validExercises.length === 0) {
      alert("Add at least one exercise.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tName,
          targetLevel: parseInt(tLevel),
          type: tType,
          exercises: validExercises,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTemplates((prev) => [data.template, ...prev]);
        setTName(""); setTLevel("1"); setTType("strength");
        setTExercises([{ name: "", description: "", sets: 3, reps: 10, durationSeconds: null }]);
        setShowCreate(false);
      } else {
        alert(data.error ?? "Failed to create template");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!showAddExercise) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/templates/${showAddExercise}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addExercise",
          exercise: {
            name: exName,
            description: exDesc,
            sets: parseInt(exSets),
            reps: parseInt(exReps),
            durationSeconds: exDuration ? parseInt(exDuration) : null,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.templateId === showAddExercise
              ? { ...t, exercises: [...t.exercises, data.exercise] }
              : t
          )
        );
        setExName(""); setExDesc(""); setExSets("3"); setExReps("10"); setExDuration("");
        setShowAddExercise(null);
      } else {
        alert(data.error ?? "Failed to add exercise");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveExercise(templateId: string, exerciseId: string) {
    const res = await fetch(`/api/admin/templates/${templateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "removeExercise", exerciseId }),
    });
    if (res.ok) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.templateId === templateId
            ? { ...t, exercises: t.exercises.filter((ex) => ex.exerciseId !== exerciseId) }
            : t
        )
      );
    }
  }

  async function handleDelete(templateId: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/templates/${templateId}`, { method: "DELETE" });
    if (res.ok) {
      setTemplates((prev) => prev.filter((t) => t.templateId !== templateId));
      if (expanded === templateId) setExpanded(null);
    }
  }

  // Group by level then type
  const grouped = templates.reduce<Record<number, Record<string, WorkoutTemplate[]>>>((acc, t) => {
    (acc[t.targetLevel] ??= {});
    (acc[t.targetLevel][t.type] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pre-built workouts assigned when a program is applied to a client. Multiple templates per level + type are randomly selected.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <p className="text-center text-gray-400 py-8">No workout templates yet. Create one to start building programs.</p>
        </Card>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([level, byType]) => (
            <div key={level} className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Level {level}</h2>
              {Object.entries(byType).map(([type, typeTemplates]) => (
                <div key={type} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={typeColors[type as WorkoutType]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                    <span className="text-xs text-gray-400">{typeTemplates.length} template{typeTemplates.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {typeTemplates.map((template) => (
                      <Card key={template.templateId}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2">
                            <Layers className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                            <span className="font-medium text-gray-900 text-sm">{template.name}</span>
                          </div>
                          <button
                            onClick={() => handleDelete(template.templateId, template.name)}
                            className="text-gray-300 hover:text-red-500 transition-colors shrink-0 ml-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => setExpanded(expanded === template.templateId ? null : template.templateId)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2"
                        >
                          {expanded === template.templateId ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {template.exercises.length} exercise{template.exercises.length !== 1 ? "s" : ""}
                        </button>

                        {expanded === template.templateId && (
                          <ul className="space-y-1.5 mb-3 border-t border-gray-100 pt-2">
                            {template.exercises.map((ex) => (
                              <li key={ex.exerciseId} className="flex items-center gap-2 text-xs group">
                                <Dumbbell className="h-3 w-3 text-gray-400 shrink-0" />
                                <span className="font-medium text-gray-800 flex-1">{ex.name}</span>
                                <span className="text-gray-400">
                                  {ex.durationSeconds
                                    ? `${ex.durationSeconds}s`
                                    : `${ex.sets}×${ex.reps}`}
                                </span>
                                <button
                                  onClick={() => handleRemoveExercise(template.templateId, ex.exerciseId)}
                                  className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowAddExercise(template.templateId)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Exercise
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
      )}

      {/* Create template modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Workout Template">
        <form onSubmit={handleCreate} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Input
            label="Template Name"
            value={tName}
            onChange={(e) => setTName(e.target.value)}
            required
            placeholder="e.g. Level 1 Strength A"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Level"
              type="number"
              value={tLevel}
              onChange={(e) => setTLevel(e.target.value)}
              required
              min="1"
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tType}
                onChange={(e) => setTType(e.target.value as WorkoutType)}
              >
                {WORKOUT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exercise list */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Exercises</label>
            <div className="space-y-3">
              {tExercises.map((ex, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Exercise {i + 1}</span>
                    {tExercises.length > 1 && (
                      <button type="button" onClick={() => removeCreateRow(i)} className="text-gray-300 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Exercise name *"
                    value={ex.name}
                    onChange={(e) => updateCreateRow(i, "name", e.target.value)}
                    required
                  />
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Instructions (optional)"
                    value={ex.description}
                    onChange={(e) => updateCreateRow(i, "description", e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input label="Sets" type="number" value={ex.sets} onChange={(e) => updateCreateRow(i, "sets", parseInt(e.target.value) || 1)} min="1" />
                    <Input label="Reps" type="number" value={ex.reps} onChange={(e) => updateCreateRow(i, "reps", parseInt(e.target.value) || 0)} min="0" />
                    <Input label="Duration (s)" type="number" value={ex.durationSeconds ?? ""} onChange={(e) => updateCreateRow(i, "durationSeconds", e.target.value ? parseInt(e.target.value) : null)} placeholder="opt." min="1" />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCreateRow}
              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add exercise
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">Create Template</Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Add exercise to existing template */}
      <Modal
        open={!!showAddExercise}
        onClose={() => setShowAddExercise(null)}
        title="Add Exercise to Template"
      >
        <form onSubmit={handleAddExercise} className="space-y-4">
          <Input label="Exercise Name" value={exName} onChange={(e) => setExName(e.target.value)} required placeholder="e.g. Barbell Squat" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Instructions <span className="text-gray-400">(optional)</span></label>
            <textarea
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={exDesc}
              onChange={(e) => setExDesc(e.target.value)}
              rows={2}
              placeholder="How to perform this exercise..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Sets" type="number" value={exSets} onChange={(e) => setExSets(e.target.value)} required min="1" />
            <Input label="Reps" type="number" value={exReps} onChange={(e) => setExReps(e.target.value)} required min="0" />
            <Input label="Duration (s)" type="number" value={exDuration} onChange={(e) => setExDuration(e.target.value)} placeholder="optional" min="1" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">Add Exercise</Button>
            <Button type="button" variant="outline" onClick={() => setShowAddExercise(null)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
