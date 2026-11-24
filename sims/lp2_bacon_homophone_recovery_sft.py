"""Reproduce the shared Bacon homophonic recovery, using g++/OpenMP and NumPy.
Usage: python sims/lp2_bacon_homophone_recovery_sft.py OUTPUT_DIRECTORY
All training/holdout splits, keys (evaluation only), and fit budgets are fixed.
"""
from collections import Counter
from pathlib import Path
import json, math, os, random, re, subprocess, sys
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
ABC = "0123456789abcdefghijklmnopqrs"
LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
CHART = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"]
ORDER = sorted(range(29), key=lambda i: -len(CHART[i]))
def read(p):
    return (ROOT / p).read_text(encoding="utf-8")
def native(w, ing=True, io=True):
    w = w.upper().replace("QU","CW").replace("V","U").replace("K","C").replace("Q","C").replace("Z","S")
    if ing: w = w.replace("ING","NG")
    if io: w = w.replace("IO","IA")
    out = []
    while w:
        k = next(i for i in ORDER if w.startswith(CHART[i]))
        out.append(k)
        w = w[len(CHART[k]):]
    return tuple(out)
def model(mode, records, gold, output):
    L = 29 if mode == "native" else 26
    words = Counter()
    for w,n in records:
        key = native(w) if L == 29 else tuple(ord(c)-65 for c in w.upper())
        words[key] += n
    total = sum(words.values())
    probs = [(w,n/total) for w,n in words.items()]
    def idx(w):
        x = 0
        for a in w: x = L*x+a
        return x
    ps, suf = [np.ones(1)], [np.zeros(1)]
    for k in range(1,4):
        prefix, suffix = np.zeros(L**k), np.zeros(L**k)
        for w,p in probs:
            if len(w)>=k:
                prefix[idx(w[:k])] += p
                suffix[idx(w[-k:])] += p
            else:
                n = L**(k-len(w))
                start = idx(w)*n
                prefix[start:start+n] += p*ps[k-len(w)]
        ps.append(prefix)
        suf.append(suffix)
        assert abs(prefix.sum()-1)<1e-8
    quad=np.full(L**4,1e-8)
    mono=np.full(L,1e-8 if L==29 else 0.)
    for w,p in probs:
        for i in range(len(w)-3): quad[idx(w[i:i+4])] += p
        for i in w: mono[i] += p
    for k in range(1,4): quad += np.outer(suf[k],ps[4-k]).ravel()
    quad/=quad.sum()
    mono/=mono.sum()
    if L==29:
        q2,m2=np.full(L**4,1e-8),np.full(L,1e-8)
        for j,w in enumerate(gold):
            if j in (3,4): continue
            for i in range(len(w)-3): q2[idx(w[i:i+4])] += 1
            for i in w: m2[i] += 1
        q2/=q2.sum()
        m2/=m2.sum()
        quad=.9*quad+.1*q2
        mono=.9*mono+.1*m2
    cond=quad.reshape(-1,L)
    cond=cond/cond.sum(axis=1,keepdims=True)
    scores=np.rint(np.log(cond).ravel()*256).astype("<i4")
    penalty=np.array([[round(256*(8*(n*math.log(q)-math.lgamma(n+1))-2*max(0,n-104)**2)) for n in range(601)] for q in mono],dtype="<i4")
    with output.open("wb") as f:
        scores.tofile(f)
        penalty.tofile(f)
    print(mode, len(words), total, int(scores.min()), int(scores.max()), flush=True)

def plant(seed, alphabet, extra, train, holdout, rare_repeat=False):
    rng=random.Random(seed)
    mask=sum(1<<i for i in rng.sample(range(1,29),14))
    book=list(alphabet+extra)
    rng.shuffle(book)
    pools=[[i for i in range(29) if (mask>>i)&1==b] for b in (0,1)]
    lookup={c:[i for i,x in enumerate(book) if x==c] for c in set(book)}
    tapes=[]
    for plain in (train,holdout):
        out=[]
        for c in plain:
            x=rng.choice(lookup[c])
            for j in range(4,-1,-1):
                pool=pools[(x>>j)&1]
                v=rng.choice(pool)
                if rare_repeat and out and v==out[-1] and rng.random()<.8:
                    v=rng.choice([q for q in pool if q!=v])
                out.append(v)
        tapes.append("".join(ABC[x] for x in out))
    assert all(decode(t,mask,"".join(book))==p for t,p in zip(tapes,(train,holdout)))
    return mask,"".join(book),tapes

def decode(tape,mask,book):
    a=[ABC.index(c) for c in tape]
    return "".join(book[sum(((mask>>a[i+j])&1)<<(4-j) for j in range(5))] for i in range(0,len(a),5))

def run(cmd, output=None):
    env=dict(os.environ)
    env.setdefault("OMP_NUM_THREADS","4")
    if output:
        with output.open("w") as f:
            subprocess.run([str(x) for x in cmd],stdout=f,check=True,env=env)
    else:
        subprocess.run([str(x) for x in cmd],check=True,env=env)

