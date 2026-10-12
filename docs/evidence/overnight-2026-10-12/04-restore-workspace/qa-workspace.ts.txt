import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const directories = ["app", "components", "data", "lib", "public", "scripts", "styles", "types"];
const configuration = [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "postcss.config.mjs",
  "tsconfig.json",
  "proxy.ts",
  "tokens.css",
];
export function createQaWorkspace(sourceRoot: string, destination: string) {
  if (fs.existsSync(destination)) throw new Error("QA workspace đã tồn tại; cần runID mới.");
  const relative = path.relative(sourceRoot, destination);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
    throw new Error("QA workspace phải nằm trong scratch của source root.");
  const parts = relative.split(path.sep);
  if (parts[0] !== "scratch" || !parts[1]?.startsWith("qa-"))
    throw new Error("QA workspace phải nằm trong scratch/qa-*.");
  fs.mkdirSync(destination, { recursive: true });
  const files: { path: string; bytes: number; sha256: string }[] = [];
  function copy(relativePath: string) {
    const segments = relativePath.split("/");
    if (
      segments.some(
        (segment) =>
          segment === "uploads" ||
          segment === "qa-uploads" ||
          segment === "backups" ||
          segment.startsWith(".env") ||
          segment.startsWith(".next"),
      )
    )
      return;
    if (/[.](db|sqlite|sqlite3)(-wal|-shm)?$/i.test(relativePath)) return;
    const source = path.join(sourceRoot, relativePath);
    if (!fs.existsSync(source)) return;
    const stat = fs.lstatSync(source);
    if (stat.isSymbolicLink())
      throw new Error(`Không copy symlink trong QA source: ${relativePath}`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(source).sort()) copy(`${relativePath}/${name}`);
      return;
    }
    if (!stat.isFile()) throw new Error("QA source phải là file thường.");
    const bytes = fs.readFileSync(source);
    const target = path.join(destination, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes, { flag: "wx" });
    files.push({
      path: relativePath,
      bytes: bytes.length,
      sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
    });
  }
  for (const name of [...directories, ...configuration]) copy(name);
  files.sort((a, b) => a.path.localeCompare(b.path));
  return {
    files,
    fingerprint: crypto.createHash("sha256").update(JSON.stringify(files)).digest("hex"),
  };
}

// Deliberately excludes user/service credentials and NODE_OPTIONS/preload hooks.
export function qaBaseEnvironment(
  environment: Partial<NodeJS.ProcessEnv>,
): Partial<NodeJS.ProcessEnv> {
  const allowed = [
    "PATH",
    "Path",
    "SystemRoot",
    "SYSTEMROOT",
    "WINDIR",
    "ComSpec",
    "COMSPEC",
    "PATHEXT",
    "TEMP",
    "TMP",
    "TMPDIR",
    "HOME",
    "USERPROFILE",
    "APPDATA",
    "LOCALAPPDATA",
    "CI",
    "NO_COLOR",
  ];
  return Object.fromEntries(
    allowed
      .filter((name) => environment[name] !== undefined)
      .map((name) => [name, environment[name]]),
  );
}
