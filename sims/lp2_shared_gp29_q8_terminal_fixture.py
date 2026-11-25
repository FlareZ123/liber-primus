#!/usr/bin/env python3
"""Rebuild the corrected 48-group p54 / 17-group p55 q8 controls."""
import json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OLD=ROOT/'im-results/lp2-shared-gp29-q8-smt-fixtures.json'
NEW=ROOT/'im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json'
PAGES=ROOT/'resources/liber-primus/lp2-page-groups-54-55-derived.json'
LEX=ROOT/'resources/control/english_wordfreq_textblob.txt'
SYM='0123456789abcdefghijklmnopqrs'
ALPHA=('F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA')
TOKENS=tuple(sorted(ALPHA,key=len,reverse=True))

def variants(word):
    s=word.upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Q','C').replace('Z','S')
    out=set()
    def rec(i,seq):
        if i==len(s):
            out.add(tuple(seq)); return
        for t in TOKENS:
            if s.startswith(t,i):
                rec(i+len(t),seq+(ALPHA.index(t),))
        if s.startswith('ING',i):
            rec(i+3,seq+(ALPHA.index('NG'),))
    rec(0,())
    return out

def compact(seq):
    return ''.join(SYM[x] for x in seq)

def parse_compact(w):
    return tuple(SYM.index(ch) for ch in w)

def load_dictionary(added):
    d=set()
    for line in LEX.read_text(encoding='utf-8').splitlines():
        m=re.match(r'^([a-z]+)\s+(\d+)$',line)
        if m: d.update(variants(m.group(1)))
    d.update(parse_compact(w) for w in added)
    return d

def encrypt(word,pi,k,start):
    inv=[pi.index(x) for x in range(29)]
    j=start; out=[]
    for p in parse_compact(word):
        if p==0: out.append(0)
        else:
            out.append(inv[(pi[p]+k[j])%29]); j=(j+1)%8
    return compact(out)

def build():
    old=json.loads(OLD.read_text())
    pages=json.loads(PAGES.read_text())
    body=pages['p54']['body_groups']; hold=pages['p55']['groups']
    assert len(body)==48 and sum(map(len,body))==223
    assert len(hold)==17 and sum(map(len,hold))==76
    additions=('friendship','absolutely')
    newplants=[]
    D=load_dictionary(old['added'])
    for i,pl in enumerate(old['plants']):
        T=pl['truth'].split(); C=pl['cipher'].split(); phases=pl['phases']
        assert len(T)==len(C)==len(phases)==66
        assert len(T[0])==1 and len(T[1])==8 and len(C[49])==11
        v=[x for x in variants(additions[i]) if len(x)==10 and x in D]
        assert len(v)==1, (additions[i],len(v))
        word10=compact(v[0]); one=T[0]
        truth=T[2:49]+[word10,one]+T[50:66]
        newphases=phases[2:49]+[phases[0],phases[1]]+phases[50:66]
        cipher=C[2:49]+[encrypt(word10,pl['pi'],pl['k'],phases[0]),
                         encrypt(one,pl['pi'],pl['k'],phases[1])]+C[50:66]
        assert len(truth)==len(cipher)==len(newphases)==65
        assert [len(x) for x in truth[:48]]==[len(x) for x in body]
        assert [len(x) for x in truth[48:]]==[len(x) for x in hold]
        assert all(parse_compact(w) in D for w in truth)
        newplants.append({**pl,'truth':' '.join(truth),'cipher':' '.join(cipher),
                          'phases':newphases,'control_addition':{'latin':additions[i],'gp29':word10}})
    out={**old,
         'schema':'lp2-shared-gp29-q8-terminal-corrected-fixtures-v1',
         'supersedes':'im-results/lp2-shared-gp29-q8-smt-fixtures.json',
         'profile':{'training_page':'p54 body only; red heading excluded',
                    'training_groups':48,'training_runes':223,
                    'holdout_page':'p55 only; page boundary preserved',
                    'holdout_groups':17,'holdout_runes':76,
                    'total_groups':65,'total_runes':299},
         'source_group_reference':'resources/liber-primus/lp2-page-groups-54-55-derived.json',
         'correction':('Legacy fixture included the two red heading groups in training and merged p54 final 10 runes with p55 first rune into an 11-rune holdout group. '
                       'The corrected fixture removes the heading, restores the p54 final group, and separates p55 first group.'),
         'plants':newplants}
    return out

if __name__=='__main__':
    out=build()
    NEW.write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
    print('wrote',NEW.relative_to(ROOT),'plants',len(out['plants']),
          'profile',out['profile'])
