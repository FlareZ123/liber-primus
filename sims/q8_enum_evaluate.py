"""Exact scoring of all enumerated anchored q8 keys, no language used in enumeration."""
import argparse,json,pathlib,subprocess,math,time
from p40_columnar_q8_em import load,model,forward_column,inverse_column,encrypt

def best_path(c,key,anchor,model_,fit=None,start=None,last=-1,offset=0):
    u,b=model_[:29],[model_[29+i*29:29+(i+1)*29] for i in range(29)]
    # phase at next position; previous GP rune. Each state has its best score.
    d={(q,last):(0.0,None) for q in (range(8) if start is None else [start])};layers=[]
    for j,x in enumerate(c):
        i=j+offset;nd={}
        for (q,p),(v,_) in d.items():
            if i==anchor and q!=0:continue
            for k,y,h in [((q+1)%8,(x-key[q])%29,False)]+([(q,0,True)] if x==0 else []):
                if y==0 and not h:continue
                z=v+((u[y] if p<0 else b[p][y]) if fit is None or i<fit else 0.0)
                if (k,y) not in nd or z>nd[k,y][0]+1e-12:nd[k,y]=(z,(q,p,h))
        if not nd:return None
        d=nd;layers.append(nd)
    end=max(d,key=lambda k:d[k][0]);score=d[end][0];s=end;plain=[];holds=[];phases=[]
    for nd in reversed(layers):
        plain.append(s[1]);q,p,h=nd[s][1];holds.append(h);phases.append(q);s=(q,p)
    return dict(score=score,plain=plain[::-1],holds=holds[::-1],phases=phases[::-1],start=s[0],end=end[0])

def enumerate_keys(exe,c,cap):
    r=subprocess.run([str(exe)],input=' '.join(map(str,[len(c),cap,*c])),text=True,capture_output=True,check=True)
    return json.loads(r.stderr),[list(map(int,l.split())) for l in r.stdout.splitlines()]

def rotate(k,q):return k[q:]+k[:q]
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--fixture');ap.add_argument('--native-fixture');ap.add_argument('--cap',type=int,default=50000000);ap.add_argument('--control',action='store_true');a=ap.parse_args();root=pathlib.Path(__file__).resolve().parents[1];c,ns=load(root,a.fixture,a.native_fixture)
    exe=pathlib.Path(__file__).with_name('q8_fullkey_enum'+('.exe' if __import__('os').name=='nt' else ''));subprocess.run(['g++','-O3','-std=c++17',str(exe.with_suffix('.cpp')),'-o',str(exe)],check=True)
    m=model(ns);fit=768
    for label,v in [('printed',c),('decolumnar',inverse_column(c))]:
        stats,keys=enumerate_keys(exe,v,a.cap);print(json.dumps(dict(label=label,stats=stats,keys=keys)),flush=True)
        assert not stats['capped'] and len(keys)==stats['keys']
        if label=='printed':
            assert keys==[[0]*8];p=inverse_column(v);s=sum(m[x] if j==0 else m[29+29*p[j-1]+x] for j,x in enumerate(p));print(json.dumps(dict(label=label,allKeyBestScore=s/len(p),plain=p)),flush=True);continue
        rows=[]
        for k in keys:
            r=best_path(v,k,stats['anchor'],m,fit);assert r is not None
            start=r['start'];actual=rotate(k,start);assert encrypt(r['plain'],actual)==v
            suf=best_path(v[fit:],k,stats['anchor'],m,start=r['phases'][fit],last=r['plain'][fit-1],offset=fit);assert suf is not None
            p=r['plain'][:fit]+suf['plain'];assert encrypt(p,actual)==v
            full=best_path(v,k,stats['anchor'],m);assert full and encrypt(full['plain'],rotate(k,full['start']))==v
            rows.append(dict(anchoredKey=k,key=actual,fitScore=r['score']/fit,holdoutScore=suf['score']/(len(v)-fit),fullScore=full['score']/len(v),plain=p,globalPlain=full['plain']))
        rows.sort(key=lambda x:-x['fitScore']);print(json.dumps(dict(label=label,allKeyResults=rows)),flush=True)
    if a.control:
        p=[x for s in ns for x in s];p=(p+p)[:3000];k=[23,10,1,10,9,10,16,26];ct=encrypt(p,k);stats,keys=enumerate_keys(exe,ct,a.cap)
        j=stats['anchor'];q=sum(x!=0 for x in p[:j])%8;truth=rotate(k,q);print(json.dumps(dict(label='full-native-control',stats=stats,truthAnchoredKey=truth,truePresent=truth in keys)),flush=True)
if __name__=='__main__':main()
