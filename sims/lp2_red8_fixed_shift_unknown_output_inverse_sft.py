"""Run fixed-key arbitrary output-alphabet inverse on matched controls and LP2."""
import json
import pathlib
import re
import random
import subprocess
import tempfile
from collections import defaultdict
from functools import lru_cache

ROOT = pathlib.Path(__file__).resolve().parents[1]
S = '0123456789abcdefghijklmnopqrs'
LABELS = 'F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()

@lru_cache(None)
def gp(s):
    if not s:
        return ('',)
    out = []
    for i, x in enumerate(LABELS):
        if s.startswith(x):
            out.extend(S[i] + w for w in gp(s[len(x):]))
    if s.startswith('ING'):
        out.extend(S[21] + w for w in gp(s[3:]))
    return tuple(out)

def register():
    lex = set()
    for line in (ROOT / 'resources/control/english_wordfreq_textblob.txt').read_text().splitlines():
        m = re.fullmatch(r'([a-z]+) ([0-9]+)', line)
        if m:
            w = m[1].upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Q','C').replace('Z','S')
            lex.update(gp(w))
    assert len(lex) == 38910
    return lex

def profile():
    p = json.loads((ROOT / 'resources/liber-primus/lp2-page-groups-54-55-derived.json').read_text())
    train = p['p54']['body_groups'][:-1]
    held = [p['p54']['body_groups'][-1] + p['p55']['groups'][0], *p['p55']['groups'][1:]]
    assert len(train) == 47 and sum(map(len,train)) == 213
    assert len(held) == 17 and sum(map(len,held)) == 86
    return train, held, p['red8_key']['compact']

def enc(w, B, k, j):
    BI = [B.index(i) for i in range(29)]
    out = []
    for x in w:
        v = S.index(x)
        if v == 0:
            out.append('0')
            continue
        out.append(S[BI[(v+k[j])%29]])
        j = (j+1)%8
    return ''.join(out)

def dec(c, B, k, lex):
    def paths(i, j, p):
        if i == len(c):
            if p in lex:
                yield p
            return
        x = S.index(c[i])
        if x == 0:
            yield from paths(i+1,j,p+'0')
        v = (B[x]-k[j])%29
        if v:
            yield from paths(i+1,(j+1)%8,p+S[v])
    return sorted(set(w for j in range(8) for w in paths(0,j,'')))

def gen(seed, lex, train, held, key):
    r = random.Random(seed)
    by = defaultdict(list)
    for w in sorted(lex):
        by[len(w)].append(w)
    k = list(map(S.index,key))
    def oov(n):
        while True:
            w = ''.join(r.choices(S,k=n))
            if w not in lex:
                return w
    for n in range(1,1000001):
        B = r.sample(range(29),29)
        p = [r.choice(by[len(w)]) for w in train]
        p[45] = oov(10)
        p[43] = oov(len(train[43]))
        j = [r.randrange(8) for _ in p]
        c = [enc(w,B,k,t) for w,t in zip(p,j)]
        z = ''.join(c)
        if z.count('0') != 3 or sum(a==b for a,b in zip(z,z[1:])) != 2:
            continue
        if sum(sum(x!='0' for x in w)>=8 for w in c)<4:
            continue
        hp = [r.choice(by[len(w)]) for w in held]
        hj = [r.randrange(8) for _ in hp]
        hc = [enc(w,B,k,t) for w,t in zip(hp,hj)]
        return dict(seed=seed,tries=n,B=B,k=k,p=p,j=j,c=c,hp=hp,hj=hj,hc=hc)
    raise RuntimeError('plant exhausted')

def main():
    lex = register()
    train, held, key = profile()
    with tempfile.TemporaryDirectory() as td:
        d = pathlib.Path(td)
        exe = d / 'inverse'
        subprocess.run(['g++','-std=c++20','-O3',str(ROOT/'sims/lp2_red8_fixed_shift_unknown_output_inverse.cpp'),'-o',str(exe)],check=True)
        lf = d / 'lex.txt'
        lf.write_text('\n'.join(sorted(lex))+'\n')
        def solve(words):
            cf = d / 'train.txt'
            cf.write_text('\n'.join(words)+'\n')
            run = subprocess.run([str(exe),str(lf),str(cf),key,'180'],capture_output=True,text=True)
            assert run.returncode in (0,2), run.stderr
            return dict(result=json.loads(run.stdout),log=run.stderr)
        controls = []
        for seed in (1419985664,1419985665):
            f = gen(seed,lex,train,held,key)
            out = solve(f['c'])
            a = out['result']
            assert a['status'] == 'FOUND' and a['B'] == f['B']
            cand = [dec(w,a['B'],f['k'],lex) for w in f['hc']]
            assert all(p in ws for p,ws in zip(f['hp'],cand))
            assert all(enc(w,a['B'],f['k'],j)==c for w,j,c in zip(a['words'],a['phases'],f['c']))
            controls.append(dict(fixture=f,solver=out,held_candidates=cand))
        original = solve(train)
        print(json.dumps(dict(controls=controls,original=original),indent=2))

if __name__ == '__main__':
    main()
