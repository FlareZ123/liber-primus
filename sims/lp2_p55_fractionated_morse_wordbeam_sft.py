"""Reproduce the bounded p55 lexical Morse inverse on pinned source files.

Run: python sims/lp2_p55_fractionated_morse_wordbeam_sft.py OUTPUT_DIR
Requires g++ (C++17); no third-party Python libraries. Outputs raw per-start logs.
The fixed control locations and permutations are used only to construct/evaluate
the six controls, never as inputs to the key search.
"""
import concurrent.futures
import itertools
import json
import os
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(sys.argv[1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
MORSE = dict(zip("ABCDEFGHIJKLMNOPQRSTUVWXYZ", [
    ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---",
    "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-",
    "..-", "...-", ".--", "-..-", "-.--", "--.."
]))
BOOK = ["".join(v) for v in itertools.product(".-x", repeat=3) if v != ("x", "x", "x")]
spec = [
    (2555, 0, [18,5,9,13,7,17,3,10,24,16,11,12,19,15,20,21,0,25,22,6,2,23,1,14,4,8]),
    (7080, 0, [0,3,6,11,14,10,8,5,20,21,18,22,4,7,16,19,12,9,25,23,24,17,1,13,2,15]),
    (12072,0, [9,14,20,24,13,4,7,11,1,2,12,18,17,25,16,19,3,21,15,0,23,10,5,8,22,6]),
    (2556, 4, [0,18,1,21,2,5,10,20,12,15,8,11,6,16,4,17,23,3,14,7,22,25,24,19,9,13]),
    (7079, 7, [1,13,18,7,12,17,5,11,9,19,10,16,15,4,3,14,6,8,25,23,21,2,20,24,22,0]),
    (12231,2,[0,3,12,8,6,24,18,11,7,20,17,14,22,5,16,19,15,9,2,23,21,1,4,13,10,25]),
]
lex = ROOT / "resources/control/english_wordfreq_textblob.txt"
rows = [line.split() for line in lex.read_text(encoding="utf-8").splitlines()
        if re.fullmatch(r"[a-z]+\s+\d+", line)]
normalized = "".join(f"{w} {n}\n" for w, n in rows)
h = 2166136261
for c in normalized:
    h = ((h ^ ord(c)) * 16777619) & 0xffffffff
assert len(rows) == 29157 and h == 0xdbba7225
(OUT/"lex.txt").write_text(normalized, encoding="ascii")
top = sorted(rows, key=lambda row: (-int(row[1]),row[0]))[:5000]
max_word = max(len("x".join(MORSE[c] for c in w.upper())+"xx") for w,_ in top)
assert max_word == 59
src = (ROOT/"resources/control/gibran_prophet_58585.txt").read_text(encoding="utf-8")
words = re.findall("[A-Z]+", src.upper())
wcode = ["x".join(MORSE[c] for c in w)+"xx" for w in words]
corpus = json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
original = next(p["indices"] for p in corpus["pages"] if p["page"] == 55)
tapes = [original]
truth = {}
for i, (start, cut, perm) in enumerate(spec, 1):
    t = "".join(wcode[start:start+30])[cut:cut+228]
    c = [perm[BOOK.index(t[j:j+3])] for j in range(0,228,3)]
    assert len(c)==76 and len(set(c))==25
    tapes.append(c)
    truth[i] = {"trits":t,"key":{v:BOOK[j] for j,v in enumerate(perm)},
                "boundary":len(wcode[start])-cut if cut else 0}
for i, t in enumerate(tapes):
    (OUT/f"tape{i}.txt").write_text(" ".join(map(str,t)),encoding="ascii")
exe = OUT/("wordbeam.exe" if os.name=="nt" else "wordbeam")
subprocess.run(["g++","-O3","-std=c++17",str(ROOT/"sims/lp2_p55_fractionated_morse_wordbeam.cpp"),"-o",str(exe)],check=True)

def run(job):
    i, start, free = job
    p = OUT/f"{i}-{start}-{free}.json"
    args = [str(exe),str(OUT/"lex.txt"),str(OUT/f"tape{i}.txt"),"1000","5000",str(free),str(start)]
    r = subprocess.run(args,check=True,capture_output=True,text=True)
    d = {"id":i,"start":start,"free":free,"stdout":r.stdout,"stderr":r.stderr}
    p.write_text(json.dumps(d,indent=2)+"\n",encoding="utf-8")
    return d

jobs = [(i,0,0) for i in range(4)]
jobs += [(i,k,1) for i in (0,4,5,6) for k in range(59)]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    logs = list(pool.map(run,jobs))
summary = []
for i in range(7):
    a = [x for x in logs if x["id"]==i]
    live = [x for x in a if x["stdout"]]
    item = {"id":i,"runs":len(a),"live":[[x["start"],x["free"]] for x in live]}
    if i:
        # Every selected observed code is evaluated; guessed clipped word completions
        # are deliberately not treated as recovered characters.
        best = max(live,key=lambda x:float(re.search(r"score=([-0-9.]+)",x["stdout"]).group(1))) if live else None
        if best:
            key = {int(k):v for k,v in (s.split(":") for s in best["stdout"].splitlines()[1][4:].strip(",").split(","))}
            decoded = "".join(key[x] for x in tapes[i])
            item.update({"selected":best["start"],
                "key_correct":sum(key[x]==truth[i]["key"][x] for x in set(tapes[i])),
                "trits_correct":sum(a==b for a,b in zip(decoded,truth[i]["trits"])),
                "decoded_trits":decoded,"true_boundary":truth[i]["boundary"]})
    summary.append(item)
print(json.dumps(summary,indent=2))
(OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
