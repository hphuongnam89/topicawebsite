import type { Migration } from "./types";
import { migration001 } from "./001_core_legacy_baseline";
import { migration002 } from "./002_cms_domain_models";
import { migration003 } from "./003_seed_verified_domain_data";

export const ALL_MIGRATIONS: Migration[] = [migration001, migration002, migration003];
