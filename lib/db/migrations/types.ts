import type { DatabaseSync } from "node:sqlite";

export interface Migration {
  version: number;
  name: string;
  checksum?: string;
  up: (db: DatabaseSync) => void;
  down: (db: DatabaseSync) => void;
}

export interface MigrationRunOptions {
  dryRun?: boolean;
  targetVersion?: number;
  logger?: (msg: string) => void;
  skipBackup?: boolean;
}

export interface RollbackOptions extends Pick<MigrationRunOptions, "skipBackup"> {
  steps?: number;
  targetVersion?: number;
  dryRun?: boolean;
  logger?: (msg: string) => void;
}

export interface MigrationReport {
  applied: string[];
  rolledBack: string[];
  currentVersion: number;
  beforeCounts: Record<string, number>;
  afterCounts: Record<string, number>;
  dryRun: boolean;
  durationMs: number;
}
