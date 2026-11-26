"""Differentiable whole-word likelihood relaxation. Synthetic control only."""
import argparse, json, math, time
from pathlib import Path
from collections import defaultdict
import numpy as np
import torch
from scipy.optimize import linear_sum_assignment
A='0123456789abcdefghijklmnopqrs'; LABELS='F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()
L=[8,3,6,2,5,3,2,3,5,7,3,4,10,8,3,5,8,4,3,4,5,4,3,5,1,3,5,5,3,4,2,6,5,3,8,5,4,8,2,3,4,6,6,3,2,10,2]; H=[11,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]; FIX={0:1}; EPS=2/47

def dictionary(path):
    words=set()
    for l in Path(path).read_text().splitlines():
        p=l.split()
        if len(p)!=2 or not p[0].isascii() or not p[0].isalpha() or not p[0].islower() or not p[1].isdigit():continue
        s=p[0].upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Q','C').replace('Z','S')
        def go(i,w):
            if i==len(s):words.add(w);return
            for j,t in enumerate(LABELS):
                if s.startswith(t,i):go(i+len(t),w+A[j])
            if s.startswith('ING',i):go(i+3,w+A[21])
        go(0,'')
    by=defaultdict(list)
    for w in sorted(words):by[len(w)].append([A.index(c) for c in w])
    assert len(words)==38910,len(words)
    return words,{n:np.array(v,dtype=np.int64) for n,v in by.items()}

def rng(seed):
    x=seed&0xffffffff
    def rand(n):
        nonlocal x
        x^=(x<<13)&0xffffffff;x^=x>>17;x^=(x<<5)&0xffffffff;return x%n
    return rand

def enc(p,m,j):
    c=[]
    for x in p:
        if not x:c.append(0)
        else:c.append(int(m[j,x]));j=(j+1)%8
    return c

def maps(pi,k):return np.argsort(pi)[(np.asarray(pi)[None,:]+np.asarray(k)[:,None])%29]

def primitive_key(k):
    return all(any(k[i] != k[i % d] for i in range(8)) for d in (1,2,4))

def full_cycle(m):
    seen=set();x=0
    while x not in seen:
        seen.add(x);x=int(m[x])
    return len(seen)==29 and x==0

def random_full_cycle(r):
    order=list(range(29))
    for i in range(28,0,-1):
        j=r(i+1);order[i],order[j]=order[j],order[i]
    m=np.zeros(29,dtype=np.int64)
    for i,x in enumerate(order):m[x]=order[(i+1)%29]
    assert full_cycle(m)
    return m

def independent_null(k,seed):
    r=rng(seed);rows=[]
    for j in range(8):
        rows.append(np.arange(29,dtype=np.int64) if k[j]==0 else random_full_cycle(r))
    return np.stack(rows)

def plant(seed,words,by,key_mode):
    r=rng(seed)
    p=[by[n][r(len(by[n]))].tolist() for n in L]
    # Fix clue geometry before the cipher key is generated: the first rune of
    # each of the first eight training words is guaranteed not to be F.
    for i in range(8):
        candidates=[w for w in by[L[i]] if int(w[0])!=0]
        assert candidates
        p[i]=candidates[(seed+13*i)%len(candidates)].tolist()
    o=sorted(range(47),key=lambda j:(-L[j],j))
    for j in [o[0],o[-8]]:
        while True:
            w=[r(29) for _ in range(L[j])]
            if ''.join(A[x] for x in w) not in words:break
        p[j]=w
    while True:
        carry=[r(29) for _ in range(11)]
        if not (by[11][:,:10]==carry[:10]).all(1).any():break
    h=[carry]+[by[n][r(len(by[n]))].tolist() for n in H[1:]]
    pi=list(range(29))
    for i in range(28,1,-1):
        j=1+r(i);pi[i],pi[j]=pi[j],pi[i]
    if key_mode=="all_nonzero_distinct":
        vals=list(range(2,29))
        for i in range(26,0,-1):
            j=r(i+1);vals[i],vals[j]=vals[j],vals[i]
        k=[1]+vals[:7]
    else:
        while True:
            k=[1]+[r(29) for _ in range(7)]
            if primitive_key(k):break
    assert primitive_key(k)
    m=maps(pi,k)
    for j in range(8):
        if k[j]==0:assert np.array_equal(m[j],np.arange(29))
        else:assert full_cycle(m[j])
    starts=[r(8) for _ in p];hstarts=[r(8) for _ in h]
    c=[enc(w,m,starts[i]) for i,w in enumerate(p)]
    hc=[enc(w,m,hstarts[i]) for i,w in enumerate(h)]
    return p,h,c,hc,m,pi,k,starts,hstarts

