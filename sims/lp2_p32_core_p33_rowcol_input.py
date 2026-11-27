"""Build the original and three native control cases for the exact core solver.

Usage (from repository root):
  python sims/lp2_p32_core_p33_rowcol_input.py > core_input.txt
  g++ -O3 -std=c++17 sims/lp2_p32_core_p33_rowcol_exact.cpp -o core_solver
  ./core_solver < core_input.txt

On Windows use the corresponding compiler/executable name, with stdin redirected
from a command prompt. Dictionary membership only; frequency is not optimized.
"""
import argparse
import json
import random
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
A = "0123456789abcdefghijklmnopqrs"
T = sorted(enumerate(
    ["F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J", "EO",
     "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D", "A", "AE", "Y", "IA", "EA"]
), key=lambda x: -len(x[1]))


def gp(word):
    w = (word.upper().replace("QU", "CW").replace("V", "U")
         .replace("K", "C").replace("Q", "C").replace("Z", "S"))
    s = ""
    i = 0
    while i < len(w):
        if w.startswith("ING", i):
            s += A[21]
            i += 3
        elif w.startswith("IO", i):
            s += A[27]
            i += 2
        else:
            for j, t in T:
                if w.startswith(t, i):
                    s += A[j]
                    i += len(t)
                    break
            else:
                raise ValueError(w)
    return s


def fingerprint(words):
    h = 2166136261
    for ch in "\n".join(sorted(words)):
        h = ((h ^ ord(ch)) * 16777619) & 0xffffffff
    return h


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--prime', action='store_true')
    parser.add_argument('--original-only', action='store_true')
    args=parser.parse_args()
    d = {}
    lex = ROOT / "resources/control/english_wordfreq_textblob.txt"
    for line in lex.read_text(encoding="utf-8").splitlines():
        m = re.fullmatch(r"([a-z]+)\s+([1-9]\d*)", line, re.I)
        if m:
            s = gp(m[1])
            d[s] = d.get(s, 0) + int(m[2])
    assert (len(d), fingerprint(d)) == (29060, 0x5eef1519)
    native = json.loads((ROOT / "resources/external/relikd-solved-gp29-native-v1.json").read_text(encoding="utf-8"))
    sections = {}
    for sec in native["sections"]:
        words = ["".join(A[native["runes"].index(c)] for c in w)
                 for w in re.findall(r"[\u16a0-\u16ff]+", sec["source_text"])]
        sections[sec["name"]] = words
        for w in words:
            d.setdefault(w, 1)
    assert (len(d), fingerprint(d)) == (29081, 0xc3a881db)
    src = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    pages = {p["page"]: p["indices"] for p in src["pages"]}
    p32 = pages[32]
    assert len(p32) == 121
    assert sum(src["prime"][x] for x in p32[:11]) == 563
    assert sum(src["prime"][x] for x in p32[::11]) == 569
    k = [p32[r*11+c] for r in range(1,10) for c in range(1,10)]
    if args.prime:
        k = [src['prime'][i] % 29 for i in k]
    c = pages[33][10:91]
    lengths = [2,9,6,3,3,5,3,2,7,3,3,6,5,8,2,3,2,2,2,3,2]
    assert len(c) == sum(lengths) == len(k) == 81
    controls = [("warning", "0_warning", 23),
                ("koan", "0_koan_1", 116),
                ("loss", "0_loss_of_divinity", 98)]
    if args.original_only:
        controls = []
    rng = random.Random(3301)
    print(len(d))
    for s,n in sorted(d.items()):
        print(s,n)
    print("".join(A[i] for i in k))
    print(len(controls)+1)
    for z,(name,sec,start) in enumerate(controls):
        words=[]
        for w in sections[sec][start:]:
            words.append(w)
            if sum(map(len,words)) >= 81:
                break
        lens=list(map(len,words))
        p="".join(words)
        assert len(p)==81 and max(lens)<=9 and all(w in d for w in words)
        rp=rng.sample(range(9),9)
        cp=rng.sample(range(9),9)
        sign=[1,-1,1][z]
        trans=[0,0,1][z]
        def key(r,c):
            return k[9*cp[c]+rp[r]] if trans else k[9*rp[r]+cp[c]]
        ct="".join(A[(A.index(v)+sign*key(i//9,i%9))%29] for i,v in enumerate(p))
        print(name,ct,len(lens),*lens,p,sign,trans,*rp,*cp)
    print("original","".join(A[i] for i in c),len(lengths),*lengths,"-",0,0,*range(9),*range(9))


if __name__ == "__main__":
    main()
