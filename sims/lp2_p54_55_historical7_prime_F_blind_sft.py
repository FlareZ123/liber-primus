"""Test the authentic 2014 Cicada row-seven transposition outside the solved p56 key.

The original LP2 pp54-55 chapter contains exactly 308=44*7 GP29 runes.
In 2014 Stage05, the authentic key 1736254 shuffles each seven-character
row. Undo that exact historical operation, then exhaust 2m independent prime
starting indices with unknown literal-F non-consuming marks and both signs.
The inverse-transposition convention is also reported separately; it is not a
free row-key search. Source-English plant is encrypted through BOTH layers.
"""
import json

import numpy as np

from rand1955_running_key import CORPUS, SRC_TEXT, encode
from prime_totient_long_offset_inversion import EXAMPLE_TRUE, primes_to, solved_p56_regression
from prime_totient_F_interrupt_viterbi import N, KMAX, recover, traceback


HISTORICAL_CIPHER = "TLBEIEOVUTHTREIDTSEOSTPOSOYRS LBTIIIYT4DGUQIMNU442I15339M".replace(" ","")
HISTORICAL_PLAIN = "TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133"
ORDER = (0,6,2,5,1,4,3)
TRAIN = 90
PLANTED_START = 123456
PLANTED_SKIP = 43


def stage5_decode(arr):
    assert len(arr)%7==0
    return np.asarray([arr[start+j] for start in range(0,len(arr),7) for j in ORDER],
                      dtype=arr.dtype)


def stage5_encode(arr):
    assert len(arr)%7==0
    out=np.empty_like(arr)
    for start in range(0,len(arr),7):
        for j,src in enumerate(ORDER):
            out[start+src]=arr[start+j]
    return out


def page(n):
    return np.asarray(next(p["indices"] for p in CORPUS["pages"]
                           if p["page"]==n),dtype=np.uint8)


def translit(p):
    return "".join(CORPUS["translit"][int(i)] for i in p)


def ioc(p):
    counts=np.bincount(np.asarray(p,dtype=np.uint8),minlength=29)
    n=len(p)
    return float(np.sum(counts*(counts-1)))/(n*(n-1))


def plant(plain,key,source):
    plain=plain.copy()
    plain[PLANTED_SKIP]=0
    c=np.empty_like(plain)
    used=0
    for i,p in enumerate(plain):
        if i==PLANTED_SKIP:c[i]=0
        else:
            c[i]=(int(p)+int(key[source+used]))%29
            used+=1
    return plain,stage5_encode(c)


def evaluate(cipher,key,logp,sign):
    hits=recover(cipher,key,sign,logp,TRAIN)
    result=[]
    for h in hits:
        offset=h["sourceOffset"]
        plain,skips=traceback(cipher,key,sign,logp,offset)
        result.append({
            "primeStart":offset,"trainingLog":h["train"],
            "heldout90Log":h["holdout"],"whole308Log":h["full"],
            "plainIoC":ioc(plain),"literalFpauses":skips,
            "first90":translit(plain[:90]),
            "heldout90":translit(plain[90:180]),
            "complete":translit(plain),
        })
    return result


def main():
    historical=[ord(c) for c in HISTORICAL_CIPHER]
    restored=stage5_decode(np.asarray(historical,dtype=np.int32))
    assert "".join(map(chr,restored))==HISTORICAL_PLAIN
    assert np.array_equal(stage5_encode(restored),historical)
    print("HISTORICAL_STAGE05",json.dumps({
        "knownSourceChars":len(historical),
        "expected":HISTORICAL_PLAIN,"key":"1736254",
        "positiveRoundTrip":True}),flush=True)

    published=np.concatenate([page(54),page(55)])
    assert len(published)==308
    primes=primes_to(N+500)
    solved_p56_regression(primes)
    key=((primes-1)%29).astype(np.uint8)
    counts=np.bincount(encode(SRC_TEXT[:240000]),minlength=29)
    logp=np.log((counts+1)/(counts.sum()+29))
    plain56,skip56=traceback(page(56),key,-1,logp,0)
    assert plain56==encode(EXAMPLE_TRUE).tolist() and skip56==[56]

    source=encode(SRC_TEXT[240000:])[:308]
    plant_plain,plant_cipher=plant(source,key,PLANTED_START)
    assert np.array_equal(stage5_decode(plant_cipher),stage5_decode(plant_cipher))
    positive=evaluate(stage5_decode(plant_cipher),key,logp,-1)
    best=positive[0]
    pp,skips=traceback(stage5_decode(plant_cipher),key,-1,logp,PLANTED_START)
    match=sum(v==int(w) for v,w in zip(pp,plant_plain))
    assert best["primeStart"]==PLANTED_START and match==308 and skips==[PLANTED_SKIP]
    print("POSITIVE_BOTH_LAYERS",json.dumps({
        "truePrimeStart":PLANTED_START,"selected":best["primeStart"],
        "literalF":skips,"sourceGPRecovered":match,"heldoutLog":best["heldout90Log"],
        "fullLog":best["whole308Log"]}),flush=True)

    original=[]
    for row_direction,untransposed in (
        ("authentic_stage05_decode",stage5_decode(published)),
        ("opposite_row_direction",stage5_encode(published))
    ):
        for sign in (-1,1):
            matches=evaluate(untransposed,key,logp,sign)
            data={"rowDirection":row_direction,"primeSign":sign,
                  "originalBeforeIoC":ioc(published),
                  "untransposedIoC":ioc(untransposed),
                  "top12":matches}
            original.append(data)
            print("ORIGINAL_BOTH_LAYERS",json.dumps(data),flush=True)
    print("SUMMARY",json.dumps({
        "publishedRuneCount":308,
        "historicalKey":"1736254",
        "sourceStartsPerModel":N,
        "originalModels":len(original),
        "positiveRecovered":match,
        "maxUnknownLiteralF":KMAX,
        "trainRunes":TRAIN,"heldoutRunes":90,
        "topByModel":[{
            "rowDirection":m["rowDirection"],"primeSign":m["primeSign"],
            "trainingBest":m["top12"][0],
            "heldoutBest":max(m["top12"],key=lambda x:x["heldout90Log"]),
            "fullBest":max(m["top12"],key=lambda x:x["whole308Log"]),
        } for m in original],
        "scope":"Fixed 2014 row-seven operator and actual p56 totient source only. Does not test secret nonhistorical transpositions or other cipher layers.",
    }),flush=True)


if __name__=="__main__":
    main()