class Score:
    def __init__(self,C,by):
        self.batches=[];self.cl=[];self.N=len(C);self.base=torch.tensor([29.**-len(c) for c in C])
        for n in sorted(set(map(len,C))):
            ids=[i for i,w in enumerate(C) if len(w)==n];W=by[n];off=np.cumsum(W!=0,1)-(W!=0);es=[];gs=[]
            self.cl.append((torch.tensor(ids),torch.tensor([C[i] for i in ids])))
            for i in ids:
                c=np.array(C[i]);good=((W!=0)|(c==0)).all(1)
                for j in range(8):
                    ph=(off+j)%8;keep=good
                    e=ph[keep]*841+W[keep]*29+c[None,:];es.append(np.where(W[keep]==0,8*841,e));gs.append(np.full(len(e),i,dtype=np.int64))
            if sum(map(len,es)):self.batches.append((torch.from_numpy(np.concatenate(es)),torch.from_numpy(np.concatenate(gs)),len(W)))
    def __call__(self,T):
        f=torch.cat([T.reshape(-1),torch.ones(1)]).clamp_min(1e-30).log();lex=torch.zeros(self.N);u=torch.zeros_like(lex)
        for E,g,n in self.batches:lex=lex.scatter_add(0,g,f[E].sum(1).exp()/(8*n))
        U=T[:,1:,:].sum(1)/29
        for ids,seq in self.cl:
            s=torch.full((len(ids),8),1/8)
            for c in seq.T:s=torch.roll(s*U[:,c].T,1,1)+s*(c[:,None]==0)/29
            u=u.scatter_add(0,ids,s.sum(1))
        return torch.log(((1-EPS)*lex+EPS*u).clamp_min(1e-100)/self.base).sum()

def soft(a,b,t):
    lp=a/t
    for _ in range(7):lp=lp-torch.logsumexp(lp,0,keepdim=True);lp=lp-torch.logsumexp(lp,1,keepdim=True)
    P=torch.nn.functional.pad(lp.exp(),(1,0,1,0));P=P+torch.nn.functional.pad(torch.ones((1,1)),(0,28,0,28))
    K=(b/t).softmax(1);rows=[];j0=0
    for j in range(8):
        if j in FIX:rows.append(torch.nn.functional.one_hot(torch.tensor(FIX[j]),29).to(P.dtype))
        else:rows.append(K[j0]);j0+=1
    K=torch.stack(rows);d=(torch.arange(29)[None,:]-torch.arange(29)[:,None])%29;eye=torch.eye(29)
    T=(P@(K[:,d]*(d!=0))@P.T)*(1-eye);T=T/T.sum(2,keepdim=True).clamp_min(1e-30)*(1-K[:,0,None,None])+K[:,0,None,None]*eye
    return T,P,K

def hard(P,K):
    r,c=linear_sum_assignment(-P.detach().numpy()[1:,1:]);pi=np.zeros(29,dtype=int);pi[r+1]=c+1;return pi,K.detach().numpy().argmax(1)
def et(M):return torch.nn.functional.one_hot(torch.tensor(M),29).to(torch.float64)
def equivalent(M,N):return any(np.array_equal(M,np.roll(N,s,axis=0)) for s in range(8))
def matches(P,C,M):return sum(any(enc(p,M,j)==c for j in range(8)) for p,c in zip(P,C))


