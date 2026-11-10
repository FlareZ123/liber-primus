"""Viterbi recovery of prime-totient source indices with unknown literal-F pauses.

Every printed F (cipher rune0) may pass as plaintext F without consuming a
prime, just as the authenticated solved LP2 page56 mechanism. All other
runes consume the next prime-totient shift. Unknown F-mask is optimized
exactly under a fixed 20% per-F pause prior, up to 9 pauses. Test 2m
source starts on all eight section-start pages, using source-trained GP
unigram scores and independent original-rune holdout. Authentic p56 and
two planted English controls are the detection checks.
"""
import json
import math
import os
import numpy as np
from numba import njit, prange
from rand1955_running_key import CORPUS, SRC_TEXT, encode
from prime_totient_long_offset_inversion import EXAMPLE_TRUE, primes_to, solved_p56_regression

N = 2000000
KMAX = 9
LOW = -1e90
LIT = math.log(.2)
USED = math.log(.8)
PAGES = (
    tuple(int(p['page']) for p in CORPUS['pages']
          if 0 <= int(p['page']) <= 55 and len(p['indices']) >= 180)
    if os.getenv('LP2_P56_ALL_PAGES') == '1'
    else (0,3,8,16,23,27,33,40)
)

@njit(parallel=True)
def scan(c, key, sign, logp, count):
    scores=np.empty(N, dtype=np.float32)
    for start in prange(N):
        old=np.empty(KMAX+1,dtype=np.float64)
        new=np.empty(KMAX+1,dtype=np.float64)
        old[:]=LOW
        old[0]=0.
        events=0
        for i in range(count):
            r=int(c[i])
            if r==0: events+=1
            new[:]=LOW
            for skipped in range(min(KMAX,events)+1):
                previous=old[skipped]
                if previous<LOW/2: continue
                p=(r+sign*int(key[start+i-skipped]))%29
                a=previous+logp[p]+(USED if r==0 else 0.)
                if a>new[skipped]: new[skipped]=a
                if r==0 and skipped<KMAX:
                    b=previous+logp[0]+LIT
                    if b>new[skipped+1]: new[skipped+1]=b
            old,new=new,old
        scores[start]=np.max(old)
    return scores

@njit
def value(c,key,sign,logp,start,count):
    old=np.empty(KMAX+1,dtype=np.float64)
    new=np.empty(KMAX+1,dtype=np.float64)
    old[:]=LOW
    old[0]=0.
    events=0
    for i in range(count):
        r=int(c[i])
        if r==0:events+=1
        new[:]=LOW
        for skipped in range(min(KMAX,events)+1):
            previous=old[skipped]
            if previous<LOW/2:continue
            p=(r+sign*int(key[start+i-skipped]))%29
            a=previous+logp[p]+(USED if r==0 else 0.)
            if a>new[skipped]:new[skipped]=a
            if r==0 and skipped<KMAX:
                b=previous+logp[0]+LIT
                if b>new[skipped+1]:new[skipped+1]=b
        old,new=new,old
    return np.max(old)

def recover(c,key,sign,logp,n):
    scores=scan(c,key,sign,logp,n)
    offsets=np.argpartition(scores,-12)[-12:]
    offsets=sorted((int(s) for s in offsets),key=lambda s:-float(scores[s]))
    candidates=[]
    for off in offsets:
        later=min(len(c),2*n)
        a=float(scores[off])
        b=value(c,key,sign,logp,off,later)
        full=value(c,key,sign,logp,off,len(c))
        candidates.append({"sourceOffset":off,"train":a/n,
            "holdout":(b-a)/(later-n),"full":full/len(c)})
    return candidates

def plant(plain,key,sign,off):
    rng=np.random.default_rng(0x3301f0)
    plaintext=plain.copy()
    plaintext[43]=0
    emitted=[]
    consumed=0
    repairs=0
    for i,r in enumerate(plaintext):
        if i==43:
            c=0
        else:
            c=(int(r)-sign*int(key[off+consumed]))%29
            consumed+=1
            if i and c==emitted[-1] and rng.random()<.81:
                c=((24-2*emitted[i-6])%29 if i>=6 else (emitted[-1]+1)%29)
                repairs+=1
        emitted.append(c)
    return np.asarray(emitted,dtype=np.uint8),repairs

