#!/usr/bin/env python3
"""Read-only original Cicada OS filesystem consumer census.

Run on an extracted root filesystem; preserves hashes and actual references.
No OS programs are executed, and suspicious files are read as inert bytes.
"""
import hashlib
import json
import os
import re
import sys
from pathlib import Path

assert len(sys.argv) == 2, "Usage: python sims/cicada2013_os_rootfs_consumer_sft.py ROOTFS"
root = Path(sys.argv[1]).resolve()
assert root.is_dir(), f"missing rootfs {root}"
files = []
links = []
for base, dirs, names in os.walk(root, followlinks=False):
    dpath = Path(base)
    for name in names:
        path = dpath / name
        rel = path.relative_to(root).as_posix()
        if path.is_symlink():
            links.append({"path": rel, "target": os.readlink(path)})
            continue
        if not path.is_file():
            continue
        files.append((rel, path))

expected = ("tmp/wisdom", "tmp/folly")
targets = {}
for rel in expected:
    p = root / rel
    assert p.is_file(), f"ISO rootfs missing {rel}"
    b = p.read_bytes()
    targets[rel] = {
        "length": len(b), "md5": hashlib.md5(b).hexdigest(),
        "sha256": hashlib.sha256(b).hexdigest(),
        "gitBlobSha1": hashlib.sha1(b"blob " + str(len(b)).encode() + bytes([0]) + b).hexdigest(),
    }
assert (root / expected[0]).read_bytes() == (root / expected[1]).read_bytes()
assert targets[expected[0]]["length"] == 3368
assert targets[expected[0]]["md5"] == "0c7d18e82cdac189d165706db4064a84"
assert targets[expected[0]]["gitBlobSha1"] == "62b1b949a1e4e4a346e75b1c34101000d3c53220"

# Exact target-path or target-name occurrences; on binaries do not presume
# incidental printable byte strings are executable consumer references.
pat = re.compile(rb"(?i)(?:/tmp/(?:wisdom|folly)|\b(?:wisdom|folly)\b)")
hits = []
binary_hits = []
for rel, path in files:
    if rel in expected:
        continue
    b = path.read_bytes()
    matches = list(pat.finditer(b))
    if not matches:
        continue
    is_text = (bytes([0]) not in b) and (
        len(b) == 0 or sum(32 <= byte <= 126 or byte in (9,10,13) for byte in b) / len(b) > 0.85
    )
    excerpts = []
    for m in matches[:12]:
        lo = max(0, m.start() - 70)
        hi = min(len(b), m.end() + 90)
        excerpts.append({"byteOffset": m.start(), "snippet": b[lo:hi].decode("latin1", "replace")})
    row = {"path": rel, "fileBytes": len(b), "count": len(matches), "textLikely": is_text, "snippets": excerpts}
    (hits if is_text else binary_hits).append(row)

script = root / "usr/local/bin/cicada"
startup = script.read_text("utf-8", "replace") if script.is_file() else None
names = [rel for rel,_ in files]
print(json.dumps({
    "rootfs": {"files":len(files),"symlinks":len(links),
               "totalRegularFileBytes":sum(p.stat().st_size for _,p in files),
               "originalTargets":targets},
    "startupScript":startup,
    "textConsumerNameHits":hits,
    "binaryNameHits":binary_hits,
    "symlinkNameHits":[x for x in links if re.search(r"(?i)wisdom|folly",x["path"]+" "+x["target"])],
    "directorySamples": {
        "etc-init": [p for p in names if p.startswith("etc/init") or p.startswith("etc/rc")][:50],
        "opt-hooks":[p for p in names if p.startswith("opt/")][:50],
        "usr-local-bin":[p for p in names if p.startswith("usr/local/bin/")][:50]
    },
    "interpretation": "Literal reference census only; indirect runtime discovery or dynamic path construction cannot be categorically excluded."
}, indent=2))
