import { afterEach, expect, test, vi } from "vitest";
import { getPublicMediaUrl } from "@/lib/services/media-storage";

afterEach(() => vi.unstubAllEnvs());

test("QA uploads use the runtime media API instead of an unbuilt static prefix", () => {
  vi.stubEnv("TOPICA_QA_MODE", "true");
  vi.stubEnv("TOPICA_UPLOAD_DIR", "C:/fixture/uploads");
  vi.stubEnv("TOPICA_UPLOAD_URL_PREFIX", "/qa-uploads/run");
  expect(getPublicMediaUrl("image.png")).toBe("/api/public-media?name=image.png");
});

test("production-configured prefixes remain supported", () => {
  vi.stubEnv("TOPICA_QA_MODE", "false");
  vi.stubEnv("TOPICA_UPLOAD_URL_PREFIX", "/uploads");
  expect(getPublicMediaUrl("image.png")).toBe("/uploads/image.png");
});
