"""p0 mapped-red13 original receiver. Python 3.13, C++17 g++, textblob 0.19.0,
cmudict 1.1.3; shared matching relaxation uses scipy 1.17.0.
Run from repo: python sims/lp2_p0_mapped_red13_sft.py
"""
from pathlib import Path
from collections import Counter, defaultdict
from itertools import combinations
import hashlib, json, random, re, subprocess, tempfile
import cmudict, textblob.en

A = '0123456789abcdefghijklmnopqrs'
TOKENS = 'F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()
ORDERED = sorted(zip(TOKENS,A), key=lambda x:-len(x[0]))
ROOT = Path(__file__).resolve().parents[1]

def native(s):
    s=s.upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Z','S').replace('ING','NG').replace('IO','IA')
    result=''
    while s:
        for t,c in ORDERED:
            if s.startswith(t):result+=c;s=s[len(t):];break
        else:return None
    return result

def dictionary():
    freq=Counter()
    for line in (Path(textblob.en.__file__).parent/'en-spelling.txt').read_text().splitlines():
        m=re.fullmatch(r'([a-z]+) (\d+)',line)
        if m:
            v=native(m[1])
            if v:freq[v]+=int(m[2])
    for w in cmudict.words():
        if re.fullmatch('[a-z]+',w):
            v=native(w)
            if v and v not in freq:freq[v]=1
    for x in 'oa3':freq.setdefault(x,1)
    return freq

def original():
    corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
    raw=(ROOT/'resources/liber-primus/lp2-transcription.txt').read_text(encoding='utf-8')
    w=re.sub(r'[%/\s]','', '%'.join(raw.split('%')[:3]))
    words=[''.join(A[corpus['runes'].index(c)] for c in x) for x in re.split(r'[^\u16a0-\u16ff]+',w) if x]
    assert ''.join(words)==''.join(A[i] for p in corpus['pages'][:3] for i in p['indices'])
    assert len(words)==158 and sum(map(len,words))==729
    assert ''.join(words[:2])=='f8i36jr0fqil5' and sum(map(len,words[2:58]))==248
    return words

def positive_deaths(c,key):
    s={j:{j} for j in range(13)};deaths={}
    for i,v in enumerate(c):
        for init in list(s):
            u=set()
            for j in s[init]:
                if v==0:u.add(j)
                if v!=key[j]:u.add((j+1)%13)
            if u:s[init]=u
            else:del s[init];deaths[init]=i
    assert not s
    return deaths

def plant(words,freq,key,seed):
    bylen=defaultdict(list)
    for w,f in sorted(freq.items()):
        if f>=5 and (len(w)!=1 or w in 'oa3'):bylen[len(w)].append((w,f))
    r=random.Random(seed);pi=[0]+r.sample(list(range(1,29)),28);ix=[pi.index(i) for i in range(29)];phase=r.randrange(13);j=phase;out=[];plain=[]
    for target in words[2:]:
        choices=bylen[len(target)];p=r.choices([w for w,f in choices],weights=[f for w,f in choices])[0];plain.append(p);c=''
        for x in p:
            v=A.index(x)
            if v==0:c+='0'
            else:c+=A[ix[(pi[v]-pi[key[j]])%29]];j=(j+1)%13
        out.append(c)
    return words[:2]+out,{'pi':pi,'phase':phase,'plain':plain}

