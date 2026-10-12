import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

describe("Custom typography preserves action colors", () => {
  test("gold CTA keeps navy text after font-size merging and supports color overrides", () => {
    render(
      <ButtonLink href="/fixture" variant="accent" size="lg">
        Fixture CTA
      </ButtonLink>,
    );
    expect(screen.getByRole("link")).toHaveClass("text-navy-950", "text-body");
    expect(cn("text-navy-950 text-body-sm", "text-white text-body-lg")).toBe(
      "text-white text-body-lg",
    );
  });
});
