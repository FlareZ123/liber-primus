"""Broaden exact original LP2 p0 source-factor inverses to CMU 1.1.3 words.

Run on Windows 11 with Python 3.12+ and cmudict==1.1.3.
No shell commands, writes, network, generated test input or model fitting.
The source is the original p0 13-rune red title followed by the 4/3/3/11
physical black word lengths. Both original F readings are admissible.

Includes:
 - p50 H*G source quartic, C=aP+b+K and C=b+P*K, all affine/offset
   values and four initial unknown field states solved algebraically;
 - degree-nine p50 factor, C=aP+b+K, all affine values and nine unknown
   initial key-state elements solved algebraically, both source directions;
 - native GP historical spelling, pinned public CMU 1.1.3 lexicon,
   all title word-pairs; authentic next four printed word slots.
Narrow conditional exclusion; no authentic LP2 plaintext is asserted.
"""

from collections import Counter, defaultdict
from pathlib import Path
import json
import re

import cmudict

ROOT = Path(__file__).resolve().parents[1]
GP = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
RAW = (ROOT / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf-8")
assert cmudict.__version__ == "1.1.3", cmudict.__version__
assert GP["translit"] == ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X",
                            "S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"]
P0 = GP["pages"][0]["indices"]
assert len(P0) == 262
assert P0[:17] == [15,8,18,3,6,19,27,0,15,26,18,21,5,2,11,6,25]
P0_WORDS = [len(x) for x in re.split(r"[-.]",
            RAW.split("%", 1)[0].replace("/\n","").replace("\n","")) if x]
assert P0_WORDS[:6] == [8,5,4,3,3,11] and sum(P0_WORDS) == len(P0)

MOD = 29
INV = [pow(v, -1, MOD) if v else 0 for v in range(MOD)]
TOKENS = sorted(((s,i) for i,s in enumerate(GP["translit"])),
                key=lambda p: -len(p[0]))
F4 = [14,9,13,28,1]
F9 = [11,15,0,9,1,5,10,20,12,1]
assert sum(F4) % MOD == 7 and sum(F9) % MOD == 26

def encode(word: str) -> tuple[int,...] | None:
    """Calibrated, native GP rune convention, matching solved LP1/p57."""
    w = (word.upper().replace("QU","CW").replace("V","U")
         .replace("K","C").replace("Q","C").replace("Z","S"))
    out: list[int] = []
    j = 0
    while j < len(w):
        if w.startswith("ING",j):
            out.append(21); j += 3; continue
        if w.startswith("IO",j):
            out.append(27); j += 2; continue
        for token,index in TOKENS:
            if w.startswith(token,j):
                out.append(index); j += len(token); break
        else:
            return None
    return tuple(out)

CMU = sorted({w.lower() for w in cmudict.words()
              if re.fullmatch(r"[a-z]+",w.lower())})
assert len(CMU) == 117493, len(CMU)
WORDS: dict[int,list[tuple[str,tuple[int,...]]]] = defaultdict(list)
LEX: dict[int,dict[tuple[int,...],list[str]]] = defaultdict(lambda: defaultdict(list))
for name in CMU:
    runes = encode(name)
    if runes is None:
        continue
    WORDS[len(runes)].append((name,runes))
    LEX[len(runes)][runes].append(name)
U_LIT = [(w,x) for w,x in WORDS[8] if x[7] == 0 and all(v != 0 for v in x[:7])]
U_ENC = [(w,x) for w,x in WORDS[8] if all(v != 0 for v in x)]
V5 = [(w,x) for w,x in WORDS[5] if all(v != 0 for v in x)]
assert (len(U_LIT),len(U_ENC),len(V5)) == (38,15471,15455)

def projection(words: list[tuple[str,tuple[int,...]]],
               ct: list[int], start: int, f: list[int],
               invplain: bool = False) -> list[tuple[str,tuple[int,...],int,tuple[int,...]]]:
    """Source polynomial row vectors split at original title word boundary.

    invplain=True returns each coefficient's A + (-b)*B contribution
    separately in a different helper; this function covers additive model.
    """
    degree = len(f)-1
    rows = len(ct)-degree
    coeffs = [[(j,f[j-r]) for j in range(max(r,start),
                min(r+degree+1,start+len(words[0][1])))] for r in range(rows)]
    out=[]
    for name,vals in words:
        residues = [sum(coef*vals[j-start] for j,coef in row) % MOD
                    for row in coeffs]
        out.append((name,vals,residues[0],tuple((v-residues[0]) % MOD
                   for v in residues[1:])))
    return out

def quartic_add(literal: bool, reverse: bool) -> int:
    ct = P0[:7]+P0[8:13] if literal else P0[:13]
    left = 7 if literal else 8
    f = F4[::-1] if reverse else F4
    lead = U_LIT if literal else U_ENC
    first = projection([(w,x[:left]) for w,x in lead],ct,0,f)
    second = projection(V5,ct,left,f)
    D = [sum(f[j]*ct[i+j] for j in range(5)) % MOD
         for i in range(len(ct)-4)]
    deltas = tuple((v-D[0]) % MOD for v in D[1:])
    count = 0
    for a in range(1,MOD):
        look: dict[tuple[int,...],list[tuple[str,tuple[int,...],int]]] = defaultdict(list)
        for w,vals,d0,tail in second:
            look[tail].append((w,vals,d0))
        wanted = tuple(v*INV[a] % MOD for v in deltas)
        for w,vals,d0,tail in first:
            target = tuple((x-y) % MOD for x,y in zip(wanted,tail))
            for v,x,head in look.get(target,()):
                b = (D[0]-a*(d0+head))*INV[sum(f)%MOD] % MOD
                assert 0 <= b < MOD
                count += 1
    return count

