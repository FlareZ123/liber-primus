#!/usr/bin/env python3
"""Regression for q8 generic affine-leaf completeness; no unknown LP2 cribs."""
import json
from lp2_q8_placed_crib_receiver import Field, affine_vectors, encode, solve, fixtures, MOD

def enumerate_leaf(f,cap):
    stats={"affine_nodes":0,"affine_assignments_examined":0,
           "affine_assignments_chart_pruned":0}
    leaf={"unresolved":False}
    values=list(affine_vectors(f,35,stats,cap,leaf))
    return values,stats,leaf

def unit(i):
    row=[0]*35
    row[i]=1
    return row

# One free chart coordinate: the other 28 known chart entries exhaust 0..27.
# Exactly one of 29 completions is a chart permutation.
f=Field()
for i in range(35):
    if i!=26:
        assert f.add(unit(i),i+2 if i<27 else 0)
values,stats,leaf=enumerate_leaf(f,29)
assert len(values)==1 and values[0][:27]==list(range(2,29))
assert stats["affine_assignments_chart_pruned"]==28 and stats["affine_assignments_examined"]==1
assert not leaf["unresolved"]
print("ONE FREE CHART",json.dumps(stats))
# Two free key coordinates: all 841 vectors survive chart pruning.
f=Field()
for i in range(33):
    assert f.add(unit(i),i+2 if i<27 else 0)
values,stats,leaf=enumerate_leaf(f,870)
assert len(values)==841 and len({tuple(v) for v in values})==841
assert stats["affine_nodes"]==870 and not leaf["unresolved"]
print("TWO FREE KEYS",json.dumps(stats))
# Budget stops on a real unresolved affine family, never a false empty result.
values,stats,leaf=enumerate_leaf(f,30)
assert leaf["unresolved"] and len(values)<841
print("BOUNDED FREE KEYS",json.dumps(stats))
# Critic's minimal rank-2/35 witness. Check an actual valid action independently.
data={"chapters":["c0"],"cribs":[{"chapter":"c0","plain_gp":"1","cipher_gp":"2"}]}
assert encode([1],list(range(29)),list(range(1,9)),0)==[2]
none=solve(data,affine_node_cap=0,require_primitive=True)
assert none["phase_tree_complete"] and not none["action_set_complete"]
assert not none["exhaustive"] and not none["uniquely_identified_action"]
assert none["stats"]["rank_histogram"]=={2:1}
assert none["stats"]["unresolved_affine_leaves"]==1
print("RANK2 ZERO BUDGET",json.dumps(none["stats"]))
found=solve(data,affine_node_cap=100000,solution_cap=2,require_primitive=True)
assert len(found["solutions"])>=1,found["stats"]
assert not found["exhaustive"] and not found["uniquely_identified_action"]
for sol in found["solutions"]:
    assert encode([1],sol["chart"],sol["chapter_keys"]["c0"],0)==[2]
    assert sorted(sol["chart"])==list(range(29))
print("RANK2 WITNESSES",json.dumps(found["stats"]),json.dumps(found["solutions"]))
# Original pinned four shared/private native calibrations, plus offset smoke.
fixtures()
print("PASS affine completeness regressions")
