import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import { expect, test } from "vitest";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

test("synchronizes asynchronously loaded CMS content without emitting an edit", async () => {
  function Harness() {
    const [value, setValue] = useState("");
    return (
      <>
        <button onClick={() => setValue("<p>Loaded legacy HTML</p>")}>Load</button>
        <RichTextEditor value={value} onChange={setValue} />
      </>
    );
  }

  const view = render(<Harness />);
  await act(async () => {
    view.getByRole("button", { name: "Load" }).click();
  });
  expect(view.container.querySelector(".ProseMirror")?.innerHTML).toContain("Loaded legacy HTML");
});

test("shows actionable image upload errors in the editor", async () => {
  const view = render(
    <RichTextEditor
      value="<p>Article</p>"
      onChange={() => {}}
      onUploadImage={async () => {
        throw new Error("Ảnh vượt quá dung lượng tối đa 5 MB.");
      }}
    />,
  );
  const input = view.container.querySelector('input[type="file"]');
  expect(input?.getAttribute("accept")).toBe("image/jpeg,image/png,image/webp");
  await waitFor(() => expect(view.container.querySelector(".ProseMirror")).toBeTruthy());

  await act(async () => {
    fireEvent.change(input!, {
      target: { files: [new File(["bad"], "too-large.png", { type: "image/png" })] },
    });
  });

  expect(view.getByRole("alert").textContent).toContain("tối đa 5 MB");
});
