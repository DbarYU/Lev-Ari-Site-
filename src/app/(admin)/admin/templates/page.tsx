import { getAllTemplates } from "@/lib/services/templateService";
import { TemplatesClient } from "@/components/admin/TemplatesClient";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getAllTemplates();
  return <TemplatesClient initialTemplates={templates} />;
}
