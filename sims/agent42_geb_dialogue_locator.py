#!/usr/bin/env python3
"""Locate the 14 source-selected GEB dialogue headings in the pinned OCR.

The OCR is fetched only at runtime. This locator emits line coordinates and
short contexts, not a copy of the copyrighted book.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

URL = (
    "https://raw.githubusercontent.com/neuroretransmit/cicada/"
    "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/"
    "2014/007-fifth-onion/eternal-golden-braid.txt"
)
BLOB_SHA = "da652686147aa1c8585be659c89d0db60c831571"
TITLES = [
    "Three-Part Invention",
    "Little Harmonic Labyrinth",
    "Edifying Thoughts of a Tobacco Smoker",
    "... Ant Fugue",
    "A Mu Offering",
    "Crab Canon",
    "Canon by Intervallic Augmentation",
    "Chromatic Fantasy, And Feud",
    "Six-Part Ricercar",
    "Contracrostipunctus",
    "Aria with Diverse Variations",
    "Contrafactus",
    "Sloth Canon",
    "Air on G's String",
]

def norm(s):
    return "".join(c.lower() for c in s if c.isalnum())

def main():
    req = Request(URL, headers={"User-Agent": "lp2-geb-eight-dialogue-audit"})
    raw = urlopen(req, timeout=120).read()
    sha = hashlib.sha1(b"blob " + str(len(raw)).encode("ascii") + b"\\0" + raw).hexdigest()
    assert sha == BLOB_SHA, (len(raw), sha)
    text = raw.decode("utf-8", errors="replace")
    lines = text.splitlines()
    ntext = []
    nline = []
    for i, line in enumerate(lines):
        for c in line:
            if c.isalnum():
                ntext.append(c.lower())
                nline.append(i)
    hay = "".join(ntext)
    result = {"source": {"url": URL, "bytes": len(raw), "git_blob_sha1": sha,
                         "line_count": len(lines)}, "titles": {}}
    for title in TITLES:
        needle = norm(title)
        starts = []
        at = 0
        while True:
            at = hay.find(needle, at)
            if at < 0:
                break
            starts.append(nline[at])
            at += max(1, len(needle))
        contexts = []
        for ln in starts:
            lo, hi = max(0, ln - 5), min(len(lines), ln + 8)
            contexts.append({"line": ln + 1, "context": lines[lo:hi]})
        result["titles"][title] = {"normalized": needle, "occurrences": contexts}
    out = Path("geb-dialogue-locator.json")
    out.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2), flush=True)

if __name__ == "__main__":
    main()
