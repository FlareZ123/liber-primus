#!/usr/bin/env python3
"""Exact, source-agnostic q8 shared-GP29 chart/key inverse from placed cribs.

Usage:
    python sims/lp2_q8_placed_crib_receiver.py --fixture
    python sims/lp2_q8_placed_crib_receiver.py --input path/to/cribs.json

Input JSON (NO proposed original LP2 cribs are embedded; use supplied cipher_gp or the exact original page/rune_offset):
  {"chapters":["c0","c1","c2"],
   "source_note":"user-specified origin and location; never inferred here",
   "cribs":[
     {"chapter":"c0","plain_gp":"a9f","cipher_gp":"3if"},
     {"chapter":"c1","plain_gp":"...", "cipher_gp":"..."},
     {"chapter":"c2","plain_gp":"...", "cipher_gp":"..."},
     ...
   ],
   "query":[{"chapter":"c0","cipher_gp":"...", "id":"word42"}]}

In original-page mode each crib supplies page (0..55) and rune_offset instead\nof cipher_gp; the exact unmodified source ciphertext is inserted and checked.\nOptional query entries can use page, rune_offset and rune_length. Original\nplaintext and its semantic alignment are NEVER inferred or certified here.\n\nThe FIRST crib in each chapter defines its private phase-0 gauge. Every later
crib has eight possible unknown starts, unless phase_from_anchor is explicitly
provided (0..7). Only source-known input words are used to fit. The F rune,
index zero, is a transparent plaintext bypass; only consuming non-F plaintext
advances the phase. A ciphertext F can arise from consuming a non-F.

Returns normalized GP29 action solutions from every consistent affine leaf,
subject to explicit phase, affine-node and solution caps. All-different chart
constraints prune entire affine subspaces exactly. Reports phase-tree and
action-set completeness separately, with set-valued word inverses for queries.
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

def affine_vectors(B,nvars,stats,node_cap,leaf):
    """Enumerate a consistent GF29 affine leaf, pruning duplicate chart values.

    Each coordinate is an affine form in the nonpivot variables. At depth d
    all chart forms whose last dependency has been assigned become exact.
    A duplicate then rejects exactly 29**remaining full assignments.
    The global node budget counts each attempted free-variable assignment,
    not just full vectors. A bounded leaf is explicitly unresolved.
    """
    free=[i for i in range(nvars) if i not in B.rows]
    dim=len(free)
    pos={v:i for i,v in enumerate(free)}
    forms=[[0]*(dim+1) for _ in range(nvars)]
    for v,i in pos.items():
        forms[v][i+1]=1
    for pivot in sorted(B.rows,reverse=True):
        a=forms[pivot]
        a[0]=B.rhs[pivot]
        for j in range(pivot+1,nvars):
            c=B.rows[pivot][j]
            if c:
                a[:]=[(u-c*v)%MOD for u,v in zip(a,forms[j])]
    # Chart variables are indexed before key variables, so the free-variable
    # order typically permits early all-different pruning.
    buckets=[[] for _ in range(dim+1)]
    for a in forms[:27]:
        last=max((j for j,v in enumerate(a[1:],1) if v),default=0)
        buckets[last].append(a)
    values=[0]*dim
    def value(a):
        return (a[0]+sum(v*t for v,t in zip(a[1:],values)))%MOD
    def rec(depth,used):
        if leaf["unresolved"]:
            return
        seen=set(used)
        for a in buckets[depth]:
            v=value(a)
            if v in seen:
                stats["affine_assignments_chart_pruned"]+=MOD**(dim-depth)
                return
            seen.add(v)
        if depth==dim:
            stats["affine_assignments_examined"]+=1
            yield [value(a) for a in forms]
            return
        for v in range(MOD):
            if stats["affine_nodes"]>=node_cap:
                leaf["unresolved"]=True
                return
            stats["affine_nodes"]+=1
            values[depth]=v
            yield from rec(depth+1,seen)
            if leaf["unresolved"]:
                return
    yield from rec(0,{0,1})

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

def resolve_original_page_offsets(data):
    """Fill ciphertext from authoritative original physical LP2 p0-55 runes.

    Input crib: {"chapter":"c0","page":27,"rune_offset":12,
                 "plain_gp":"..."}.
    The supplied plaintext *remains a hypothesis*; only ciphertext is
    authenticated. Inputs that claim a different cipher_gp at the given
    source offset are rejected before cryptanalysis.

    Input query: {"id":"rune-window","chapter":"c0",
                  "page":27,"rune_offset":12,"rune_length":7}.
    No page-spanning, synthetic/real mixture, or page50 runeless text is
    silently repaired. The two solved pages 56-57 are excluded because their
    published methods differ from any unknown-page q8 hypothesis.
    """
    cribs=data.get("cribs",[])
    originals=[bool(isinstance(q,dict) and "page" in q) for q in cribs]
    if not any(originals):
        return data
    if not all(originals):
        raise ValueError("do not mix original-offset cribs with synthetic string cribs")
    original=json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    pages={p["page"]:p["indices"] for p in original["pages"] if p["page"]<=55}
    copied=json.loads(json.dumps(data))
    for typ in ("cribs","query"):
        for idx,obj in enumerate(copied.get(typ,[])):
            if not isinstance(obj,dict) or "page" not in obj or "rune_offset" not in obj:
                raise ValueError(f"all original {typ} entries require physical page and rune_offset")
            page=obj["page"];offset=obj["rune_offset"]
            if not isinstance(page,int) or page not in pages:
                raise ValueError(f"{typ}[{idx}] page outside original p0-55")
            if not isinstance(offset,int) or offset<0:
                raise ValueError(f"{typ}[{idx}] rune_offset negative/noninteger")
            if typ=="cribs":
                length=len(parse_gp(obj.get("plain_gp"),f"{typ}[{idx}].plain_gp"))
            else:
                length=obj.get("rune_length")
                if not isinstance(length,int) or length<1:
                    raise ValueError("query rune_length must be a positive integer")
            if offset+length>len(pages[page]):
                raise ValueError(f"{typ}[{idx}] exceeds original page rune range")
            actual=''.join(SYM[v] for v in pages[page][offset:offset+length])
            supplied=obj.get("cipher_gp")
            if supplied is not None and supplied!=actual:
                raise ValueError(f"{typ}[{idx}] supplied ciphertext contradicts canonical source")
            obj["cipher_gp"]=actual
    copied["ciphertext_source"]="Exact original GP29 physical pages p0-55; source plaintext/authentication NOT certified"
    return copied

def solve(data,branch_cap=1000000,solution_cap=100,word_cap=300,require_primitive=False,affine_node_cap=1000000):
    if min(branch_cap,solution_cap,word_cap)<1 or affine_node_cap<0:
        raise ValueError("phase/solution/word caps must be positive; affine node cap nonnegative")
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
           "primitive_actions":0,"exact_actions":0,"completed":0,
           "rank_histogram":{},"affine_assignments_possible":0,
           "affine_assignments_examined":0,"affine_assignments_chart_pruned":0,
           "affine_nodes":0,"unresolved_affine_leaves":0}
    solutions=[]
    distinct_actions=set()
    phase_truncated=False
    solution_truncated=False
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
    def accept(x,starts):
        pi=[0,1]+x[:27]
        if sorted(pi)!=list(range(29)):return
        stats["chart_permutations"]+=1
        keys=[x[27+8*ci:27+8*ci+8] for ci in range(len(chapters))]
        if require_primitive and any(all(key[k]==key[k+4] for k in range(4)) for key in keys):return
        stats["primitive_actions"]+=1
        if any(encode(p,pi,keys[ci],starts[w_i])!=c
               for w_i,(ci,p,c,_) in enumerate(words)):return
        stats["exact_actions"]+=1
        distinct_actions.add((tuple(pi),tuple(map(tuple,keys))))
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
                result["query"].append({"id":obj.get("id"),"chapter":obj["chapter"],
                                        "cipher_gp":obj["cipher_gp"],**decoded})
        solutions.append(result)

    def dfs(i,B,starts):
        nonlocal phase_truncated,solution_truncated
        if phase_truncated or solution_truncated:return
        if i==len(words):
            stats["completed"]+=1
            rank=len(B.rows)
            stats["rank_histogram"][rank]=stats["rank_histogram"].get(rank,0)+1
            stats["affine_assignments_possible"]+=MOD**(nvars-rank)
            if rank==nvars:
                stats["full_rank"]+=1
            leaf={"unresolved":False}
            vectors=affine_vectors(B,nvars,stats,affine_node_cap,leaf)
            for x in vectors:
                accept(x,starts)
                if len(solutions)>=solution_cap:
                    solution_truncated=True
                    # Conservative: the current generator and subsequent
                    # phase leaves have not necessarily been exhausted.
                    leaf["unresolved"]=True
                    break
            if leaf["unresolved"]:
                stats["unresolved_affine_leaves"]+=1
            return
        ci,p,c,options=words[i]
        for phase in options:
            if stats["branches"]>=branch_cap:
                phase_truncated=True;return
            stats["branches"]+=1
            trial=B.copy()
            if not add_word(trial,ci,p,c,phase):
                stats["dead"]+=1;continue
            dfs(i+1,trial,starts+[phase])
            if phase_truncated or solution_truncated:return
    dfs(0,basis,[])
    phase_complete=not (phase_truncated or solution_truncated)
    action_complete=phase_complete and stats["unresolved_affine_leaves"]==0
    stats["affine_assignments_unresolved_in_seen_leaves"]=(
        stats["affine_assignments_possible"]-stats["affine_assignments_examined"]
        -stats["affine_assignments_chart_pruned"])
    assert stats["affine_assignments_unresolved_in_seen_leaves"]>=0
    if action_complete:
        assert stats["affine_assignments_unresolved_in_seen_leaves"]==0
    return {"source_note":data.get("source_note","Unverified user-provided crib locations"),
            "chapters":chapter_names,"oracle_crib_count":len(cribs),
            "crib_runes":sum(len(w[1]) for w in words),
            "unknown_phase_count":sum(len(w[3])>1 for w in words),
            "stats":stats,"exhaustive":action_complete,
            "phase_tree_complete":phase_complete,"action_set_complete":action_complete,
            "phase_cap_reached":phase_truncated,"solution_cap_reached":solution_truncated,
            "distinct_normalized_actions_found":len(distinct_actions),
            "distinct_start_histories_found":len(solutions),
            "uniquely_identified_action":action_complete and len(distinct_actions)==1,
            "require_primitive":require_primitive,"solutions":solutions,
            "interpretation":"Conditional placed-crib inverse; no built-in original LP2 plaintext, key, or independently authenticated crib locations"}

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
            out=solve(data,require_primitive=True)
            assert out["phase_tree_complete"] and out["action_set_complete"]
            # Independent Critic audit, 2026-11-27: exact consistent-leaf ranks.
            expected={(0,"common"):{51:18,50:4},(0,"independent"):{50:18,49:9},
                      (1,"common"):{51:20,50:3,49:1},(1,"independent"):{51:15,50:5,49:3}}
            assert out["stats"]["rank_histogram"]==expected[(plant,world)],out["stats"]
            assert out["stats"]["unresolved_affine_leaves"]==0
            assert out["stats"]["affine_assignments_unresolved_in_seen_leaves"]==0
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
    # Exact canonical original-cipher acquisition smoke test. The plaintext
    # below is intentionally fabricated and NEVER fed to the inverse.
    original_input={"chapters":["physical54"],"source_note":"UNTRUSTED TEST WORD",
                    "cribs":[{"chapter":"physical54","plain_gp":"aaa",
                              "page":54,"rune_offset":0}],
                    "query":[{"chapter":"physical54","id":"page55test",
                              "page":55,"rune_offset":0,"rune_length":4}]}
    hydrated=resolve_original_page_offsets(original_input)
    corpus=json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    pages={p["page"]:p["indices"] for p in corpus["pages"]}
    assert hydrated["cribs"][0]["cipher_gp"]==''.join(SYM[x] for x in pages[54][:3])
    assert hydrated["query"][0]["cipher_gp"]==''.join(SYM[x] for x in pages[55][:4])
    contradiction=json.loads(json.dumps(original_input))
    contradiction["cribs"][0]["cipher_gp"]="zzz"
    try:resolve_original_page_offsets(contradiction)
    except ValueError:pass
    else:raise AssertionError("incorrect original ciphertext was accepted")
    print("PASS generic crib-driven receiver: two exact shared-chart actions recovered and two independent-chart controls rejected; canonical original-page offset hydrator rejects forged ciphertext; NO original plaintext or key supplied.")

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    mode=ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--fixture",action="store_true")
    mode.add_argument("--input",type=pathlib.Path)
    ap.add_argument("--branch-cap",type=int,default=1000000)
    ap.add_argument("--solution-cap",type=int,default=100)
    ap.add_argument("--affine-node-cap",type=int,default=1000000,
                    help="global attempted free-variable assignments; zero allows only full-rank leaves")
    ap.add_argument("--require-primitive",action="store_true",help="exclude 1/2/4-period q8 keys; synthetic controls use this, unknown original need not")
    args=ap.parse_args()
    if args.fixture:fixtures()
    else:
        data=json.loads(args.input.read_text(encoding="utf-8"))
        data=resolve_original_page_offsets(data)
        result=solve(data,args.branch_cap,args.solution_cap,require_primitive=args.require_primitive,
                     affine_node_cap=args.affine_node_cap)
        if "ciphertext_source" in data:result["ciphertext_source"]=data["ciphertext_source"]
        print(json.dumps(result,indent=2))
