#!/usr/bin/env python3
"""Exact, source-agnostic q8 shared-GP29 chart/key inverse from placed cribs.

Usage:
    python sims/lp2_q8_placed_crib_receiver.py --fixture
    python sims/lp2_q8_placed_crib_receiver.py --input path/to/cribs.json

Input JSON (NO proposed original LP2 cribs are embedded):
  {"chapters":["c0","c1","c2"],
   "source_note":"user-specified origin and location; never inferred here",
   "cribs":[
     {"chapter":"c0","plain_gp":"a9f","cipher_gp":"3if"},
     {"chapter":"c1","plain_gp":"...", "cipher_gp":"..."},
     {"chapter":"c2","plain_gp":"...", "cipher_gp":"..."},
     ...
   ],
   "query":[{"chapter":"c0","cipher_gp":"...", "id":"word42"}]}

The FIRST crib in each chapter defines its private phase-0 gauge. Every later
crib has eight possible unknown starts, unless phase_from_anchor is explicitly
provided (0..7). Only source-known input words are used to fit. The F rune,
index zero, is a transparent plaintext bypass; only consuming non-F plaintext
advances the phase. A ciphertext F can arise from consuming a non-F.

Returns all found full-rank GP29 action solutions up to configurable caps, exact
forward checks, and set-valued word inverses for queries. Flag cap truncation.
No vocabulary matching is used in chart/key inference, no source/private key is
invented and no unknown LP2 source pair is supplied by this script.

'--fixture' exercises the exact original #3046 three-chapter solved-native donor
plants, including both common-chart and independent-chart rivals, and asserts
recoveries. Fixture plaintext pairs are ORACLE-supplied, not original LP2 cribs.
"""
from __future__ import annotations
import argparse, json, pathlib, sys

ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'sims'))
SYM="0123456789abcdefghijklmnopqrs"
MOD=29

class Field:
    __slots__=("rows","rhs")
    def __init__(self):
        self.rows={}
        self.rhs={}
    def copy(self):
        b=Field()
        b.rows={p:list(x) for p,x in self.rows.items()}
        b.rhs=self.rhs.copy()
        return b
    def add(self,row,rhs):
        row=list(row)
        rhs%=MOD
        for pivot in sorted(self.rows):
            v=row[pivot]
            if v:
                old=self.rows[pivot]
                row=[(a-v*b)%MOD for a,b in zip(row,old)]
                rhs=(rhs-v*self.rhs[pivot])%MOD
        pivot=next((i for i,v in enumerate(row) if v),None)
        if pivot is None:return rhs==0
        inv=pow(row[pivot],-1,MOD)
        self.rows[pivot]=[v*inv%MOD for v in row]
        self.rhs[pivot]=rhs*inv%MOD
        return True
    def solve(self,nvars):
        if len(self.rows)!=nvars:return None
        x=[0]*nvars
        for pivot in sorted(self.rows,reverse=True):
            row=self.rows[pivot]
            x[pivot]=(self.rhs[pivot]-sum(row[j]*x[j] for j in range(pivot+1,nvars)))%MOD
        return x

def encode(plain,chart,key,phase):
    inv=[0]*29
    for i,v in enumerate(chart):inv[v]=i
    out=[]
    for p in plain:
        if p==0:out.append(0);continue
        out.append(inv[(chart[p]+key[phase])%MOD])
        phase=(phase+1)&7
    return out

def original_word_readouts(cipher,chart,key,limit):
    """Enumerate all eight starts with both legal meanings of ciphertext F."""
    inv=[0]*29
    for i,v in enumerate(chart):inv[v]=i
    candidates={}
    overflow=False
    def rec(i,phase,word,start):
        nonlocal overflow
        if len(candidates)>=limit:overflow=True;return
        if i==len(cipher):
            token=''.join(SYM[x] for x in word)
            candidates.setdefault(token,[]).append(start)
            return
        c=cipher[i]
        if c==0:
            rec(i+1,phase,word+[0],start)
        p=inv[(chart[c]-key[phase])%MOD]
        if p!=0:rec(i+1,(phase+1)&7,word+[p],start)
    for start in range(8):
        if len(candidates)>=limit:
            overflow=True;break
        rec(0,start,[],start)
    return {"n_plaintext_candidates":len(candidates),"truncated":overflow,
            "plain_gp_start_phases":[{"plain_gp":w,"starts":sorted(set(starts))}
                                   for w,starts in sorted(candidates.items())]}

