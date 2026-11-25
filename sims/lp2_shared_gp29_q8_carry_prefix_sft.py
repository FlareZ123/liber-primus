#!/usr/bin/env python3
"""Word-reset q8 common-cycle calibration with a correctly continuous page carry.

Source profile: 47 complete p54 body words, a 10-rune prefix of one
11-rune cross-page word, then its held-out final rune plus 16 complete p55
words. The page boundary does not reset the carry word's phase.
"""
import argparse, collections, json, pathlib, random, sys
from ortools.sat.python import cp_model
import lp2_shared_gp29_q8_smt as s
import lp2_shared_gp29_q8_cpsat_sft as cpsat

ROOT=pathlib.Path(__file__).resolve().parents[1]
RESULTS=ROOT/'im-results'
PAGES=ROOT/'resources/liber-primus/lp2-page-groups-54-55-derived.json'
FIXTURE=RESULTS/'lp2-shared-gp29-q8-terminal-corrected-fixtures.json'
PREFIX=RESULTS/'lp2-terminal-carry-prefix-cycle-output.json'
LEX=ROOT/'resources/control/english_wordfreq_textblob.txt'
SYM=s.SYM

def compact(w):
    return ''.join(SYM[x] for x in w)

def parse(w):
    return tuple(SYM.index(x) for x in w)

def model_commute(C,D,prefix_index,prefix_domain,max_oov):
    """Exact common-cycle model; only prefix_index gets the 11-to-10 prefix domain."""
    m=cp_model.CpModel()
    maps=[[m.new_int_var(0,28,'f%d_%d'%(j,c)) for c in range(29)] for j in range(8)]
    for row in maps:
        m.add_all_different(row)
    orbit=[m.new_int_var(0,28,'orbit%d'%i) for i in range(29)]
    m.add(orbit[0]==0)
    for i in range(28):
        m.add_element(orbit[i],maps[0],orbit[i+1])
    m.add_element(orbit[28],maps[0],orbit[0])
    m.add_all_different(orbit)
    for j in range(1,8):
        for c in range(29):
            left=m.new_int_var(0,28,'left%d_%d'%(j,c))
            right=m.new_int_var(0,28,'right%d_%d'%(j,c))
            m.add_element(maps[0][c],maps[j],left)
            m.add_element(maps[j][c],maps[0],right)
            m.add(left==right)
    differences=[]
    for j in range(4):
        for c in range(29):
            d=m.new_bool_var('diff%d_%d'%(j,c))
            m.add(maps[j][c]!=maps[j+4][c]).only_enforce_if(d)
            m.add(maps[j][c]==maps[j+4][c]).only_enforce_if(d.Not())
            differences.append(d)
    m.add_bool_or(differences)

    by=collections.defaultdict(list)
    for w in sorted(D):
        by[len(w)].append(w)
    domains=[]
    inlex=[]
    oov=[]
    for g,c in enumerate(C):
        phase=m.new_int_var(0,7,'phase%d_0'%g)
        ps=[]
        for i,x in enumerate(c):
            p=m.new_int_var(0 if x==0 else 1,28,'p%d_%d'%(g,i))
            ps.append(p)
            dec=m.new_int_var(0,28,'dec%d_%d'%(g,i))
            m.add_element(phase,[maps[j][x] for j in range(8)],dec)
            if x==0:
                hold=m.new_bool_var('hold%d_%d'%(g,i))
                m.add(p==0).only_enforce_if(hold)
                m.add(p!=0).only_enforce_if(hold.Not())
                # The literal F hold does not pass through the consuming inverse.
                m.add(p==dec).only_enforce_if(hold.Not())
            else:
                m.add(p==dec)
            if i+1<len(c):
                nxt=m.new_int_var(0,7,'phase%d_%d'%(g,i+1))
                if x==0:
                    m.add(nxt==phase).only_enforce_if(hold)
                    m.add_allowed_assignments([phase,nxt],[(j,(j+1)%8) for j in range(8)]).only_enforce_if(hold.Not())
                else:
                    m.add_allowed_assignments([phase,nxt],[(j,(j+1)%8) for j in range(8)])
                phase=nxt
        words=([w for w in prefix_domain if s.candidate(w,c)]
               if g==prefix_index else
               [w for w in by[len(c)] if s.candidate(w,c)])
        domains.append(len(words))
        flag=m.new_bool_var('inlex%d'%g)
        inlex.append(flag)
        if g==prefix_index:
            if words:
                m.add(flag==1)
                m.add_allowed_assignments(ps,words)
            else:
                m.add(False)
        elif words:
            m.add_allowed_assignments(ps,words).only_enforce_if(flag)
            oov.append(flag.Not())
        else:
            m.add(flag==0)
            oov.append(flag.Not())
    m.add(sum(oov)<=max_oov)
    return m,maps,domains,inlex

