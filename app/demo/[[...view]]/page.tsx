import { notFound } from "next/navigation";
import { demoWorkspace } from "@/lib/demo/seed";
import { demoEnabled } from "@/lib/supabase/config";
import { WorkspaceApp } from "@/components/workspace/WorkspaceApp";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Demostración",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ view?: string[] }>;
  searchParams: Promise<{ template?: string }>;
}) {
  if (!demoEnabled()) notFound();
  const [{ view }, { template }] = await Promise.all([params, searchParams]);
  return (
    <WorkspaceApp initial={demoWorkspace()} view={view} template={template} />
  );
}
