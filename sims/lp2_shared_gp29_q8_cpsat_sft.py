"""CP-SAT receivers for the exact primitive q8 common-cycle model.

Requires ortools==9.14.6206. The solver sees 48 encrypted training groups
and the frozen lexicon; hidden actions and 17 held-out groups are used only
to calibrate a returned solution. No original fit in these calibrations.
The centralizer model uses the exact equivalence: commuting permutations
with a common 29-cycle generator are precisely its powers.
"""
import argparse, collections, json, pathlib, time
from ortools.sat.python import cp_model
import lp2_shared_gp29_q8_smt as s
import lp2_shared_gp29_q8_affine_sft as a

def model(C,D,mode,gauge='rank1'):
    m=cp_model.CpModel()
    rank=[m.new_int_var(0,28,f'pi{i}') for i in range(29)]
    k=[m.new_int_var(0,28,f'k{j}') for j in range(8)]
    m.add_all_different(rank)
    m.add(rank[0]==0); m.add(sum(rank)==406)
    if gauge=='rank1': m.add(rank[1]==1)
    elif gauge=='k0': m.add(k[0]==1)
    else: raise ValueError(gauge)
    neq=[]
    for j in range(4):
        b=m.new_bool_var(f'nonperiod4_{j}')
        m.add(k[j]!=k[j+4]).only_enforce_if(b)
        neq.append(b)
    m.add_bool_or(neq)
    maps={}
    if mode=='maps':
        for j in range(8):
            row=[]
            for c in range(29):
                v=m.new_int_var(0,28,f'm{j}_{c}')
                r=m.new_int_var(0,28,f'r{j}_{c}')
                wrap=m.new_bool_var(f'w{j}_{c}')
                m.add_element(v,rank,r)
                m.add(rank[c]==r+k[j]-29*wrap)
                maps[j,c]=v
                row.append(v)
            m.add_all_different(row)
    by=collections.defaultdict(list)
    for w in sorted(D): by[len(w)].append(w)
    anchor=max(range(len(C)),key=lambda g:(0 not in C[g],len(C[g]),-g))
    for g,c in enumerate(C):
        phase=m.new_int_var(0,7,f'phase{g}_0')
        if gauge=='rank1' and g==anchor: m.add(phase==0)
        words=[w for w in by[len(c)] if s.candidate(w,c)]
        ps=[]
        for i,x in enumerate(c):
            p=m.new_int_var(0 if x==0 else 1,28,f'p{g}_{i}')
            ps.append(p)
            if x==0:
                hold=m.new_bool_var(f'hold{g}_{i}')
                m.add(p==0).only_enforce_if(hold)
                m.add(p!=0).only_enforce_if(hold.Not())
            if mode=='maps':
                dec=m.new_int_var(0,28,f'dec{g}_{i}')
                m.add_element(phase,[maps[j,x] for j in range(8)],dec)
                eq=m.add(p==dec)
            else:
                pr=m.new_int_var(0,28,f'r{g}_{i}')
                sh=m.new_int_var(0,28,f's{g}_{i}')
                wrap=m.new_bool_var(f'w{g}_{i}')
                m.add_element(p,rank,pr)
                m.add_element(phase,k,sh)
                eq=m.add(rank[x]==pr+sh-29*wrap)
            if x==0: eq.only_enforce_if(hold.Not())
            if i+1<len(c):
                nxt=m.new_int_var(0,7,f'phase{g}_{i+1}')
                if x==0:
                    m.add(nxt==phase).only_enforce_if(hold)
                    m.add_allowed_assignments([phase,nxt],[(j,(j+1)%8) for j in range(8)]).only_enforce_if(hold.Not())
                else:
                    m.add_allowed_assignments([phase,nxt],[(j,(j+1)%8) for j in range(8)])
                phase=nxt
        m.add_allowed_assignments(ps,words)
    return m,rank,k


