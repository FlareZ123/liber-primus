"""Exact feasibility for p40 source columnar-last + q8 Fehu-hold layer.
Use imported native Z3 SAT backend. No word cuts or language scores.
"""
import argparse, json, pathlib, time
from lp2_layer2_reverse_q13_sat import CNF,solve
from p40_columnar_q8_em import load,inverse_column,forward_column,encrypt

def build(c,q,forbidden):
    f=CNF();K=[[f.var() for _ in range(29)] for _ in range(q)]
    for row in K:f.one(row)
    blocks=[];i=0
    while i<len(c):
        j=i+1
        if c[i]:
            while j<len(c) and c[j]:j+=1
        blocks.append((i,j));i=j
    P=[[f.var() for _ in range(q)] for _ in blocks];H={i:f.var() for i,x in enumerate(c) if not x}
    f.add(P[0][0]) # key phase zero, no loss because every key is free
    for b,(lo,hi) in enumerate(blocks):
        f.one(P[b]);h=H.get(lo)
        if b+1<len(blocks):
            for j in range(q):
                if h:
                    f.imply([P[b][j],h],P[b+1][j]);f.imply([P[b][j],-h],P[b+1][(j+1)%q])
                else:f.imply([P[b][j]],P[b+1][(j+hi-lo)%q])
        for i in range(lo,hi):
            for j in range(q):
                phase=(j+i-lo)%q;active=[P[b][j]]+([-h] if h else [])
                for p in forbidden:f.imply(active,-K[phase][(c[i]-p)%29])
    return f,K,P,H

def run(c,q,forbidden,timeout):
    t=time.monotonic();f,K,P,H=build(c,q,forbidden)
    print(json.dumps({'stage':'built','q':q,'forbidden':forbidden,'length':len(c),'variables':f.n,'clauses':len(f.clauses)}),flush=True)
    result,m,response=solve(f,[x for row in K for x in row]+list(H.values()),timeout)
    out={'result':result,'response':response,'q':q,'forbidden':forbidden,'length':len(c),'variables':f.n,'clauses':len(f.clauses),'seconds':time.monotonic()-t}
    if result=='sat':
        key=[next(a for a,v in enumerate(row) if m[v]) for row in K];p=[];j=0
        for i,x in enumerate(c):
            if i in H and m[H[i]]:p.append(0)
            else:
                y=(x-key[j])%29;assert y not in forbidden;p.append(y);j=(j+1)%q
        assert encrypt(p,key)==c
        out.update(key=key,replay=True,intermediate=p)
    print(json.dumps(out),flush=True);return out

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--fixture');ap.add_argument('--native-fixture');ap.add_argument('--native-support',action='store_true');ap.add_argument('--control',action='store_true');ap.add_argument('--timeout',type=int,default=300000);a=ap.parse_args();c,ns=load(pathlib.Path(__file__).resolve().parents[1],a.fixture,a.native_fixture)
    forbidden=[0,12,22] if a.native_support else [0]
    if a.control:
        truth=[x for p in ns for x in p];truth=(truth+truth)[:3000];key=[23,10,1,10,9,10,16,26];c=forward_column(encrypt(truth,key));print(json.dumps({'plantedKey':key}),flush=True)
    natural=inverse_column(c);out=run(natural,8,forbidden,a.timeout)
    if a.control and out['result']=='sat':print(json.dumps({'keyExact':out['key']==key,'plaintextExact':sum(x==y for x,y in zip(out['intermediate'],truth))}),flush=True)
if __name__=='__main__':main()
