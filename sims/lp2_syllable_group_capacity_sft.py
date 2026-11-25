#!/usr/bin/env python3
"""Agent3 #2744: exact alignment-independent syllable grouping capacity.

Pinned cmudict==1.1.3, first ARPAbet pronunciation. Every stress-tagged
vowel is a syllable nucleus (2009 NLTK book ch.2). The maximal-onset
assignment of intervocalic consonants cannot change the nucleus count.
Grant arbitrary nonempty GP boundaries for each full word, clip both
edge words freely, and grant all OOVs one syllable.
"""
from __future__ import annotations

import bisect
import collections
import functools
import hashlib
import json
import re
from pathlib import Path

import cmudict

ROOT = Path(__file__).resolve().parents[1]
PATHS = {
    "corpus": "resources/liber-primus/lp2-corpus.json",
    "original": "resources/transcriptions/lp2-image-corrected.txt",
    "latin": "resources/liber-primus/lp1-plaintext-reference.txt",
    "native": "resources/transcriptions/lp1_wulfic_canonical.txt",
    "Gibran": "resources/control/gibran_prophet_58585.txt",
    "Emerson": "resources/control/emerson_essays_2944.txt",
    "Shakespeare": "resources/control/shakespeare_first300k.txt",
}
raw = {key: (ROOT / p).read_bytes() for key, p in PATHS.items()}
data = {key: b.decode("utf-8-sig").replace("\r\n", "\n") for key, b in raw.items()}
C = json.loads(data["corpus"])
gp = C["runes"]
tokens = sorted(enumerate(C["translit"]), key=lambda item: -len(item[1]))
pron = cmudict.dict()
assert cmudict.__version__ == "1.1.3"
runes_pattern = re.compile("[" + "".join(gp) + "]+")
latin_pattern = re.compile("[A-Z]+")

@functools.lru_cache(maxsize=None)
def native(word: str) -> tuple[int, ...]:
    word = word.replace("QU", "CW").replace("V", "U").replace("K", "C").replace("Q", "C").replace("Z", "S")
    out = []
    i = 0
    while i < len(word):
        if word.startswith("ING", i):
            out.append(21)
            i += 3
        elif word.startswith("IO", i):
            out.append(27)
            i += 2
        else:
            v, spelling = next((v, s) for v, s in tokens if word.startswith(s, i))
            out.append(v)
            i += len(spelling)
    return tuple(out)