def model_commute(C,D):
    """Exact map-space model: eight decryption permutations are powers of one 29-cycle."""
    m=cp_model.CpModel()
    maps=[[m.new_int_var(0,28,f'f{j}_{c}') for c in range(29)] for j in range(8)]
    for row in maps:
        m.add_all_different(row)

    # A 29-cycle generator g = maps[0], anchored only at the symbol F=0.
    orbit=[m.new_int_var(0,28,f'orbit{i}') for i in range(29)]
    m.add(orbit[0]==0)
    for i in range(28):
        m.add_element(orbit[i],maps[0],orbit[i+1])
    m.add_element(orbit[28],maps[0],orbit[0])
    m.add_all_different(orbit)

    # The centralizer of a full 29-cycle is its cyclic group:
    # every other phase map commuting with g is exactly g**t for some t in GF(29).
    for j in range(1,8):
        for c in range(29):
            left=m.new_int_var(0,28,f'left{j}_{c}')
            right=m.new_int_var(0,28,f'right{j}_{c}')
            m.add_element(maps[0][c],maps[j],left)
            m.add_element(maps[j][c],maps[0],right)
            m.add(left==right)

    # Primitive period eight: not all four opposite phase pairs are equal.
    differences=[]
    for j in range(4):
        for c in range(29):
            d=m.new_bool_var(f'diff{j}_{c}')
            m.add(maps[j][c]!=maps[j+4][c]).only_enforce_if(d)
            m.add(maps[j][c]==maps[j+4][c]).only_enforce_if(d.Not())
            differences.append(d)
    m.add_bool_or(differences)

    by=collections.defaultdict(list)
    for w in sorted(D): by[len(w)].append(w)
    domains=[]
    for g,c in enumerate(C):
        phase=m.new_int_var(0,7,f'phase{g}_0')
        ps=[]
        for i,x in enumerate(c):
            p=m.new_int_var(0 if x==0 else 1,28,f'p{g}_{i}')
            ps.append(p)
            dec=m.new_int_var(0,28,f'dec{g}_{i}')
            m.add_element(phase,[maps[j][x] for j in range(8)],dec)
            if x==0:
                hold=m.new_bool_var(f'hold{g}_{i}')
                m.add(p==0).only_enforce_if(hold)
                m.add(p!=0).only_enforce_if(hold.Not())
                # F bypass is independent of the consuming inverse permutation.
                m.add(p==dec).only_enforce_if(hold.Not())
            else:
                m.add(p==dec)
            if i+1<len(c):
                nxt=m.new_int_var(0,7,f'phase{g}_{i+1}')
                if x==0:
                    m.add(nxt==phase).only_enforce_if(hold)
                    m.add_allowed_assignments([phase,nxt],[(j,(j+1)%8) for j in range(8)]).only_enforce_if(hold.Not())
                else:
                    m.add_allowed_assignments([phase,nxt],[(j,(j+1)%8) for j in range(8)])
                phase=nxt
        words=[w for w in by[len(c)] if s.candidate(w,c)]
        domains.append(len(words))
        if words: m.add_allowed_assignments(ps,words)
        else: m.add(False)
    return m,maps,domains

