"""Reproduce exhaustive fixed-shift unknown input alphabet gate."""
import collections
import json
import pathlib
import subprocess
import tempfile
import lp2_red8_fixed_shift_unknown_output_inverse_sft as common

S=common.S
ROOT=common.ROOT
def enc(w,A,k,j):
    out=[]
    for x in w:
        p=S.index(x)
        if p==0:
            out.append('0')
            continue
        out.append(S[(A[p]+k[j])%29])
        j=(j+1)%8
    return ''.join(out)

def main():
    common.enc=enc
    lex=common.register()
    train,held,key=common.profile()
    with tempfile.TemporaryDirectory() as td:
        d=pathlib.Path(td)
        exe=d/'enum'
        he=d/'held'
        for stem,target in [('enumeration',exe),('held',he)]:
            subprocess.run(['g++','-std=c++20','-O3',str(ROOT/f'sims/lp2_red8_fixed_shift_unknown_input_{stem}.cpp'),'-o',str(target)],check=True)
        lf=d/'lex.txt';lf.write_text('\n'.join(sorted(lex))+'\n')
        def solve(words):
            cf=d/'train.txt';cf.write_text('\n'.join(words)+'\n')
            of=d/'actions.jsonl'
            with of.open('w') as o:
                r=subprocess.run([str(exe),str(lf),str(cf),key,'180'],stdout=o,stderr=subprocess.PIPE,text=True)
            assert r.returncode==2,r.stderr
            counts=collections.Counter()
            keys=set()
            status=None
            for l in of.read_text().splitlines():
                a=json.loads(l)
                if 'candidate' in a:
                    counts[a['support']]+=1
                    keys.add(a['candidate'])
                else:status=a
            assert status['status']=='EXHAUSTED',status
            return dict(counts=dict(counts),unique=len(keys),status=status,log=r.stderr),keys,of
        controls=[]
        for seed in (1419985920,1419985921):
            f=common.gen(seed,lex,train,held,key)
            result,keys,of=solve(f['c'])
            truth=''.join(S[v] for v in f['B'])
            assert truth in keys
            hf=d/'held.txt';hf.write_text('\n'.join(f['hc'])+'\n')
            ev=subprocess.run([str(he),str(lf),str(hf),str(of),key],capture_output=True,text=True,check=True)
            survivors=ev.stdout.splitlines()
            assert truth in survivors
            controls.append(dict(seed=seed,tries=f['tries'],truth=truth,training=result,held_survivors=len(survivors),held_log=ev.stderr))
        original,_,_=solve(train)
        print(json.dumps(dict(controls=controls,original=original),indent=2))

if __name__=='__main__':
    main()
