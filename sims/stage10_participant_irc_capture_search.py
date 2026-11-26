"""Search a pinned 2014 participant IRC archive for a distinct Stage10 POST response.

This is a source retrieval/search only: it does not infer server paths or fabricate
an HTTP exchange. The pinned source is the public neuroretransmit archive.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

OWNER_REPO = "cicada-solvers/neuroretransmit-cicada"
COMMIT = "b13600373d3400d75ec4208198019f3d92a304dd"
LOGS = [
    "irc-logs/#33012014.freenode.log",
]
PATTERNS = {
    "stage10": re.compile(r"\bstage[\s_-]*10\b|\bstage[\s_-]*ten\b|\bstage[\s_-]*11\b", re.I),
    "square": re.compile(r"\bmagic squares?\b|\bsquares?\b|53301|71033|51033", re.I),
    "submission": re.compile(r"\bsubmit(?:ted|ting|sion)?\b|\baccepted\b|\bsuccess(?:ful)?\b", re.I),
    "callback": re.compile(r"cgi-bin/upload|key\.asc|Cicada/33\.01|hidden service|user-agent", re.I),
    "http_exchange": re.compile(
        r"\bPOST\b|\bGET /\b|HTTP/1\.[01]|Content-Length|Content-Type|Set-Cookie|Location:|Server:|\b200 OK\b",
        re.I,
    ),
    "response": re.compile(r"\bresponse\b|\breply\b|\backnowledg(?:e)?ment\b|\bcallback\b|\bbody\b|\bupload\b", re.I),
    "onion": re.compile(r"\.onion\b|ut3qtzbrvs7dtvzp", re.I),
    "digest": re.compile(r"\bp56\b|SHA-?512|[0-9a-f]{64,128}", re.I),
    "html": re.compile(r"<(?:html|form|body)\b|</(?:html|form|body)>", re.I),
}


def fetch(path: str) -> bytes:
    url = (
        f"https://raw.githubusercontent.com/{OWNER_REPO}/"
        f"{COMMIT}/{quote(path, safe='/')}"
    )
    request = Request(url, headers={"User-Agent": "liber-primus-research/1.0"})
    with urlopen(request, timeout=90) as response:
        if response.status != 200:
            raise RuntimeError(f"{url}: HTTP {response.status}")
        return response.read()


def main() -> None:
    outdir = Path("im-results/stage10-participant-irc-capture-search")
    outdir.mkdir(parents=True, exist_ok=True)
    sources = []
    for path in LOGS:
        raw = fetch(path)
        text = raw.decode("latin-1")
        lines = text.splitlines()
        hits = []
        for i, line in enumerate(lines):
            categories = [name for name, pattern in PATTERNS.items() if pattern.search(line)]
            if categories:
                lo, hi = max(0, i - 1), min(len(lines), i + 2)
                hits.append({
                    "line": i + 1,
                    "categories": categories,
                    "text": line[:700],
                    "context": [x[:700] for x in lines[lo:hi]],
                })
        # Keep all substantive hits up to 500; preserve totals even if capped.
        sources.append({
            "path": path,
            "url": f"https://github.com/{OWNER_REPO}/blob/{COMMIT}/{quote(path, safe='/')}",
            "commit": COMMIT,
            "bytes": len(raw),
            "sha256": hashlib.sha256(raw).hexdigest(),
            "encoding": "latin-1 for byte-preserving ASCII-compatible search",
            "lineCount": len(lines),
            "firstLine": lines[0] if lines else "",
            "firstLines": lines[:25],
            "sessionMarkers": [x for x in lines if "Session Start:" in x or "Session Close:" in x][:100],
            "dateSamples": [x[:700] for x in lines if re.search(r"2014|May", x, re.I)][:100],
            "lastLine": lines[-1] if lines else "",
            "matchCount": len(hits),
            "matches": hits[:1000],
            "truncated": len(hits) > 1000,
        })
    result = {
        "purpose": "Find a materially distinct participant-side Stage10 successful squares POST response; no URL/path guessing.",
        "sourceRepository": OWNER_REPO,
        "sourceCommit": COMMIT,
        "searchPatterns": list(PATTERNS),
        "sources": sources,
    }
    dest = outdir / "stage10-participant-irc-capture-search.json"
    dest.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(dest),
        "sources": [{
            "path": s["path"],
            "bytes": s["bytes"],
            "sha256": s["sha256"],
            "lines": s["lineCount"],
            "firstLine": s["firstLine"],
            "lastLine": s["lastLine"],
            "matches": s["matchCount"],
        } for s in sources],
    }, indent=2))


if __name__ == "__main__":
    main()
