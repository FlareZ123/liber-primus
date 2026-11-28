"""Exact independent broad-register q8 silent-output anchor experiment.
Dependencies: textblob==0.19.0, cmudict==1.1.3, C++17 compiler with OpenMP.
Run from any cwd; outputs in a temporary directory. No network required once installed.
"""
import re
import pathlib
import hashlib
import functools
import importlib.metadata
import json
import subprocess
import tempfile
import os
import cmudict
import textblob

A='0123456789abcdefghijklmnopqrs'
T=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA']
ALIAS=[(x,A[i]) for i,x in enumerate(T)]+[('ING',A[21]),('IO',A[27])]
@functools.lru_cache(None)
def forms(w):
    if not w:return ('',)
    return tuple(a+s for k,a in ALIAS if w.startswith(k) for s in forms(w[len(k):]))
def norm(w):
    return w.upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Q','C').replace('Z','S')

def main():
    here=pathlib.Path(__file__).resolve().parent
    source=json.loads((here.parent/'resources/liber-primus/lp2-page-groups-54-55-derived.json').read_text())
    body=source['p54']['body_groups']
    tail=source['p55']['groups']
    groups=body[:-1]+[body[-1]+tail[0]]+tail[1:]
    assert len(groups)==64 and sum(map(len,groups))==299
    anchors=sorted(groups,key=len,reverse=True)[:4]
    assert anchors==['hs0eaj15d8lkc','63g2eis46ql','n78hl0o5b1','8so5ajebji']
    p=pathlib.Path(textblob.__file__).parent/'en'/'en-spelling.txt'
    words={m.group(1) for l in p.read_text().splitlines() if (m:=re.fullmatch(r'([a-z]+)\s+\d+\s*',l))}
    textblob_count=len(words)
    words.update(w for w in cmudict.words() if re.fullmatch(r'[a-z]+',w))
    lex=set()
    for w in words:lex.update(forms(norm(w)))
    lex.discard('')
    data=('\n'.join(sorted(lex))+'\n').encode()
    digest=hashlib.sha256(data).hexdigest()
    print('textblob',importlib.metadata.version('textblob'),textblob_count,'cmudict',importlib.metadata.version('cmudict'),'word_spellings',len(words),'GP_forms',len(lex),'sha256',digest,flush=True)
    assert digest=='cc12917b6fbce3968517eefdd0d520a2c599afc52dde82b2d849c4bf2d97aa35'
    with tempfile.TemporaryDirectory() as tmp:
        d=pathlib.Path(tmp)
        exes={}
        for name in ('anchor','match'):
            exe=d/(name+('.exe' if os.name=='nt' else ''))
            subprocess.run([os.environ.get('CXX','g++'),'-O3','-std=c++17','-fopenmp',str(here/f'lp2_alt36_q8_broad_{name}.cpp'),'-o',str(exe)],check=True)
            exes[name]=exe
        lp=d/'lex.txt'; lp.write_bytes(data)
        gp=d/'groups.txt';gp.write_text(' '.join(groups)+'\n')
        keys=[]
        counts=[]
        for anchor in anchors:
            out=subprocess.check_output([exes['anchor'],lp,anchor],text=True)
            print(out,end='',flush=True)
            ks={l.split()[0] for l in out.splitlines()[1:]}
            keys.append(ks);counts.append(len(ks))
        union=set.union(*keys)
        assert counts==[0,1,51,66] and len(union)==118
        kp=d/'keys.txt';kp.write_text('\n'.join(sorted(union))+'\n')
        result=subprocess.check_output([exes['match'],lp,gp,kp],text=True)
        print(result,end='',flush=True)
        assert min(int(l.split()[1]) for l in result.splitlines())==34
        # Independent register omits these authentic donor words. Supply only
        # for implementation controls, never to the original anchor search.
        extra=['58ofgafiji9g','d4ifi9gaji9gf']
        assert all(w not in lex for w in extra)
        cp=d/'control.txt';cp.write_bytes(data+('\n'.join(extra)+'\n').encode())
        out=subprocess.check_output([exes['anchor'],cp,'n51k1c9p1fml','p2j3r1jrga4o'],text=True)
        print(out,end='',flush=True)
        assert '2u7ixd5l 58ofgafiji9g' in out and '1o9s3hcy d4ifi9gaji9gf' in out
        print('PASS: all q8 keys require at least four outside-register groups under the stated model.')
if __name__=='__main__':
    main()
