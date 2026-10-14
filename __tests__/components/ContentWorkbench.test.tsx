import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ContentWorkbench } from "@/components/admin/ContentWorkbench";
import type { ContentRevisionRecord } from "@/lib/db/types";

test("admin can approve and publish an in-review article with ordered revision checks", async () => {
  let revision = {
    id: 7,
    entity_type: "article",
    entity_id: "test-article",
    title: "Bài kiểm tra quy trình",
    payload: JSON.stringify({ title: "Bài kiểm tra quy trình", slug: "test-article" }),
    workflow_state: "in_review",
    version: 1,
    updated_at: "2026-10-14T08:00:00.000Z",
  } as unknown as ContentRevisionRecord;
  const actions: Array<{ action: string; expectedUpdatedAt: string }> = [];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        const body = JSON.parse(String(init.body));
        actions.push({ action: body.action, expectedUpdatedAt: body.expectedUpdatedAt });
        revision = {
          ...revision,
          workflow_state: body.action === "approve" ? "approved" : "published",
          updated_at: `2026-10-14T08:0${actions.length}:00.000Z`,
        };
        return new Response(JSON.stringify({ revision }));
      }
      return new Response(
        JSON.stringify({ revisions: [revision], serverTime: Date.now(), total: 1, totalPages: 1 }),
      );
    }),
  );
  vi.spyOn(window, "confirm").mockReturnValue(true);
  const view = render(
    <ContentWorkbench isAdmin initialListType="article" initialListState="in_review" />,
  );

  fireEvent.click(await view.findByRole("button", { name: /Bài kiểm tra quy trình/ }));
  fireEvent.click(await view.findByRole("button", { name: "Duyệt và công bố ngay" }));

  await waitFor(() => expect(view.getByText("Đã duyệt và công bố bài viết.")).toBeTruthy());
  expect(actions.map((item) => item.action)).toEqual(["approve", "publish"]);
  expect(actions.map((item) => item.expectedUpdatedAt)).toEqual([
    "2026-10-14T08:00:00.000Z",
    "2026-10-14T08:01:00.000Z",
  ]);
});

test("article title fills the internal ID, revision name, and URL for a new post", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({ revisions: [], serverTime: Date.now(), total: 0, totalPages: 1 }),
        ),
    ),
  );
  const view = render(
    <ContentWorkbench isAdmin initialEntityType="article" initialListType="article" />,
  );
  await waitFor(() => expect(view.getByText(/0 bản sửa/)).toBeTruthy());

  await act(async () => {
    fireEvent.change(view.getByRole("textbox", { name: "Tiêu đề" }), {
      target: { value: "Bà Nguyễn Thị Tuyết Nhung" },
    });
  });

  expect((view.getByLabelText(/^Mã nội dung/) as HTMLInputElement).value).toBe(
    "ba-nguyen-thi-tuyet-nhung",
  );
  expect((view.getByRole("textbox", { name: /^Tên bản sửa/ }) as HTMLInputElement).value).toBe(
    "Bà Nguyễn Thị Tuyết Nhung",
  );
  expect((view.getByRole("textbox", { name: "Đường dẫn" }) as HTMLInputElement).value).toBe(
    "ba-nguyen-thi-tuyet-nhung",
  );
});