def parse_gp(value,where):
    if not isinstance(value,str):raise ValueError(where+" must be GP29 symbol string")
    bad=set(value)-set(SYM)
    if bad:raise ValueError(where+" contains invalid canonical GP29 symbols "+repr(sorted(bad)))
    return [SYM.index(ch) for ch in value]

def solve(data,branch_cap=1000000,solution_cap=100,word_cap=300):
    chapter_names=data.get("chapters")
    if not isinstance(chapter_names,list) or not chapter_names or len(set(chapter_names))!=len(chapter_names):
        raise ValueError("chapters must be distinct nonempty chapter IDs")
    chapters={name:i for i,name in enumerate(chapter_names)}
    cribs=data.get("cribs")
    if not isinstance(cribs,list) or not cribs:raise ValueError("cribs required")
    seen_anchor=set()
    words=[]
    for idx,obj in enumerate(cribs):
        name=obj.get("chapter")
        if name not in chapters:raise ValueError("unknown chapter in crib "+str(idx))
        p=parse_gp(obj.get("plain_gp"),"plain_gp")
        c=parse_gp(obj.get("cipher_gp"),"cipher_gp")
        if not p or len(p)!=len(c):
            raise ValueError("empty or length-unequal crib "+str(idx))
        if any(a==0 and b!=0 for a,b in zip(p,c)):
            raise ValueError("plaintext-F bypass inconsistent with cipher at "+str(idx))
        anchor=name not in seen_anchor
        if anchor:
            if obj.get("phase_from_anchor",0)!=0:
                raise ValueError("first chapter crib phase gauge must be zero")
            options=(0,)
            seen_anchor.add(name)
        else:
            phase=obj.get("phase_from_anchor")
            if phase is not None and (not isinstance(phase,int) or phase not in range(8)):
                raise ValueError("phase_from_anchor must be 0..7")
            options=(phase,) if phase is not None else tuple(range(8))
        words.append((chapters[name],p,c,options))
    if len(seen_anchor)!=len(chapters):
        raise ValueError("at least one anchored crib per chapter required")
    nvars=27+8*len(chapters)
    basis=Field()
    assert basis.add([1]*27+[0]*(nvars-27),28)  # pi(0)=0, pi(1)=1; sum other=28 mod29
    stats={"branches":0,"dead":0,"full_rank":0,"chart_permutations":0,
           "primitive_actions":0,"exact_actions":0,"completed":0}
    solutions=[]
    truncated=False
    def add_word(B,ci,p,c,phase):
        for a,b in zip(p,c):
            if a==0:continue
            row=[0]*nvars
            if b>=2:row[b-2]+=1
            if a>=2:row[a-2]-=1
            row[27+8*ci+phase]-=1
            if not B.add(row,(int(a==1)-int(b==1))%MOD):
                return False
            phase=(phase+1)&7
        return True
    def dfs(i,B,starts):
        nonlocal truncated
        if truncated:return
        if i==len(words):
            stats["completed"]+=1
            x=B.solve(nvars)
            if x is None:return
            stats["full_rank"]+=1
            pi=[0,1]+x[:27]
            if sorted(pi)!=list(range(29)):return
            stats["chart_permutations"]+=1
            keys=[x[27+8*ci:27+8*ci+8] for ci in range(len(chapters))]
            if any(all(key[k]==key[k+4] for k in range(4)) for key in keys):return
            stats["primitive_actions"]+=1
            if any(encode(p,pi,keys[ci],starts[w_i])!=c
                   for w_i,(ci,p,c,_) in enumerate(words)):return
            stats["exact_actions"]+=1
            result={"chart":pi,"chapter_keys":{name:keys[ci] for name,ci in chapters.items()},
                    "crib_starts_from_anchor":starts}
            if isinstance(data.get("query"),list):
                result["query"]=[]
                for obj in data["query"]:
                    if obj.get("chapter") not in chapters:
                        raise ValueError("unknown query chapter")
                    ci=chapters[obj["chapter"]]
                    cipher=parse_gp(obj.get("cipher_gp"),"query cipher_gp")
                    decoded=original_word_readouts(cipher,pi,keys[ci],word_cap)
                    result["query"].append({"id":obj.get("id"),
                                            "chapter":obj["chapter"],
                                            "cipher_gp":obj["cipher_gp"],**decoded})
            solutions.append(result)
            if len(solutions)>=solution_cap:truncated=True
            return
        ci,p,c,options=words[i]
        for phase in options:
            if stats["branches"]>=branch_cap:
                truncated=True;return
            stats["branches"]+=1
            trial=B.copy()
            if not add_word(trial,ci,p,c,phase):
                stats["dead"]+=1;continue
            dfs(i+1,trial,starts+[phase])
            if truncated:return
    dfs(0,basis,[])
    return {"source_note":data.get("source_note","Unverified user-provided crib locations"),
            "chapters":chapter_names,"oracle_crib_count":len(cribs),
            "crib_runes":sum(len(w[1]) for w in words),
            "unknown_phase_count":sum(len(w[3])>1 for w in words),
            "stats":stats,"exhaustive":not truncated,
            "uniquely_identified_action":not truncated and len(solutions)==1,
            "solutions":solutions,"interpretation":"Conditional placed-crib inverse; no built-in original LP2 plaintext, key, or independently authenticated crib locations"}