def recover_action_from_maps(maps):
    g=maps[0]
    orbit=[0]
    for _ in range(28): orbit.append(g[orbit[-1]])
    assert len(set(orbit))==29 and g[orbit[-1]]==0
    pi=[None]*29
    for n,c in enumerate(orbit): pi[c]=(-n)%29
    k=[orbit.index(maps[j][0]) for j in range(8)]
    inv=[pi.index(x) for x in range(29)]
    for j in range(8):
        assert [inv[(pi[c]-k[j])%29] for c in range(29)]==maps[j]
    return pi,k

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--plant',type=int,choices=[0,1],default=0)
    ap.add_argument('--profile',choices=['terminal','long'],default='terminal')
    ap.add_argument('--mode',choices=['direct','maps','centralizer'],default='maps')
    ap.add_argument('--gauge',choices=['rank1','k0'],default='rank1')
    ap.add_argument('--seconds',type=int,default=900)
    ap.add_argument('--workers',type=int,default=2)
    ap.add_argument('--oracle',action='store_true')
    args=ap.parse_args()
    term=json.loads((a.RESULTS/'lp2-shared-gp29-q8-terminal-corrected-fixtures.json').read_text())
    D=s.load_dictionary(a.ROOT/'resources/control/english_wordfreq_textblob.txt',term['added'])
    assert len(D)==38938
    f,n=(term,48) if args.profile=='terminal' else (json.loads((a.RESULTS/'lp2-shared-gp29-q8-affine-long-fixtures.json').read_text()),24)
    pl=f['plants'][args.plant]
    T=s.words(pl['truth']); C=s.words(pl['cipher'])
    if args.profile=='terminal': assert len(C)==len(T)==65 and sum(map(len,C[:48]))==223 and sum(map(len,C[48:]))==76
    assert all(t in s.decode(c,pl['pi'],pl['k'],D) for t,c in zip(T,C))
    if args.mode=='centralizer':
        m,maps,domains=model_commute(C[:n],D)
        rank=k=None
    else:
        m,rank,k=model(C[:n],D,args.mode,args.gauge)
    if args.oracle and args.mode=='centralizer':
        r=next(j for j,x in enumerate(pl['k']) if x%29)
        inv=[pl['pi'].index(x) for x in range(29)]
        oracle_maps=[[inv[(pl['pi'][c]-pl['k'][(j+r)%8])%29] for c in range(29)] for j in range(8)]
        for j in range(8):
            for c in range(29): m.add(maps[j][c]==oracle_maps[j][c])
    elif args.oracle:
        if args.gauge=='rank1':
            scale=pow(pl['pi'][1],-1,29)
            pp=[scale*x%29 for x in pl['pi']]
            kk=[scale*x%29 for x in pl['k']]
            anchor=max(range(n),key=lambda g:(0 not in C[g],len(C[g]),-g))
            start=pl['phases'][anchor]
            kk=kk[start:]+kk[:start]
        else:
            start=next(j for j,x in enumerate(pl['k']) if x%29)
            scale=pow(pl['k'][start],-1,29)
            pp=[scale*x%29 for x in pl['pi']]
            kk=[scale*pl['k'][(j+start)%8]%29 for j in range(8)]
        for x,v in zip(rank,pp): m.add(x==v)
        for x,v in zip(k,kk): m.add(x==v)
    err=m.validate()
    if err: raise ValueError(err)
    solver=cp_model.CpSolver()
    solver.parameters.max_time_in_seconds=args.seconds
    solver.parameters.num_search_workers=args.workers
    solver.parameters.random_seed=2722+args.plant
    print(m.model_stats(),flush=True)
    if args.mode=='centralizer': print('candidate_domains',domains,'total',sum(domains),flush=True)
    status=solver.solve(m)
    out={'status':solver.status_name(status),'wall_time':solver.wall_time,
         'branches':solver.num_branches,'conflicts':solver.num_conflicts,
         'mode':args.mode,'gauge':('centralizer' if args.mode=='centralizer' else args.gauge),'plant':args.plant,'profile':args.profile,'oracle':args.oracle}
    if status in (cp_model.OPTIMAL,cp_model.FEASIBLE):
        if args.mode=='centralizer':
            map_values=[[solver.value(maps[j][c]) for c in range(29)] for j in range(8)]
            pi,shifts=recover_action_from_maps(map_values)
        else:
            pi=[solver.value(x) for x in rank]; shifts=[solver.value(x) for x in k]
        decoded=[s.decode(c,pi,shifts,D) for c in C]
        assert all(decoded[:n])
        out.update(pi=pi,k=shifts,exact=s.same_action(pi,shifts,pl['pi'],pl['k']),
                   training_truth=sum(T[i] in decoded[i] for i in range(n)),
                   holdout_truth=sum(T[i] in decoded[i] for i in range(n,len(C))),
                   holdout_unique=sum(decoded[i]=={T[i]} for i in range(n,len(C))))
    print(json.dumps(out),flush=True)

if __name__=='__main__':main()
