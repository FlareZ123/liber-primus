from collections import defaultdict
from bisect import bisect_left
from pathlib import Path
import json
N=29220
sieve=bytearray(b'\1')*500000;sieve[:2]=b'\0\0'
for p in range(2,708):
    if sieve[p]: sieve[p*p::p]=bytes((499999-p*p)//p+1)
k=[(p-1)%29 for p,b in enumerate(sieve) if b]; d=[len(k)]*len(k)
for j in range(len(k)-2,-1,-1):d[j]=d[j+1] if k[j]==k[j+1] else j+1
G=[158,255,383,437,224,326,378,669,66]; R=[729,1145,1729,1903,1021,1433,1680,3008,308]
original={int(g):w for g,w in (line.split() for line in Path('original.txt').read_text().splitlines())}
jump=[[min(N,d[j]+1) for j in range(N)]+[N]]
for i in range(12): jump.append([jump[-1][v] for v in jump[-1]])
def ends(r):
    a=list(range(N)); bit=0
    while r:
        if r&1:a=[jump[bit][x] for x in a]
        r>>=1;bit+=1
    return a
maxends=[ends(r) for r in R]
report={}
for sign in (1,-1):
    edges=defaultdict(set); summaries=[]
    for a,b in ((0,10000),(10000,20000),(20000,N)):
        for line in Path(f'{sign}_{a}.txt').read_text().splitlines():
            typ,*v=line.split()
            if typ=='edge':g,s,t=map(int,v[:3]);assert a<=s<b; edges[g].add((s,t,v[3]))
            else:summaries.append(list(map(int,v)))
    assert [(s[1],s[2]) for s in summaries]==[(0,10000),(10000,20000),(20000,N)]
    assert all(s[4]==s[5] for s in summaries)
    rows=[];lo=0
    for i,(g,r,end) in enumerate(zip(G,R,maxends)):
        groups=[x for x in original if lo<=x<lo+g]; diff=[0]*(N+1)
        for x in groups:
            intervals=sorted((bisect_left(end,t),s) for s,t,w in edges[x]); a,b=-1,-1
            for p,q in intervals:
                if p>q:continue
                if a<0:a,b=p,q
                elif p<=b+1:b=max(b,q)
                else:diff[a]+=1;diff[b+1]-=1;a,b=p,q
            if a>=0:diff[a]+=1;diff[b+1]-=1
        cur=best=0;origin=-1
        for s in range(N):
            cur+=diff[s]
            if cur>best:best=cur;origin=s
        rows.append(dict(chapter=i,eligible=len(groups),raw=sum(bool(edges[x]) for x in groups),best=best,required=len(groups)-g//20,origin=origin));lo+=g
    report[str(sign)]=dict(nodes=sum(s[3] for s in summaries),control_correct=sum(s[4] for s in summaries),control_total=sum(s[5] for s in summaries),covered=sum(bool(v) for v in edges.values()),edges=sum(map(len,edges.values())),chapters=rows)
print(json.dumps(report,indent=2));Path('summary.json').write_text(json.dumps(report,indent=2)+'\n')
