import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/firebase-admin";

const COLLECTIONS_TO_CLEAR = [
  "workoutTemplates",
  "programs",
  "workouts",
  "workoutHistory",
  "inactivityAlerts",
  "exerciseBuckets", // legacy, safe to clear
];

async function deleteCollection(collectionName: string): Promise<number> {
  let deleted = 0;
  let snap = await db.collection(collectionName).limit(100).get();

  while (!snap.empty) {
    const batch = db.batch();
    snap.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      batch.delete(doc.ref);
      deleted++;
    });
    await batch.commit();
    snap = await db.collection(collectionName).limit(100).get();
  }

  return deleted;
}

export async function POST(req: NextRequest) {
  try {
    // Must be admin session OR carry the CRON_SECRET header for script use
    const scriptSecret = req.headers.get("x-reset-secret");
    const isScriptAuthed = scriptSecret && scriptSecret === process.env.CRON_SECRET;

    if (!isScriptAuthed) {
      const session = await getSession();
      if (!session.user || session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const results: Record<string, number> = {};
    for (const col of COLLECTIONS_TO_CLEAR) {
      results[col] = await deleteCollection(col);
    }

    const total = Object.values(results).reduce((s, n) => s + n, 0);
    return NextResponse.json({ success: true, deletedTotal: total, byCollection: results });
  } catch (err) {
    console.error("[POST /api/admin/reset-db]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
