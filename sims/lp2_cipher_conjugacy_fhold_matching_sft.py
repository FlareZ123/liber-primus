"""One ciphertext-driven conjugacy law, authentic literal-F hold.

A0 is a single secret involution with one fixed point (Atbash conjugacy class).
B0=I, A_i=B_i A0 B_i^-1, B'=T^C R B on consuming events.
Blind alternating exact subproblems: affine-state Viterbi and weighted matching.
No original evaluation unless both independent hidden-key native controls pass.
"""
import json, pathlib, random, time
import numpy as np
import networkx as nx

ROOT=pathlib.Path(__file__).resolve().parents[1]
GP=json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text(encoding='utf-8'))
TOKENS=sorted([(s,i) for i,s in enumerate(GP["translit"])],key=lambda x:-len(x[0]))
N=29
A=np.repeat([1,-1],29)
B=np.tile(np.arange(29),2)
V=np.arange(29)
U=((V[:,None]-B[None,:])*A[None,:])%29
NEXT=np.array([((A==1).astype(int)*29+(28+c-B)%29) for c in V])
PREV=np.argsort(NEXT,axis=1)
assert np.all(NEXT[:,0]==29+(28+V)%29)
FIT=2000
RESTARTS=32
STAGES=((-3.,18),(-15.,18),(-80.,18))

def native(text):
    import re
    out=[]
    for word in re.findall("[A-Z]+",text.upper().replace("QU","CW").replace("V","U").replace("K","C").replace("Q","C").replace("Z","S")):
        i=0
        while i<len(word):
            if word.startswith("ING",i):out.append(21);i+=3
            elif word.startswith("IO",i):out.append(27);i+=2
            else:
                s,j=next((s,j) for s,j in TOKENS if word.startswith(s,i))
                out.append(j);i+=len(s)
    return np.array(out,dtype=np.int16)

def randkey(rng):
    labels=list(range(29));rng.shuffle(labels)
    k=np.arange(29)
    for i in range(0,28,2):
        p,q=labels[i:i+2];k[p]=q;k[q]=p
    return k

def encrypt(p,k,reverse=False):
    c=[];states=[];holds=[];s=0
    for x in p:
        states.append(s);holds.append(x==0)
        if x==0:c.append(0);continue
        z=(A[s]*k[(A[s]*(x-B[s]))%29]+B[s])%29
        c.append(z)
        if reverse:s=int((A[s]==1)*29+(28-z-B[s])%29)
        else:s=NEXT[z,s]
    return np.array(c,dtype=int),np.array(states),np.array(holds)

def decoded_table(k):
    return (A[None,:]*k[U]+B[None,:])%29

def best_path(c,k,logp,penalty,start=0):
    ptab=decoded_table(k)
    emit=logp[ptab]+penalty*(ptab==0)
    score=np.full(58,-np.inf);score[start]=0.
    held=np.zeros((len(c),58),dtype=bool)
    for i,z in enumerate(c):
        prev=PREV[z]
        take=score[prev]+emit[z,prev]
        if z==0:
            stay=score+logp[0]
            held[i]=stay>=take
            score=np.maximum(take,stay)
        else:score=take
    terminal=int(np.argmax(score));s=terminal
    st=np.empty(len(c),dtype=int);h=np.empty(len(c),dtype=bool);p=np.empty(len(c),dtype=int)
    for i in range(len(c)-1,-1,-1):
        z=c[i];h[i]=held[i,s]
        if h[i]:p[i]=0
        else:s=PREV[z,s];p[i]=ptab[z,s]
        st[i]=s
    assert s==start
    return float(score[terminal]),st,h,p,terminal

def matching(c,st,h,logp,penalty):
    c=c[~h];s=st[~h]
    u=U[c,s];ps=(A[s,None]*V[None,:]+B[s,None])%29
    w=np.zeros((29,29));np.add.at(w,u,logp[ps]+penalty*(ps==0))
    # One dummy vertex represents the unique fixed point.
    G=nx.Graph();G.add_nodes_from(range(30))
    for i in range(29):
        G.add_edge(i,29,weight=float(w[i,i]))
        for j in range(i+1,29):G.add_edge(i,j,weight=float(w[i,j]+w[j,i]))
    pairs=nx.max_weight_matching(G,maxcardinality=True)
    assert len(pairs)==15
    k=np.arange(29)
    for i,j in pairs:
        if i!=29 and j!=29:k[i]=j;k[j]=i
    assert np.array_equal(k[k],V) and np.count_nonzero(k==V)==1
    return k