def traceback(c, key, sign, logp, source_start):
    """Exact Viterbi path and plaintext, including unknown literal F positions."""
    n = len(c)
    states = np.full((n+1, KMAX+1), LOW, dtype=np.float64)
    parents = [[None]*(KMAX+1) for _ in range(n+1)]
    states[0,0] = 0.0
    for i, raw in enumerate(c):
        r = int(raw)
        for skipped in range(KMAX+1):
            previous = states[i,skipped]
            if previous < LOW/2:
                continue
            p = (r+sign*int(key[source_start+i-skipped]))%29
            regular = previous+logp[p]+(USED if r==0 else 0.0)
            if regular > states[i+1,skipped]:
                states[i+1,skipped] = regular
                parents[i+1][skipped] = (skipped,int(p),False)
            if r==0 and skipped<KMAX:
                literal = previous+logp[0]+LIT
                if literal > states[i+1,skipped+1]:
                    states[i+1,skipped+1] = literal
                    parents[i+1][skipped+1] = (skipped,0,True)
    state = int(np.argmax(states[n]))
    recovered = []
    skipped_at = []
    for i in range(n,0,-1):
        prev,plain,literal = parents[i][state]
        recovered.append(plain)
        if literal:
            skipped_at.append(i-1)
        state = prev
    return list(reversed(recovered)),list(reversed(skipped_at))


def main():
    primes=primes_to(N+500)
    p56=solved_p56_regression(primes)
    key=((primes-1)%29).astype(np.uint8)
    counts=np.bincount(encode(SRC_TEXT[:240000]),minlength=29)
    logp=np.log((counts+1)/(counts.sum()+29))
    original56=np.asarray(next(p["indices"] for p in CORPUS["pages"] if p["page"]==56),dtype=np.uint8)
    solvedhits=recover(original56,key,-1,logp,60)
    solvedrank=next((i+1 for i,v in enumerate(solvedhits) if v["sourceOffset"]==0),None)
    blind_plain,blind_skips=traceback(original56,key,-1,logp,solvedhits[0]["sourceOffset"])
    assert solvedrank==1
    assert blind_skips==[56],blind_skips
    assert blind_plain==encode(EXAMPLE_TRUE).tolist()
    print("BLIND_P56_DECIPHERMENT",json.dumps({"recoveredPrimeIndex":solvedhits[0]["sourceOffset"],"unknownLiteralFMaskRecovered":blind_skips,"GPsymbolsMatched":85,"text":EXAMPLE_TRUE}),flush=True)
    print("AUTHENTIC_P56",json.dumps({"expectedSource":0,"foundRank":solvedrank,"top":solvedhits[:3]}),flush=True)
    english=encode(SRC_TEXT[240000:])[:262]
    positives=[]
    for sign in (-1,1):
        encoded,repairs=plant(english,key,sign,123456)
        hits=recover(encoded,key,sign,logp,90)
        rank=next((i+1 for i,v in enumerate(hits) if v["sourceOffset"]==123456),None)
        record={"sign":sign,"source":123456,"foundRank":rank,"literalF":43,
                "outputRepairs":repairs,"sourceFullScore":value(encoded,key,sign,logp,123456,len(encoded))/len(encoded),
                "selected":hits[0]}
        assert rank==1,record
        positives.append(record)
        print("PLANTED_KEY_RECOVERED",json.dumps(record),flush=True)
    results={}
    for page in PAGES:
        cipher=np.asarray(next(p["indices"] for p in CORPUS["pages"] if p["page"]==page),dtype=np.uint8)
        choices=[]
        for sign in (-1,1):
            hits=recover(cipher,key,sign,logp,90)
            choices.append({"sign":sign,"topPrefix":hits[0],
                "topWhole":max(hits,key=lambda r:r["full"]),
                "topHoldout":max(hits,key=lambda r:r["holdout"])})
        results[str(page)]=choices
        print("ORIGINAL_PAGE",page,json.dumps(choices),flush=True)
    print("RESULT_JSON_BEGIN",flush=True)
    print(json.dumps({"source":"Authentic page56 prime-totient stream with latent literal-F pauses",
        "offsetsPerModel":N,"maxFpauses":KMAX,"priorLiteralF":.2,
        "knownSolvedP56":p56,"knownP56RecoveredPrimeStartRank":solvedrank,
        "positiveSourceControls":positives,"actualSectionOpenerResults":results,
        "scope":"The fixed GP-English source and literal F pauses are tested; unmodeled output substitutions and different plain registers remain."},indent=2),flush=True)
    print("RESULT_JSON_END",flush=True)

if __name__=="__main__":main()
