"""Scale-quotiented spectrum test on the pinned planted row graphs."""
import numpy as np,itertools,json,sys
from pathlib import Path
import agent31_q8_graph_qap as g
N=29

def canonical(key):return min(tuple(sorted(k*j%N for k in key)) for j in range(1,N))
def keys():
    for rest in itertools.combinations([j for j in range(N) if j!=1],7):
        k=tuple(sorted((1,)+rest))
        if canonical(k)==k:yield k

def run(raw):
    ks=np.array(list(keys()));ktrue=canonical(raw['key'])
    idx=np.flatnonzero((ks==ktrue).all(axis=1))[0]
    roots=np.exp(2j*np.pi*np.arange(N)[:,None]*np.arange(1,N)[None,:]/N)
    E=roots[ks].sum(axis=1);mag=np.sort(abs(E),axis=1);real=np.sort(E.real,axis=1);imag=np.sort(abs(E.imag),axis=1)
    traces=np.stack([(E**j).sum(axis=1).real for j in range(2,8)],axis=1)
    out={}
    for name in ('oracle','independent'):
        A=g.adjacency(raw[name]['bestRows'] if isinstance(raw[name],dict) else raw[name]);Ac=g.centre(A)
        e=np.linalg.eigvals(Ac);e=e[np.argsort(abs(e))[1:]]
        metrics={}
        for tag,P,q in [('mag',mag,np.sort(abs(e))),('real',real,np.sort(e.real)),('imag',imag,np.sort(abs(e.imag))),('singular',mag,np.linalg.svd(Ac,compute_uv=False)[:-1])]:
            q=np.sort(q);P=P/np.linalg.norm(P,axis=1)[:,None];q=q/np.linalg.norm(q);metrics[tag]=np.sum((P-q)**2,axis=1)
        for m in (3,5,7):
            P=traces[:,:m-1];q=np.array([np.trace(np.linalg.matrix_power(Ac,j)) for j in range(2,m+1)]);scale=np.sqrt(np.mean(P**2,axis=0))
            scores=[np.sum(((P*t**np.arange(2,m+1)-q)/scale)**2,axis=1) for t in np.linspace(.2,1,41)]
            metrics['traces'+str(m)]=np.min(scores,axis=0)
        out[name]={tag:{'rank':1+int((z<z[idx]).sum()),'top20':ks[np.argsort(z)[:20]].tolist()} for tag,z in metrics.items()}
    return {'num_histograms':len(ks),'true':list(ktrue),'results':out}

if __name__=='__main__':print(json.dumps(run(json.loads(Path(sys.argv[1] if len(sys.argv)>1 else g.DEFAULT).read_text())),indent=2))
