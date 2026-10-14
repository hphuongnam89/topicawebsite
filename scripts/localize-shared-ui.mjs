import ts from "typescript";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, ".");
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const roots = [
  "app/(main)",
  ...[
    "sections",
    "layout",
    "admission",
    "program",
    "cms",
    "tuition",
    "forms",
    "faq",
    "news",
    "article",
    "cta",
    "ui",
  ].map((dir) => `components/${dir}`),
];
const skip = /(?:LanguageSwitcher|RichTextEditor|WordPressContent|design-system|cn)\./;
const files = [];
function collect(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (path.endsWith(".tsx") && !skip.test(path)) files.push(path);
  }
}
roots.forEach(collect);
const vocabulary = new Set();
let changed = 0;
for (const file of files) {
  const source = program.getSourceFile(file);
  if (!source) continue;
  const text = readFileSync(file, "utf8");
  if (text.includes('"@/components/i18n/LocalizedText"')) continue;
  const edits = [];
  let useText = false;
  let useElement = false;
  function edit(start, end, value) {
    edits.push({ start, end, value });
  }
  function hasString(type) {
    return (
      !!(type.flags & ts.TypeFlags.StringLike) || (type.isUnion() && type.types.some(hasString))
    );
  }
  function walk(node) {
    if (
      ts.isStringLiteral(node) &&
      /[\u00c0-\u1eff]/.test(node.text) &&
      node.text.length < 900 &&
      !node.text.includes("<")
    )
      vocabulary.add(node.text.replace(/\s+/g, " ").trim());
    if (ts.isJsxText(node) && node.text.trim()) {
      const normalized = node.text.replace(/\s+/g, " ").trim();
      if (/[\u00c0-\u1eff]/.test(normalized)) vocabulary.add(normalized);
      const start = node.getStart(source);
      edit(start, node.end, `<LocalizedText>${text.slice(start, node.end)}</LocalizedText>`);
      useText = true;
    } else if (
      ts.isJsxExpression(node) &&
      node.expression &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent)) &&
      hasString(checker.getTypeAtLocation(node.expression))
    ) {
      const start = node.getStart(source);
      edit(start, node.end, `<LocalizedText>${text.slice(start, node.end)}</LocalizedText>`);
      useText = true;
      // Nested JSX branches still need their own strings localized.
    } else if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      const native = /^[a-z][a-z0-9-]*$/.test(tag);
      const attrs = node.attributes.properties;
      if (
        native &&
        (["input", "textarea", "select"].includes(tag) ||
          attrs.some(
            (attr) =>
              ts.isJsxAttribute(attr) &&
              ["aria-label", "aria-description", "title", "placeholder", "alt"].includes(
                attr.name.getText(source),
              ),
          ))
      ) {
        edit(node.tagName.getStart(source), node.tagName.end, `LocalizedElement as="${tag}"`);
        if (ts.isJsxOpeningElement(node)) {
          const close = node.parent.closingElement.tagName;
          edit(close.getStart(source), close.end, "LocalizedElement");
        }
        useElement = true;
      }
    }
    ts.forEachChild(node, walk);
  }
  walk(source);
  // Apply insertions rather than overlapping replacements for text expressions.
  const safeEdits = [];
  for (const change of edits) {
    if (change.value.startsWith("<LocalizedText>")) {
      safeEdits.push(
        { start: change.start, end: change.start, value: "<LocalizedText>" },
        { start: change.end, end: change.end, value: "</LocalizedText>" },
      );
    } else safeEdits.push(change);
  }
  let result = text;
  for (const change of safeEdits.sort(
    (a, b) =>
      b.start - a.start ||
      (a.value === "<LocalizedText>" ? -1 : b.value === "<LocalizedText>" ? 1 : 0),
  ))
    result = result.slice(0, change.start) + change.value + result.slice(change.end);
  result = result
    .replace(/from "next\/image"/g, 'from "@/components/i18n/LocalizedImage"')
    .replace(/from "next\/link"/g, 'from "@/components/i18n/LocalizedLink"');
  let imports = "";
  if (useText) imports += 'import { LocalizedText } from "@/components/i18n/LocalizedText";\n';
  if (useElement)
    imports += 'import { LocalizedElement } from "@/components/i18n/LocalizedElement";\n';
  const directive = result.match(/^(?:"use client"|'use client');\s*/);
  const position = directive ? directive[0].length : 0;
  result = result.slice(0, position) + imports + result.slice(position);
  if (result !== text) {
    writeFileSync(file, result);
    changed++;
  }
}
console.log(`Localized ${changed} shared files. Source vocabulary:`);
console.log([...vocabulary].sort().join("\n"));