def path_from_mask(c,h):
    st=np.empty(len(c),dtype=int);s=0
    for i,z in enumerate(c):
        st[i]=s
        if not h[i]:s=NEXT[z,s]
    return st

def bigram_path(c,k,lp,lb,start=0,prev_plain=None):
    """Exact legal best path under a native bigram model, no penalty relaxation."""
    ptab=decoded_table(k)
    score=np.full((58,29),-np.inf)
    if prev_plain is None:score[start]=lp
    else:score[start,prev_plain]=0.
    back_s=np.full((len(c),58,29),-1,dtype=np.int8)
    back_p=np.full_like(back_s,-1)
    for i,z in enumerate(c):
        # Each consuming edge has a single plaintext rune determined by its source state.
        ps=ptab[z];cand=score+lb[:,ps].T
        oldp=np.argmax(cand,axis=1)
        val=cand[np.arange(58),oldp]
        dest=NEXT[z];ns=np.full_like(score,-np.inf)
        legal=ps!=0
        ns[dest[legal],ps[legal]]=val[legal]
        back_s[i,dest[legal],ps[legal]]=np.arange(58)[legal]
        back_p[i,dest[legal],ps[legal]]=oldp[legal]
        if z==0:
            cand=score+lb[:,0][None,:]
            oldp=np.argmax(cand,axis=1);val=cand[np.arange(58),oldp]
            ns[:,0]=val
            back_s[i,:,0]=np.arange(58)
            back_p[i,:,0]=oldp
        score=ns
        if not np.isfinite(score).any():return None
    s,p=np.unravel_index(int(np.argmax(score)),score.shape)
    terminal,last=int(s),int(p);value=float(score[s,p])
    plain=np.empty(len(c),dtype=int);states=np.empty(len(c),dtype=int);holds=np.empty(len(c),dtype=bool)
    for i in range(len(c)-1,-1,-1):
        plain[i]=p;ss=int(back_s[i,s,p]);pp=int(back_p[i,s,p])
        assert ss>=0 and pp>=0
        holds[i]=p==0;states[i]=ss;s,p=ss,pp
    assert s==start
    return {"score":value,"plain":plain,"states":states,"holds":holds,"end":terminal,"last":last}

def fit(c,lp,lb,seed):
    rng=random.Random(seed);seen=set();legal=[];bestSoft=-np.inf;counts=[]
    for r in range(RESTARTS):
        if r==0:k=matching(c,path_from_mask(c,c==0),c==0,lp,-3.)
        elif r==1:k=matching(c,path_from_mask(c,np.zeros(len(c),dtype=bool)),np.zeros(len(c),dtype=bool),lp,-3.)
        else:
            mask=np.array([(z==0 and rng.random()<.5) for z in c])
            k=matching(c,path_from_mask(c,mask),mask,lp,-3.) if r%2==0 else randkey(rng)
        for penalty,lim in STAGES:
            last=None
            for it in range(lim):
                value,st,h,p,end=best_path(c,k,lp,penalty)
                new=matching(c,st,h,lp,penalty)
                if np.array_equal(new,k):break
                # Finite weighted matching ties may alternate; stop a two-cycle.
                if last is not None and np.array_equal(new,last):break
                last=k;k=new
        value,st,h,p,end=best_path(c,k,lp,-80.)
        bad=int(np.count_nonzero((p==0)&(~h)));bestSoft=max(bestSoft,value)
        counts.append(bad)
        sig=tuple(k)
        if sig in seen:continue
        seen.add(sig)
        if bad==0:
            dec=bigram_path(c,k,lp,lb)
            if dec is not None:legal.append((dec["score"],k.copy(),dec))
    legal.sort(key=lambda x:-x[0])
    return (legal[0] if legal else None),{"restarts":RESTARTS,"distinct":len(seen),"legal":len(legal),"minIllegal":min(counts),"bestSoft":float(bestSoft)}

def replay(c,k,dec,start=0,reverse=False):
    s=start
    for i,p in enumerate(dec["plain"]):
        assert s==dec["states"][i]
        if p==0:assert c[i]==0
        else:
            assert (A[s]*k[(A[s]*(p-B[s]))%29]+B[s])%29==c[i]
            s=NEXT[c[i],s]
    assert s==dec["end"]

