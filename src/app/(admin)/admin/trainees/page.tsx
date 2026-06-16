import { getAllTrainees } from "@/lib/services/userService";
import { TraineesClient } from "@/components/admin/TraineesClient";

export const dynamic = "force-dynamic";

export default async function TraineesPage() {
  const trainees = await getAllTrainees();
  return <TraineesClient initialTrainees={trainees} />;
}
