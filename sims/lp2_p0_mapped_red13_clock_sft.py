"""Complete 56-group mapped-red13 negative-sign inverse with up to 3 OOV.
Run from repository root: python sims/lp2_p0_mapped_red13_clock_sft.py
Uses the same frozen dictionary and original receiver as the anchor SFT.
Every locally admissible clock is covered; only timed-out histories are retried.
"""
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib, random, re, subprocess, tempfile
from lp2_p0_mapped_red13_sft import A, ROOT, dictionary, original, plant

def state_table(words, domains, output):
    key=''.join(words[:2]);words=words[2:58];states=0;nc=0
    with output.open('w',encoding='utf-8',newline='\n') as f:
        for i,line in enumerate(domains.read_text().splitlines()[:56]):
            _,s,ds=line.split('\t');assert s==words[i];groups=defaultdict(list)
            for z in ds.strip(',').split(',') if ds else []:
                p,m=z.split(':');m=int(m);h=sum(1<<t for t,a in enumerate(p) if a=='0')
                for j in range(13):
                    if m>>j&1:groups[j,h].append(p)
            row=[]
            for start in range(13):
                paths=[(start,0,())]
                for t,c in enumerate(s):
                    paths=[y for p,h,toks in paths for y in
                           ([(p,h|(1<<t),toks+(-1,))] if c=='0' else [])+
                           ([((p+1)%13,h,toks+(min(A.index(c),A.index(key[p]))*29+max(A.index(c),A.index(key[p])),))] if c!='0' or key[p]!='0' else [])]
                for end,h,toks in paths:
                    cand=[]
                    for p in groups[start,h]:
                        mapping={};ok=True
                        for z,v in zip(toks,p):
                            if z<0:continue
                            if z in mapping and mapping[z]!=v:ok=False;break
                            mapping[z]=v
                        if ok:cand.append(p)
                    row.append((start,end,h,toks,cand))
            for j,(start,end,h,toks,cand) in enumerate(row):
                print(i,j,start,end,h,','.join(map(str,toks)),','.join(cand),sep='\t',file=f)
                states+=1;nc+=len(cand)
    return states,nc

def exact_true_path(table,truth,dest):
    phase=truth['phase'];true=[]
    for p in truth['plain'][:56]:
        h=sum(1<<t for t,x in enumerate(p) if x=='0')
        true.append((phase,h));phase=(phase+len(p)-p.count('0'))%13
    lines=[l for l in table.read_text().splitlines() if (int(l.split('\t')[2]),int(l.split('\t')[4]))==true[int(l.split('\t')[0])]]
    assert len(lines)==56
    dest.write_text('\n'.join(lines)+'\n')

def oov_plant(words,freq,key):
    _,truth=plant(words,freq,key,1033);r=random.Random(1138);plain=truth['plain']
    for i in [3,29,53]:
        while True:
            p=''.join(r.choice(A) for _ in plain[i])
            if p not in freq:break
        plain[i]=p
    pi=truth['pi'];ix=[pi.index(i) for i in range(29)];j=truth['phase'];out=[]
    for p in plain:
        c=''
        for x in p:
            v=A.index(x)
            if v==0:c+='0'
            else:c+=A[ix[(pi[v]-pi[key[j]])%29]];j=(j+1)%13
        out.append(c)
    return words[:2]+out,truth

def parse_stats(s):
    return {k:int(v) for k,v in re.findall(r'(\w+)=(\d+)',s)}

def main():
    words=original();freq=dictionary();key=[A.index(x) for x in ''.join(words[:2])]
    with tempfile.TemporaryDirectory(prefix='lp2-red13-clock-') as tmp:
        d=Path(tmp);df=d/'words.tsv';df.write_text(''.join(f'{w}\t{n}\n' for w,n in sorted(freq.items())),encoding='utf-8',newline='\n')
        assert hashlib.sha256(df.read_bytes()).hexdigest()=='e81523d77ba04327ce22845d9805fcfb283827b44986fcb7eb9df854d4355896'
        dom=d/'domains.exe';solver=d/'clock.exe'
        for name,exe in [('domains',dom),('clock_exact',solver)]:
            subprocess.run(['g++','-O3','-std=c++17',str(ROOT/'sims'/f'lp2_p0_mapped_red13_{name}.cpp'),'-o',str(exe)],check=True)
        for label in [1033,3301,'OOV','original']:
            if label=='original':w,truth=words,None
            elif label=='OOV':w,truth=oov_plant(words,freq,key)
            else:w,truth=plant(words,freq,key,label)
            inp=d/f'{label}.txt';inp.write_text(' '.join(w)+'\n');ds=d/f'{label}.tsv'
            subprocess.run([str(dom),str(df),str(inp),str(ds)],stderr=subprocess.DEVNULL,check=True)
            table=d/f'{label}-clock.tsv';print(label,'states/candidates',state_table(w,ds,table),flush=True)
            if truth:
                path=d/f'{label}-true.tsv';exact_true_path(table,truth,path);out=d/f'{label}-fit.txt'
                res=subprocess.run([str(solver),str(path),str(out),str(df),str(truth['phase']),'60'],capture_output=True,text=True,check=True)
                print(res.stdout,out.read_text(),flush=True)
                m=re.search(r'FIT map=(\S+) phase=(\d+) OOV=(\d+) words=(.*)',out.read_text());assert m
                norm=[(x*pow(truth['pi'][15],-1,29))%29 for x in truth['pi']]
                assert [A.index(x) for x in m[1]]==norm and int(m[2])==truth['phase']
                assert int(m[3])==(3 if label=='OOV' else 0) and m[4].split()==truth['plain'][:56]
                continue
            rows={(int(l.split('\t')[0]),int(l.split('\t')[1])):l for l in table.read_text().splitlines()}
            def run(path,out,phase,seconds):
                res=subprocess.run([str(solver),str(path),str(out),str(df),str(phase),str(seconds)],capture_output=True,text=True,check=True)
                return parse_stats(res.stdout),out.read_text().splitlines()
            def phase_run(j):return run(table,d/f'phase{j}.txt',j,2)
            with ThreadPoolExecutor(max_workers=4) as ex:results=list(ex.map(phase_run,range(13)))
            timed=[]
            for j,(stats,lines) in enumerate(results):
                print(j,stats,flush=True);assert stats['solutions']==0
                timed.extend(tuple(map(int,l.split()[1:])) for l in lines if l.startswith('TIMEOUT '))
            assert sum(s['relaxed'] for s,_ in results)==35233 and sum(s['graphpass'] for s,_ in results)==16946
            assert len(timed)==sum(s['timeoutPaths'] for s,_ in results)
            def retry(pair):
                i,clock=pair;path=d/f'retry{i}.tsv';path.write_text('\n'.join(rows[j,k] for j,k in enumerate(clock))+'\n')
                return run(path,d/f'retry{i}.txt',int(rows[0,clock[0]].split('\t')[2]),60)
            with ThreadPoolExecutor(max_workers=4) as ex:retries=list(ex.map(retry,enumerate(timed)))
            for i,(stats,lines) in enumerate(retries):
                print('retry',i,stats,flush=True);assert stats['relaxed']==1 and stats['solutions']==0 and stats['timeoutPaths']==0
            print('Complete original negative, 35233 clock histories, no remaining cap',flush=True)

if __name__=='__main__':main()
