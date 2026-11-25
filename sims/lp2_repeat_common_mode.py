"""Repeat-pair common-mode and exploratory C/L context relaxation.
Usage: python sims/lp2_repeat_common_mode.py weights.npz resources/liber-primus/lp2-corpus.json output.json
"""
import json,sys
from collections import defaultdict
from pathlib import Path
import numpy as np
A=np.load(sys.argv[1]); rec=A['rec']; page,line,raw=rec[:,:3].astype(int).T; mass,hi,lo=rec[:,3:].T
pages=json.loads(Path(sys.argv[2]).read_text(encoding='utf-8'))['pages'];contexts=[]
for p in range(56):
    x=pages[p]['indices']
    for j in range(1,len(x)):
        if x[j]==x[j-1]:
            lo0=max(0,j-6);hi0=min(len(x),j+6);contexts.append((p,j,j-lo0,''.join(chr(65+c) for c in x[lo0:hi0])))
assert len(contexts)==86
def run(merge):
    lab=raw.copy(); norm=lambda s:s.replace('L','C') if merge else s
    if merge: lab[lab==11]=2
    center={c:np.median(mass[(page<40)&(lab==c)]) for c in np.unique(lab)}
    sens={c:np.median((hi-lo)[(page<40)&(lab==c)]/2) for c in np.unique(lab)}
    scale=np.array([sens[c] for c in lab]); x=(mass-np.array([center[c] for c in lab]))/scale
    lines=defaultdict(list)
    for i in np.flatnonzero(page<56): lines[page[i],line[i]].append(i)
    lines={k:np.array(v) for k,v in lines.items() if len(v)>=10}
    def measures(u,v):
        ids=lines[page[u],line[u]]; baseline=np.median(x[ids[(ids!=u)&(ids!=v)]])
        return [(x[u]+x[v])/2-baseline,x[v]-x[u]]
    matches=[]; missed=[]; cross=[]; short=[]
    for p,j,k,ctx in contexts:
        ids=np.flatnonzero(page==p); s=''.join(chr(65+c) for c in raw[ids]); ss=norm(s); cs=norm(ctx)
        hits=[i for i in range(len(ss)-len(cs)+1) if ss.startswith(cs,i)]
        if len(hits)!=1:missed.append([p,j,len(hits)]);continue
        u,v=ids[hits[0]+k-1:hits[0]+k+1];assert lab[u]==lab[v]
        if line[u]!=line[v]:cross.append([p,j]);continue
        if (p,line[u]) not in lines:short.append([p,j]);continue
        matches.append((p,j,u,v))
    local=defaultdict(list);regime=defaultdict(list)
    for (p,l),ids in lines.items():
        for i,u in enumerate(ids):
            for v in ids[i+1:]:
                if v-u<=1 or lab[u]!=lab[v]:continue
                m=measures(u,v);local[p,lab[u]].append(m);regime[p>=40,lab[u]].append(m)
    single_local=defaultdict(list);single_regime=defaultdict(list)
    occupied={i for _,_,u,v in matches for i in (u,v)}
    for (p,l),ids in lines.items():
        for i in ids:
            if i in occupied:continue
            v=x[i]-np.median(x[ids[ids!=i]])
            single_local[p,lab[i]].append(v);single_regime[p>=40,lab[i]].append(v)
    rng=np.random.default_rng(3301); N=20000; ns=[]; obs=[]; fallback=0; H=[];L=[]; pairdata=[];single=[]
    for p,j,u,v in matches:
        c=lab[u];pool=local[p,c]
        one=single_local[p,c] or single_regime[p>=40,c]
        single.append(rng.choice(one,N))
        if not pool:pool=regime[p>=40,c];fallback+=1
        q=np.array(pool);ns.append(q[rng.integers(0,len(q),N)]);m=measures(u,v);obs.append(m);pairdata.append([p,j,int(c),*m]);H.append(((hi[u]-mass[u])/scale[u]+(hi[v]-mass[v])/scale[v])/2);L.append(((lo[u]-mass[u])/scale[u]+(lo[v]-mass[v])/scale[v])/2)
    ns=np.stack(ns,axis=1);obs=np.array(obs);H=np.array(H);L=np.array(L)
    null=np.mean(np.abs(ns),axis=1);stat=np.mean(np.abs(obs),axis=0);q95=np.quantile(null,.95,axis=0);p=(1+(null>=stat).sum(axis=0))/(N+1)
    single95=float(np.quantile(np.mean(np.abs(np.stack(single,axis=1)),axis=1),.95))
    controls={}
    for amp in [.05,.1,.25,.5,1.]:
        bits=rng.integers(0,2,(2000,len(obs)));plant=obs[:,0]+amp*np.where(bits,H,L);m=np.mean(np.abs(plant),axis=1);controls[str(amp)]={'common_mode_power':float(np.mean(m>q95[0])),'single_reference_power':float(np.mean(m>single95)),'sign_accuracy':float(np.mean((plant>0)==bits))}
    single=np.stack(single,axis=1)
    subsets={}
    for key,mask in [('all',np.ones(len(matches),bool)),('non_CL',np.array([lab[u] not in (2,11) for p,j,u,v in matches])),('early',np.array([p<40 for p,j,u,v in matches])),('late',np.array([p>=40 for p,j,u,v in matches]))]:
        if not mask.any():continue
        orig=float(np.mean(abs(obs[mask,0]))); null1=np.mean(abs(single[:,mask]),axis=1);null2=np.mean(abs(ns[:,mask,0]),axis=1)
        subsets[key]={'n':int(mask.sum()),'observed':orig,'single_null_mean':float(null1.mean()),'single_q95':float(np.quantile(null1,.95)),'single_p':float((1+(null1>=orig).sum())/(N+1)),'pair_null_mean':float(null2.mean()),'pair_p':float((1+(null2>=orig).sum())/(N+1))}
    return {'subsets':subsets,'merge_CL':merge,'matches':len(matches),'missed':missed,'cross_line':cross,'short_line':short,'fallback':fallback,'stat_common_differential':stat.tolist(),'null_mean':null.mean(axis=0).tolist(),'null_q95':q95.tolist(),'p_upper':p.tolist(),'controls':controls,'pairs':pairdata}
out=[run(False),run(True)];Path(sys.argv[3]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps([{k:v for k,v in x.items() if k!='pairs'} for x in out],indent=2))
