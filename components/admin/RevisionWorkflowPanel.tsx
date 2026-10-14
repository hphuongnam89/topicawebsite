import type { ContentRevisionRecord } from "@/lib/db/types";
import { workflowStateLabels } from "./workflow-states";

type RevisionAction = "submit_review" | "approve" | "reject" | "publish" | "archive";

const actionLabels: Record<RevisionAction, string> = {
  submit_review: "Gửi duyệt",
  approve: "Duyệt",
  reject: "Yêu cầu chỉnh sửa",
  publish: "Công bố / đặt lịch",
  archive: "Lưu trữ",
};
export function RevisionWorkflowPanel({
  selected,
  isAdmin,
  busy,
  dirty,
  reason,
  publishAt,
  expireAt,
  highlight,
  onReason,
  onPublishAt,
  onExpireAt,
  onHighlight,
  onPreview,
  onTransition,
  onApproveAndPublish,
}: {
  selected: ContentRevisionRecord;
  isAdmin: boolean;
  busy: boolean;
  dirty: boolean;
  reason: string;
  publishAt: string;
  expireAt: string;
  highlight: string;
  onReason: (value: string) => void;
  onPublishAt: (value: string) => void;
  onExpireAt: (value: string) => void;
  onHighlight: (value: string) => void;
  onPreview: () => void;
  onTransition: (action: RevisionAction) => void;
  onApproveAndPublish: () => void;
}) {
  const actions: RevisionAction[] =
    selected.workflow_state === "draft"
      ? ["submit_review"]
      : isAdmin && selected.workflow_state === "in_review"
        ? ["approve", "reject"]
        : isAdmin && selected.workflow_state === "approved"
          ? ["publish"]
          : isAdmin && selected.workflow_state === "published"
            ? ["archive"]
            : [];

  return (
    <div className="mt-6 border-t pt-6">
      <h2 className="font-semibold text-navy-950">
        Bước tiếp theo · Bản v{selected.version} · {workflowStateLabels[selected.workflow_state]}
      </h2>
      <button
        type="button"
        className="my-3 min-h-11 rounded border px-4 underline"
        disabled={busy || dirty}
        onClick={onPreview}
      >
        Xem trước (hiệu lực 5 phút)
      </button>
      <label className="mb-3 grid gap-1">
        Ghi chú / lý do
        <textarea
          className="min-h-11 w-full rounded-md border border-line-200 bg-white px-3 py-2 text-ink-950"
          value={reason}
          onChange={(event) => onReason(event.target.value)}
        />
      </label>
      {isAdmin && selected.workflow_state === "approved" && (
        <fieldset className="mb-4 grid gap-3 sm:grid-cols-3">
          <legend className="mb-2 text-sm">
            Lịch công bố — giờ Việt Nam (GMT+7); để trống để công bố ngay
          </legend>
          <label>
            Công bố
            <input
              type="datetime-local"
              className="min-h-11 w-full rounded-md border border-line-200 bg-white px-3 py-2 text-ink-950"
              value={publishAt}
              onChange={(event) => onPublishAt(event.target.value)}
            />
          </label>
          <label>
            Hết hạn
            <input
              type="datetime-local"
              className="min-h-11 w-full rounded-md border border-line-200 bg-white px-3 py-2 text-ink-950"
              value={expireAt}
              onChange={(event) => onExpireAt(event.target.value)}
            />
          </label>
          <label>
            Hết ưu tiên
            <input
              type="datetime-local"
              className="min-h-11 w-full rounded-md border border-line-200 bg-white px-3 py-2 text-ink-950"
              value={highlight}
              onChange={(event) => onHighlight(event.target.value)}
            />
          </label>
        </fieldset>
      )}
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <button
            key={action}
            disabled={busy || dirty}
            type="button"
            className="min-h-11 rounded bg-navy-800 px-4 text-white disabled:opacity-50"
            onClick={() => onTransition(action)}
          >
            {actionLabels[action]}
          </button>
        ))}
        {isAdmin && selected.workflow_state === "in_review" && (
          <button
            type="button"
            disabled={busy || dirty}
            className="min-h-11 rounded bg-navy-950 px-4 font-semibold text-white disabled:opacity-50"
            onClick={onApproveAndPublish}
          >
            Duyệt và công bố ngay
          </button>
        )}
      </div>
    </div>
  );
}
