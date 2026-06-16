/**
 * Seed script — creates workout templates and programs via the live API.
 * Run while dev server is running:
 *   node scripts/seed.mjs
 *
 * Optionally target a different host:
 *   BASE_URL=https://yourapp.vercel.app node scripts/seed.mjs
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "LEVARI2026";
const CRON_SECRET = process.env.CRON_SECRET ?? "KpaS26M1GZtsVXagaQdZTwLAmmzAvDOxibPE0psLI0c=";

// ─── Workout Templates ────────────────────────────────────────────────────────
// Each entry: { name, targetLevel, type, exercises: [{name, description, sets, reps, durationSeconds}] }

const TEMPLATES = [
  // ── STRENGTH ────────────────────────────────────────────────────────────────
  {
    name: "Level 1 Strength A — Bodyweight Basics",
    targetLevel: 1, type: "strength",
    exercises: [
      { name: "Bodyweight Squat", description: "Feet shoulder-width, lower until thighs parallel.", sets: 3, reps: 12, durationSeconds: null },
      { name: "Push-Up", description: "Hands shoulder-width, lower chest to floor, press up.", sets: 3, reps: 10, durationSeconds: null },
      { name: "Glute Bridge", description: "Lie on back, feet flat, push hips up and squeeze.", sets: 3, reps: 15, durationSeconds: null },
      { name: "Plank Hold", description: "Maintain rigid plank position, core braced.", sets: 3, reps: 1, durationSeconds: 30 },
    ],
  },
  {
    name: "Level 1 Strength B — Dumbbell Intro",
    targetLevel: 1, type: "strength",
    exercises: [
      { name: "Goblet Squat", description: "Hold dumbbell at chest, squat deep keeping chest tall.", sets: 3, reps: 10, durationSeconds: null },
      { name: "Dumbbell Row", description: "Hinge at hips, row dumbbell to hip, keep back flat.", sets: 3, reps: 10, durationSeconds: null },
      { name: "Dumbbell RDL", description: "Soft knees, hinge at hip, feel hamstring stretch.", sets: 3, reps: 12, durationSeconds: null },
      { name: "Dumbbell Shoulder Press", description: "Press from shoulder height to full extension overhead.", sets: 3, reps: 10, durationSeconds: null },
    ],
  },
  {
    name: "Level 2 Strength A — Compound Lifts",
    targetLevel: 2, type: "strength",
    exercises: [
      { name: "Barbell Back Squat", description: "Bar on upper back, squat to parallel, drive through heels.", sets: 4, reps: 8, durationSeconds: null },
      { name: "Barbell Bench Press", description: "Grip slightly wider than shoulders, lower to chest.", sets: 4, reps: 8, durationSeconds: null },
      { name: "Barbell Row", description: "Hinge, pull bar to lower chest, keep back flat.", sets: 3, reps: 8, durationSeconds: null },
    ],
  },
  {
    name: "Level 2 Strength B — Posterior Chain",
    targetLevel: 2, type: "strength",
    exercises: [
      { name: "Romanian Deadlift", description: "Bar close to body, hinge deep, feel hamstrings load.", sets: 4, reps: 8, durationSeconds: null },
      { name: "Hip Thrust", description: "Shoulders on bench, drive hips to full extension.", sets: 4, reps: 10, durationSeconds: null },
      { name: "Pull-Up", description: "Dead hang start, pull chin above bar.", sets: 3, reps: 6, durationSeconds: null },
      { name: "Face Pull", description: "Cable at face height, pull to ears, externally rotate.", sets: 3, reps: 15, durationSeconds: null },
    ],
  },
  {
    name: "Level 3 Strength A — Heavy Power",
    targetLevel: 3, type: "strength",
    exercises: [
      { name: "Back Squat", description: "Work up to a heavy set of 5.", sets: 5, reps: 5, durationSeconds: null },
      { name: "Conventional Deadlift", description: "Drive through heels, bar stays close, lockout strong.", sets: 4, reps: 4, durationSeconds: null },
      { name: "Weighted Pull-Up", description: "Add load via belt, full range of motion.", sets: 4, reps: 5, durationSeconds: null },
    ],
  },
  {
    name: "Level 3 Strength B — Hypertrophy",
    targetLevel: 3, type: "strength",
    exercises: [
      { name: "Incline Dumbbell Press", description: "45° incline, press to lockout, controlled descent.", sets: 4, reps: 10, durationSeconds: null },
      { name: "Leg Press", description: "Full depth, drive through full foot.", sets: 4, reps: 12, durationSeconds: null },
      { name: "Cable Row", description: "Seated, neutral grip, pull elbows back.", sets: 4, reps: 12, durationSeconds: null },
      { name: "Nordic Curl", description: "Kneel, anchor feet, lower body under control.", sets: 3, reps: 5, durationSeconds: null },
    ],
  },

  // ── MOBILITY ─────────────────────────────────────────────────────────────────
  {
    name: "Level 1 Mobility A — Daily Reset",
    targetLevel: 1, type: "mobility",
    exercises: [
      { name: "Cat-Cow", description: "Alternate arching and rounding spine, 10 slow reps.", sets: 2, reps: 10, durationSeconds: null },
      { name: "Hip Flexor Stretch", description: "Low lunge, sink hips forward, hold.", sets: 2, reps: 1, durationSeconds: 45 },
      { name: "Thoracic Rotation", description: "Seated, arms crossed, rotate upper back.", sets: 2, reps: 10, durationSeconds: null },
      { name: "Ankle Circles", description: "Seated, draw full circles with each foot.", sets: 2, reps: 10, durationSeconds: null },
    ],
  },
  {
    name: "Level 1 Mobility B — Chest & Shoulders",
    targetLevel: 1, type: "mobility",
    exercises: [
      { name: "Chest Opener", description: "Clasp hands behind back, open chest upward.", sets: 2, reps: 1, durationSeconds: 30 },
      { name: "Doorway Stretch", description: "Forearm on doorframe, lean through.", sets: 2, reps: 1, durationSeconds: 30 },
      { name: "Shoulder Circles", description: "Large slow arm circles forward and back.", sets: 2, reps: 10, durationSeconds: null },
    ],
  },
  {
    name: "Level 2 Mobility A — Hip Opening",
    targetLevel: 2, type: "mobility",
    exercises: [
      { name: "Pigeon Pose", description: "Front shin parallel to mat, sink into hip.", sets: 2, reps: 1, durationSeconds: 60 },
      { name: "World's Greatest Stretch", description: "Lunge, reach one arm skyward, rotate.", sets: 3, reps: 5, durationSeconds: null },
      { name: "Deep Squat Hold", description: "Full depth squat, elbows pry knees open.", sets: 3, reps: 1, durationSeconds: 45 },
    ],
  },
  {
    name: "Level 3 Mobility A — Advanced Flow",
    targetLevel: 3, type: "mobility",
    exercises: [
      { name: "Cossack Squat", description: "Wide stance, shift weight side to side in deep lunge.", sets: 3, reps: 8, durationSeconds: null },
      { name: "Jefferson Curl", description: "Roll spine down vertebra by vertebra with light weight.", sets: 3, reps: 8, durationSeconds: null },
      { name: "Loaded Hip 90-90", description: "Rotate between internal/external hip rotation positions.", sets: 3, reps: 10, durationSeconds: null },
    ],
  },

  // ── RUN ──────────────────────────────────────────────────────────────────────
  {
    name: "Level 1 Run A — Easy Intro",
    targetLevel: 1, type: "run",
    exercises: [
      { name: "Walk-Run Intervals", description: "Alternate 2 min walk / 1 min jog. Focus on breathing.", sets: 1, reps: 1, durationSeconds: 1800 },
    ],
  },
  {
    name: "Level 1 Run B — Steady Jog",
    targetLevel: 1, type: "run",
    exercises: [
      { name: "Continuous Easy Jog", description: "Comfortable conversational pace for full duration.", sets: 1, reps: 1, durationSeconds: 1200 },
    ],
  },
  {
    name: "Level 2 Run A — Tempo",
    targetLevel: 2, type: "run",
    exercises: [
      { name: "Warm-Up Jog", description: "Easy pace to warm up.", sets: 1, reps: 1, durationSeconds: 600 },
      { name: "Tempo Run", description: "Comfortably hard — short sentences only. Hold pace.", sets: 1, reps: 1, durationSeconds: 1200 },
      { name: "Cool-Down Walk", description: "Easy walk to recover.", sets: 1, reps: 1, durationSeconds: 300 },
    ],
  },
  {
    name: "Level 2 Run B — Hill Repeats",
    targetLevel: 2, type: "run",
    exercises: [
      { name: "Warm-Up Jog", description: "10 min easy flat jog.", sets: 1, reps: 1, durationSeconds: 600 },
      { name: "Hill Sprint", description: "Hard effort uphill, walk back down for recovery.", sets: 6, reps: 1, durationSeconds: 60 },
    ],
  },
  {
    name: "Level 3 Run A — Long Distance",
    targetLevel: 3, type: "run",
    exercises: [
      { name: "Long Slow Distance", description: "Easy aerobic pace sustained the entire duration.", sets: 1, reps: 1, durationSeconds: 3600 },
    ],
  },
  {
    name: "Level 3 Run B — Track Intervals",
    targetLevel: 3, type: "run",
    exercises: [
      { name: "Warm-Up", description: "10 min easy jog + drills.", sets: 1, reps: 1, durationSeconds: 600 },
      { name: "400m Repeats", description: "Run 400m at 5K effort. Walk 90 sec between.", sets: 8, reps: 1, durationSeconds: 90 },
      { name: "Cool-Down", description: "10 min easy jog.", sets: 1, reps: 1, durationSeconds: 600 },
    ],
  },

  // ── CARDIO ───────────────────────────────────────────────────────────────────
  {
    name: "Level 1 Cardio A — Low Impact",
    targetLevel: 1, type: "cardio",
    exercises: [
      { name: "Stationary Bike", description: "Low resistance, comfortable cadence.", sets: 1, reps: 1, durationSeconds: 1200 },
      { name: "Step Ups", description: "Alternate legs stepping onto a box.", sets: 3, reps: 15, durationSeconds: null },
    ],
  },
  {
    name: "Level 2 Cardio A — Mixed",
    targetLevel: 2, type: "cardio",
    exercises: [
      { name: "Rowing Machine", description: "24 strokes/min, moderate resistance.", sets: 1, reps: 1, durationSeconds: 1200 },
      { name: "Box Jump", description: "Explosive jump onto box, step down controlled.", sets: 4, reps: 8, durationSeconds: null },
      { name: "Jump Rope", description: "Basic two-foot bounce, focus on rhythm.", sets: 5, reps: 1, durationSeconds: 60 },
    ],
  },
  {
    name: "Level 3 Cardio A — High Intensity",
    targetLevel: 3, type: "cardio",
    exercises: [
      { name: "Assault Bike Intervals", description: "30 sec max effort / 30 sec rest.", sets: 10, reps: 1, durationSeconds: 30 },
      { name: "Sled Push", description: "Drive hard for full distance, walk back.", sets: 5, reps: 1, durationSeconds: 20 },
    ],
  },

  // ── HIIT ─────────────────────────────────────────────────────────────────────
  {
    name: "Level 1 HIIT A — Tabata Bodyweight",
    targetLevel: 1, type: "hiit",
    exercises: [
      { name: "Jumping Jacks", description: "20 sec on / 10 sec off.", sets: 4, reps: 1, durationSeconds: 20 },
      { name: "Mountain Climbers", description: "20 sec on / 10 sec off. Drive knees to chest.", sets: 4, reps: 1, durationSeconds: 20 },
      { name: "Air Squats", description: "20 sec on / 10 sec off. Full depth.", sets: 4, reps: 1, durationSeconds: 20 },
    ],
  },
  {
    name: "Level 2 HIIT A — EMOM",
    targetLevel: 2, type: "hiit",
    exercises: [
      { name: "Burpee", description: "Every minute on the minute: 10 burpees, rest remainder.", sets: 10, reps: 10, durationSeconds: null },
      { name: "KB Swing", description: "Every minute: 15 swings, rest remainder.", sets: 5, reps: 15, durationSeconds: null },
    ],
  },
  {
    name: "Level 3 HIIT A — Complex",
    targetLevel: 3, type: "hiit",
    exercises: [
      { name: "Barbell Complex", description: "6 reps: deadlift → hang clean → front squat → press. No rest between movements.", sets: 5, reps: 6, durationSeconds: null },
      { name: "Timed Sprint", description: "100m sprint, walk back, repeat.", sets: 8, reps: 1, durationSeconds: 15 },
    ],
  },

  // ── FLEXIBILITY ──────────────────────────────────────────────────────────────
  {
    name: "Level 1 Flexibility A — Full Body",
    targetLevel: 1, type: "flexibility",
    exercises: [
      { name: "Neck Stretch", description: "Tilt ear to shoulder each side, hold.", sets: 2, reps: 1, durationSeconds: 30 },
      { name: "Chest Stretch", description: "Clasp hands, open chest.", sets: 2, reps: 1, durationSeconds: 30 },
      { name: "Seated Hamstring Stretch", description: "Legs extended, reach for toes.", sets: 2, reps: 1, durationSeconds: 45 },
      { name: "Calf Stretch", description: "Heel on ground, lean into wall.", sets: 2, reps: 1, durationSeconds: 30 },
    ],
  },
  {
    name: "Level 2 Flexibility A — Yoga Flow",
    targetLevel: 2, type: "flexibility",
    exercises: [
      { name: "Sun Salutation A", description: "10 slow rounds, sync breath to movement.", sets: 10, reps: 1, durationSeconds: 60 },
      { name: "Pigeon Pose Hold", description: "Deep hip opener, each side.", sets: 2, reps: 1, durationSeconds: 60 },
    ],
  },
  {
    name: "Level 3 Flexibility A — Deep Stretch",
    targetLevel: 3, type: "flexibility",
    exercises: [
      { name: "Full Yoga Session", description: "45-min intermediate flow: hip openers, shoulder mobility, spinal work.", sets: 1, reps: 1, durationSeconds: 2700 },
    ],
  },
];

// ─── Programs ─────────────────────────────────────────────────────────────────

const PROGRAMS = [
  {
    name: "2 Days/Week — Starter",
    description: "For beginners or very busy schedules.",
    weeklySchedule: [{ type: "strength", count: 1 }, { type: "mobility", count: 1 }],
  },
  {
    name: "3 Days/Week — Full Body",
    description: "Classic 3-day split with strength and a run.",
    weeklySchedule: [{ type: "strength", count: 2 }, { type: "run", count: 1 }],
  },
  {
    name: "3 Days/Week — Active Recovery",
    description: "Light week for deloads or return from injury.",
    weeklySchedule: [{ type: "mobility", count: 2 }, { type: "flexibility", count: 1 }],
  },
  {
    name: "4 Days/Week — Strength & Cardio",
    description: "Balanced strength and cardiovascular development.",
    weeklySchedule: [{ type: "strength", count: 2 }, { type: "cardio", count: 1 }, { type: "run", count: 1 }],
  },
  {
    name: "4 Days/Week — Endurance Focus",
    description: "For clients training toward a running goal.",
    weeklySchedule: [{ type: "run", count: 3 }, { type: "mobility", count: 1 }],
  },
  {
    name: "5 Days/Week — Performance",
    description: "High frequency for dedicated athletes.",
    weeklySchedule: [{ type: "strength", count: 3 }, { type: "run", count: 1 }, { type: "mobility", count: 1 }],
  },
  {
    name: "5 Days/Week — HIIT & Strength",
    description: "Intense conditioning combined with strength work.",
    weeklySchedule: [{ type: "strength", count: 2 }, { type: "hiit", count: 2 }, { type: "flexibility", count: 1 }],
  },
  {
    name: "6 Days/Week — Elite",
    description: "Maximum volume for advanced athletes with strong recovery.",
    weeklySchedule: [
      { type: "strength", count: 3 },
      { type: "run", count: 1 },
      { type: "cardio", count: 1 },
      { type: "mobility", count: 1 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

let sessionCookie = "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { _raw: text };
  }
  return { ok: res.ok, status: res.status, data, headers: res.headers };
}

async function resetDb() {
  console.log("🗑  Clearing existing data...");
  const { ok, data, status } = await request("/api/admin/reset-db", {
    method: "POST",
    headers: { "x-reset-secret": CRON_SECRET },
  });

  if (!ok) {
    console.log(`   ⚠️  Reset API returned ${status}: ${JSON.stringify(data)}`);
    throw new Error(`Reset failed`);
  }

  if (!data || typeof data !== "object") {
    console.log(`   ⚠️  Unexpected response: ${JSON.stringify(data)}`);
    throw new Error("Reset returned unexpected response");
  }

  const byCollection = data.byCollection ?? {};
  const deletedTotal = data.deletedTotal ?? 0;
  console.log(`   Deleted ${deletedTotal} documents total:`);
  for (const [col, count] of Object.entries(byCollection)) {
    if (count > 0) console.log(`   • ${col}: ${count}`);
  }
  if (deletedTotal === 0) console.log("   (database was already empty)");
  console.log();
}

async function login() {
  console.log("🔐 Logging in as admin...");
  const { ok, data, headers } = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "", password: ADMIN_PASSWORD }),
  });
  if (!ok) throw new Error(`Login failed: ${JSON.stringify(data)}`);
  const setCookie = headers.get("set-cookie");
  if (setCookie) sessionCookie = setCookie.split(";")[0];
  console.log("✅ Logged in\n");
}

async function seedTemplates() {
  console.log(`📋 Creating ${TEMPLATES.length} workout templates...\n`);
  for (const tmpl of TEMPLATES) {
    process.stdout.write(`  [L${tmpl.targetLevel} ${tmpl.type}] ${tmpl.name}... `);
    const { ok, data } = await request("/api/admin/templates", {
      method: "POST",
      body: JSON.stringify(tmpl),
    });
    console.log(ok ? `✅ (${tmpl.exercises.length} exercises)` : `❌ ${data.error ?? "failed"}`);
  }
  console.log();
}

async function seedPrograms() {
  console.log(`📅 Creating ${PROGRAMS.length} programs...\n`);
  for (const prog of PROGRAMS) {
    process.stdout.write(`  ${prog.name}... `);
    const { ok, data } = await request("/api/admin/programs", {
      method: "POST",
      body: JSON.stringify(prog),
    });
    if (ok) {
      const slots = prog.weeklySchedule.map((s) => `${s.count}× ${s.type}`).join(", ");
      console.log(`✅  [${slots}]`);
    } else {
      console.log(`❌  ${data.error ?? "failed"}`);
    }
  }
  console.log();
}

async function main() {
  console.log(`\n🚀 Seeding FitCoach → ${BASE_URL}\n${"─".repeat(55)}\n`);
  await resetDb();
  await login();
  await seedTemplates();
  await seedPrograms();
  console.log("─".repeat(55));
  console.log(`✅ Done! Created ${TEMPLATES.length} templates + ${PROGRAMS.length} programs.\n`);
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