def make_clues(kind,budget,plant_data,random_values=False,seed=1):
    p,h,c,hc,m,pi,k,starts,hstarts=plant_data
    r=rng(seed);edges=[];shifts=[]
    if kind=="none":
        pass
    elif kind=="alignment":
        # Known plaintext/ciphertext rune pairs at fixed word/offset coordinates,
        # with the true word phase supplied by the clue.
        for g in range(budget):
            x=int(p[g][0]);assert x!=0
            y=int(c[g][0]);j=int(starts[g])
            if random_values:
                z=r(29)
                while z==y:z=r(29)
                y=z
            edges.append((j,x,y))
    elif kind=="phase_map_edge":
        # Alphabet-level map edges at a fixed, predeclared phase/input geometry.
        geometry=[(1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(1,8)]
        for j,x in geometry[:budget]:
            y=int(m[j,x])
            if random_values:
                z=r(29)
                while z==y:z=r(29)
                y=z
            edges.append((j,x,y))
    elif kind=="relative_shift":
        # The phase labels are part of this clue; it fixes the phase origin.
        geometry=[(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(2,3),(2,4)]
        for a,b in geometry[:budget]:
            d=(int(k[b])-int(k[a]))%29
            if random_values:
                z=r(29)
                while z==d:z=r(29)
                d=z
            shifts.append((a,b,d))
    else:raise ValueError(kind)
    return {"edges":edges,"shifts":shifts,"phase_anchored":True}

def clue_logprob(T,K,clues):
    z=torch.zeros((),dtype=T.dtype)
    for j,x,y in clues["edges"]:
        z=z+torch.log(T[j,x,y].clamp_min(1e-30))
    for a,b,d in clues["shifts"]:
        # P(k_b - k_a = d) = sum_v P(k_a=v) P(k_b=v+d).
        prob=(K[a]*torch.roll(K[b],shifts=-d,dims=0)).sum()
        z=z+torch.log(prob.clamp_min(1e-30))
    return z

def clue_satisfied(M,k,clues):
    return (all(int(M[j,x])==y for j,x,y in clues["edges"]) and
            all((int(k[b])-int(k[a]))%29==d for a,b,d in clues["shifts"]))

def word_metrics(P,C,M):
    # Re-encrypt the planted words under the candidate action and allow every
    # possible word-start phase; this tests true-word recovery without assuming
    # a single decryption path when a non-F symbol maps to F.
    return {"recovered":int(matches(P,C,M)),"total":len(P)}

def run_case(seed,plant_data,words,by,kind,budget,random_values,args):
    p,h,c,hc,m,pi,k,starts,hstarts=plant_data
    f=Score(c,by);clues=make_clues(kind,budget,plant_data,random_values,seed+7919)
    true_score=float(f(et(m)))
    nullM=independent_null(k,seed+0x1A2B3C)
    null_score=float(f(et(nullM)))
    best=None;best_any=None;start=time.time()
    for trial in range(args.restarts):
        torch.manual_seed(seed+1009*trial+17*budget+sum(map(ord,kind)))
        a=torch.nn.Parameter(torch.randn(28,28)*.25)
        b=torch.nn.Parameter(torch.randn(7,29)*.25)
        opt=torch.optim.Adam([a,b],lr=.08)
        for step in range(args.steps):
            t=math.exp(math.log(.18)*step/max(1,args.steps-1))
            T,Pmat,K=soft(a,b,t)
            s=f(T)+args.clue_weight*clue_logprob(T,K,clues)
            opt.zero_grad();(-s).backward();opt.step()
            if step%50==0 or step==args.steps-1:
                with torch.no_grad():
                    hp,hk=hard(Pmat,K);hm=maps(hp,hk)
                    primitive=primitive_key(hk);clue_ok=clue_satisfied(hm,hk,clues)
                    score=float(f(et(hm)))
                    rec={"score":score,"trial":trial,"step":step,"pi":hp.tolist(),"key":hk.tolist(),
                         "primitive":bool(primitive),"clue_satisfied":bool(clue_ok),
                         "exact_action":bool(np.array_equal(hm,m)),
                         "gauge_equivalent_action":bool(equivalent(hm,m)),
                         "fit_truth":int(matches(p,c,hm)),"held_truth":int(matches(h,hc,hm)),
                         "fit_words":word_metrics(p,c,hm),
                         "held_words":word_metrics(h[1:],hc[1:],hm)}
                    if best_any is None or score>best_any["score"]:best_any=rec
                    if primitive and clue_ok and (best is None or score>best["score"]):best=rec
    return {"type":kind,"budget":budget,"random_constraints":random_values,
            "true_clues":clues if not random_values else None,
            "random_clue_count":len(clues["edges"])+len(clues["shifts"]),
            "best_valid":best,"best_any":best_any,"true_score":true_score,
            "independent_cycle_null_score":null_score,
            "seconds":time.time()-start}

def main(args):
    global L,H
    torch.set_num_threads(args.threads);torch.set_default_dtype(torch.float64)
    profile=json.loads(Path(args.profile).read_text())
    p54=profile["p54"]["body_groups"];p55=profile["p55"]["groups"]
    L=[len(w) for w in p54[:47]]
    carry_prefix=p54[47];carry_suffix=p55[0]
    H=[len(carry_prefix)+len(carry_suffix)]+[len(w) for w in p55[1:]]
    assert len(L)==47 and sum(L)==213,(len(L),sum(L))
    assert len(carry_prefix)==10 and len(carry_suffix)==1 and H[0]==11
    assert len(H)==17 and sum(H)==86,(len(H),sum(H))
    words,by=dictionary(args.dict)
    plants=[];cases=[]
    for idx,mode in enumerate(("random_primitive","all_nonzero_distinct")):
        seed=args.seed+idx*1000003
        data=plant(seed,words,by,mode)
        p,h,c,hc,m,pi,k,starts,hstarts=data
        nullM=independent_null(k,seed+0x1A2B3C)
        key_profile={"key":list(map(int,k)),"primitive":primitive_key(k),
                     "zeros":sum(int(x)==0 for x in k),"distinct":len(set(map(int,k))),
                     "all_nonzero":all(int(x)!=0 for x in k),"all_distinct":len(set(map(int,k)))==8}
        plants.append({"seed":seed,"mode":mode,"key_profile":key_profile,
                       "training_groups":len(p),"training_runes":sum(map(len,p)),
                       "holdout_groups":len(h),"holdout_runes":sum(map(len,h)),
                       "carry_split":{"p54_prefix":len(carry_prefix),"p55_suffix":len(carry_suffix),"combined":len(h[0])},
                       "nonzero_phase_maps_are_full_29_cycles":all(full_cycle(m[j]) for j in range(8) if k[j]!=0),
                       "zero_phase_maps_are_identity":all(np.array_equal(m[j],np.arange(29)) for j in range(8) if k[j]==0),
                       "true_action_score":float(Score(c,by)(et(m))),
                       "matched_independent_cycle_null_score":float(Score(c,by)(et(nullM)))})
        baseline=run_case(seed+101,data,words,by,"none",0,False,args)
        cases.append({"plant_seed":seed,"plant_mode":mode,"case":"no_clue_baseline",**baseline})
        for kind in ("alignment","phase_map_edge","relative_shift"):
            for budget in (1,2,4,8):
                res=run_case(seed+1000+budget*31+len(kind),data,words,by,kind,budget,False,args)
                cases.append({"plant_seed":seed,"plant_mode":mode,**res})
            res=run_case(seed+90000+len(kind),data,words,by,kind,8,True,args)
            cases.append({"plant_seed":seed,"plant_mode":mode,**res})
    recoveries=[x for x in cases if x.get("best_valid") and x["best_valid"]["exact_action"]]
    summary={"exact_recoveries":len(recoveries),"case_count":len(cases),"minimum_budget_by_type":{}}
    for kind in ("alignment","phase_map_edge","relative_shift"):
        vals=[x["budget"] for x in cases if x.get("type")==kind and not x.get("random_constraints") and x.get("best_valid") and x["best_valid"]["exact_action"]]
        summary["minimum_budget_by_type"][kind]=min(vals) if vals else None
    out={"schema":"lp2-q8-independent-clue-budget-v1",
         "receiver":"existing differentiable whole-word likelihood receiver; unrestricted primitive q8; F holds; full-cycle nonzero phase maps",
         "parameters":{"steps":args.steps,"restarts":args.restarts,"clue_weight":args.clue_weight,
                       "tested_budgets":[1,2,4,8],"random_controls":"same geometry/count, clue value sampled uniformly excluding truth"},
         "source_profile":{"path":args.profile,"p54_complete_words":47,"p54_complete_runes":213,
                           "p54_carry_prefix":10,"p55_carry_suffix":1,"combined_carry_holdout":11,
                           "p55_complete_words":16,"holdout_groups":17,"holdout_runes":86},
         "dictionary_words":len(words),"plants":plants,"summary":summary,"cases":cases}
    Path(args.out).write_text(json.dumps(out,indent=2)+"\n")
    print(json.dumps({"summary":summary,"plants":plants,"output":args.out}),flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--dict',default='resources/control/english_wordfreq_textblob.txt')
    p.add_argument('--profile',default='resources/liber-primus/lp2-page-groups-54-55-derived.json')
    p.add_argument('--out',default='lp2-q8-independent-clue-budget.json')
    p.add_argument('--seed',type=int,default=1781047296)
    p.add_argument('--steps',type=int,default=200)
    p.add_argument('--restarts',type=int,default=2)
    p.add_argument('--threads',type=int,default=4)
    p.add_argument('--clue-weight',type=float,default=12.0)
    main(p.parse_args())