def fixtures():
    # The sole fixture-only dependency imports the pinned #3046 generator.
    import agent31_q8_seven_crib_gf29_receiver_sft as prior
    D,base=prior.G["load_inputs"]()
    outputs=[]
    for plant in (0,1):
        for world in ("common","independent"):
            chs=prior.G["make_plant"](base,plant,world)
            by={ch["name"]:ch for ch in chs}
            data={"chapters":[ch["name"] for ch in chs],
                  "source_note":"ORACLE SOLVED NATIVE #3046 FIXTURE, NOT LP2",
                  "cribs":[]}
            for name,idx in prior.ANCHORS:
                ch=by[name]
                p=ch["train_truth"][idx]
                c=ch["train_cipher"][idx]
                data["cribs"].append({"chapter":name,
                    "plain_gp":''.join(SYM[v] for v in p),
                    "cipher_gp":''.join(SYM[v] for v in c)})
            # No F/phase/key/chart truth is sent to solve().
            out=solve(data)
            assert out["exhaustive"]
            if world=="common":
                assert out["uniquely_identified_action"]
                sol=out["solutions"][0]
                import lp2_shared_gp29_q8_smt as ref
                for ci,ch in enumerate(chs):
                    assert ref.same_action(sol["chart"],sol["chapter_keys"][ch["name"]],
                                           ch["pi"],ch["key"])
                # Check that the source-hidden word-start phases are inferred.
                true_starts=[]
                for name,idx in prior.ANCHORS:
                    true_starts.append(by[name]["starts"][idx])
                assert sol["crib_starts_from_anchor"]==true_starts
            else:
                assert out["solutions"]==[]
            outputs.append({"plant":plant,"world":world,
                            "stats":out["stats"],
                            "unique_action":out["uniquely_identified_action"]})
            print("CASE "+json.dumps(outputs[-1],separators=(",",":")),flush=True)
    print("PASS generic crib-driven receiver: two exact shared-chart actions recovered and two independent-chart controls rejected; no original LP2 cribs supplied.")

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    mode=ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--fixture",action="store_true")
    mode.add_argument("--input",type=pathlib.Path)
    ap.add_argument("--branch-cap",type=int,default=1000000)
    ap.add_argument("--solution-cap",type=int,default=100)
    args=ap.parse_args()
    if args.fixture:fixtures()
    else:
        data=json.loads(args.input.read_text(encoding="utf-8"))
        print(json.dumps(solve(data,args.branch_cap,args.solution_cap),indent=2))
