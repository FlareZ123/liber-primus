#!/usr/bin/env python3
"""Extend lp2_q8_permutation_marginal_sft.py's held-F control fixtures.
Run its main first, then this from the same directory. No withheld plaintext
is used for fitting, candidate selection, or language-model adaptation.
"""
import concurrent.futures,json,os,subprocess,tempfile
from lp2_q8_permutation_marginal_sft import *

def native_lm():
    j=json.loads((ROOT/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf-8'))
    table={x:i for i,x in enumerate(j['runes'])}
    return [np.array([table[c] for c in s['source_text'] if c in table]) for s in j['sections']]

def lm(seq,adapt=None):
    b=np.zeros((30,29));t=np.zeros((30,30,29))
    for s,weight in [(s,5 if adapt is not None else 1) for s in seq]+([] if adapt is None else [(adapt,1)]):
        z=np.r_[29,29,s];np.add.at(b,(z[1:-1],z[2:]),weight);np.add.at(t,(z[:-2],z[1:-1],z[2:]),weight)
    b+=10*p;b/=b.sum(axis=1,keepdims=True);t+=10*b[None,:,:];t/=t.sum(axis=2,keepdims=True);return np.log(t)

def run():
    native=native_lm();assert sum(map(len,native))==2979
    rare=np.argsort(pa,kind='stable')[:8]
    with tempfile.TemporaryDirectory() as d:
        d=Path(d)
        exes={}
        for name in ['mask_chain','dedupbeam','trigram_beam']:
            exe=d/name
            subprocess.check_call(['g++','-O3','-std=c++17','-fopenmp',str(ROOT/'sims'/f'lp2_q8_hold_{name}.cpp'),'-o',str(exe)])
            exes[name]=str(exe)
        for trial in [0,1]:
            a=np.load(f'lp2-q8-hold-control-{trial}.npz')
            ct=a['ct'];fit=FIT
            np.savetxt(d/'ct',ct[:fit],fmt='%d');np.savetxt(d/'prob',pa,fmt='%.17g');np.savetxt(d/'base',a['k'],fmt='%d')
            o=subprocess.check_output([exes['mask_chain'],str(d/'ct'),str(d/'prob'),str(d/'base'),'4','33','49','65','81'],env={**os.environ,'OMP_NUM_THREADS':'4'},text=True)
            print(o,flush=True)
            bases=[a['k'],np.array(list(map(int,o.strip().splitlines()[-1].split())))]
            cand={tuple(k) for k in bases}
            for k in bases:
                for x,y in combinations(rare,2):
                    v=k.copy();v[x],v[y]=v[y],v[x];cand.add(tuple(v))
            def evaluate(item):
                j,f=item;f=np.array(f);u=np.empty(N);u[f]=pa
                g0=np.dot(pa,u[(-idx)%N]);h=np.clip(((ct[:fit]==0).mean()-g0)/(1-g0),.0001,.2)
                kfile=d/f'candidate{j}';np.savetxt(kfile,f,fmt='%d')
                r=subprocess.run([exes['dedupbeam'],str(d/'ct'),str(d/'prob'),str(kfile),str(fit),'32',str(h),'8'],capture_output=True,text=True)
                if r.returncode or len(r.stdout.splitlines())<3:return None
                s=r.stdout.splitlines()
                return dict(key=f.tolist(),score=float(s[0].split('fitBest=')[1].split()[0]),iv=list(map(int,s[1].split())),pt=s[2],h=float(h))
            with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
                out=[v for v in ex.map(evaluate,enumerate(sorted(cand))) if v is not None]
            out.sort(key=lambda x:x['score'],reverse=True)
            if not out:
                print('no legal retained fit',trial);continue
            r=out[0];k=np.array(r['key']);iv=np.array(r['iv']);pt0=np.array([ALPHA.index(c) for c in r['pt']])
            print(json.dumps(dict(trial=trial,candidates=len(cand),retained=len(out),key=k.tolist(),iv=iv.tolist(),map_matches=int((k==a['f']).sum()),fit_matches=int((pt0==a['pt'][:fit]).sum()))),flush=True)
            np.savetxt(d/'full',ct,fmt='%d');np.savetxt(d/'key',k,fmt='%d');np.savetxt(d/'iv',iv,fmt='%d')
            for adapted in [False,True]:
                model=lm(native,pt0 if adapted else None)
                np.savetxt(d/'lm',model.ravel(),fmt='%.17g')
                o=subprocess.check_output([exes['trigram_beam'],str(d/'full'),str(d/'key'),str(d/'iv'),str(d/'lm'),str(fit),'2048'],text=True).splitlines()
                print(trial,adapted,o[0],flush=True)
                if len(o)>1:
                    pred=np.array([ALPHA.index(c) for c in o[1]])
                    v=pred[pred!=0];ct2=np.zeros_like(pred)
                    ct2[pred!=0]=np.r_[(v[:Q]+iv)%N,(v[Q:]+k[v[:-Q]])%N]
                    assert np.array_equal(ct2,ct)
                    print(json.dumps(dict(trial=trial,adapted=adapted,fit_matches=int((pred[:fit]==a['pt'][:fit]).sum()),heldout_matches=int((pred[fit:]==a['pt'][fit:]).sum()),heldout_n=len(ct)-fit)),flush=True)

if __name__=='__main__':run()
