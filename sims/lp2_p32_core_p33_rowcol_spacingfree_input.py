"""Generate spacing-free quantized trigram model + original/control solver input.

Training is TextBlob independent-word expected trigram counts, plus six solved
native GP chapters excluding WARNING, KOAN1, LOSS OF DIVINITY. No original
ciphertext or held control sequences are used to train scores.
Dependencies: Python 3, NumPy. Run from repository root.
"""
import json
import re
import subprocess
import sys
from pathlib import Path
import numpy as np
from lp2_p32_core_p33_rowcol_input import A, ROOT, gp, fingerprint

def model():
    d = {}
    for line in (ROOT / "resources/control/english_wordfreq_textblob.txt").read_text(encoding="utf-8").splitlines():
        m = re.fullmatch(r"([a-z]+)\s+([1-9]\d*)", line, re.I)
        if m:
            s = gp(m[1])
            d[s] = d.get(s, 0) + int(m[2])
    assert (len(d), fingerprint(d)) == (29060, 0x5eef1519)
    total = sum(d.values())
    assert total == 1105285
    counts = np.zeros((29,29,29),float)
    fst=np.zeros(29); lst=np.zeros(29)
    fst2=np.zeros((29,29)); lst2=np.zeros((29,29)); single=np.zeros(29)
    for w,f in d.items():
        z=[A.index(c) for c in w]
        fst[z[0]]+=f; lst[z[-1]]+=f
        if len(z)==1:
            single[z[0]]+=f
        else:
            fst2[z[0],z[1]]+=f; lst2[z[-2],z[-1]]+=f
        for i in range(len(z)-2):
            counts[tuple(z[i:i+3])]+=f
    # All three possible patterns across boundaries in an iid-word stream.
    counts+=lst2[:,:,None]*fst[None,None,:]/total
    counts+=lst[:,None,None]*fst2[None,:,:]/total
    counts+=lst[:,None,None]*single[None,:,None]*fst[None,None,:]/total**2
    uni=counts.sum(axis=(0,1))+1; uni/=uni.sum()
    bi=counts.sum(axis=0)
    bp=(bi+5*uni[None,:])/(bi.sum(axis=1)[:,None]+5)
    p=(counts+10*bp[None,:,:])/(counts.sum(axis=2)[:,:,None]+10)
    native=json.loads((ROOT/"resources/external/relikd-solved-gp29-native-v1.json").read_text(encoding="utf-8"))
    nc=np.zeros_like(counts); n=0
    for sec in native["sections"]:
        if sec["name"] in ("0_warning","0_koan_1","0_loss_of_divinity"):
            continue
        z=[native["runes"].index(c) for c in re.findall(r"[\u16a0-\u16ff]",sec["source_text"])]
        n+=len(z)
        for i in range(len(z)-2):
            nc[tuple(z[i:i+3])]+=1
    assert n==1260
    p=(nc+4*p)/(nc.sum(axis=2)[:,:,None]+4)
    score=np.rint(1000*np.log(p)).astype(int)
    assert score.min()==-20387 and score.max()==-9
    return score

def main():
    score=model()
    s=subprocess.check_output([sys.executable,str(Path(__file__).with_name("lp2_p32_core_p33_rowcol_input.py")),*sys.argv[1:]],text=True)
    lines=s.splitlines()
    n=int(lines[0])
    print(" ".join(map(str,score.ravel())))
    print("\n".join(lines[n+1:]))

if __name__=="__main__":
    main()
