"use client";
import { useEffect, useState } from "react";
import type { ContentRevisionRecord } from "@/lib/db/types";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  FolderOpen,
  X,
  RefreshCw,
} from "lucide-react";
import {
  contentTypes,
  contentFields,
  fieldLabels,
  numberFields,
  jsonFields,
  getEditableFieldValue,
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
const dateTimeFields = new Set([
  "open_at",
  "deadline_at",
  "start_at",
  "effective_from",
  "effective_to",
]);
const dateOnlyFields = new Set(["published_date"]);
function parseObject(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function parseArray(value: string): Array<Record<string, unknown>> {
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === "object" && !Array.isArray(item),
        )
      : [];
  } catch {
    return [];
  }
}
function articleContentId(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 240);
}

function RepeatableObjectEditor({
  value,
  onChange,
  fields,
  addLabel,
  emptyItem,
}: {
  value: string;
  onChange: (next: string) => void;
  fields: Array<{ key: string; label: string; placeholder?: string }>;
  addLabel: string;
  emptyItem: Record<string, string>;
}) {
  const items = parseArray(value);
  const update = (index: number, key: string, nextValue: string) => {
    const next = items.map((item) => ({ ...item }));
    next[index] = { ...next[index], [key]: nextValue };
    onChange(JSON.stringify(next, null, 2));
  };
  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <fieldset
          key={index}
          className="grid gap-2 rounded-md border border-line-200 p-3 sm:grid-cols-2"
        >
          <legend className="px-1 text-xs font-semibold text-ink-600">Mục {index + 1}</legend>
          {fields.map((field) => (
            <label key={field.key} className="grid gap-1 text-sm">
              {field.label}
              <input
                className={inputClass}
                value={String(item[field.key] ?? "")}
                placeholder={field.placeholder}
                onChange={(event) => update(index, field.key, event.target.value)}
              />
            </label>
          ))}
          <button
            type="button"
            className="min-h-11 justify-self-start rounded-md border border-line-200 px-3 text-sm text-red-800 hover:bg-red-50 sm:col-span-2"
            onClick={() =>
              onChange(
                JSON.stringify(
                  items.filter((_, itemIndex) => itemIndex !== index),
                  null,
                  2,
                ),
              )
            }
          >
            Xóa mục
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="hover:bg-surface-50 min-h-11 justify-self-start rounded-md border border-line-200 px-3 text-sm font-medium"
        onClick={() => onChange(JSON.stringify([...items, emptyItem], null, 2))}
      >
        + {addLabel}
      </button>
      <span className="text-xs text-ink-500">
        Các thay đổi chỉ lưu vào bản nháp cho đến khi được duyệt và công bố.
      </span>
    </div>
  );
}

function StringListEditor({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
}) {
  let items: unknown[] = [];
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    if (Array.isArray(parsed)) items = parsed;
  } catch {
    items = value ? value.split(/\r?\n/) : [];
  }
  return (
    <div className="grid gap-2">
      <textarea
        rows={4}
        className={inputClass}
        value={items.map((item) => String(item ?? "")).join("\n")}
        onChange={(event) =>
          onChange(
            JSON.stringify(
              event.target.value
                .split(/\r?\n/)
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          )
        }
        aria-label={label}
      />
      <span className="text-xs text-ink-500">
        Mỗi mục một dòng. Để trống để xóa toàn bộ danh sách.
      </span>
    </div>
  );
}

