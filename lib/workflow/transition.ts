import "server-only";
import { getDb, transaction } from "@/lib/db/connection";
import { canTransition, type RevisionState } from "@/lib/auth/policy";
import type { SessionUser } from "@/lib/auth/session";
import type { PublicationAction, ContentRevision } from "@/lib/db/schema";

export class WorkflowService {
  /**
   * Lấy trạng thái hiện tại của một revision
   */
  async getRevisionState(revisionId: string): Promise<RevisionState> {
    const db = getDb();
    const result = await db.query(
      `SELECT action FROM publication_events 
       WHERE revision_id = $1 
       ORDER BY occurred_at DESC LIMIT 1`,
      [revisionId],
    );
    if (result.rowCount === 0) {
      return "draft"; // Mặc định là draft nếu chưa có event nào
    }
    const action = result.rows[0].action as string;
    if (["draft", "in_review", "approved", "published", "archived"].includes(action)) {
      return action as RevisionState;
    }
    if (action === "unpublished" || action === "restored") {
      return "draft";
    }
    return "draft";
  }

  /**
   * Thực hiện chuyển đổi trạng thái (State Transition)
   */
  async transition(
    contentId: string,
    revisionId: string,
    actor: SessionUser,
    action: PublicationAction,
    reason?: string,
  ): Promise<boolean> {
    return transaction(async () => {
      const currentState = await this.getRevisionState(revisionId);

      // Determine next state based on action
      let nextState: RevisionState;
      if (["draft", "in_review", "approved", "published"].includes(action)) {
        nextState = action as RevisionState;
      } else if (action === "unpublished") {
        nextState = "draft";
      } else if (action === "expired") {
        nextState = "archived";
      } else if (action === "restored") {
        nextState = "draft";
      } else {
        throw new Error(`Unsupported action: ${action}`);
      }

      // Check permission via policy engine
      if (!canTransition(currentState, nextState, actor.role)) {
        throw new Error(
          `Forbidden: Role ${actor.role} cannot transition from ${currentState} to ${nextState}`,
        );
      }

      const db = getDb();

      // Ensure revision exists and belongs to content
      const checkRes = await db.query(
        `SELECT id FROM content_revisions WHERE id = $1 AND content_id = $2`,
        [revisionId, contentId],
      );
      if (checkRes.rowCount === 0) {
        throw new Error("Revision not found or does not belong to content item");
      }

      // Ghi log sự kiện
      await db.query(
        `INSERT INTO publication_events (content_id, revision_id, action, actor_id, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [contentId, revisionId, action, actor.id, reason || null],
      );

      // Nếu action là published, cập nhật content_items (tách draft và public)
      if (action === "published") {
        await db.query(
          `UPDATE content_items SET published_revision_id = $1, updated_at = NOW() WHERE id = $2`,
          [revisionId, contentId],
        );
      } else if (action === "unpublished") {
        await db.query(
          `UPDATE content_items SET published_revision_id = NULL, updated_at = NOW() WHERE id = $1 AND published_revision_id = $2`,
          [contentId, revisionId],
        );
      }

      return true;
    });
  }
}

export const workflowService = new WorkflowService();
