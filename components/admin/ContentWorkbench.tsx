"use client";
import { useEffect, useState } from "react";
import type { ContentRevisionRecord } from "@/lib/db/types";
import {
  contentTypes,
  contentFields,
  fieldLabels,
  numberFields,
  jsonFields,
  type ContentType,
} from "./content-fields";
const states: Record<string, string> = {
  draft: "Bản nháp",
  in_review: "Chờ duyệt",
  approved: "Đã duyệt",
  published: "Đã công bố",
  archived: "Lưu trữ",
};
const inputClass =
  "min-h-11 w-full rounded-md border border-line-200 bg-white px-3 py-2 text-ink-950 focus:outline-2 focus:outline-navy-700";
export function ContentWorkbench({ isAdmin }: { isAdmin: boolean }) {
  const [serverTime, setServerTime] = useState(0);
  const [rows, setRows] = useState<ContentRevisionRecord[]>([]),
    [type, setType] = useState<ContentType>("program"),
    [entityId, setEntityId] = useState(""),
    [title, setTitle] = useState("");
  const [values, setValues] = useState<Record<string, string>>({}),
    [base, setBase] = useState(0),
    [selected, setSelected] = useState<ContentRevisionRecord | null>(null);
  const [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [publishAt, setPublishAt] = useState(""),
    [expireAt, setExpireAt] = useState(""),
    [highlight, setHighlight] = useState(""),
    [reason, setReason] = useState("");
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function refresh() {
    const res = await fetch("/api/admin/revisions", { cache: "no-store" });
    if (!res.ok) throw new Error("Không tải được danh sách bản sửa");
    const data = await res.json();
    setRows(data.revisions);
    setServerTime(data.serverTime);
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/revisions", { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Không tải được danh sách bản sửa");
        return res.json();
      })
      .then((data) => {
        setRows(data.revisions);
        setServerTime(data.serverTime);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(String(error.message));
      });
    return () => controller.abort();
  }, []);
  function load(row: ContentRevisionRecord) {
    if (dirty) {
      setError("Hãy lưu bản nháp hoặc chọn Bỏ thay đổi trước khi chuyển bản sửa.");
      return;
    }
    const payload = JSON.parse(row.payload);
    setType(row.entity_type);
    setEntityId(row.entity_id);
    setTitle(row.title);
    setSelected(row);
    setBase(
      Math.max(
        ...rows
          .filter(
            (item) => item.entity_type === row.entity_type && item.entity_id === row.entity_id,
          )
          .map((item) => item.id),
      ),
    );
    setValues(
      Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [
          key,
          typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? ""),
        ]),
      ),
    );
    setError("");
    setNotice("");
  }
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  }
  async function response(res: Response) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Thao tác thất bại");
    return data;
  }
  async function save() {
    const payload: Record<string, unknown> = {};
    for (const key of contentFields[type])
      if (values[key]?.trim())
        payload[key] = jsonFields.has(key)
          ? JSON.parse(values[key])
          : numberFields.has(key)
            ? Number(values[key])
            : values[key];
    const data = await response(
      await fetch("/api/admin/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: type, entityId, title, payload, baseRevisionId: base }),
      }),
    );
    setDirty(false);
    setSelected(data.revision);
    setBase(data.revision.id);
    await refresh();
    setNotice("Đã lưu bản nháp. Nội dung công khai chưa thay đổi.");
  }
  async function loadExisting() {
    if (!entityId.trim()) throw new Error("Nhập mã nội dung cần tải.");
    if (dirty && Object.values(values).some(Boolean))
      throw new Error("Lưu hoặc bỏ thay đổi đang nhập trước khi tải lại.");
    const data = await response(
      await fetch(
        `/api/admin/revisions?entityType=${encodeURIComponent(type)}&entityId=${encodeURIComponent(entityId)}`,
        { cache: "no-store" },
      ),
    );
    setValues(
      Object.fromEntries(
        Object.entries(data.payload).map(([key, value]) => [
          key,
          typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? ""),
        ]),
      ),
    );
    setBase(data.baseRevisionId);
    setTitle(data.payload.title || data.payload.name || "Cập nhật nội dung");
    setSelected(null);
    setDirty(false);
    setNotice("Đã tải nội dung hiện có. Thay đổi sẽ được lưu thành bản nháp mới.");
  }
  async function transition(action: string) {
    if (!selected) return;
    if (dirty) throw new Error("Lưu bản nháp trước khi gửi duyệt hoặc công bố.");
    const utc = (value: string) =>
      value ? new Date(value + ":00+07:00").toISOString() : undefined;
    const options =
      action === "publish"
        ? { publishAt: utc(publishAt), expireAt: utc(expireAt), highlightUntil: utc(highlight) }
        : {};
    const data = await response(
      await fetch(`/api/admin/revisions/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          expectedUpdatedAt: selected.updated_at,
          reason: reason || undefined,
          ...options,
        }),
      }),
    );
    setSelected(data.revision);
    await refresh();
    setNotice("Đã cập nhật trạng thái.");
  }
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <h1 className="text-h2 font-bold text-navy-950">Nội dung & phê duyệt</h1>
      <p className="mt-2 text-ink-700">
        Lưu thay đổi thành bản nháp mới. Quản trị viên duyệt đúng bản sửa trước khi công bố; lịch
        nhập theo giờ Việt Nam.
      </p>
      {error && (
        <p role="alert" className="my-4 rounded bg-error/10 p-4 text-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="my-4 rounded bg-success/10 p-4 text-success">
          {notice}
        </p>
      )}
      <div className="mt-6 grid gap-6 xl:grid-cols-[18rem_1fr]">
        <aside aria-label="Các bản sửa" className="min-w-0 rounded-xl border bg-white p-4">
          <button
            type="button"
            className={inputClass}
            disabled={busy}
            onClick={() => {
              setDirty(false);
              setSelected(null);
              setValues({});
              setEntityId("");
              setTitle("");
              setBase(0);
              setError("");
            }}
          >
            Bỏ thay đổi / Tạo nội dung mới
          </button>
          <ul className="mt-4 max-h-[36rem] space-y-2 overflow-auto">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="min-h-11 w-full rounded border p-3 text-left hover:bg-navy-50"
                  onClick={() => load(row)}
                >
                  <span className="block font-semibold">{row.title}</span>
                  <span className="text-sm text-ink-600">
                    {contentTypes[row.entity_type]} · v{row.version} ·{" "}
                    {row.workflow_state === "published" &&
                    row.published_at &&
                    Date.parse(row.published_at) > serverTime
                      ? "Đặt lịch"
                      : states[row.workflow_state]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {!rows.length && (
            <p className="mt-4 text-ink-600">Chưa có bản sửa. Bạn có thể tạo bản nháp đầu tiên.</p>
          )}
        </aside>
        <section
          className="min-w-0 rounded-xl border bg-white p-4 sm:p-6"
          aria-label="Biên tập nội dung"
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void run(save);
            }}
          >
            <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1">
                Loại nội dung
                <select
                  value={type}
                  className={inputClass}
                  onChange={(event) => {
                    setType(event.target.value as ContentType);
                    setValues({});
                    setBase(0);
                    setSelected(null);
                    setDirty(true);
                  }}
                >
                  {Object.entries(contentTypes).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                Mã nội dung
                <input
                  required
                  maxLength={240}
                  className={inputClass}
                  value={entityId}
                  readOnly={!!selected}
                  onChange={(event) => {
                    setEntityId(event.target.value);
                    setDirty(true);
                  }}
                />
                <span className="text-xs text-ink-600">
                  Dùng mã đã có khi cập nhật; chương trình: ba, tourism, it, english, chinese.
                </span>
              </label>
              <button
                type="button"
                className="min-h-11 rounded border px-4 text-navy-900 underline sm:col-span-2"
                onClick={() => void run(loadExisting)}
              >
                Tải nội dung hiện có theo mã
              </button>
              <label className="grid gap-1 sm:col-span-2">
                Tên bản sửa
                <input
                  required
                  maxLength={240}
                  className={inputClass}
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setDirty(true);
                  }}
                />
              </label>
              {contentFields[type].map((key) => (
                <label
                  key={key}
                  className={`grid min-w-0 gap-1 ${jsonFields.has(key) || key === "content_html" ? "sm:col-span-2" : ""}`}
                >
                  {fieldLabels[key] || key}
                  {jsonFields.has(key) || key === "content_html" ? (
                    <textarea
                      rows={jsonFields.has(key) ? 4 : 10}
                      className={inputClass}
                      value={values[key] || ""}
                      onChange={(event) => {
                        setValues({ ...values, [key]: event.target.value });
                        setDirty(true);
                      }}
                    />
                  ) : (
                    <input
                      className={inputClass}
                      type={numberFields.has(key) ? "number" : "text"}
                      min={numberFields.has(key) ? 0 : undefined}
                      value={values[key] || ""}
                      onChange={(event) => {
                        setValues({ ...values, [key]: event.target.value });
                        setDirty(true);
                      }}
                    />
                  )}
                </label>
              ))}
              <button
                className="min-h-12 rounded bg-navy-950 px-4 font-semibold text-white sm:col-span-2"
                type="submit"
              >
                {busy ? "Đang xử lý…" : "Lưu thành bản nháp mới"}
              </button>
            </fieldset>
          </form>
          {selected && (
            <div className="mt-6 border-t pt-6">
              <h2 className="font-semibold">
                Bản v{selected.version} · {states[selected.workflow_state]}
              </h2>
              <button
                type="button"
                className="my-3 min-h-11 rounded border px-4 underline"
                disabled={busy || dirty}
                onClick={() =>
                  void run(async () => {
                    const data = await response(
                      await fetch(`/api/admin/revisions/${selected.id}/preview`, {
                        cache: "no-store",
                      }),
                    );
                    window.location.assign(data.url);
                  })
                }
              >
                Xem trước (hiệu lực 5 phút)
              </button>
              <label className="mb-3 grid gap-1">
                Ghi chú / lý do
                <textarea
                  className={inputClass}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
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
                      className={inputClass}
                      value={publishAt}
                      onChange={(event) => setPublishAt(event.target.value)}
                    />
                  </label>
                  <label>
                    Hết hạn
                    <input
                      type="datetime-local"
                      className={inputClass}
                      value={expireAt}
                      onChange={(event) => setExpireAt(event.target.value)}
                    />
                  </label>
                  <label>
                    Hết ưu tiên
                    <input
                      type="datetime-local"
                      className={inputClass}
                      value={highlight}
                      onChange={(event) => setHighlight(event.target.value)}
                    />
                  </label>
                </fieldset>
              )}
              <div className="flex flex-wrap gap-3">
                {(selected.workflow_state === "draft"
                  ? ["submit_review"]
                  : isAdmin && selected.workflow_state === "in_review"
                    ? ["approve", "reject"]
                    : isAdmin && selected.workflow_state === "approved"
                      ? ["publish"]
                      : isAdmin && selected.workflow_state === "published"
                        ? ["archive"]
                        : []
                ).map((action) => (
                  <button
                    key={action}
                    disabled={busy || dirty}
                    type="button"
                    className="min-h-11 rounded bg-navy-800 px-4 text-white disabled:opacity-50"
                    onClick={() => void run(() => transition(action))}
                  >
                    {
                      {
                        submit_review: "Gửi duyệt",
                        approve: "Duyệt",
                        reject: "Yêu cầu chỉnh sửa",
                        publish: "Công bố / đặt lịch",
                        archive: "Lưu trữ",
                      }[action]
                    }
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
