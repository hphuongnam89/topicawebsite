import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ContentWorkbench } from "@/components/admin/ContentWorkbench";
export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; entityId?: string; workflowState?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  const params = await searchParams;
  const types = [
    "program",
    "admission_round",
    "tuition_policy",
    "scholarship",
    "document",
    "organization",
    "article",
    "page",
  ] as const;
  const initialEntityType = types.includes(params.entityType as (typeof types)[number])
    ? (params.entityType as (typeof types)[number])
    : undefined;
  const workflowStates = ["draft", "in_review", "approved", "published", "archived"] as const;
  const initialListState = workflowStates.includes(
    params.workflowState as (typeof workflowStates)[number],
  )
    ? params.workflowState
    : undefined;
  return (
    <ContentWorkbench
      key={`${initialEntityType ?? "new"}:${params.entityId ?? ""}`}
      isAdmin={user.role === "admin"}
      initialEntityType={initialEntityType}
      initialEntityId={params.entityId}
      initialListType={initialEntityType}
      initialListState={initialListState}
    />
  );
}
