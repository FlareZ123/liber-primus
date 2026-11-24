import json,sys,time
from pathlib import Path
import numpy as np
from lp2_chapter_private_affine_rank import *
import lp2_chapter_private_affine_rank as rank
from lp2_chapter_private_affine_exact_map import factors,solve_cycle
WIDTH=512;TOPCLOCKS=32;MAXOPS=150_000_000;QO=13
def opening_data(root):
    base=Path(root);cp=json.loads((base/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf8'))
    C,ss=parse((base/'resources/liber-primus/lp2-transcription.txt').read_text(encoding='utf8'),cp['runes'],True)
    assert C.tolist()==[x for p in cp['pages'] for x in p['indices']]
    native=json.loads((base/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf8'))
    data=[(s['name'],*parse(s['source_text'],cp['runes'],False)) for s in native['sections']]
    return C[:729],{x for x in ss if x<729},data
def beam(C,ss,M,q=QO,width=WIDTH,top=TOPCLOCKS):
    u,_,_=M;R=[[]];Z=[]
    for i,c in enumerate(C):
        if c==0:Z.append((i,i in ss));R.append([])
        else:R[-1].append((i,int(c),int(i in ss)))
    assert len(Z)<64
    weights=np.where(VALID,u[INV][None,:,:],-np.inf).astype(np.float32)
    D=np.zeros((1,q,812),dtype=np.float32);phase=np.zeros(1,dtype=np.int16);H=np.zeros(1,dtype=np.uint64);constant=np.zeros(1,dtype=np.float32);max_candidates=0
    for t,run in enumerate(R):
        v=np.zeros((q,812),dtype=np.float32)
        for j,(i,c,s) in enumerate(run):v[j%q]+=weights[s,:,c]
        rv=np.stack([np.roll(v,p,axis=0) for p in range(q)])
        D+=rv[phase];phase=(phase+len(run))%q
        if t<len(Z):
            i,s=Z[t];cons=D.copy();cons[np.arange(len(D)),phase]+=weights[int(s),:,0]
            if not s:
                D=np.concatenate([D,cons]);phase=np.concatenate([phase,(phase+1)%q]);H=np.concatenate([H|(np.uint64(1)<<np.uint64(t)),H]);constant=np.concatenate([constant+u[0],constant])
            else:D=cons;phase=(phase+1)%q
        scores=D.max(axis=2).sum(axis=1)+constant;good=np.flatnonzero(np.isfinite(scores));max_candidates=max(max_candidates,len(good));keep=min(width if t<len(Z) else top,len(good))
        if keep==0:return [],dict(zeros=len(Z),max_candidates=max_candidates)
        order=good[np.argsort(-scores[good],kind='stable')[:keep]];D=D[order];phase=phase[order];H=H[order];constant=constant[order]
    leaves=[]
    for j,mask in enumerate(H):
        hold={Z[t][0] for t in range(len(Z)) if int(mask)>>t&1};slots=np.full(len(C),-1,dtype=np.int16);p=0
        for i in range(len(C)):
            if i not in hold:slots[i]=p;p=(p+1)%q
        assert p==phase[j]
        opt=[np.flatnonzero(np.isfinite(D[j,r])).astype(np.int16) for r in range(q)]
        for r,o in enumerate(opt):
            ix=np.flatnonzero(slots==r);v=np.ones(812,dtype=bool)
            for i in ix:v&=VALID[int(i in ss),:,C[i]]
            assert np.array_equal(o,np.flatnonzero(v))
        leaves.append((slots,opt,p,float(D[j].max(axis=1).sum()+constant[j])))
    return leaves,dict(zeros=len(Z),max_candidates=max_candidates,beam_width=width,selected_clocks=len(leaves))
def estimate(opt):
    s=[len(x) for x in opt];q=len(s)
    return min(s[r]*s[(r+1)%q]*sum(s[(r+j-2)%q]*s[(r+j-1)%q]*s[(r+j)%q] for j in range(2,q)) for r in range(q))
def fit_open(C,ss,M,q=QO):
    leaves,info=beam(C,ss,M,q);best=None;skipped=[];done=0;large=[]
    for slots,opt,phase,uscore in leaves:
        cost=estimate(opt)
        if cost>MAXOPS:
            skipped.append(cost);large.append((slots,tuple(sum(1<<int(x) for x in o) for o in opt),phase));continue
        F,const=factors(C,slots,opt,M,q);v,key,r,cost2=solve_cycle(F,opt);v+=const;P=np.zeros(len(C),dtype=np.int16)
        for j in range(q):P[slots==j]=INV[key[j],C[slots==j]]
        assert abs(score(P,M)-v)<1e-7;assert np.array_equal(enc(P,key,q),C);done+=1
        if best is None or v>best['score']:best=dict(score=v,key=key,P=P,phase=phase,slots=slots)
    if large:
        old,oldtop=rank.schedules,rank.TOP
        rank.schedules=lambda C,ss,q:(large,len(large),False);rank.TOP=TOPCLOCKS
        try:other,_=rank.fit(C,ss,M,765219,q)
        finally:rank.schedules=old;rank.TOP=oldtop
        if other and (best is None or other['score']>best['score']):best=other
    return best,{**info,'exact_clocks':done,'coordinate_clocks':len(large),'large_cost_min':min(skipped) if skipped else None}
def run(C,S,data,split,total,seed,original):
    for j,(name,P,ss) in enumerate([x for x in data if len(x[1])>=total][:3]):
        P=P[:total];key=np.random.default_rng(seed+j*7919).integers(812,size=QO);ct=enc(P,key,QO);M=model(data,name);start=time.monotonic();f,info=fit_open(ct[:split],{i for i in ss if i<split},M);ext=extend(ct[split:],{i-split for i in ss if split<=i<total},M,f,QO) if f else None
        if ext:assert np.array_equal(enc(np.concatenate([f['P'],ext[1]]),f['key'],QO),ct)
        print(json.dumps(dict(name=name,**info,correct_rows=int((f['key']==key).sum()) if f else 0,prefix_exact=int((f['P']==P[:split]).sum()) if f else 0,prefix_score=f['score']/split if f else None,suffix_exact=int((ext[1]==P[split:]).sum()) if ext else None,suffix_score=ext[0]/(total-split) if ext else None,seconds=time.monotonic()-start)),flush=True)
    if original:
        M=model(data,None);start=time.monotonic();f,info=fit_open(C[:split],{i for i in S if i<split},M);ext=extend(C[split:],{i-split for i in S if split<=i<total},M,f,QO) if f else None
        if ext:assert np.array_equal(enc(np.concatenate([f['P'],ext[1]]),f['key'],QO),C)
        print(json.dumps(dict(original=True,**info,rows=ROWS[f['key']].tolist() if f else None,holds=np.flatnonzero(f['slots']<0).tolist() if f else None,prefix_score=f['score']/split if f else None,suffix_score=ext[0]/(total-split) if ext else None,suffix=ext[1].tolist() if ext else None,seconds=time.monotonic()-start)),flush=True)
if __name__=='__main__':
    root=sys.argv[1];final='--final' in sys.argv
    C,S,data=(fixture(root) if root.endswith('.json') else fromrepo(root) if final else opening_data(root))
    assert (len(C),S)==((308,{0,122}) if final else (729,{176,244,350,530,644}))
    run(C,S,data,232 if final else 528,308 if final else 729,972531 if final else 823754,'--original' in sys.argv)