def solve(C,D,prefix_index,prefix_domain,max_oov,seconds,workers,seed):
    m,maps,domains,inlex=model_commute(C,D,prefix_index,prefix_domain,max_oov)
    error=m.validate()
    if error:
        raise ValueError(error)
    solver=cp_model.CpSolver()
    solver.parameters.max_time_in_seconds=seconds
    solver.parameters.num_search_workers=workers
    solver.parameters.random_seed=seed
    status=solver.solve(m)
    out={'status':solver.status_name(status),'wall_time':solver.wall_time,
         'branches':solver.num_branches,'conflicts':solver.num_conflicts,
         'domains':domains,'model_stats':m.model_stats()}
    if status in (cp_model.OPTIMAL,cp_model.FEASIBLE):
        map_values=[[solver.value(maps[j][c]) for c in range(29)] for j in range(8)]
        pi,k=cpsat.recover_action_from_maps(map_values)
        out.update(pi=pi,k=k,
                   oov_indices=[i for i,v in enumerate(inlex) if i!=prefix_index and solver.value(v)==0])
        return out,pi,k
    return out,None,None

def choose_words(D,lengths,rng):
    by=collections.defaultdict(list)
    for w in D:
        by[len(w)].append(w)
    used=set()
    def choose(n):
        pool=[w for w in by[n] if w not in used]
        if not pool:
            pool=by[n]
        if not pool:
            raise ValueError('dictionary has no forms of rune length %d'%n)
        w=rng.choice(pool)
        used.add(w)
        return w
    return [choose(n) for n in lengths],choose

def write_result(result,suffix):
    path=RESULTS/('lp2-shared-gp29-q8-carry-prefix-%s.json'%suffix)
    path.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')

def run_control(args,D,body_lengths,hold_lengths):
    rng=random.Random(3301+args.plant)
    train_truth,choose=choose_words(D,body_lengths,rng)
    carry=choose(11)
    hold_truth=[choose(n) for n in hold_lengths]
    pi=[0]+rng.sample(list(range(1,29)),28)
    while True:
        k=[1]+[rng.randrange(29) for _ in range(7)]
        if any(k[j]!=k[j+4] for j in range(4)):
            break
    train_cipher=[s.encode(w,pi,k,rng.randrange(8)) for w in train_truth]
    carry_cipher=s.encode(carry,pi,k,rng.randrange(8))
    hold_cipher=[s.encode(w,pi,k,rng.randrange(8)) for w in hold_truth]
    prefix_domain={w[:10] for w in D if len(w)==11}
    assert carry[:10] in prefix_domain
    C=train_cipher+[carry_cipher[:10]]
    out,found_pi,found_k=solve(C,D,len(C)-1,prefix_domain,3,args.seconds,args.workers,3301+args.plant)
    if found_pi is None:
        result={'target':'control','plant':args.plant,**out,'passed':False}
        write_result(result,'control-%d'%args.plant)
        print(json.dumps(result,indent=2),flush=True)
        return 1
    exact=s.same_action(found_pi,found_k,pi,k)
    train_present=sum(w in s.decode(c,found_pi,found_k,D) for w,c in zip(train_truth,train_cipher))
    prefix_present=carry[:10] in s.decode(C[-1],found_pi,found_k,prefix_domain)
    hold_ciphers=[carry_cipher]+hold_cipher
    all_hold_truth=[carry]+hold_truth
    hold_decoded=[s.decode(c,found_pi,found_k,D) for c in hold_ciphers]
    hold_present=sum(w in d for w,d in zip(all_hold_truth,hold_decoded))
    hold_unique=sum(len(d)==1 and w in d for w,d in zip(all_hold_truth,hold_decoded))
    oov=out.get('oov_indices',[])
    passed=(exact and not oov and train_present==47 and prefix_present and hold_present==17 and hold_unique>=8)
    result={'target':'control','plant':args.plant,**out,
            'exact_action':exact,'training_truth_present':train_present,
            'carry_prefix_present':prefix_present,'holdout_truth_present':hold_present,
            'holdout_unique':hold_unique,'holdout_candidate_counts':[len(x) for x in hold_decoded],
            'passed':passed}
    write_result(result,'control-%d'%args.plant)
    print(json.dumps(result,indent=2),flush=True)
    return 0 if passed else 1

