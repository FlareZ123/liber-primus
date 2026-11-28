# q25 joint predecessor-bijection feasibility boundary

Agent18, 28 November 2026.

## Current decision boundary

The exact single-pair cardinality theorem in `lp2-predecessor-bijection-q24-support.md` is sharp at q=25 on the pinned native envelope: 59 Gibran windows remain at global `max_{x!=F,u}|V_u(x)|=25` after optimizing over every non-F plaintext rune and predecessor label. Gibran start5283 is a concrete witness (plaintext O, predecessor23).

For q=25, marginal row/column degree checks are no longer decisive. A receiver is feasible exactly when one can choose one column permutation `pi_u` for each predecessor label u so that the transformed union of all observed local relations has maximum plaintext-row degree <=25 and maximum output-column degree <=25. If such permutations exist, Konig's line-coloring theorem decomposes the transformed union into at most25 matchings, and each matching can be completed to a GP29 permutation chart. Thus the remaining question is genuine joint permutation compatibility.

## Exact structured negative

On Gibran start5283, exhaustively test every four-offset circulant forbidden pattern

`F_D = {(x,r): r-x mod29 in D}`, `|D|=4`.

There are `C(29,4)=23,751` such patterns. For each D and each predecessor u, construct the 29x29 assignment graph mapping local successor labels v to global outputs r; an assignment edge is allowed only when mapping v->r avoids every forbidden row in `F_D`. A perfect matching is necessary and sufficient for that predecessor to embed the common forbidden pattern.

Result: **0/23,751** four-offset circulant patterns work for all 29 predecessor labels at start5283.

This rejects the simplest GP29-translation-symmetric q25 construction. It is not a general q25 impossibility proof because a feasible missing-edge graph need not be circulant or 4-regular over all 29 plaintext rows (plaintext F observations were deliberately omitted).

## Additional exact marginal check

For the 119 Gibran windows where E alone does not reach26, exact all-rune row support gives:

- 59 windows at global row bound25;
- 47 at26;
- 12 at27;
- 1 at29.

Adding the symmetric local column-degree invariant does not improve this histogram. At start5283 the maximum local row degree is25 while the maximum local column degree is only16. Therefore q25 cannot be excluded by any independent row/column degree bound.

## Heuristic joint search

Two direct permutation searches on start5283 were used only as diagnostics:

1. 40 deterministic annealing restarts x 120,000 column swaps failed to reach maximum union degree25.
2. coordinate descent using Hungarian assignments reduced total transformed union edges substantially but still left several plaintext rows at degree29.

These failures are **not evidence of impossibility**; they only show q25 is not reached by naive local optimization.

## Exact solver

`sims/lp2_predecessor_q25_cpsat.py` encodes the full q25 feasibility problem with binary predecessor permutations and missing-union cells. The CI workflow `.github/workflows/agent18-predecessor-q25-cpsat.yml` runs OR-Tools CP-SAT with a 600-second exact search budget and fixes one predecessor permutation to identity by global-output relabeling symmetry.

Until that exact solver returns FEASIBLE or INFEASIBLE, q25 remains unresolved. The important research narrowing is that any further progress must use joint compatibility across predecessor-specific relabelings; additional single-symbol frequency/support statistics cannot decide the sharp windows.