function ScalarObjectEditor({
  value,
  onChange,
  label,
  numeric = false,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  numeric?: boolean;
}) {
  const fields = Object.entries(parseObject(value));
  const rows = fields.length ? fields : [["", ""] as [string, unknown]];
  const update = (index: number, nextKey: string, nextValue: unknown) => {
    const next = Object.fromEntries(fields);
    const oldKey = rows[index]?.[0] ?? "";
    const oldValue = rows[index]?.[1] ?? "";
    if (oldKey) delete next[oldKey];
    const key = nextKey.trim();
    if (key && nextValue !== "") next[key] = nextValue;
    else if (key && oldValue !== "") next[key] = oldValue;
    onChange(JSON.stringify(next, null, 2));
  };
  return (
    <div className="grid gap-2">
      {rows.map(([key, rawValue], index) => (
        <div
          key={`${index}:${key}`}
          className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <input
            className={inputClass}
            value={key}
            placeholder={numeric ? "Mã khoản phí" : "Tên dịch vụ"}
            aria-label={`${label} · tên mục ${index + 1}`}
            onChange={(event) => update(index, event.target.value, rawValue)}
          />
          <input
            className={inputClass}
            type={numeric ? "number" : "url"}
            min={numeric ? 0 : undefined}
            value={String(rawValue ?? "")}
            placeholder={numeric ? "Số tiền (VNĐ)" : "https://…"}
            aria-label={`${label} · giá trị ${index + 1}`}
            onChange={(event) =>
              update(
                index,
                key,
                numeric && event.target.value ? Number(event.target.value) : event.target.value,
              )
            }
          />
          <button
            type="button"
            className="min-h-11 rounded border border-line-200 px-3 text-sm text-ink-700 hover:bg-paper"
            aria-label={`Xóa ${label} ${index + 1}`}
            onClick={() => {
              const next = Object.fromEntries(fields);
              if (key) delete next[key];
              onChange(JSON.stringify(next, null, 2));
            }}
          >
            Xóa
          </button>
        </div>
      ))}
      <button
        type="button"
        className="min-h-10 justify-self-start rounded border border-line-200 px-3 text-sm font-semibold text-navy-900 hover:bg-paper"
        onClick={() => {
          const next = Object.fromEntries(fields);
          let suffix = fields.length + 1;
          let key = numeric ? `Khoản phí ${suffix}` : `Dịch vụ ${suffix}`;
          while (Object.hasOwn(next, key)) key = `${numeric ? "Khoản phí" : "Dịch vụ"} ${++suffix}`;
          next[key] = numeric ? 0 : "";
          onChange(JSON.stringify(next, null, 2));
        }}
      >
        + Thêm mục
      </button>
    </div>
  );
}

function DurationEditor({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const current = parseObject(value);
  const update = (field: string, rawValue: string) => {
    const next = { ...current };
    if (!rawValue) delete next[field];
    else next[field] = Number(rawValue);
    onChange(JSON.stringify(next, null, 2));
  };
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        ["credits", "Tổng tín chỉ", true],
        ["semesters", "Số học kỳ", true],
        ["estimatedMonths", "Số tháng dự kiến", false],
      ].map(([field, label, required]) => (
        <label key={String(field)} className="grid gap-1 text-sm">
          {String(label)}
          <input
            className={inputClass}
            type="number"
            min={1}
            required={Boolean(required)}
            value={String(current[String(field)] ?? "")}
            onChange={(event) => update(String(field), event.target.value)}
          />
        </label>
      ))}
      {Array.isArray(current.tracks) && (
        <p className="text-xs text-ink-500 sm:col-span-3">
          Bản xem trước giữ nguyên {current.tracks.length} lộ trình đối tượng từ dữ liệu đã tải.
          Chỉnh cấu hình lộ trình chi tiết trong trường JSON nâng cao.
        </p>
      )}
    </div>
  );
}

function ServiceUrlsEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const current = parseObject(value);
  const fields = [
    ["library", "Thư viện số"],
    ["lms", "Cổng Elearning"],
    ["assessment", "Hệ thống khảo thí"],
    ["application", "Cổng xét tuyển"],
    ["status", "Trang trạng thái"],
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {fields.map(([field, label]) => (
        <label key={field} className="grid gap-1 text-sm">
          {label}
          <input
            className={inputClass}
            type="text"
            value={String(current[field] ?? "")}
            onChange={(event) =>
              onChange(JSON.stringify({ ...current, [field]: event.target.value }, null, 2))
            }
          />
        </label>
      ))}
    </div>
  );
}

function CurriculumJsonEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [formatError, setFormatError] = useState<string | null>(null);

  const format = () => {
    try {
      const parsed = JSON.parse(value || "[]");
      onChange(JSON.stringify(parsed, null, 2));
      setFormatError(null);
    } catch (e: any) {
      setFormatError("Lỗi JSON: " + (e?.message || "Cú pháp không hợp lệ"));
    }
  };

  const insertSample = () => {
    const sample = [
      {
        id: "term-1",
        name: "Học kỳ 1",
        credits: 14,
        phase: "Nền tảng cơ bản",
        courses: [
          { code: "GEN.101", name: "Nhập môn ngành", credits: 2, requirement: "Bắt buộc" },
          { code: "GEN.102", name: "Tin học ứng dụng", credits: 3, requirement: "Bắt buộc" },
          { code: "ENG.101", name: "Ngoại ngữ 1", credits: 3, requirement: "Bắt buộc" },
          { code: "LAW.101", name: "Pháp luật đại cương", credits: 3, requirement: "Bắt buộc" },
          { code: "POL.101", name: "Triết học Mác-Lênin", credits: 3, requirement: "Bắt buộc" },
        ],
      },
      {
        id: "term-2",
        name: "Học kỳ 2",
        credits: 15,
        phase: "Cơ sở chuyên ngành",
        courses: [
          { code: "ENG.102", name: "Ngoại ngữ 2", credits: 3, requirement: "Bắt buộc" },
          { code: "MAJ.201", name: "Cơ sở chuyên ngành 1", credits: 3, requirement: "Bắt buộc" },
          { code: "MAJ.202", name: "Cơ sở chuyên ngành 2", credits: 3, requirement: "Bắt buộc" },
          { code: "MAJ.203", name: "Kỹ năng chuyên môn", credits: 3, requirement: "Bắt buộc" },
          { code: "POL.102", name: "Kinh tế chính trị Mác-Lênin", credits: 3, requirement: "Bắt buộc" },
        ],
      },
    ];
    onChange(JSON.stringify(sample, null, 2));
    setFormatError(null);
  };

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-ink-600">
          Danh mục học phần theo từng học kỳ. Có thể dán trực tiếp JSON từ khung chương trình đào tạo.
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={format}
            className="rounded border border-line-200 bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-slate-50"
          >
            Định dạng JSON
          </button>
          {(!value || value === "[]" || value === "{}") && (
            <button
              type="button"
              onClick={insertSample}
              className="rounded border border-navy-300 bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-800 hover:bg-navy-100"
            >
              + Chèn mẫu học kỳ
            </button>
          )}
        </div>
      </div>
      <textarea
        rows={8}
        className={`${inputClass} font-mono text-xs leading-relaxed`}
        spellCheck={false}
        value={value || ""}
        onChange={(event) => {
          onChange(event.target.value);
          try {
            if (event.target.value.trim()) JSON.parse(event.target.value);
            setFormatError(null);
          } catch {
            setFormatError("JSON chưa đúng định dạng");
          }
        }}
      />
      {formatError && <span className="text-xs font-medium text-red-600">{formatError}</span>}
    </div>
  );
}