def solve(out, mode, name, tapes, truth=None, known=None):
    t,h=(out/(name+"_train.txt"),out/(name+"_holdout.txt"))
    t.write_text(tapes[0]+"\n")
    h.write_text(tapes[1]+"\n")
    rank=out/(name+"_rank.txt")
    coarse=out/(name+"_coarse.txt")
    deep=out/(name+"_deep.txt")
    exe=".exe" if os.name=="nt" else ""
    args=[out/("rank_"+mode+exe),t,rank]
    if known is not None: args.append(known)
    run(args)
    fit=out/("fit_"+mode+exe)
    model_path=out/(mode+".bin")
    run([fit,t,h,model_path,rank,512 if truth else 10000,4,9000],coarse)
    winner=coarse
    if mode=="native" or truth is None:
        run([fit,t,h,model_path,coarse,64,28,24000],deep)
        winner=deep
    key,rank_i,score,book=winner.read_text().splitlines()[0].split()
    key=int(key)
    train,hold=[decode(s,key,book) for s in tapes]
    assert len(train)==600 and len(hold)==201
    alphabet=ABC if mode=="native" else LATIN
    assert set(book)==set(alphabet)
    weights=np.fromfile(model_path,dtype="<i4",count=len(alphabet)**4).reshape((len(alphabet),)*4)
    def ll(s):
        a=np.array([alphabet.index(x) for x in s])
        return float(weights[a[:-3],a[1:-2],a[2:-1],a[3:]].mean()/256)
    print(name,"key",key,"score",score,"train/heldout conditional nats",ll(train),ll(hold),flush=True)
    print("TRAIN",train,"\nHOLDOUT",hold,flush=True)
    if truth:
        print("exact key",key==known,"exact symbols",[sum(a==b for a,b in zip(s,p)) for s,p in zip((train,hold),truth)],flush=True)
    return key,train,hold

def main():
    out=Path(sys.argv[1]).resolve()
    out.mkdir(parents=True,exist_ok=True)
    corpus=json.loads(read("resources/liber-primus/lp2-corpus.json"))
    runes={x:i for i,x in enumerate(corpus["runes"])}
    gold=[tuple(runes[c] for c in s["source_text"] if c in runes) for s in json.loads(read("resources/external/relikd-solved-gp29-native-v1.json"))["sections"]]
    gold_tapes=["".join(ABC[i] for i in s) for s in gold]
    assert [len(s) for s in gold]==[184,515,157,780,755,319,89,85,95]
    pages=corpus["pages"]
    original=["".join(ABC[i] for p in pages[a:b] for i in p["indices"])[skip:] for a,b,skip in [(40,54,8),(23,27,16)]]
    assert list(map(len,original))==[3000,1005]
    def fnv(s):
        h=2166136261
        for c in s: h=((h^ord(c))*16777619)&0xffffffff
        return h
    assert list(map(fnv,original))==[0x521294b1,0x01cbd53f]
    docs=[re.sub("[^A-Z]","",read("resources/control/"+n).upper()) for n in ("gibran_prophet_58585.txt","emerson_essays_2944.txt","shakespeare_first300k.txt")]
    assert list(map(len,docs))==[66521,340374,229448]
    records=[]
    for line in read("resources/control/english_wordfreq_textblob.txt").splitlines():
        m=re.fullmatch(r"([A-Za-z]+)\s+(\d+)",line.strip())
        if m: records.append((m[1],int(m[2])))
    assert len(records)==29157 and sum(n for _,n in records)==1105285
    exe=".exe" if os.name=="nt" else ""
    for mode in ("latin","native"):
        for name,src in (("rank","rank"),("fit","fit")):
            flags=["-DGP_NATIVE"] if mode=="native" else []
            run(["g++","-O3","-march=native","-fopenmp","-std=c++17",*flags,ROOT/"sims"/("lp2_bacon_homophone_"+src+".cpp"),"-o",out/(name+"_"+mode+exe)])
        model(mode,records,gold,out/(mode+".bin"))
    plants=[
        (3302,"latin","ETAOIN",docs[0][5000:5600],docs[1][5000:5201]),
        (3303,"latin","EEETTT",docs[1][12000:12600],docs[2][18000:18201]),
        (3304,"latin","ETAOIN",docs[2][25000:25600],docs[0][20000:20201]),
        (3305,"native","igo",gold_tapes[3][100:700],gold_tapes[4][200:401]),
        (3306,"native","iii",gold_tapes[4][20:620],gold_tapes[3][:201]),
    ]
    for seed,mode,extra,train,hold in plants:
        key,book,tapes=plant(seed,ABC if mode=="native" else LATIN,extra,train,hold)
        found,a,b=solve(out,mode,"plant_"+str(seed),tapes,(train,hold),key)
        assert found==key and a==train and b==hold
    for mode in ("latin","native"):
        solve(out,mode,"original_"+mode,original)

if __name__=="__main__": main()
