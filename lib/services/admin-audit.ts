import "server-only";
import { recordAuditLog } from "@/lib/services/cms-models";

export interface AdminAuditActor {
  id: string;
  name: string;
}

export function recordAdminAudit(
  actor: AdminAuditActor,
  action: "create" | "update" | "delete",
  entityType: string,
  entityId: string,
  changedFields: string[],
  reason?: string,
) {
  recordAuditLog({
    actor_id: actor.id,
    actor_name: actor.name,
    action,
    entity_type: entityType,
    entity_id: entityId,
    changed_fields: JSON.stringify([...new Set(changedFields)]),
    reason: reason ?? null,
  });
}
