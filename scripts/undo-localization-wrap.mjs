import ts from "typescript";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
function walk(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, item.name);
    if (item.isDirectory()) { if (item.name !== "i18n") walk(file); continue; }
    if (!file.endsWith(".tsx") || file.endsWith("LanguageSwitcher.tsx")) continue;
    let text = readFileSync(file, "utf8");
    text = text.replace(/<\/?LocalizedText>/g, "").replace(/import \{ Localized(?:Text|Element) \} from "@\/components\/i18n\/Localized(?:Text|Element)";\r?\n/g, "");
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const edits = [];
    function visit(node) {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(source) === "LocalizedElement") {
        const attr = node.attributes.properties.find((p) => ts.isJsxAttribute(p) && p.name.getText(source) === "as");
        const tag = attr?.initializer?.text;
        if (tag) {
          edits.push({start: node.tagName.getStart(source), end: attr.end, value: tag});
          if (ts.isJsxOpeningElement(node)) { const closing = node.parent.closingElement.tagName; edits.push({start: closing.getStart(source), end: closing.end, value: tag}); }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    for (const edit of edits.sort((a,b) => b.start-a.start)) text = text.slice(0,edit.start)+edit.value+text.slice(edit.end);
    text = text.replace(/from "@\/components\/i18n\/LocalizedImage"/g, 'from "next/image"').replace(/from "@\/components\/i18n\/LocalizedLink"/g, 'from "next/link"');
    writeFileSync(file,text);
  }
}
walk("components"); walk("app/(main)");
