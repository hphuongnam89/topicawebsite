import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { runMigrations } from "@/lib/db/migrations";
import { createQaWorkspace, qaBaseEnvironment } from "./qa-workspace";
import { hashPassword } from "@/lib/auth/password";

// This process owns only its unique fixture, output directory and child server.
const runId =
  process.env.TOPICA_QA_RUN_ID || `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
if (!/^[a-zA-Z0-9-]+$/.test(runId)) throw new Error("Invalid QA run ID.");
const port = Number(process.env.TOPICA_QA_PORT || 3107);
if (!Number.isInteger(port) || port < 1024 || port > 65535 || port === 3000) {
  throw new Error("QA requires a separate port between 1024 and 65535 (not 3000).");
}
const root = path.join(process.cwd(), "scratch", `qa-${runId}`);
const sourceRoot = process.cwd();
const workspace = path.join(root, "workspace");
function protectedRootFiles() {
  return Object.fromEntries(
    ["next-env.d.ts", "tsconfig.json", "tsconfig.tsbuildinfo", ".next/BUILD_ID"].map((file) => [
      file,
      fs.existsSync(path.join(sourceRoot, file))
        ? crypto
            .createHash("sha256")
            .update(fs.readFileSync(path.join(sourceRoot, file)))
            .digest("hex")
        : null,
    ]),
  );
}
const protectedBefore = protectedRootFiles();
const dbPath = path.join(root, "fixture.db");
if (fs.existsSync(dbPath))
  throw new Error("QA fixture already exists; choose a new TOPICA_QA_RUN_ID.");
fs.mkdirSync(root, { recursive: true });
const qaEnvironment = {
  ...qaBaseEnvironment(process.env),
  NODE_ENV: "production" as const,
  TOPICA_DB_PATH: dbPath,
  TOPICA_DATA_DIR: root,
  TOPICA_BACKUP_DIR: path.join(root, "backups"),
  TOPICA_UPLOAD_DIR: path.join(workspace, "public", "qa-uploads", runId),
  TOPICA_UPLOAD_URL_PREFIX: `/qa-uploads/${runId}`,
  TOPICA_NEXT_DIST_DIR: `.next-qa-${runId}`,
  TOPICA_QA_TSCONFIG: `.tsconfig-qa-${runId}.json`,
  STUB_NOTIFICATIONS: "true",
  TELEGRAM_DISABLED: "true",
  TOPICA_QA_MODE: "true",
  TOPICA_QA_SOURCE_ROOT: sourceRoot,
  ADMIN_JWT_SECRET: crypto.randomBytes(32).toString("hex"),
  ADMIN_SESSION_SECRET: crypto.randomBytes(32).toString("hex"),
  SESSION_SECRET: crypto.randomBytes(32).toString("hex"),
  ADMIN_INITIAL_PASSWORD: "", // No admin account or external configuration in QA.
  NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
};
for (const key of Object.keys(process.env)) delete process.env[key];
Object.assign(process.env, qaEnvironment);
// Migration bootstrap imports were evaluated before the clean child environment.
process.env.ADMIN_INITIAL_PASSWORD = "";
const snapshot = createQaWorkspace(sourceRoot, workspace);
// Sandboxed Windows may deny junction creation. A physical copy keeps QA independent.
let dependencyMode = "junction";
try {
  fs.symlinkSync(
    path.join(sourceRoot, "node_modules"),
    path.join(workspace, "node_modules"),
    "junction",
  );
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "EPERM") throw error;
  dependencyMode = "copy";
  fs.cpSync(path.join(sourceRoot, "node_modules"), path.join(workspace, "node_modules"), {
    recursive: true,
    dereference: true,
    errorOnExist: true,
    force: false,
  });
}
fs.writeFileSync(
  path.join(workspace, qaEnvironment.TOPICA_QA_TSCONFIG),
  JSON.stringify(
    {
      extends: "./tsconfig.json",
      compilerOptions: { tsBuildInfoFile: "./qa.tsbuildinfo" },
      include: [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx",
        "**/*.mts",
        `.next-qa-${runId}/types/**/*.ts`,
        `.next-qa-${runId}/dev/types/**/*.ts`,
      ],
    },
    null,
    2,
  ),
);
const db = new DatabaseSync(dbPath);
try {
  runMigrations(db);
  if (process.argv.includes("--with-editor-fixtures")) {
    const accounts = ["editor", "admin"].map((role) => ({
      id: `qa-${role}`,
      username: `qa-${role}`,
      role,
      password: crypto.randomBytes(24).toString("hex"),
    }));
    for (const account of accounts)
      db.prepare(
        "INSERT INTO users(id,username,name,role,password_hash,created_at)VALUES(?,?,?,?,?,?)",
      ).run(
        account.id,
        account.username,
        `QA Fixture ${account.role}`,
        account.role,
        hashPassword(account.password),
        new Date().toISOString(),
      );
    // Synthetic credentials stay only in ignored scratch, never public evidence/manifests.
    fs.writeFileSync(path.join(root, "private-auth.json"), JSON.stringify(accounts), {
      flag: "wx",
    });
  }
} finally {
  db.close();
}
fs.writeFileSync(
  path.join(root, "manifest.json"),
  JSON.stringify(
    {
      runId,
      port,
      node: process.version,
      dependencyMode,
      distDir: qaEnvironment.TOPICA_NEXT_DIST_DIR,
      tsconfig: qaEnvironment.TOPICA_QA_TSCONFIG,
      workspace,
      sourceFingerprint: snapshot.fingerprint,
      sourceFiles: snapshot.files,
      protectedBefore,
      dataset: "empty migrated fixture; no copied production records",
      outbound: "stubbed",
      startedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const buildCompiler = process.argv.includes("--webpack") ? "webpack" : "turbopack";
if (dependencyMode === "copy") qaEnvironment.TOPICA_QA_SOURCE_ROOT = workspace;
const build = spawnSync(
  process.execPath,
  [nextBin, "build", ...(buildCompiler === "webpack" ? ["--webpack"] : [])],
  {
    cwd: workspace,
    env: qaEnvironment,
    stdio: "inherit",
  },
);
if (build.error) throw build.error;
const manifestPath = path.join(root, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const protectedAfter = protectedRootFiles();
Object.assign(manifest, {
  buildExitCode: build.status,
  buildCompiler,
  protectedAfter,
  protectedUnchanged: JSON.stringify(protectedBefore) === JSON.stringify(protectedAfter),
  buildId: fs.existsSync(path.join(workspace, qaEnvironment.TOPICA_NEXT_DIST_DIR, "BUILD_ID"))
    ? fs
        .readFileSync(path.join(workspace, qaEnvironment.TOPICA_NEXT_DIST_DIR, "BUILD_ID"), "utf8")
        .trim()
    : null,
  builtAt: new Date().toISOString(),
});
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
if (!manifest.protectedUnchanged)
  throw new Error("Root helper/config changed during QA build; investigate concurrent edits.");
if (build.status !== 0) process.exit(build.status || 1);
if (!process.argv.includes("--build-only")) {
  const server = spawn(
    process.execPath,
    [nextBin, "start", "-p", String(port), "-H", "localhost"],
    {
      cwd: workspace,
      env: qaEnvironment,
      stdio: "inherit",
    },
  );
  server.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  server.on("exit", (code) => {
    process.exitCode = code || 0;
  });
  process.on("SIGTERM", () => server.kill("SIGTERM"));
  process.on("SIGINT", () => server.kill("SIGINT"));
}
