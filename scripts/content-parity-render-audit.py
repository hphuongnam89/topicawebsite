"""Read-only HTTP rendering parity; does not execute browser scripts or submit forms."""
import concurrent.futures, csv, html, json, re, time, urllib.error, urllib.request
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

OUT=Path("docs/content-audit-2026-10-08")
source=json.loads((OUT/"source-inventory.json").read_text())
comparison=json.loads((OUT/"comparison.json").read_text())
class Visible(HTMLParser):
    def __init__(self, main_only=False):
        super().__init__();self.skip=0;self.main=0;self.main_only=main_only;self.words=[];self.links=[];self.images=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ["script","style"]:self.skip+=1
        if tag=="main":self.main+=1
        if tag=="a" and a.get("href"):self.links.append(a["href"])
        if tag=="img" and a.get("src"):self.images.append(a["src"])
    def handle_endtag(self,tag):
        if tag in ["script","style"]:self.skip=max(0,self.skip-1)
        if tag=="main":self.main=max(0,self.main-1)
    def handle_data(self,value):
        if not self.skip and (self.main or not self.main_only):self.words.append(value)
    def text(self):return " ".join(" ".join(self.words).split())
def normalize(value):return " ".join(html.unescape(value).casefold().split())
def shingle(value):
    words=normalize(value).split();n=min(5,len(words));return set(" ".join(words[i:i+n]) for i in range(len(words)-n+1)) if n else set()
def audit(row):
    path="/tin-tuc/"+row["slug"] if row["kind"]=="posts" else row["source_path"]
    url="http://127.0.0.1:3010"+path
    result={**row,"local_url":url}
    try:
        request=urllib.request.Request(url,headers={"User-Agent":"Topica-content-parity-audit/1.0"})
        with urllib.request.urlopen(request,timeout=30) as response:
            raw=response.read().decode("utf-8",errors="replace");result.update(status=response.status,final_url=response.url)
        parser=Visible(main_only=False);parser.feed(raw)
        (OUT/"rendered").mkdir(exist_ok=True)
        (OUT/"rendered"/f"{row['kind']}-{row['source_id']}.html").write_text(raw)
        actual=normalize(parser.text())
        original=next(item for item in source[row["kind"]]["items"] if item["id"]==row["source_id"])
        src_parser=Visible();src_parser.feed(original["content"]["rendered"])
        expected=normalize(src_parser.text());phrases=shingle(expected)
        matches=sum(phrase in actual for phrase in phrases)
        result.update(rendered_text_length=len(actual),source_phrase_count=len(phrases),matched_phrases=matches,phrase_coverage=round(matches/len(phrases),4) if phrases else None,source_images=len(src_parser.images),rendered_images=len(parser.images))
        result["classification"]="source-empty" if not expected else "near-complete-text" if result["phrase_coverage"]>=.98 else "partial-or-rewritten"
        (OUT/"rendered").mkdir(exist_ok=True)
        (OUT/"rendered"/f"{row['kind']}-{row['source_id']}.txt").write_text(parser.text())
    except urllib.error.HTTPError as error:
        result.update(status=error.code,classification="http-error",error=str(error))
    except Exception as error:
        result.update(status=None,classification="unverified",error=f"{type(error).__name__}: {error}")
    return result
rows=comparison["items"]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    tested=[]
    for result in pool.map(audit,rows):
        tested.append(result)
        if len(tested)%10==0:print(f"Rendered {len(tested)}/{len(rows)}",flush=True)
summary={kind:{label:sum(r["kind"]==kind and r["classification"]==label for r in tested) for label in ["near-complete-text","partial-or-rewritten","source-empty","http-error","unverified"]} for kind in ["pages","posts"]}
(OUT/"rendered-comparison.json").write_text(json.dumps({"summary":summary,"items":tested},ensure_ascii=False,indent=2))
with (OUT/"content-parity.csv").open("w",encoding="utf-8-sig",newline="") as handle:
    fields=["kind","title","source_url","local_url","status","classification","source_text_length","rendered_text_length","phrase_coverage","local_present","source_images","rendered_images"]
    writer=csv.DictWriter(handle,fieldnames=fields,extrasaction="ignore");writer.writeheader();writer.writerows(tested)
print(json.dumps(summary,ensure_ascii=False),flush=True)
