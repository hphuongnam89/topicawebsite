import type { Migration } from "./types";

/**
 * Reserved historical version. The previous seed had no approval evidence.
 * Keep its identity for existing migration ledgers; never seed/publish it again.
 * Existing rows require a content audit, not an automatic destructive cleanup.
 */
export const migration003: Migration = {
  version: 3,
  name: "003_seed_verified_domain_data",
  up: () => {},
  down: () => {},
};