def multiplicative_parts(words: list[tuple[str,tuple[int,...]]],
                         ct: list[int], start: int, f: list[int]):
    rows = len(ct)-len(f)+1
    out=[]
    for name,vals in words:
        A=[];B=[]
        for r in range(rows):
            terms = [(j,f[j-r]) for j in range(max(start,r),
                     min(start+len(vals),r+len(f)))]
            A.append(sum(coeff*ct[j]*INV[vals[j-start]] for j,coeff in terms)%MOD)
            B.append(sum(coeff*INV[vals[j-start]] for j,coeff in terms)%MOD)
        out.append((name,vals,tuple(A),tuple(B)))
    return out

def quartic_multiplicative(literal: bool, reverse: bool) -> int:
    ct = P0[:7]+P0[8:13] if literal else P0[:13]
    first = U_LIT if literal else U_ENC
    left = 7 if literal else 8
    f = F4[::-1] if reverse else F4
    L = multiplicative_parts([(w,x[:left]) for w,x in first],ct,0,f)
    R = multiplicative_parts(V5,ct,left,f)
    count=0
    for b in range(MOD):
        second: dict[tuple[int,...],int] = defaultdict(int)
        for name,vals,A,B in R:
            second[tuple((x-b*y)%MOD for x,y in zip(A,B))] += 1
        for name,vals,A,B in L:
            need = tuple((-x+b*y)%MOD for x,y in zip(A,B))
            count += second.get(need,0)
    return count

def extend(f: list[int], seed: list[int], count: int) -> list[int]:
    values = seed[:]
    degree = len(f)-1
    while len(values) < count:
        t = len(values)
        values.append((-sum(f[i]*values[t-degree+i]
                    for i in range(degree))*INV[f[degree]])%MOD)
    return values

def following_word_depth(a: int,b: int,key: list[int],clock: int) -> tuple[int,list[str]]:
    """Return number of printed English words survived; no phase tuning."""
    states = [(clock,[])]
    start = 13
    for wi in range(2,6):
        size = P0_WORDS[wi]
        cipher = P0[start:start+size]
        start += size
        next_states = []
        for k,phrase in states:
            variants = [(k,())]
            for c in cipher:
                new=[]
                for keyindex,runic in variants:
                    if c == 0:
                        new.append((keyindex,runic+(0,)))
                    val = (c-b-key[keyindex])*INV[a]%MOD
                    if val != 0:
                        new.append((keyindex+1,runic+(val,)))
                variants = new
            for keyindex,runic in variants:
                possible = LEX[size].get(runic)
                if possible:
                    next_states.append((keyindex,phrase+[possible[0]]))
        if not next_states:
            return wi,[]
        states=next_states
    return 6,states[0][1]

def degree9_add(literal: bool, reverse: bool):
    ct = P0[:7]+P0[8:13] if literal else P0[:13]
    left = 7 if literal else 8
    f = F9[::-1] if reverse else F9
    first = projection([(w,x[:left]) for w,x in
                       (U_LIT if literal else U_ENC)],ct,0,f)
    second = projection(V5,ct,left,f)
    D = [sum(f[j]*ct[i+j] for j in range(10)) % MOD
         for i in range(len(ct)-9)]
    dc = tuple((v-D[0]) % MOD for v in D[1:])
    counter = Counter()
    titlefits = 0
    longest=[]
    for a in range(1,MOD):
        look=defaultdict(list)
        for name,vals,zero,tail in second:
            look[tail].append((name,vals,zero))
        target=tuple(x*INV[a]%MOD for x in dc)
        for name,vals,zero,tail in first:
            need=tuple((v-w)%MOD for v,w in zip(target,tail))
            for v,y,second0 in look.get(need,()):
                b=(D[0]-a*(zero+second0))*INV[sum(f)%MOD]%MOD
                P = vals+y
                seed = [(ct[i]-a*P[i]-b)%MOD for i in range(9)]
                K = extend(f,seed,35)
                assert all((a*p+b+K[i])%MOD==ct[i]
                           for i,p in enumerate(P))
                titlefits += 1
                reached,phrase=following_word_depth(a,b,K,len(ct))
                counter[reached] += 1
                if reached == 6:
                    longest.append([name,v,a,b,phrase])
    return {"titlefits":titlefits,"reached":dict(counter),
            "reaches_six":len(longest),"examples":longest[:4]}

def main():
    report={}
    for direction in (False,True):
        for literal in (True,False):
            ident=("rev_" if direction else "fwd_")+("literal" if literal else "cipherF")
            add4=quartic_add(literal,direction)
            mul4=quartic_multiplicative(literal,direction)
            add9=degree9_add(literal,direction)
            assert add4==mul4==0, (ident,add4,mul4)
            assert add9["reaches_six"]==0, (ident,add9["examples"])
            report[ident]={"source_HG_quartic_additive_titles":add4,
                          "source_HG_quartic_multiplicative_titles":mul4,
                          "source_degree9_additive":add9}
    assert [report[k]["source_degree9_additive"]["titlefits"] for k in
           ("fwd_literal","rev_literal","fwd_cipherF","rev_cipherF")] == [
           18862,18648,264790,264725]
    print(json.dumps({"status":"PASS","dictionary":"cmudict 1.1.3",
          "normalized_words":len(CMU),"source":"LP2 original p0",
          "models":"quartic affine, quartic multiplicative, degree-nine affine",
          "outcome":"zero English title for quartic; zero six-word continuations for degree nine",
          "report":report},indent=2))

if __name__=="__main__":
    main()
