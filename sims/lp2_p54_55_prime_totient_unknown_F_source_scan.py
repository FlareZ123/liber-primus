"""Blind solved-p56 prime-totient transfer to original final LP2 p54–55 chapter.

The original last unknown chapter begins at p54, contains 232+76=308 runes,
and ends at the 13-dot punctuation following p55. Exhaust source ordinal
starts 0..1,999,999 and both signs, optimizing any literal ciphertext-F
non-consuming clock pauses (maximum nine). Freeze the model at the first
90 runes, evaluate the next 90 and all 308 without key refitting.
Control: exact p56 plaintext and a separate native-GP Shakespeare plant.
"""
import json
import numpy as np

from rand1955_running_key import CORPUS, SRC_TEXT, encode
from prime_totient_long_offset_inversion import EXAMPLE_TRUE, primes_to, solved_p56_regression
from prime_totient_F_interrupt_viterbi import N, KMAX, recover, traceback, value


TRAIN = 90
PLANT_START = 123456
PLANT_SKIP = 43


def page(n):
    return np.asarray(next(p["indices"] for p in CORPUS["pages"]
                           if p["page"]==n),dtype=np.uint8)


def labels(x):
    return "".join(CORPUS["translit"][int(n)] for n in x)


def coincidence(x):
    counts=np.bincount(np.asarray(x,dtype=np.uint8),minlength=29)
    n=len(x)
    return int(np.sum(counts*(counts-1)))/(n*(n-1))


def plant(plain,key,offset):
    plain=plain.copy()
    plain[PLANT_SKIP]=0
    out=np.empty(len(plain),dtype=np.uint8)
    used=0
    for i,p in enumerate(plain):
        if i==PLANT_SKIP:
            out[i]=0
        else:
            out[i]=(int(p)+int(key[offset+used]))%29
            used+=1
    return plain,out


def analyze(cipher,key,logp,sign,top_count=12):
    hits=recover(cipher,key,sign,logp,TRAIN)
    choices=[]
    for c in hits[:top_count]:
        offset=c["sourceOffset"]
        p,skips=traceback(cipher,key,sign,logp,offset)
        choices.append({
            "primeStartIndex":offset,
            "trainMeanLog":c["train"],
            "holdoutMeanLog90":c["holdout"],
            "fullMeanLog":c["full"],
            "plainIoC":coincidence(p),
            "literalFpauses":skips,
            "plainFirst90":labels(p[:90]),
            "plainHeldout90":labels(p[90:180]),
            "plainComplete":labels(p),
        })
    return choices


def main():
    c54=page(54)
    c55=page(55)
    assert len(c54)==232 and len(c55)==76
    original=np.concatenate([c54,c55])
    assert len(original)==308
    assert len(page(56))==85 and len(page(57))==95
    primes=primes_to(N+500)
    solved=solved_p56_regression(primes)
    key=((primes-1)%29).astype(np.uint8)
    cnt=np.bincount(encode(SRC_TEXT[:240000]),minlength=29)
    logp=np.log((cnt+1)/(cnt.sum()+29))
    p56,mask=traceback(page(56),key,-1,logp,0)
    assert p56==encode(EXAMPLE_TRUE).tolist() and mask==[56]
    print("AUTHENTIC_P56",json.dumps({"sourceStart":0,"literalFmask":mask,
        "plainMatched":85,"fullScore":value(page(56),key,-1,logp,0,85)/85}),flush=True)

    gp=encode(SRC_TEXT[240000:])[:308]
    assert len(gp)==308
    planted_plain,planted_cipher=plant(gp,key,PLANT_START)
    planted=analyze(planted_cipher,key,logp,-1)
    planted_first=planted[0]
    assert planted_first["primeStartIndex"]==PLANT_START, (
        "True source start absent from top prefix; review power",planted[:3])
    original_would_be=traceback(planted_cipher,key,-1,logp,PLANT_START)[0]
    correct=sum(x==int(y) for x,y in zip(original_would_be,planted_plain))
    print("NATIVE_LANGUAGE_PLANT",json.dumps({
        "trueSourceStart":PLANT_START,"topRank1":planted_first["primeStartIndex"],
        "gpSymbolsRecovered":correct,"outOf":len(gp),
        "first90":planted_first["plainFirst90"],
        "heldout90":planted_first["plainHeldout90"],
        "trainLog":planted_first["trainMeanLog"],
        "heldoutLog":planted_first["holdoutMeanLog90"],
        "fullLog":planted_first["fullMeanLog"]}),flush=True)

    results={}
    for sign in (-1,1):
        choices=analyze(original,key,logp,sign)
        results[str(sign)]=choices
        print("ORIGINAL_P54_P55",sign,json.dumps(choices,ensure_ascii=False),flush=True)
    print("RESULT_SUMMARY",json.dumps({
        "source":"Original physical LP2 pp54–55, 308 contiguous GP29 runes",
        "originalRunes":len(original),"p54":len(c54),"p55":len(c55),
        "sourceStartsPerSign":N,
        "signs":[-1,1],"maxLiteralFpauses":KMAX,
        "trainRunes":90,"heldoutNextRunes":90,
        "originalCipherIoC":coincidence(original),
        "p56KnownDecryptMatched":85,
        "plantRecovered":correct,
        "nativeGPPlantLength":len(gp),
        "best":{sign:{
            "bestTrain":choices[0],
            "bestHeldout":max(choices,key=lambda c:c["holdoutMeanLog90"]),
            "bestFull":max(choices,key=lambda c:c["fullMeanLog"]),
            } for sign,choices in results.items()},
        "interpretation":"Only exact solved-page phi(prime) additive GP29 model with optional F skips and unknown initial positive ordinal; cannot exclude additional layers or other source keys.",
    },ensure_ascii=False),flush=True)


if __name__=="__main__":
    main()