def main():
    names=["resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"]
    tapes=[native((ROOT/x).read_text(encoding='utf-8')) for x in names]
    train=np.concatenate([tapes[0][:14000],tapes[1][:28000]])
    hist=np.bincount(train,minlength=29).astype(float)+.5
    lp=np.log(hist/hist.sum())
    hh=np.full((29,29),.5);np.add.at(hh,(train[:-1],train[1:]),1)
    lb=np.log(hh/hh.sum(axis=1,keepdims=True))
    data=[tapes[0][17000:20008],tapes[1][30000:33008]]
    results=[];passed=True
    for i,p in enumerate(data):
        k=randkey(random.Random(3161101+i))
        c,st,h=encrypt(p,k)
        # Known-mask key oracle: independently validate matching and Viterbi.
        oracle=matching(c[:FIT],st[:FIT],h[:FIT],lp,-80.)
        truth=bigram_path(c[:FIT],k,lp,lb)
        assert truth is not None
        replay(c[:FIT],k,truth)
        result,meta=fit(c[:FIT],lp,lb,3161201+i)
        row={"plant":i,"zeros":int(np.count_nonzero(c==0)),"true_holds":int(h.sum()),"true_key":k.tolist(),
             "known_mask_key_correct":int(np.count_nonzero(oracle==k)),"true_key_fit_score":truth["score"]/FIT,**meta}
        if result:
            value,guess,dec=result
            test=bigram_path(c[FIT:],guess,lp,lb,dec["end"],dec["last"])
            replay(c[:FIT],guess,dec)
            row.update({"key_correct":int(np.count_nonzero(guess==k)),"fit_correct":int(np.count_nonzero(dec["plain"]==p[:FIT])),
                        "fit_score":value/FIT,"guess":guess.tolist(),"held_correct":0,"held_score":None})
            if test is not None:
                replay(c[FIT:],guess,test,dec["end"])
                row.update({"held_correct":int(np.count_nonzero(test["plain"]==p[FIT:])),"held_score":test["score"]/(len(p)-FIT)})
            ok=row["fit_correct"]>=.95*FIT and row["held_correct"]>=.95*(len(p)-FIT)
        else:ok=False
        row["passed"]=bool(ok);passed &= ok
        results.append(row);print("CONTROL",json.dumps(row),flush=True)
    if not passed:
        print("GATE_FAIL: no original ciphertext scored; blind matching/Viterbi recovery uncalibrated.",flush=True)
        return
    # Wrong-order conjugation rival on an independent native excerpt.
    p=tapes[1][40000:43008];k=randkey(random.Random(3161103));c,_,_=encrypt(p,k,reverse=True)
    result,meta=fit(c[:FIT],lp,lb,3161203)
    rival={"plant":"reverse_order",**meta,"fit_correct":0,"held_correct":0}
    if result:
        value,guess,dec=result
        test=bigram_path(c[FIT:],guess,lp,lb,dec["end"],dec["last"])
        rival.update({"fit_score":value/FIT,"fit_correct":int(np.count_nonzero(dec["plain"]==p[:FIT]))})
        if test:rival.update({"held_correct":int(np.count_nonzero(test["plain"]==p[FIT:])),"held_score":test["score"]/(len(p)-FIT)})
    print("RIVAL",json.dumps(rival),flush=True)
    if rival["held_correct"]>=.95*(len(p)-FIT):
        print("GATE_FAIL: wrong-law rival not discriminated.",flush=True);return
    # Original values enter the receiver only after blind calibration.
    c=np.array([z for x in GP["pages"][40:54] for z in x["indices"]])
    result,meta=fit(c[:FIT],lp,lb,3161204);row={"fit":FIT,"held":len(c)-FIT,**meta}
    if result:
        value,guess,dec=result;replay(c[:FIT],guess,dec)
        row.update({"key":guess.tolist(),"fit_score":value/FIT,"fit_plain":dec["plain"].tolist()})
        test=bigram_path(c[FIT:],guess,lp,lb,dec["end"],dec["last"])
        if test:
            replay(c[FIT:],guess,test,dec["end"])
            row.update({"held_score":test["score"]/(len(c)-FIT),"held_plain":test["plain"].tolist()})
    print("ORIGINAL",json.dumps(row),flush=True)

if __name__=="__main__":main()