function toVietnamLocal(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16);
}
function fromVietnamLocal(value: string) {
  return value ? new Date(`${value}:00+07:00`).toISOString() : "";
}
export function ContentWorkbench({
  isAdmin,
  initialEntityType,
  initialEntityId,
  initialListType,
  initialListState,
}: {
  isAdmin: boolean;
  initialEntityType?: ContentType;
  initialEntityId?: string;
  initialListType?: ContentType;
  initialListState?: string;
}) {
  const [serverTime, setServerTime] = useState(0);
  const [rows, setRows] = useState<ContentRevisionRecord[]>([]),
    [type, setType] = useState<ContentType>(initialEntityType ?? "program"),
    [entityId, setEntityId] = useState(initialEntityId ?? ""),
    [title, setTitle] = useState("");
  const [autoEntityId, setAutoEntityId] = useState(false),
    [autoRevisionTitle, setAutoRevisionTitle] = useState(false),
    [autoArticleSlug, setAutoArticleSlug] = useState(false);
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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [listType, setListType] = useState(initialListType ?? "");
  const [listState, setListState] = useState(initialListState ?? "");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaList, setMediaList] = useState<{ key: string; name: string; url: string; size: number }[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  const openMediaPicker = async () => {
    setMediaPickerOpen(true);
    setLoadingMedia(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.media || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMedia(false);
    }
  };

  const uploadFeaturedImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tải được ảnh");
      setValues((current) => ({
        ...current,
        featured_image: data.url,
      }));
      setDirty(true);
      setNotice(`Đã tải ảnh "${file.name}" lên cho trường ảnh đại diện.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi tải ảnh");
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("topica:unsaved-changes", { detail: { dirty } }));
    return () => {
      window.dispatchEvent(new CustomEvent("topica:unsaved-changes", { detail: { dirty: false } }));
    };
  }, [dirty]);
  async function refresh() {
    const query = new URLSearchParams({ page: String(page), limit: "25" });
    if (search) query.set("search", search);
    if (listType) query.set("entityType", listType);
    if (listState) query.set("workflowState", listState);
    const res = await fetch(`/api/admin/revisions?${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không tải được danh sách bản sửa");
    const data = await res.json();
    setRows(data.revisions);
    setServerTime(data.serverTime);
    setTotal(data.total);
    setTotalPages(data.totalPages);
  }
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), limit: "25" });
    if (search) query.set("search", search);
    if (listType) query.set("entityType", listType);
    if (listState) query.set("workflowState", listState);
    fetch(`/api/admin/revisions?${query}`, { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Không tải được danh sách bản sửa");
        return res.json();
      })
      .then((data) => {
        setRows(data.revisions);
        setServerTime(data.serverTime);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(String(error.message));
      });
    return () => controller.abort();
  }, [page, search, listType, listState]);
  function load(row: ContentRevisionRecord) {
    if (dirty) {
      setError("Hãy lưu bản nháp hoặc chọn Bỏ thay đổi trước khi chuyển bản sửa.");
      return;
    }
    const payload = JSON.parse(row.payload);
    setType(row.entity_type);
    setAutoEntityId(false);
    setAutoRevisionTitle(false);
    setAutoArticleSlug(false);
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
          dateTimeFields.has(key)
            ? toVietnamLocal(value)
            : dateOnlyFields.has(key)
              ? String(value ?? "").slice(0, 10)
              : typeof value === "object"
                ? JSON.stringify(value, null, 2)
                : String(value ?? ""),
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
    for (const key of contentFields[type]) {
      const value = getEditableFieldValue(key, values);
      if (jsonFields.has(key)) {
        payload[key] = value.trim()
          ? JSON.parse(value)
          : key === "duration_credits"
            ? ""
            : key === "other_fees" || key === "assumptions" || key === "service_urls"
              ? {}
              : [];
      } else if (numberFields.has(key)) {
        payload[key] = value.trim() ? Number(value) : null;
      } else if (dateTimeFields.has(key)) {
        payload[key] = fromVietnamLocal(value);
      } else {
        // Send empty strings too, so an editor can intentionally clear an optional field.
        payload[key] = value;
      }
    }
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
          dateTimeFields.has(key)
            ? toVietnamLocal(value)
            : dateOnlyFields.has(key)
              ? String(value ?? "").slice(0, 10)
              : typeof value === "object"
                ? JSON.stringify(value, null, 2)
                : String(value ?? ""),
        ]),
      ),
    );
    setBase(data.baseRevisionId);
    setTitle(data.payload.title || data.payload.name || "Cập nhật nội dung");
    setAutoEntityId(false);
    setAutoRevisionTitle(false);
    setAutoArticleSlug(false);
    setSelected(null);
    setDirty(false);
    setNotice("Đã tải nội dung hiện có. Thay đổi sẽ được lưu thành bản nháp mới.");
  }
  async function uploadDocument(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("access", values.access || "public");
    const data = await response(await fetch("/api/admin/upload", { method: "POST", body: form }));
    setValues((current) => ({
      ...current,
      file_url: data.url,
      view_url: data.url,
      mime_type: data.mimeType,
      byte_size: String(data.size),
      checksum_sha256: data.checksumSha256,
    }));
    setDirty(true);
    setNotice(
      data.access === "private"
        ? "Tệp được lưu riêng tư; chỉ quản trị viên xem được."
        : "Tệp công khai đã tải lên.",
    );
  }
  useEffect(() => {
    if (!initialEntityType || !initialEntityId) return;
    const entityType = initialEntityType;
    const targetId = initialEntityId;
    let active = true;
    async function loadInitialEntity() {
      try {
        const data = await response(
          await fetch(
            `/api/admin/revisions?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(targetId)}`,
            { cache: "no-store" },
          ),
        );
        if (!active) return;
        setValues(
          Object.fromEntries(
            Object.entries(data.payload).map(([key, value]) => [
              key,
              dateTimeFields.has(key)
                ? toVietnamLocal(value)
                : dateOnlyFields.has(key)
                  ? String(value ?? "").slice(0, 10)
                  : typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : String(value ?? ""),
            ]),
          ),
        );
        setBase(data.baseRevisionId);
        setTitle(data.payload.title || data.payload.name || "Cập nhật nội dung");
        setSelected(null);
        setDirty(false);
        setNotice("Đã tải nội dung hiện có. Thay đổi sẽ được lưu thành bản nháp mới.");
      } catch (loadError) {
        if (active)
          setError(loadError instanceof Error ? loadError.message : "Không tải được nội dung.");
      }
    }
    void loadInitialEntity();
    return () => {
      active = false;
    };
  }, [initialEntityType, initialEntityId]);
  async function sendTransition(
    revision: ContentRevisionRecord,
    action: string,
    options: Record<string, unknown> = {},
  ) {
    const data = await response(
      await fetch(`/api/admin/revisions/${revision.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          expectedUpdatedAt: revision.updated_at,
          reason: reason || undefined,
          ...options,
        }),
      }),
    );
    return data.revision as ContentRevisionRecord;
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
    setSelected(await sendTransition(selected, action, options));
    await refresh();
    setNotice("Đã cập nhật trạng thái.");
  }
  async function approveAndPublishNow() {
    if (!selected || !isAdmin) return;
    if (dirty) throw new Error("Lưu bản nháp trước khi duyệt hoặc công bố.");
    if (!window.confirm("Bài sẽ được duyệt và hiển thị công khai ngay. Bạn muốn tiếp tục?")) return;

    const approved = await sendTransition(selected, "approve");
    setSelected(approved);
    const published = await sendTransition(approved, "publish");
    setSelected(published);
    await refresh();
    setNotice("Đã duyệt và công bố bài viết.");
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
              setAutoEntityId(false);
              setAutoRevisionTitle(false);
              setAutoArticleSlug(false);
              setBase(0);
              setError("");
            }}
          >
            Bỏ thay đổi / Tạo nội dung mới
          </button>
          <form
            className="mt-4 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <label className="grid gap-1 text-sm font-medium">
              Tìm theo tên hoặc mã
              <input
                className={inputClass}
                value={searchInput}
                maxLength={120}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="VD: tourism, học phí..."
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Loại nội dung
              <select
                className={inputClass}
                value={listType}
                onChange={(event) => {
                  setListType(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tất cả loại</option>
                {Object.entries(contentTypes).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Trạng thái
              <select
                className={inputClass}
                value={listState}
                onChange={(event) => {
                  setListState(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(states).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="min-h-10 rounded bg-navy-900 px-3 font-semibold text-white"
            >
              Tìm nội dung
            </button>
          </form>
          <p className="mt-3 text-xs text-ink-600">
            {total} bản sửa · trang {page}/{totalPages}
          </p>
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
                    {contentTypes[row.entity_type]} · {row.entity_id} · v{row.version} ·{" "}
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
            <p className="mt-4 text-ink-600">
              {search || listType || listState
                ? "Không tìm thấy bản sửa phù hợp. Hãy thử đổi từ khóa hoặc bộ lọc."
                : "Chưa có bản sửa. Bạn có thể tạo bản nháp đầu tiên."}
            </p>
          )}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="min-h-10 rounded border px-3 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                className="min-h-10 rounded border px-3 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
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
                    if (autoEntityId) setEntityId("");
                    setAutoEntityId(false);
                    setAutoRevisionTitle(false);
                    setAutoArticleSlug(false);
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
                    setAutoEntityId(false);
                    setDirty(true);
                  }}
                />
                <span className="text-xs text-ink-600">
                  {type === "article"
                    ? "Mã tự tạo theo tiêu đề; bạn có thể sửa nếu cần."
                    : type === "program"
                      ? "Chọn mã có sẵn (ba, tourism, it, english, chinese) hoặc nhập mã mới để tạo ngành mới."
                      : "Dùng mã đã có khi cập nhật hoặc nhập mã mới."}
                </span>
              </label>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  type="button"
                  className="min-h-11 flex-1 rounded border px-4 text-navy-900 underline hover:bg-slate-50"
                  onClick={() => void run(loadExisting)}
                >
                  Tải nội dung hiện có theo mã
                </button>
                {selected && (
                  <button
                    type="button"
                    className="min-h-11 rounded border border-navy-700 bg-navy-50 px-4 text-sm font-semibold text-navy-900 hover:bg-navy-100"
                    onClick={() => {
                      setSelected(null);
                      setEntityId("");
                      setTitle("");
                      setValues({});
                      setBase(0);
                      setDirty(false);
                    }}
                  >
                    + Tạo mới ({contentTypes[type]})
                  </button>
                )}
              </div>
              <label className="grid gap-1 sm:col-span-2">
                Tên bản sửa
                <input
                  required
                  maxLength={240}
                  className={inputClass}
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setAutoRevisionTitle(false);
                    setDirty(true);
                  }}
                />
                {type === "article" && (
                  <span className="text-xs text-ink-600">
                    Tên bản sửa tự lấy từ tiêu đề bài viết; bạn có thể đổi tên này.
                  </span>
                )}
              </label>
              {contentFields[type].map((key) => (
                <label
                  key={key}
                  className={`grid min-w-0 gap-1 ${jsonFields.has(key) || key === "content_html" ? "sm:col-span-2" : ""}`}
                >
                  {fieldLabels[key] || key}
                  {key === "category_id" && type === "article" ? (
                    <select
                      className={inputClass}
                      value={values[key] || ""}
                      onChange={(event) => {
                        setValues({ ...values, [key]: event.target.value });
                        setDirty(true);
                      }}
                    >
                      <option value="">-- Chưa phân loại --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : key === "featured_image" ? (
                    <div className="grid gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          className={`flex-1 ${inputClass}`}
                          value={values[key] || ""}
                          placeholder="https://... hoặc tải ảnh lên"
                          onChange={(event) => {
                            setValues({ ...values, [key]: event.target.value });
                            setDirty(true);
                          }}
                          aria-label="Đường dẫn ảnh đại diện"
                        />
                        <label className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md border border-line-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 shadow-xs hover:bg-slate-50">
                          <Upload className="h-4 w-4" />
                          <span>{uploadingImage ? "Đang tải..." : "Tải từ máy"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploadingImage}
                            className="sr-only"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void uploadFeaturedImage(file);
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => void openMediaPicker()}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-line-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 shadow-xs hover:bg-slate-50"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span>Thư viện Media</span>
                        </button>
                        {values[key] && (
                          <button
                            type="button"
                            onClick={() => {
                              setValues({ ...values, [key]: "" });
                              setDirty(true);
                            }}
                            className="inline-flex min-h-11 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-sm text-red-700 hover:bg-red-100"
                            title="Xóa ảnh đại diện"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>
                      {values[key] && (
                        <div className="flex items-center gap-3 rounded-lg border border-line-200 bg-slate-50 p-2.5">
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded border border-line-200 bg-white">
                            <img
                              src={values[key]}
                              alt="Xem trước ảnh đại diện"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 text-xs">
                            <p className="font-semibold text-ink-900">Xem trước ảnh đại diện (Bản nháp)</p>
                            <p className="mt-0.5 truncate text-ink-500">{values[key]}</p>
                            <p className="mt-0.5 text-ink-400">Ảnh này chỉ được công bố khi hoàn tất duyệt và xuất bản.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : key === "access" && type === "document" ? (
                    <select
                      className={inputClass}
                      value={values[key] || "public"}
                      onChange={(event) => {
                        setValues({ ...values, [key]: event.target.value });
                        setDirty(true);
                      }}
                    >
                      <option value="public">Công khai</option>
                      {isAdmin && <option value="private">Riêng tư · chỉ admin truy cập</option>}
                    </select>
                  ) : key === "file_url" && type === "document" ? (
                    <div className="grid gap-2">
                      <input
                        className={inputClass}
                        value={values[key] || ""}
                        onChange={(event) => {
                          setValues({ ...values, [key]: event.target.value });
                          setDirty(true);
                        }}
                        aria-label="Đường dẫn tệp"
                      />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        disabled={!isAdmin && values.access === "private"}
                        className={inputClass}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void run(() => uploadDocument(file));
                          event.currentTarget.value = "";
                        }}
                      />
                      <span className="text-xs text-ink-600">
                        PDF tối đa 20 MB; ảnh JPG/PNG/WebP tối đa 5 MB. PDF riêng tư được lưu ngoài
                        thư mục public.
                      </span>
                    </div>
                  ) : key === "content_html" ? (
                    <RichTextEditor
                      value={values[key] || ""}
                      onChange={(value) => {
                        setValues({ ...values, [key]: value });
                        setDirty(true);
                      }}
                      onUploadImage={async (file) => {
                        const form = new FormData();
                        form.append("file", file);
                        const response = await fetch("/api/admin/upload", {
                          method: "POST",
                          body: form,
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.error || "Không tải được ảnh");
                        return data.url;
                      }}
                    />
                  ) : key === "aliases" || key === "program_ids" || key === "careers" || key === "confirmations" ? (
                    <StringListEditor
                      label={fieldLabels[key] || key}
                      value={values[key] || "[]"}
                      onChange={(value) => {
                        setValues({ ...values, [key]: value });
                        setDirty(true);
                      }}
                    />
                  ) : key === "curriculum" ? (
                    <CurriculumJsonEditor
                      value={values[key] || "[]"}
                      onChange={(value) => {
                        setValues({ ...values, [key]: value });
                        setDirty(true);
                      }}
                    />
                  ) : key === "group" && type === "program" ? (
                    <select
                      className={inputClass}
                      value={values[key] || "technology"}
                      onChange={(event) => {
                        setValues({ ...values, [key]: event.target.value });
                        setDirty(true);
                      }}
                    >
                      <option value="technology">Công nghệ & Sáng tạo</option>
                      <option value="business">Kinh doanh & Dịch vụ</option>
                      <option value="language">Ngôn ngữ</option>
                      <option value="other">Khác</option>
                    </select>
                  ) : key === "image" && type === "program" ? (
                    <div className="grid gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          className={`flex-1 ${inputClass}`}
                          value={values[key] || ""}
                          placeholder="/images/programs/... hoặc https://..."
                          onChange={(event) => {
                            setValues({ ...values, [key]: event.target.value });
                            setDirty(true);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => void openMediaPicker()}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-line-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 shadow-xs hover:bg-slate-50"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span>Thư viện Media</span>
                        </button>
                      </div>
                      {values[key] && (
                        <div className="flex items-center gap-3 rounded-lg border border-line-200 bg-slate-50 p-2.5">
                          <img
                            src={values[key]}
                            alt="Ảnh ngành"
                            className="h-12 w-20 rounded object-cover"
                          />
                          <span className="truncate text-xs text-ink-600">{values[key]}</span>
                        </div>
                      )}
                    </div>
                  ) : key === "summary" || key === "admissions" || key === "graduation" || key === "further_study" ? (
                    <textarea
                      rows={3}
                      className={inputClass}
                      value={values[key] || ""}
                      placeholder={`Nhập ${fieldLabels[key]?.toLowerCase() || key}...`}
                      onChange={(event) => {
                        setValues({ ...values, [key]: event.target.value });
                        setDirty(true);
                      }}
                    />
                  ) : key === "duration_credits" ? (
                    <DurationEditor
                      value={values[key] || "{}"}
                      onChange={(value) => {
                        setValues({ ...values, [key]: value });
                        setDirty(true);
                      }}
                    />
                  ) : key === "other_fees" ? (
                    <ScalarObjectEditor
                      label={fieldLabels[key] || key}
                      numeric
                      value={values[key] || "{}"}
                      onChange={(value) => {
                        setValues({ ...values, [key]: value });
                        setDirty(true);
                      }}
                    />
                  ) : key === "service_urls" ? (
                    <ServiceUrlsEditor
                      value={values[key] || "{}"}
                      onChange={(value) => {
                        setValues({ ...values, [key]: value });
                        setDirty(true);
                      }}
                    />
                  ) : key === "documents" ? (
                    <RepeatableObjectEditor
                      value={values[key] || "[]"}
                      onChange={(value) => {
                        setValues({ ...values, [key]: value });
                        setDirty(true);
                      }}
                      fields={[
                        { key: "title", label: "Tên tài liệu" },
                        {
                          key: "url",
                          label: "Liên kết tài liệu",
                          placeholder: "/duong-dan-hoac-https://...",
                        },
                      ]}
                      addLabel="Thêm tài liệu hướng dẫn"
                      emptyItem={{ title: "", url: "" }}
                    />
                  ) : key === "locations" ? (
                    <RepeatableObjectEditor
                      value={values[key] || "[]"}
                      onChange={(value) => {
                        setValues({ ...values, [key]: value });
                        setDirty(true);
                      }}
                      fields={[
                        { key: "name", label: "Tên cơ sở" },
                        { key: "city", label: "Tỉnh/thành phố" },
                        { key: "address", label: "Địa chỉ" },
                        { key: "hotline", label: "Hotline (không bắt buộc)" },
                      ]}
                      addLabel="Thêm địa điểm"
                      emptyItem={{ name: "", city: "", address: "", hotline: "" }}
                    />
                  ) : jsonFields.has(key) ? (
                    <div className="grid gap-1.5">
                      <textarea
                        rows={4}
                        className={inputClass}
                        spellCheck={false}
                        value={values[key] || ""}
                        onChange={(event) => {
                          setValues({ ...values, [key]: event.target.value });
                          setDirty(true);
                        }}
                      />
                      <span className="text-xs text-ink-500">
                        Trường dữ liệu lồng nhau; nhập JSON hợp lệ. Để trống sẽ xóa nội dung.
                      </span>
                    </div>
                  ) : (
                    <input
                      className={inputClass}
                      type={
                        numberFields.has(key)
                          ? "number"
                          : dateTimeFields.has(key)
                            ? "datetime-local"
                            : dateOnlyFields.has(key)
                              ? "date"
                              : "text"
                      }
                      min={numberFields.has(key) ? 0 : undefined}
                      step={dateTimeFields.has(key) ? 60 : undefined}
                      value={values[key] || ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setValues({ ...values, [key]: value });
                        if ((type === "article" || type === "program") && key === "slug") setAutoArticleSlug(false);
                        if ((type === "article" || type === "program") && (key === "title" || key === "name") && !selected) {
                          const generated = articleContentId(value);
                          if (!entityId || autoEntityId) {
                            setEntityId(generated);
                            setAutoEntityId(Boolean(generated));
                          }
                          if (!title.trim() || autoRevisionTitle) {
                            setTitle(type === "program" ? `Cập nhật ngành: ${value}`.slice(0, 240) : value.slice(0, 240));
                            setAutoRevisionTitle(Boolean(value.trim()));
                          }
                          if (!values.slug || autoArticleSlug) {
                            setValues({ ...values, [key]: value, slug: generated });
                            setAutoArticleSlug(Boolean(generated));
                          }
                        }
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
                {isAdmin && selected.workflow_state === "in_review" && (
                  <button
                    type="button"
                    disabled={busy || dirty}
                    className="min-h-11 rounded bg-navy-950 px-4 font-semibold text-white disabled:opacity-50"
                    onClick={() => void run(approveAndPublishNow)}
                  >
                    Duyệt và công bố ngay
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-navy-800" />
                <h3 className="font-display text-lg font-bold text-ink-950">
                  Chọn ảnh đại diện từ Thư viện Media
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerOpen(false)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-slate-100 hover:text-ink-700"
                aria-label="Đóng thư viện ảnh"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingMedia ? (
                <div className="flex h-48 items-center justify-center gap-2 text-ink-500">
                  <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
                  <span>Đang tải thư viện media...</span>
                </div>
              ) : mediaList.length === 0 ? (
                <div className="py-12 text-center text-ink-500">
                  <p>Chưa có tệp nào trong thư viện media.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {mediaList
                    .filter((item) => /\.(jpg|jpeg|png|webp|gif)$/i.test(item.name || item.url))
                    .map((item) => (
                      <button
                        key={item.key || item.url}
                        type="button"
                        onClick={() => {
                          setValues({ ...values, featured_image: item.url });
                          setDirty(true);
                          setMediaPickerOpen(false);
                        }}
                        className="group flex flex-col overflow-hidden rounded-lg border border-line-200 bg-white text-left transition-all hover:border-brand-600 hover:shadow-md focus:outline-2 focus:outline-brand-600"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="p-2">
                          <p className="line-clamp-1 text-xs font-semibold text-ink-900" title={item.name}>
                            {item.name}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
            <div className="border-t border-line-200 px-6 py-3 text-right">
              <button
                type="button"
                onClick={() => setMediaPickerOpen(false)}
                className="rounded-lg border border-line-200 bg-white px-4 py-2 text-xs font-semibold text-ink-700 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
