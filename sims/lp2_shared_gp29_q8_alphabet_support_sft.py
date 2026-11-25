"""Exact necessary anchor-support bound; use no p55 material to fit p54.

Run from repository checkout:
python sims/lp2_shared_gp29_q8_alphabet_support_sft.py --chapter all
python sims/lp2_shared_gp29_q8_alphabet_support_sft.py --chapter all --heading
"""
import argparse, json, pathlib, re, subprocess, tempfile
import lp2_shared_gp29_q8_smt as s
import lp2_shared_gp29_q8_affine_sft as a

COUNTS=[158,255,383,437,224,326,378,669,66]
RUNES=[729,1145,1729,1903,1021,1433,1680,3008,308]
PAGES=[0,3,8,15,23,27,33,40,54]

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--chapter',choices=[str(i) for i in range(9)]+['all'],default='all')
    p.add_argument('--heading',action='store_true')
    p.add_argument('--threads',type=int,default=1)
    p.add_argument('--compiler',default='g++')
    p.add_argument('--lex',type=pathlib.Path,default=a.ROOT/'resources/control/english_wordfreq_textblob.txt')
    args=p.parse_args()
    native=json.loads((a.ROOT/'resources/external/relikd-solved-gp29-native-v1.json').read_text())
    trans={r:s.SYM[i] for i,r in enumerate(native['runes'])}
    pool=sorted(set(''.join(trans[x] for x in w) for sec in native['sections'] for w in re.findall(r'[\u16a0-\u16ff]+',sec['source_text'])))
    assert len(pool)==272
    term=json.loads((a.RESULTS/'lp2-shared-gp29-q8-smt-fixtures.json').read_text())
    D=s.load_dictionary(args.lex,term['added'])
    assert len(D)==38938
    h=1469598103934665603
    for c in '\n'.join(sorted(map(a.compact,D))): h=((h^ord(c))*1099511628211)&((1<<64)-1)
    assert h==0xb39eeb2d0de511c4
    raw=(a.ROOT/'resources/liber-primus/lp2-transcription.txt').read_text()
    W=[''.join(trans[x] for x in w) for w in re.findall(r'[\u16a0-\u16ff]+',re.sub(r'[\s/%]','',raw))]
    assert len(W)==2941 and sum(map(len,W))==13136
    ink=json.loads((a.ROOT/'resources/liber-primus/lp2-ink-annotations.json').read_text())
    with tempfile.TemporaryDirectory() as tmp:
        inp=pathlib.Path(tmp)/'input.txt'
        keys=pathlib.Path(tmp)/'keywords.txt'
        exe=pathlib.Path(tmp)/'solver'
        subprocess.run([args.compiler,'-O3','-fopenmp','-std=c++17',str(a.ROOT/'sims/lp2_shared_gp29_q8_alphabet_support.cpp'),'-o',str(exe)],check=True)
        for ch in range(9) if args.chapter=='all' else [int(args.chapter)]:
            off=sum(COUNTS[:ch])
            words=W[off:off+COUNTS[ch]]
            assert sum(map(len,words))==RUNES[ch]
            if ch==8:
                words=words[:49]
                assert s.words(' '.join(words))==s.words(a.TERMINAL_ORIGINAL)
            kw=pool
            if args.heading:
                red=next(x for x in ink['pages'] if x['page']==PAGES[ch])['red_spans'][0]
                assert red['start']==0
                heading=''.join(trans[x] for x in red['runes'])
                n=0
                while sum(map(len,words[:n]))<len(heading): n+=1
                assert ''.join(words[:n])==heading
                kw=sorted(set(words[:n]+[heading]))
                words=words[n:]
            budget=3 if ch==8 else len(words)//20
            anchors=[w for w in words if len(w)>=8 and '0' not in w]
            a.write_input(inp,s.words(' '.join(anchors)),D)
            keys.write_text('\n'.join(kw)+'\n')
            print('chapter',ch,'body_groups',len(words),'budget',budget,'keywords',len(kw),flush=True)
            subprocess.run([str(exe),str(inp),str(keys),str(budget),str(args.threads)],check=True)

if __name__=='__main__':main()
