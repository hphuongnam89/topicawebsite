import type { ContentRevisionRecord } from "@/lib/db/types";

export const workflowStateLabels: Record<ContentRevisionRecord["workflow_state"], string> = {
  draft: "Bản nháp",
  in_review: "Chờ duyệt",
  approved: "Đã duyệt",
  published: "Đã công bố",
  archived: "Lưu trữ",
};
