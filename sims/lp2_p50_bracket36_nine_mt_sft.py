"""Source-selected 36-byte bracket -> nine signed red-heading chapter 32-bit seeds.

Potential key: one 32-bit Mersenne Twister seed per visible red chapter.
This is a narrow *investigator-selected* 2014-available consumer. Original
ciphertext is left unchanged; only direct GP29 additive directions are tested.
No third-party code, network access or external language model.
"""
from __future__ import annotations

import hashlib
import json
import random
from pathlib import Path

root = Path(__file__).resolve().parent.parent
grid = json.loads((root / "resources/liber-primus/lp2-grid-256.json").read_text(encoding="utf-8"))
book = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
assert len(grid["bytes"]) == 256
block = bytes(grid["bytes"][193:229])
assert len(block) == 36
assert hashlib.sha256(block).hexdigest() == "9205dc9d0d6071448dd91876e1211becd2b4ef224445030e11b08b63acbdd86b"
assert grid["bytes"][192] == grid["bytes"][229] == 0

chapters: list[list[int]] = []
for a, b in zip([0,3,8,15,23,27,33,40,54], [3,8,15,23,27,33,40,54,56]):
    chapter = [v for p in book["pages"][a:b] for v in p["indices"]]
    chapters.append(chapter)
assert len(chapters) == 9
assert list(map(len,chapters)) == [729,1145,1729,1903,1021,1433,1680,3008,308]
assert sum(map(len,chapters)) == 12956
assert len(book["pages"][57]["indices"]) == 95

def ioc(x: list[int]) -> float:
    counts = [x.count(k) for k in range(29)]
    return sum(n*(n-1) for n in counts)/(len(x)*(len(x)-1))

def mt_tape(seed: int, n: int, readout: str) -> list[int]:
    r = random.Random(seed)
    if readout == "randrange29":
        return [r.randrange(29) for _ in range(n)]
    if readout == "bits32mod29":
        return [r.getrandbits(32) % 29 for _ in range(n)]
    if readout == "bits8mod29":
        return [r.getrandbits(8) % 29 for _ in range(n)]
    raise ValueError(readout)

out = []
for endian in ("big","little"):
    seeds = [int.from_bytes(block[4*j:4*j+4],endian) for j in range(9)]
    for readout in ("randrange29","bits32mod29","bits8mod29"):
        taps = [mt_tape(seed,len(c),readout) for seed,c in zip(seeds,chapters)]
        for sign in (-1,1):
            plain = [[(c+sign*k)%29 for c,k in zip(chapter,tap)] for chapter,tap in zip(chapters,taps)]
            # Physical chapters are the only resets. Every variant reenciphers all original runes.
            assert all([((p-sign*k)%29)==c for c,p,k in zip(chapter,pl,tap)]
                       for chapter,pl,tap in zip(chapters,plain,taps))
            control = book["pages"][57]["indices"]
            encrypted=[(p-sign*k)%29 for p,k in zip(control,taps[0])]
            assert [(c+sign*k)%29 for c,k in zip(encrypted,taps[0])] == control
            out.append({"endian":endian,"readout":readout,"sign":sign,
                        "seedPrefix":seeds[:2],
                        "chapterIoC":[round(ioc(ch),6) for ch in plain],
                        "wholeIoC":round(ioc([x for ch in plain for x in ch]),6)})
assert len(out) == 12
best=max(out,key=lambda a: min(a["chapterIoC"][:8]))
print(json.dumps({"status":"source 9x4 key evaluation","sourceBytes":block.hex(),
"originalChapterIoC":[round(ioc(ch),6) for ch in chapters],
"bestMinChapterIoC":best,"all":out},indent=2))