def matching_relaxation(domainpath,key):
    """One global inverse-pair matching, exact clock flow, independent local
    word GF29 feasibility. Objective is a lower bound on true lexical OOV."""
    import numpy as np
    from scipy.optimize import milp,Bounds,LinearConstraint
    from scipy.sparse import coo_matrix
    edges=list(combinations(range(1,29),2));eid={e:i for i,e in enumerate(edges)}
    layers=[];cw=[];objective=[0]*len(edges);ids=[];nvars=len(edges)
    for line in domainpath.read_text().splitlines():
        offset,w,ds=line.split('\t');c=[A.index(x) for x in w];cw.append(c);support=set()
        for cand in ds.strip(',').split(',') if ds else []:
            pw,mask=cand.split(':');mask=int(mask);hold=sum(1<<i for i,x in enumerate(pw) if x=='0')
            for j in range(13):
                if mask>>j&1:support.add((j,hold))
        zeros=[i for i,v in enumerate(c) if v==0];layer=[]
        for start in range(13):
            for bits in range(1<<len(zeros)):
                hold=sum(1<<i for t,i in enumerate(zeros) if bits>>t&1)
                j=start;forbid=set();valid=True
                for i,v in enumerate(c):
                    k=key[j]
                    if hold>>i&1:continue
                    if v==0 and k==0:valid=False;break
                    if v and k and v!=k:forbid.add(eid[tuple(sorted((k,v)))])
                    j=(j+1)%13
                if valid:layer.append((start,j,hold,forbid,int((start,hold) not in support)))
        ids.append(list(range(nvars,nvars+len(layer))));nvars+=len(layer);layers.append(layer);objective.extend(a[4] for a in layer)
    rr=[];cc=[];vv=[];lo=[];hi=[]
    def add(terms,lb,ub):
        idx=len(lo);lo.append(lb);hi.append(ub)
        for j,v in terms:rr.append(idx);cc.append(j);vv.append(v)
    for a in range(1,29):add([(i,1) for i,e in enumerate(edges) if a in e],1,1)
    add([(i,1) for i in ids[0]],1,1)
    for l in range(1,len(layers)):
        for j in range(13):add([(i,1) for i,a in zip(ids[l-1],layers[l-1]) if a[1]==j]+[(i,-1) for i,a in zip(ids[l],layers[l]) if a[0]==j],0,0)
    for l,layer in enumerate(layers):
        forbidden=defaultdict(list)
        for i,a in zip(ids[l],layer):
            for e in a[3]:forbidden[e].append(i)
        for e,aa in forbidden.items():add([(e,1)]+[(i,1) for i in aa],-np.inf,1)
    mat=coo_matrix((vv,(rr,cc)),shape=(len(lo),nvars)).tocsc()
    res=milp(np.array(objective,dtype=float),integrality=np.ones(nvars),bounds=Bounds(0,1),constraints=LinearConstraint(mat,np.array(lo),np.array(hi)),options={'time_limit':90,'mip_rel_gap':0})
    out={'status':int(res.status),'message':res.message,'bound':getattr(res,'mip_dual_bound',None),'objective':res.fun,'variables':nvars,'constraints':len(lo)}
    if res.x is not None:
        pairs=[list(e) for i,e in enumerate(edges) if res.x[i]>.5]
        path=[[(a[0],a[1],a[2],a[4]) for i,a in zip(ids[l],layer) if res.x[i]>.5] for l,layer in enumerate(layers)]
        assert len(pairs)==14 and len(set(sum(pairs,[])))==28 and all(len(p)==1 for p in path)
        x=[0]*29
        for r,(a,b) in enumerate(pairs,1):x[a]=r;x[b]=29-r
        ix=[x.index(a) for a in range(29)];p=[];j=path[0][0][0];oov=[]
        for l,c in enumerate(cw):
            start,end,hold,bad=path[l][0];assert j==start;pp=[]
            for i,v in enumerate(c):
                if hold>>i&1:assert v==0;pp.append(0)
                else:pp.append(ix[(x[v]+x[key[j]])%29]);assert pp[-1]!=0;j=(j+1)%13
            assert j==end
            if bad:oov.append(l)
            p.extend(pp)
        j=path[0][0][0];replay=[]
        for v in p:
            if v==0:replay.append(0)
            else:replay.append(ix[(x[v]-x[key[j]])%29]);j=(j+1)%13
        assert replay==sum(cw,[])
        out.update(pairs=pairs,phase=path[0][0][0],clock=[v[0] for v in path],permutation=x,localOOV=oov)
    return out

def main():
    words=original();key=[A.index(c) for c in ''.join(words[:2])];c=[A.index(c) for c in ''.join(words[2:])];freq=dictionary()
    print('positive deaths:',positive_deaths(c,key))
    with tempfile.TemporaryDirectory(prefix='lp2-red13-') as tmp:
        d=Path(tmp);dictfile=d/'words.tsv';dictfile.write_text(''.join(f'{w}\t{n}\n' for w,n in sorted(freq.items())),encoding='utf-8',newline='\n')
        digest=hashlib.sha256(dictfile.read_bytes()).hexdigest();print('dictionary',len(freq),digest);assert digest=='e81523d77ba04327ce22845d9805fcfb283827b44986fcb7eb9df854d4355896'
        domains=d/'domains.exe';join=d/'join.exe'
        for name,exe in [('domains',domains),('anchor_join',join)]:subprocess.run(['g++','-O3','-std=c++17',str(ROOT/'sims'/f'lp2_p0_mapped_red13_{name}.cpp'),'-o',str(exe)],check=True)
        for label in [1033,3301,'original']:
            w,truth=plant(words,freq,key,label) if isinstance(label,int) else (words,None)
            inp=d/f'{label}.txt';inp.write_text(' '.join(w)+'\n',encoding='utf-8',newline='\n');domain=d/f'{label}-domains.tsv'
            subprocess.run([str(domains),str(dictfile),str(inp),str(domain)],stderr=subprocess.DEVNULL,check=True)
            result=subprocess.run([str(join),str(dictfile),str(inp),str(domain),'90'],capture_output=True,text=True,check=True);print(label,result.stderr,result.stdout)
            if truth:
                m=re.search(r'FIT map=(\S+) start=(\d+) end=(\d+) train_oov=(\d+) holdout_oov=(\d+)\nTRAIN (.*)\nHOLDOUT (.*)\n',result.stdout);assert m
                norm=[(x*pow(truth['pi'][15],-1,29))%29 for x in truth['pi']];assert [A.index(x) for x in m[1]]==norm and int(m[2])==truth['phase']
                pred=(m[6]+' '+m[7]).split();print('train exact',sum(x==y for x,y in zip(''.join(pred[:56]),''.join(truth['plain'][:56]))),'holdout exact',sum(x==y for x,y in zip(''.join(pred[56:]),''.join(truth['plain'][56:]))))
            else:
                assert 'timeout=0 leafcaps=0 maps=0 fit=0' in result.stdout
                print('matching relaxation',json.dumps(matching_relaxation(domain,key)))
if __name__=='__main__':main()