def run_original(args,D,pages,prefix_data):
    body=[parse(x) for x in pages['p54']['body_groups']]
    p55=[parse(x) for x in pages['p55']['groups']]
    assert len(body)==48 and sum(map(len,body))==223
    assert len(body[-1])==10 and len(p55[0])==1 and len(body[-1]+p55[0])==11
    assert len(body[:47])==47 and sum(map(len,body[:47]))==213
    assert len(p55[1:])==16 and sum(map(len,p55[1:]))==75
    opts=prefix_data['options']
    prefix_domain={parse(x['gp'][:10]) for x in opts}
    assert len(opts)==96 and len(prefix_domain)==93
    assert all(len(w)==10 for w in prefix_domain)
    C=body[:48]
    out,pi,k=solve(C,D,47,prefix_domain,3,args.seconds,args.workers,2854)
    result={'target':'original','training_profile':{'complete_p54_words':47,'complete_p54_runes':213,
             'carry_prefix_runes':10,'carry_total_runes':11,'heldout_carry_suffix_runes':1,
             'complete_p55_words':16,'complete_p55_runes':75,'max_oov_complete_words':3},
            'prefix_domain':{'source_options':96,'unique_prefixes':93,
             'cipher_prefix':compact(body[-1])},**out}
    if pi is not None:
        result['oov_indices']=out.get('oov_indices',[])
        carry_cipher=body[-1]+p55[0]
        hold_cipher=[carry_cipher]+p55[1:]
        decoded=[s.decode(c,pi,k,D) for c in hold_cipher]
        result['holdout_candidate_counts']=[len(x) for x in decoded]
        result['holdout_candidate_samples']=[[compact(w) for w in sorted(x)[:5]] for x in decoded]
        train_decoded=[s.decode(c,pi,k,D) for c in body[:47]]
        result['training_candidate_counts']=[len(x) for x in train_decoded]
        result['carry_prefix_candidate_count']=len(s.decode(body[-1],pi,k,prefix_domain))
        result['pi']=pi
        result['k']=k
    result['diagnostic_exit']='Intentional exit 1 after printing JSON so the failed-job log can be retrieved; inspect status before interpreting.'
    write_result(result,'original')
    print(json.dumps(result,indent=2),flush=True)
    return 1

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--target',choices=['control','original'],required=True)
    ap.add_argument('--plant',type=int,choices=[0,1],default=0)
    ap.add_argument('--seconds',type=int,default=900)
    ap.add_argument('--workers',type=int,default=4)
    args=ap.parse_args()
    fixture=json.loads(FIXTURE.read_text(encoding='utf-8'))
    D=s.load_dictionary(LEX,fixture['added'])
    assert len(D)==38938
    pages=json.loads(PAGES.read_text(encoding='utf-8'))
    body_lengths=[len(x) for x in pages['p54']['body_groups'][:47]]
    hold_lengths=[len(x) for x in pages['p55']['groups'][1:]]
    assert len(body_lengths)==47 and sum(body_lengths)==213
    assert len(hold_lengths)==16 and sum(hold_lengths)==75
    if args.target=='control':
        return run_control(args,D,body_lengths,hold_lengths)
    prefix_data=json.loads(PREFIX.read_text(encoding='utf-8'))
    return run_original(args,D,pages,prefix_data)

if __name__=='__main__':
    sys.exit(main())
