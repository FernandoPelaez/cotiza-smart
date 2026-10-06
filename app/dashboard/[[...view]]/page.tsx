import { redirect } from "next/navigation";
import { WorkspaceApp } from "@/components/workspace/WorkspaceApp";
import { getWorkspace } from "@/lib/services/workspace";
import { supabaseConfigured } from "@/lib/supabase/config";
import { ServiceError } from "@/lib/services/http";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Mi espacio",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ view?: string[] }>;
  searchParams: Promise<{ template?: string }>;
}) {
  if (!supabaseConfigured()) redirect("/login?setup=required");
  const [{ view }, { template }] = await Promise.all([params, searchParams]);
  let workspace;
  try {
    workspace = await getWorkspace();
  } catch (error) {
    if (error instanceof ServiceError && error.status === 401)
      redirect("/login");
    throw error;
  }
  return <WorkspaceApp initial={workspace} view={view} template={template} />;
}
