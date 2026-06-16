import { getAllPrograms } from "@/lib/services/programService";
import { getAllTrainees } from "@/lib/services/userService";
import { ProgramsClient } from "@/components/admin/ProgramsClient";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const [programs, trainees] = await Promise.all([
    getAllPrograms(),
    getAllTrainees(),
  ]);
  return <ProgramsClient initialPrograms={programs} trainees={trainees} />;
}
