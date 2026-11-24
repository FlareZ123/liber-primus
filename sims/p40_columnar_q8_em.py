"""p40 red8 source columnar + q8 literal-Fehu Vigenere, spacing-free inverse.
Use exact alternating latent mask/key updates (local optimizer), freeze key on prefix.
"""
import argparse, json, math, pathlib, subprocess, time
ALPH='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
ORDER=[0,4,7,1,2,5,6,3]

def inverse_column(c):
    assert len(c)%8==0
    n=len(c)//8; out=[0]*len(c)
    for i,k in enumerate(ORDER):
        for j in range(n):out[8*j+k]=c[i*n+j]
    return out

def forward_column(p):return [p[j] for k in ORDER for j in range(k,len(p),8)]

def encrypt(p,k):
    phase=0;c=[]
    for x in p:
        if x==0:c.append(0)
        else:c.append((x+k[phase])%29);phase=(phase+1)%8
    return c

def model(secs):
    u=[.5]*29;b=[[.5]*29 for _ in range(29)]
    for p in secs:
        for i,x in enumerate(p):
            u[x]+=1
            if i:b[p[i-1]][x]+=1
    return [math.log(x/sum(u)) for x in u]+[math.log(x/sum(r)) for r in b for x in r]

def load(root,fixture,native_fixture):
    if fixture:
        c=[ALPH.index(x)%32 for x in pathlib.Path(fixture).read_text().strip()]
    else:
        g=json.loads((root/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'));c=[x for p in g['pages'][40:54] for x in p['indices']]
    assert c[:8]==[0,9,19,26,6,23,25,8] and len(c)==3008
    if native_fixture:ns=[[ord(x)-65 for x in a['seq']] for a in json.loads(pathlib.Path(native_fixture).read_text())['native']]
    else:
        g=json.loads((root/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'));mp=dict(zip(g['runes'],range(29)));ns=[[mp[x] for x in a['source_text'] if x in mp] for a in json.loads((root/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf-8'))['sections']]
    return c[8:],ns

def run(exe,c,secs,fit,starts,iters,seed,truth=None,key=None):
    raw=' '.join(map(str,[len(c),fit,starts,iters,seed,*c,*model(secs)]));t=time.monotonic()
    p=subprocess.run([str(exe)],input=raw,text=True,stdout=subprocess.PIPE,check=True);r=json.loads(p.stdout);r['seconds']=time.monotonic()-t
    p=r['fit']+r['holdout'];h=r['fitHolds']+r['holdoutHolds'];q=0;out=[]
    for x,b in zip(p,h):
        if b:assert x==0;out.append(0)
        else:out.append((x+r['key'][q])%29);q=(q+1)%8
    assert out==c
    r['replayIncludingIllegalConsumes']=True
    r['strictReplay']=r['legalFit'] and r['legalHoldout'] and encrypt(p,r['key'])==c
    if truth is not None:
        r['keyExact']=r['key']==key;r['fitExact']=sum(a==b for a,b in zip(p[:fit],truth[:fit]));r['holdoutExact']=sum(a==b for a,b in zip(p[fit:],truth[fit:]));r['holdoutLength']=len(c)-fit
    r['fitLength']=fit;r['length']=len(c)
    return r

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--fixture');ap.add_argument('--native-fixture');ap.add_argument('--starts',type=int,default=128);ap.add_argument('--iters',type=int,default=16);ap.add_argument('--exe');ap.add_argument('--target',choices=['all','controls','original'],default='all');a=ap.parse_args();root=pathlib.Path(__file__).resolve().parents[1];c,ns=load(root,a.fixture,a.native_fixture)
    exe=pathlib.Path(a.exe).resolve() if a.exe else pathlib.Path(__file__).with_suffix('.exe' if __import__('os').name=='nt' else '')
    if not exe.exists():subprocess.run(['g++','-O3','-std=c++17',str(pathlib.Path(__file__).with_suffix('.cpp')),'-o',str(exe)],check=True)
    cases=[]
    if a.target in ('all','controls'):
        for idx,donors,k in [(1,[1,2,3],[23,10,1,10,9,10,16,26]),(2,[4,5,6,7,8],[3,17,9,22,6,1,14,10])]:
            truth=[x for i in donors for x in ns[i]][:1024];assert len(truth)==1024;encrypted=forward_column(encrypt(truth,k));natural=inverse_column(encrypted);assert natural==encrypt(truth,k)
            cases.append((f'control{idx}',natural,[p for i,p in enumerate(ns) if i not in donors],truth,k,768))
    if a.target in ('all','original'):
        natural=inverse_column(c);assert forward_column(natural)==c;cases.append(('original',natural,ns,None,None,768))
    for label,tape,train,truth,k,fit in cases:
        r=run(exe,tape,train,fit,a.starts,a.iters,604014,truth,k);r['label']=label;print(json.dumps(r),flush=True)
if __name__=='__main__':main()
