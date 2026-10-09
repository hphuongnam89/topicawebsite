import { getAnalyticsConsent, setAnalyticsConsent, trackEvent } from "@/lib/analytics";

describe("analytics consent gate", () => {
  test("defaults to disabled and supports withdrawal", () => {
    window.localStorage.clear();
    expect(getAnalyticsConsent()).toBeNull();
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response());
    trackEvent("page_view", { path: "/" });
    expect(fetcher).not.toHaveBeenCalled();
    setAnalyticsConsent(true);
    expect(getAnalyticsConsent()).toBe("granted");
    trackEvent("page_view", { path: "/" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    setAnalyticsConsent(false);
    expect(getAnalyticsConsent()).toBe("denied");
    trackEvent("page_view", { path: "/" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    fetcher.mockRestore();
  });
});
