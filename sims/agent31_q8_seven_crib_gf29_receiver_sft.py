#!/usr/bin/env python3
"""Conditional q8 common-chart inverse from seven externally supplied native cribs.

This is NOT a blind cipher breaker: the seven plaintext anchor words are read
from the known solved-native donors (an oracle) and selected using their true
rank contribution. Their start phases, keys and chart are HIDDEN from the
solver. It implements a distinct exact quotient via unknown 29-chart
coordinates, unknown chapter shifts, and incremental GF(29) source equations.
Its successful recovery proves a *conditional receiver*, not an LP2 source
selector, unknown plaintext recovery or a successful #3258 blind gate.

Run with the existing manual Python research SFT workflow; stdlib only.
"""
from __future__ import annotations
import ast, collections, json, pathlib, random, re, sys, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'sims'))
import lp2_shared_gp29_q8_smt as s

# Exact unchanged #3046 native and plant generator, skipping CP-SAT-only imports.
SOURCE=ROOT/'sims/lp2_shared_gp29_q8_multichapter_pool_sft.py'
TREE=ast.parse(SOURCE.read_text(encoding='utf-8'))
FNAMES={'primitive_q8','same_key_orbit','make_pi','effective_decrypt_map',
        'is_full_cycle','same_cyclic_subgroup','load_inputs',
        'random_primitive_key','make_plant'}
NODES=[node for node in TREE.body if isinstance(node,ast.FunctionDef)
       and node.name in FNAMES]
G=dict(pathlib=pathlib,random=random,re=re,collections=collections,json=json,s=s,
       ROOT=ROOT, MOD=29,
       NATIVE=ROOT/'resources/external/relikd-solved-gp29-native-v1.json',
       LEX=ROOT/'resources/control/english_wordfreq_textblob.txt',
       FIXTURE=ROOT/'im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json',
       CHAPTERS=('jpg229','p57_parable','p56_an_end'),TRAIN_NUM=9,TRAIN_DEN=10)
exec(compile(ast.Module(body=NODES,type_ignores=[]),str(SOURCE),'exec'),G)

MOD=29
N=27+3*8
# Seven 55-rune oracle cribs selected for full GF29 rank on BOTH pinned
# common-chart plants. Three phase gauges fixed, four phases withheld.
# The six-word rank gate cannot reach 51 on either dual-world control under
# this donor candidate pool with three chapter anchors.
ANCHORS=(('p57_parable',13),('jpg229',1),('p56_an_end',19),
         ('jpg229',5),('jpg229',7),('p56_an_end',2),
         ('p56_an_end',18))
ORDER=tuple(range(len(ANCHORS)))

class Linear:
    """Echelon chart-key constraints over GF29; no oracle key is inspected."""
    __slots__=('pivots','rhs')
    def __init__(self):
        self.pivots={}
        self.rhs={}
    def copy(self):
        x=Linear()
        x.pivots={p:list(row) for p,row in self.pivots.items()}
        x.rhs=self.rhs.copy()
        return x
    def add(self,row,rhs):
        row=list(row)
        rhs%=MOD
        for p in sorted(self.pivots):
            v=row[p]
            if not v:continue
            src=self.pivots[p]
            row=[(a-v*b)%MOD for a,b in zip(row,src)]
            rhs=(rhs-v*self.rhs[p])%MOD
        idx=next((j for j,v in enumerate(row) if v),None)
        if idx is None:return rhs==0
        inv=pow(row[idx],-1,MOD)
        row=[x*inv%MOD for x in row]
        self.pivots[idx]=row
        self.rhs[idx]=rhs*inv%MOD
        return True
    def solution(self):
        if len(self.pivots)!=N:return None
        x=[0]*N
        for p in sorted(self.pivots,reverse=True):
            row=self.pivots[p]
            x[p]=(self.rhs[p]-sum(row[j]*x[j] for j in range(p+1,N)))%MOD
        return x

def rows(chapter_idx,plain,cipher,start):
    phase=start
    for p,c in zip(plain,cipher):
        if p==0:
            if c!=0:raise AssertionError('invalid plaintext-F bypass')
            continue
        row=[0]*N
        # pi[0]=0 and pi[1]=1 are gauge-fixed, all others are unknown.
        if c>=2:row[c-2]+=1
        if p>=2:row[p-2]-=1
        row[27+8*chapter_idx+phase]-=1
        rhs=(int(p==1)-int(c==1))%MOD
        yield row,rhs
        phase=(phase+1)%8

def apply(system,chapter_idx,plain,cipher,start):
    for row,rhs in rows(chapter_idx,plain,cipher,start):
        if not system.add(row,rhs):return False
    return True

