"""Repeat-local weight gate: run after stroke-weight SFT with optional NPZ argument.
python sims/lp2_repeat_weight_test.py weights.npz resources/liber-primus/lp2-corpus.json output.json
"""
import sys,json
from pathlib import Path
from collections import defaultdict
import numpy as np
a=np.load(sys.argv[1]); rec=a['rec']; sens=a['sensitivity']; page,line,label=rec[:,:3].astype(int).T; mass,hi,lo=rec[:,3:].T
pages=json.loads(Path(sys.argv[2]).read_text(encoding='utf-8'))['pages']
contexts=[]
for p in range(56):
    x=pages[p]['indices']
    for j in range(1,len(x)):
        if x[j]==x[j-1]:
            lo0=max(0,j-6); hi0=min(len(x),j+6)
            contexts.append((p,j,j-lo0,''.join(chr(65+c) for c in x[lo0:hi0])))
assert len(contexts)==86
matches=[]; missed=[]; excluded=[]
for p,j,k,ctx in contexts:
    idx=np.flatnonzero(page==p); seq=''.join(chr(65+x) for x in label[idx]); hits=[i for i in range(len(seq)-len(ctx)+1) if seq.startswith(ctx,i)]
    if len(hits)!=1: missed.append([p,j,len(hits)]); continue
    u,v=idx[hits[0]+k-1:hits[0]+k+1]; assert label[u]==label[v]
    if line[u]!=line[v]: excluded.append([p,j,'cross-line']); continue
    matches.append((p,j,int(u),int(v)))
byline=defaultdict(list)
for i in np.flatnonzero(page<56): byline[(page[i],line[i],label[i])].append(i)
local=defaultdict(list); regime=defaultdict(list)
for (p,l,c),idx in byline.items():
    for k,u in enumerate(idx):
        for v in idx[k+1:]:
            if v-u<=1: continue
            d=(mass[v]-mass[u])/sens[c]
            local[p,c].append(d); regime[p>=40,c].append(d)
pools=[]; observed=[]; amp_hi=[];amp_lo=[]; fallback=0
for p,j,u,v in matches:
    c=label[u]; pool=local[p,c]
    if not pool: pool=regime[p>=40,c]; fallback+=1
    assert len(pool)>0
    pools.append(np.array(pool)); observed.append((mass[v]-mass[u])/sens[c]); amp_hi.append((hi[v]-mass[v])/sens[c]); amp_lo.append((lo[v]-mass[v])/sens[c])
observed=np.array(observed); amp_hi=np.array(amp_hi); amp_lo=np.array(amp_lo)
rng=np.random.default_rng(3301); N=20000
null=np.stack([rng.choice(x,N) for x in pools],axis=1); null_stat=np.mean(np.abs(null),axis=1); base=np.mean(abs(observed))
threshold=float(np.quantile(null_stat,.95)); controls={}
for amp in [.05,.1,.25,.5,1.]:
    bits=rng.integers(0,2,(2000,len(observed))); planted=observed+amp*np.where(bits,amp_hi,amp_lo); t=np.mean(abs(planted),axis=1)
    controls[str(amp)]={'mean_abs':float(t.mean()),'power_above_null95':float(np.mean(t>threshold)),'sign_accuracy':float(np.mean((planted>0)==bits))}
out={'events':len(contexts),'unique_matched':len(matches)+len(excluded),'same_line':len(matches),'missed':missed,'excluded':excluded,'fallback':fallback,'mean_abs':float(base),'null_mean':float(null_stat.mean()),'null_q95':threshold,'p_upper':float((1+np.sum(null_stat>=base))/(N+1)),'controls':controls,'pairs':[{'page':p,'second_index':j,'delta':float(d),'rune':int(label[u]),'control_count':len(pool)} for (p,j,u,v),d,pool in zip(matches,observed,pools)]}
Path(sys.argv[3]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='pairs'},indent=2))
