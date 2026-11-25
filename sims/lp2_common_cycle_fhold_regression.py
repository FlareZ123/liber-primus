"""Exact F-bypass regression for shared GP29 cycle receivers.
Run with Python (algebraic oracle); add --cpsat in the repository's
ORTools environment to pin actual model maps and exercise both receivers.
"""
import sys
import random

Q=29

def edges(pi,k,phase,c):
    inv=[pi.index(x) for x in range(Q)]
    dec=inv[(pi[c]-k[phase])%Q]
    out=set()
    if c==0:
        out.add((0,phase))
    if dec!=0:
        out.add((dec,(phase+1)%len(k)))
    return out


def forward_edges(pi,k,phase,c):
    inv=[pi.index(x) for x in range(Q)]
    return {(p,phase if p==0 else (phase+1)%len(k))
            for p in range(Q) if (0 if p==0 else inv[(pi[p]+k[phase])%Q])==c}


def old_edges(pi,k,phase,c):
    inv=[pi.index(x) for x in range(Q)]
    dec=inv[(pi[c]-k[phase])%Q]
    return {(p,j) for p,j in edges(pi,k,phase,c) if p==dec}


def algebraic():
    rng=random.Random(3301)
    counts=[0,0,0]
    for pi in [list(range(Q))]+[[0]+rng.sample(range(1,Q),Q-1) for _ in range(99)]:
        # Put each shift in the first phase; a second phase distinguishes hold/consume.
        for shift in range(Q):
            k=[shift,1]
            for c in range(Q):
                oracle=forward_edges(pi,k,0,c)
                got=edges(pi,k,0,c)
                assert got==oracle,(pi,shift,c,got,oracle)
                old=old_edges(pi,k,0,c)
                assert old<=oracle
                assert oracle-old==({(0,0)} if c==0 and shift!=0 else set())
                counts[0]+=len(oracle);counts[1]+=len(old);counts[2]+=len(oracle-old)
    assert counts==[84100,81300,2800],counts
    print('algebraic: 100 alphabets × 29 shifts × 29 ciphertexts; true, old, omitted edges:',counts)


def cpsat():
    from ortools.sat.python import cp_model
    import lp2_shared_gp29_q8_smt as s
    import lp2_shared_gp29_q8_cpsat_sft as base
    import lp2_shared_gp29_q8_carry_prefix_sft as carry
    # All nonzero shifts are important: the old unconditional equality
    # cannot rescue a literal F by choosing another phase with shift zero.
    pi=list(range(Q)); k=list(range(1,9))
    examples=[('leading_hold',(0,1),(0,2)),('terminal_hold',(1,0),(2,0)),
              ('sole_hold',(0,),(0,)),('consuming_cipher_F',(28,1),(0,3)),
              ('interior_hold',(1,0,1),(2,0,3))]
    for name,p,c in examples:
        assert s.encode(p,pi,k,0)==c,(name,p,c)
        assert p in s.decode(c,pi,k,{p})
        for label,builder in [('base',lambda:base.model_commute([c],{p})),
                              ('carry',lambda:carry.model_commute([c],{p},0,{p},0))]:
            model,maps,*_=builder()
            for j in range(8):
                for x in range(Q):
                    model.add(maps[j][x]==(x-k[j])%Q)
            solver=cp_model.CpSolver()
            solver.parameters.max_time_in_seconds=20
            status=solver.solve(model)
            assert status in (cp_model.OPTIMAL,cp_model.FEASIBLE),(label,name,solver.status_name(status))
            print('actual CP-SAT',label,name,solver.status_name(status))


if __name__=='__main__':
    algebraic()
    if '--cpsat' in sys.argv:
        cpsat()
