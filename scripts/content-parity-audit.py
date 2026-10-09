"""Read-only inventory of the public WordPress source and local CMS database."""
import concurrent.futures, datetime, html, json, re, sqlite3, urllib.request
from pathlib import Path
from urllib.parse import urlparse

OUT = Path("docs/content-audit-2026-10-08")
OUT.mkdir(parents=True, exist_ok=True)
BASE = "https://topicauni.edu.vn/wp-json/wp/v2"

def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Topica-content-parity-audit/1.0", "Accept": "application/json,text/html"})
    with urllib.request.urlopen(request, timeout=25) as response:
        raw = response.read()
        return raw, dict(response.headers)

def collection(kind):
    fields = "id,slug,link,parent,status,title,content,excerpt,featured_media,modified,categories"
    first, headers = fetch(f"{BASE}/{kind}?per_page=100&page=1&_fields={fields}")
    items = json.loads(first)
    pages = int(headers.get("X-WP-TotalPages", headers.get("x-wp-totalpages", "1")))
    total = int(headers.get("X-WP-Total", headers.get("x-wp-total", str(len(items)))))
    if pages > 1:
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            batches = pool.map(lambda page: json.loads(fetch(f"{BASE}/{kind}?per_page=100&page={page}&_fields={fields}")[0]), range(2, pages + 1))
            for batch in batches: items.extend(batch)
    print(f"SOURCE {kind}: {len(items)}/{total}", flush=True)
    return {"items": items, "declared_total": total, "complete": len(items) == total}

def text(value):
    value = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", value or "", flags=re.S|re.I)
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", value)).split())

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    results = dict(zip(["pages", "posts"], pool.map(collection, ["pages", "posts"])))
(OUT / "source-inventory.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
connection = sqlite3.connect("file:data/topica.db?mode=ro", uri=True)
connection.row_factory = sqlite3.Row
local = {}
for kind, table in [("pages", "pages"), ("posts", "articles")]:
    columns = [row[1] for row in connection.execute(f"PRAGMA table_info({table})")]
    wanted = [name for name in ["id", "slug", "title", "status", "content", "updated_at"] if name in columns]
    local[kind] = [dict(row) for row in connection.execute(f"SELECT {','.join(wanted)} FROM {table}")]
connection.close()
rows = []
for kind in ["pages", "posts"]:
    by_slug = {item["slug"]: item for item in local[kind]}
    for item in results[kind]["items"]:
        stored = by_slug.get(item["slug"])
        source_text = text(item["content"]["rendered"])
        row = {"kind": kind, "source_id": item["id"], "slug": item["slug"], "source_url": item["link"], "source_path": urlparse(item["link"]).path, "title": text(item["title"]["rendered"]), "source_text_length": len(source_text), "local_present": stored is not None, "local_status": stored.get("status") if stored else None, "local_text_equal": text(stored.get("content")) == source_text if stored else False}
        row["links"] = re.findall(r"href=[\"']([^\"']+)", item["content"]["rendered"], flags=re.I)
        row["images"] = re.findall(r"src=[\"']([^\"']+)", item["content"]["rendered"], flags=re.I)
        rows.append(row)
summary = {"checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": BASE, "source_complete": all(value["complete"] for value in results.values()), "source_counts": {kind: len(value["items"]) for kind, value in results.items()}, "local_counts": {kind: len(value) for kind, value in local.items()}, "local_published_counts": {kind: sum(item.get("status") == "published" for item in value) for kind, value in local.items()}, "matched_local_counts": {kind: sum(row["local_present"] for row in rows if row["kind"] == kind) for kind in results}, "equal_local_counts": {kind: sum(row["local_text_equal"] for row in rows if row["kind"] == kind) for kind in results}}
(OUT / "comparison.json").write_text(json.dumps({"summary": summary, "items": rows}, ensure_ascii=False, indent=2))
try:
    raw, _ = fetch("https://topicauni.edu.vn/")
    (OUT / "source-homepage.html").write_bytes(raw)
    print(f"SOURCE homepage: {len(raw)} bytes", flush=True)
except Exception as error:
    print(f"SOURCE homepage unavailable: {type(error).__name__}: {error}", flush=True)
print(json.dumps(summary, ensure_ascii=False), flush=True)
