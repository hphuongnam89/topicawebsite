import { describe, it, expect } from "vitest";
import {
  can,
  canTransition,
  type PolicyContext,
  type ResourceKind,
  type Action,
} from "@/lib/auth/policy";

describe("Policy Engine (RBAC & State Machine)", () => {
  describe("Deny-by-default rules", () => {
    it("should deny if context or role is invalid", () => {
      expect(can({} as PolicyContext, "article", "read")).toBe(false);
      expect(can({ role: "invalid_role" as any }, "article", "read")).toBe(false);
    });

    it("should strictly prevent contributors from publishing or deleting", () => {
      const contributor: PolicyContext = { role: "contributor", userId: "c1" };

      expect(can(contributor, "article", "publish")).toBe(false);
      expect(can(contributor, "article", "delete")).toBe(false);
      expect(can(contributor, "lead", "read")).toBe(false);
      expect(can(contributor, "lead", "export")).toBe(false);
      expect(can(contributor, "user", "create")).toBe(false);
    });

    it("should only allow contributor to edit their own article", () => {
      const contributorOwner: PolicyContext = { role: "contributor", userId: "c1", isOwner: true };
      const contributorNotOwner: PolicyContext = {
        role: "contributor",
        userId: "c1",
        isOwner: false,
      };

      expect(can(contributorOwner, "article", "update")).toBe(true);
      expect(can(contributorNotOwner, "article", "update")).toBe(false);
    });

    it("should allow publisher to publish articles and pages, but not manage users", () => {
      const publisher: PolicyContext = { role: "publisher", userId: "p1" };

      expect(can(publisher, "article", "publish")).toBe(true);
      expect(can(publisher, "page", "publish")).toBe(true);
      expect(can(publisher, "user", "create")).toBe(false);
      expect(can(publisher, "user", "delete")).toBe(false);
    });

    it("should allow admin full access to all resources and actions", () => {
      const admin: PolicyContext = { role: "admin", userId: "a1" };
      const resources: ResourceKind[] = [
        "article",
        "page",
        "program",
        "category",
        "lead",
        "media",
        "user",
        "setting",
      ];

      for (const res of resources) {
        expect(can(admin, res, "read")).toBe(true);
      }
      expect(can(admin, "article", "publish")).toBe(true);
      expect(can(admin, "lead", "export")).toBe(true);
      expect(can(admin, "user", "delete")).toBe(true);
    });
  });

  describe("Revision State Machine Transitions", () => {
    it("should allow draft -> in_review for all editor/contributor roles", () => {
      expect(canTransition("draft", "in_review", "contributor")).toBe(true);
      expect(canTransition("draft", "in_review", "editor")).toBe(true);
    });

    it("should only allow approve transition for reviewer, publisher, or admin", () => {
      expect(canTransition("in_review", "approved", "contributor")).toBe(false);
      expect(canTransition("in_review", "approved", "editor")).toBe(false);
      expect(canTransition("in_review", "approved", "reviewer")).toBe(true);
      expect(canTransition("in_review", "approved", "publisher")).toBe(true);
      expect(canTransition("in_review", "approved", "admin")).toBe(true);
    });

    it("should only allow publish transition for publisher or admin", () => {
      expect(canTransition("approved", "published", "reviewer")).toBe(false);
      expect(canTransition("approved", "published", "editor")).toBe(false);
      expect(canTransition("approved", "published", "publisher")).toBe(true);
      expect(canTransition("approved", "published", "admin")).toBe(true);
    });

    it("should deny illegal transitions (e.g. draft directly to published)", () => {
      expect(canTransition("draft", "published", "admin")).toBe(false);
      expect(canTransition("archived", "published", "admin")).toBe(false);
    });
  });
});