@functools.lru_cache(maxsize=None)
def word_info(word: str) -> tuple[int, int, int, int, bool]:
    L = len(native(word))
    variants = pron.get(word.lower())
    s = max(1, sum(p[-1] in "012" for p in variants[0])) if variants else 1
    # If s>L the one-rune minimum is impossible; granting arbitrary
    # partition anyway is a conservative relaxation of the receiver.
    # If s syllables occupy L positions, >=2s-L singletons and
    # >=ceil((3s-L)/2) groups of size <=2, for ANY positive partition.
    return L, s, max(0, 2*s-L), max(0, (3*s-L+1)//2), variants is None

def word_stats(words):
    infos = [word_info(w) for w in words]
    return {"words": len(words), "runes": sum(x[0] for x in infos),
            "nuclei_lower": sum(x[1] for x in infos),
            "singleton_lower": sum(x[2] for x in infos),
            "short_group_lower": sum(x[3] for x in infos),
            "oov": dict(collections.Counter(w for w,x in zip(words, infos) if x[4])),
            "impossible_nonempty_words": sum(x[1]>x[0] for x in infos)}

# Same original source calibration as the shared source-orthography SFT.
sections = dict((int(n), s) for n,s in re.findall(r"(?ms)^### (\d+)\s*\n(.*?)(?=^### |\Z)", data["latin"]))
def words_in_section(n):
    s = re.sub(r"(?m)^\[[^\n]*\]$", "", sections[n])
    return latin_pattern.findall(s.upper())
reference = [w for n in range(10,14) for w in words_in_section(n)]
start = data["native"].index("ᚦᛖ-ᛚᚩᛋᛋ")
end = data["native"].index("\n$\n%\n", start)
source_words = runes_pattern.findall(data["native"][start:end].replace("/\n%\n","").replace("/\n","").replace("\n",""))
assert len(reference) == len(source_words) == 181
assert ["".join(gp[i] for i in native(w)) for w in reference] == source_words
p57 = words_in_section(57)
assert len(p57) == 20
assert [i for w in p57 for i in native(w)] == C["pages"][57]["indices"]
native_controls = {
    "LP1_p10-13": word_stats(reference),
    "LP2_p57": word_stats(p57),
    "prior_2253_source": word_stats([w for n in (1,3,6,10,14,57) for w in words_in_section(n)]),
}

# Physical page 50 has no rune transcript; do not make physical wraps
# into groups. Count actual delimiter-bearing groups and retain seams.
pages = data["original"].split("%")[:55]
def source_groups(parts):
    stream = re.sub(r"[/\s%]", "", "%".join(parts))
    return runes_pattern.findall(stream)
def measure(parts):
    groups = source_groups(parts)
    lengths = collections.Counter(map(len, groups))
    return {"runes":sum(map(len,groups)), "groups":len(groups),
            "singletons":lengths[1], "short_groups":lengths[1]+lengths[2],
            "length_hist":dict(sorted(lengths.items()))}
original = {"book":measure(pages),"opening":measure(pages[:3]),"terminal":measure(pages[-2:])}
assert original["book"]["runes"]==12956 and original["book"]["groups"]==2896
assert original["book"]["singletons"]==83 and original["book"]["short_groups"]==531
assert original["terminal"]["runes"]==308 and original["terminal"]["groups"]==66
assert [gp.index(s) for g in source_groups(pages) for s in g] == [i for p in C["pages"] if p["page"]<56 for i in p["indices"]]

def scan(words, regions):
    starts, ends, prefix = [], [], [[0,0,0,0]]
    L=0
    for w in words:
        n,s,one,short,oov=word_info(w)
        starts.append(L)
        L+=n
        ends.append(L)
        prefix.append([a+b for a,b in zip(prefix[-1],(s,one,short,int(oov)))])
    result={}
    for name,r in regions.items():
        N=r["runes"]
        mins=[10**9]*3
        maxs=[-1]*3
        max_oov=0
        fit=[0]*3
        joint=0
        witness=[None]*3
        target=(r["groups"],r["singletons"],r["short_groups"])
        for s in range(L-N+1):
            a=bisect.bisect_left(starts,s)
            b=bisect.bisect_right(ends,s+N)
            # Drop every syllable of both clipped edge words.
            if b<a: b=a
            values=[prefix[b][j]-prefix[a][j] for j in range(4)]
            for j,v in enumerate(values[:3]):
                if v<mins[j]:
                    mins[j]=v
                    witness[j]=s
                maxs[j]=max(maxs[j],v)
                fit[j]+=v<=target[j]
            max_oov=max(max_oov,values[3])
            joint+=all(v<=t for v,t in zip(values,target))
        result[name]={"windows":L-N+1,"minimum":[int(x) for x in mins],
                      "maximum_lower_bounds":maxs,"min_offsets":witness,
                      "per_constraint_survivors":fit,"joint_survivors":joint,
                      "max_oov_whole_words_in_window":max_oov}
    return {"runes":L,"words":len(words),"regions":result}

# Exhaustive positive check of the length-only relaxation, no language scoring.
def partitions(n,k):
    if k==1:
        yield (n,)
    else:
        for first in range(1,n-k+2):
            for rest in partitions(n-first,k-1):
                yield (first,)+rest
toy=0
for n in range(1,11):
    for k in range(1,n+1):
        for parts in partitions(n,k):
            assert sum(x==1 for x in parts)>=max(0,2*k-n)
            assert sum(x<=2 for x in parts)>=max(0,(3*k-n+1)//2)
            toy+=1

donors={name:scan(latin_pattern.findall(data[name].upper()),original) for name in ("Gibran","Emerson","Shakespeare")}
out={"schema":1,"scope":"literal one-printed-group-per-syllable, length-preserving GP rune encryption",
     "source":"https://www.nltk.org/book_1ed/ch02.html",
     "inputs":{k:{"path":PATHS[k],"git_blob_sha":hashlib.sha1(b"blob "+str(len(v)).encode()+b"\x00"+v).hexdigest()} for k,v in raw.items()},
     "cmudict":cmudict.__version__,"native_controls":native_controls,"original":original,
     "donors":donors,"toy_partitions_checked":toy,
     "constraints_order":["syllable_groups","singleton_groups","groups_size_at_most_2"],
     "caveat":"finite literal donor register only, all alignment possibilities relaxed, no phoneme or rune deletions"}
print(json.dumps(out,indent=2))
