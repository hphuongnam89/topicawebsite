import path from "node:path";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  ALL_MIGRATIONS,
  getAppliedMigrations,
  getTableCounts,
  runMigrations,
  rollbackMigration,
} from "@/lib/db/migrations";
import { assertFixturePath } from "@/lib/db/safety";

function parseArgs() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isRollback = args.includes("--rollback");
  const isStatus = args.includes("--status");
  const skipBackup = args.includes("--skip-backup");

  let targetVersion: number | undefined;
  const targetIdx = args.indexOf("--target");
  if (targetIdx !== -1 && args[targetIdx + 1]) {
    targetVersion = Number(args[targetIdx + 1]);
  }

  let steps: number | undefined;
  const stepsIdx = args.indexOf("--steps");
  if (stepsIdx !== -1 && args[stepsIdx + 1]) {
    steps = Number(args[stepsIdx + 1]);
  }

  if (targetIdx !== -1 && (!Number.isInteger(targetVersion) || targetVersion! < 0)) {
    throw new Error("--target phải là số nguyên không âm.");
  }
  if (stepsIdx !== -1 && (!Number.isInteger(steps) || steps! < 1)) {
    throw new Error("--steps phải là số nguyên dương.");
  }
  return { isDryRun, isRollback, isStatus, skipBackup, targetVersion, steps };
}

function main() {
  const { isDryRun, isRollback, isStatus, skipBackup, targetVersion, steps } = parseArgs();

  const dbPath =
    process.env.TOPICA_DB_PATH ||
    path.join(process.env.TOPICA_DATA_DIR || path.join(process.cwd(), "data"), "topica.db");

  if (process.env.NODE_ENV === "test" || skipBackup) assertFixturePath(dbPath);
  if (isStatus && !fs.existsSync(dbPath)) {
    throw new Error("Database chưa tồn tại; --status không tạo file hoặc schema.");
  }
  if (!isDryRun && !isStatus) fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  console.log("=================================================");
  console.log("TOPICA EDU — DATABASE MIGRATION RUNNER (Task R16)");
  console.log(`Target DB: ${dbPath}`);
  console.log("=================================================");

  // Dry-run of a new deployment uses memory and leaves no target file behind.
  const db = new DatabaseSync(isDryRun && !fs.existsSync(dbPath) ? ":memory:" : dbPath, {
    readOnly: isStatus,
  });
  try {
    if (isStatus) {
      const applied = getAppliedMigrations(db);
      const appliedSet = new Set(applied.map((a) => a.version));
      console.log("\n--- TRẠNG THÁI MIGRATION ---");
      for (const m of ALL_MIGRATIONS) {
        const isApplied = appliedSet.has(m.version);
        const appRecord = applied.find((a) => a.version === m.version);
        const mark = isApplied
          ? `[✓ APPLIED at ${appRecord?.applied_at} (${appRecord?.execution_time_ms}ms)]`
          : "[PENDING]";
        console.log(`v${m.version}: ${m.name.padEnd(35)} ${mark}`);
      }

      const counts = getTableCounts(db);
      console.log("\n--- SỐ LƯỢNG BẢN GHI THEO BẢNG ---");
      for (const [tbl, cnt] of Object.entries(counts)) {
        console.log(`- ${tbl.padEnd(25)}: ${cnt} rows`);
      }
      return;
    }

    if (isRollback) {
      console.log(
        `\nBắt đầu rollback (steps: ${steps || 1}, target: ${targetVersion ?? "auto"})...`,
      );
      const report = rollbackMigration(db, {
        steps,
        targetVersion,
        dryRun: isDryRun,
        skipBackup,
        logger: (msg) => console.log(`[ROLLBACK] ${msg}`),
      });

      console.log("\n--- KẾT QUẢ ROLLBACK ---");
      console.log(`Chế độ: ${report.dryRun ? "DRY-RUN (Không lưu)" : "THỰC THI (Đã ghi nhận)"}`);
      console.log(`Migrations đã rollback: ${report.rolledBack.join(", ") || "Không có"}`);
      console.log(`Version hiện tại sau rollback: v${report.currentVersion}`);
      console.log(`Thời gian thực hiện: ${report.durationMs}ms`);
      return;
    }

    console.log(
      `\nBắt đầu chạy migrations (target: ${targetVersion ?? "latest"}, dryRun: ${isDryRun})...`,
    );
    const report = runMigrations(db, {
      dryRun: isDryRun,
      targetVersion,
      skipBackup,
      logger: (msg) => console.log(`[MIGRATE] ${msg}`),
    });

    console.log("\n--- KẾT QUẢ MIGRATION ---");
    console.log(`Chế độ: ${report.dryRun ? "DRY-RUN (Không lưu)" : "THỰC THI (Đã ghi nhận)"}`);
    console.log(`Migrations đã áp dụng: ${report.applied.join(", ") || "Không có migration mới"}`);
    console.log(`Version hiện tại: v${report.currentVersion}`);
    console.log(`Thời gian thực hiện: ${report.durationMs}ms`);

    console.log("\n--- THỐNG KÊ BẢN GHI TRƯỚC / SAU ---");
    const allTables = Array.from(
      new Set([...Object.keys(report.beforeCounts), ...Object.keys(report.afterCounts)]),
    ).sort();

    for (const tbl of allTables) {
      const before = report.beforeCounts[tbl] ?? 0;
      const after = report.afterCounts[tbl] ?? 0;
      const diff = after - before;
      const diffStr = diff > 0 ? `(+${diff})` : diff < 0 ? `(${diff})` : "(=)";
      console.log(`- ${tbl.padEnd(25)}: ${before} -> ${after} ${diffStr}`);
    }

    console.log("\nHoàn tất migration an toàn!");
  } finally {
    db.close();
  }
}

if (process.argv[1]?.includes("migrate-db")) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Migration thất bại.");
    process.exitCode = 1;
  }
}