def run(dictionary,base,plant,world):
    chapters=G['make_plant'](base,plant,world)
    by_name={ch['name']:(i,ch) for i,ch in enumerate(chapters)}
    groups=[]
    for name,idx in ANCHORS:
        ci,ch=by_name[name]
        groups.append((ci,idx,ch['train_truth'][idx],ch['train_cipher'][idx],
                       idx==ch['anchor']))
    assert sum(len(g[2]) for g in groups)==55
    assert sum(g[4] for g in groups)==3
    # Permutation sum invariant: sum pi(0..28)=406=0 mod29.
    # Given fixed pi(0)=0 and pi(1)=1, sum remaining pi = -1.
    basis=Linear()
    sumrow=[1]*27+[0]*24
    assert basis.add(sumrow,28)

    # Diagnostic only. For independent-pi rivals, a shared-chart oracle
    # cannot be assembled from three different source charts.
    if world=='common':
        diag=basis.copy()
        values=chapters[0]['pi'][2:]
        for cc in chapters:values+=cc['key']
        diag_steps=[]
        for anchor_i in ORDER:
            ci,wordidx,p,c,_=groups[anchor_i]
            true_start=chapters[ci]['starts'][wordidx]
            eq=list(rows(ci,p,c,true_start))
            assert all((sum(a*b for a,b in zip(row,values))-rhs)%MOD==0
                       for row,rhs in eq),('oracle row failed',plant,anchor_i)
            assert apply(diag,ci,p,c,true_start)
            diag_steps.append((anchor_i,true_start,len(diag.pivots)))
        assert len(diag.pivots)==N,('oracle rank not 51',plant,diag_steps)
        print('ORACLE_RANK',plant,world,len(diag.pivots),diag_steps,flush=True)

    stats=dict(branches=0,dead=0,leaves=0,rank51=0,
               permutation=0,primitive=0,complete_actions=0)
    solutions=[]
    def walk(depth,current,phases):
        if depth==len(ORDER):
            stats['leaves']+=1
            x=current.solution()
            if x is None:return
            stats['rank51']+=1
            pi=[0,1]+x[:27]
            if sorted(pi)!=list(range(MOD)):return
            stats['permutation']+=1
            keys=[x[27+8*ci:27+8*(ci+1)] for ci in range(3)]
            if not all(G['primitive_q8'](key) for key in keys):return
            stats['primitive']+=1
            # Full forward replay on all seven anchor words.
            for anchor_i,(ci,wordidx,p,c,_) in enumerate(groups):
                if s.encode(p,pi,keys[ci],phases[anchor_i])!=c:return
            stats['complete_actions']+=1
            held=[]
            for ci,ch in enumerate(chapters):
                details=[]
                for w,c in zip(ch['holdout_truth'],ch['holdout_cipher']):
                    variants=s.decode(c,pi,keys[ci],dictionary)
                    details.append({'truth_present':w in variants,
                                    'compatible_words':len(variants),
                                    'unique_correct':len(variants)==1 and w in variants})
                held.append(dict(name=ch['name'],count=len(details),
                    truth_present=sum(x['truth_present'] for x in details),
                    unique_correct=sum(x['unique_correct'] for x in details),
                    ambiguity=sum(x['compatible_words']!=1 for x in details)))
            exact=all(s.same_action(pi,keys[ci],chapters[ci]['pi'],
                                    chapters[ci]['key']) for ci in range(3))
            solutions.append(dict(starts=phases,pi=pi,keys=keys,
                                  planted_action_recovered=exact,
                                  held=held))
            return
        index=ORDER[depth]
        ci,wordidx,p,c,is_anchor=groups[index]
        starts=(0,) if is_anchor else range(8)
        for start in starts:
            stats['branches']+=1
            trial=current.copy()
            if not apply(trial,ci,p,c,start):
                stats['dead']+=1
                continue
            walk(depth+1,trial,{**phases,index:start})
    t=time.monotonic()
    walk(0,basis,{})
    return {'plant':plant,'world':world,'oracle_anchor_words':len(ANCHORS),
            'oracle_anchor_runes':55,'unfixed_start_phases':4,
            'stats':stats,'seconds':round(time.monotonic()-t,3),
            'solutions':solutions}

def main():
    dictionary,base=G['load_inputs']()
    cases=[]
    for plant in (0,1):
        for world in ('common','independent'):
            obj=run(dictionary,base,plant,world)
            print('CASE',json.dumps(obj,separators=(',',':')),flush=True)
            cases.append(obj)
    for x in cases:
        if x['world']=='common':
            assert len(x['solutions'])==1
            assert x['solutions'][0]['planted_action_recovered']
        else:
            assert not x['solutions']
    print('PASS: exact conditional seven-crib receiver calibrates on both '
          'common worlds and rejects both private-chart rivals; '
          'NOT blind, NO LP2 plaintext or key.',flush=True)

if __name__=='__main__':
    main()
