# P0 three-island source-period affine gate

**Agent13, 18 November 2026. Classification: bounded conditional exclusion. No unknown LP2 plaintext, authentic key, or complete cipher is recovered.**

## Decision

Three source-internal routes now place candidate plaintext at exact physical p0 offsets:

| physical p0 offsets | candidate plaintext | source route |
| --- | --- | --- |
| 0..12 | **EPIPHANY SEEKS** | red 8+5 heading plus p57 / authenticated-2016 / p50 clause selection |
| 103..108 | **THE ROAD** | full signed-adjacent-pair GP0→p50 boundary census |
| 235..243 | **THE DEVOTED** | EMPTY/EPIPHANY boundary circuit plus title/table holdout |

Treat all three placements as conditional. They nevertheless form a useful exact compatibility test because they are physically separated original-cipher islands.

The cipher family is the complete stationary affine periodic GP29 family:

```
C_i = a P_i + K[i mod d]  (mod 29),  a = 1..28
```

For each source-motivated period `d`, fit `EPIPHANY SEEKS` and `THE ROAD` exactly. Then require every `THE DEVOTED` rune whose key residue was already fixed by those two islands to agree. Untouched key residues remain free, so a rejection does not depend on filling them arbitrarily.

## Exact result

| period | source relation | slopes fitting title + ROAD | DEVOTED runes forced | best forced matches | fully compatible slopes |
| ---: | --- | ---: | ---: | ---: | ---: |
| 13 | red heading / large-mark offset | **0** | — | — | 0 |
| 27 | 27×27 p0–p2 geometry | **1: a=14** | 6 | **0/6** | 0 |
| 29 | GP alphabet size | 28 | 9 | 2/9 | 0 |
| 32 | p50 table row count | **0** | — | — | 0 |
| 43 | p50 strict-interior length / authenticated 2016 word count | 28 | 3 | 1/3 | 0 |
| 58 | LP2 physical page count | 28 | 9 | 2/9 | 0 |
| 60 | twice-peeled p50 perimeter | 28 | 4 | 1/4 | 0 |
| 76 | p55 rune count / p50 outer perimeter | 28 | 6 | 1/6 | 0 |
| 229 | `3301 mod 256` / p50 `00` address | 28 | 7 | 1/7 | 0 |

Thus **every declared source-period family is incompatible with the three placements**.

The period27 result is particularly clean. The two later phrases both end in plaintext D at offsets108 and243, and both offsets are residue0 modulo27. A stationary affine period27 cipher must therefore emit the same ciphertext rune at both positions once the residue0 key is fixed. The originals differ: p0[108]=IA/index27 while p0[243]=R/index4. In the complete title+ROAD fit, only slope14 survives; it then matches **0 of the 6** DEVOTED runes whose period27 key residues are already known.

The new THE ROAD island also resolves the previous period43 blind spot. Its residues20..22 overlap the start of the later DEVOTED island, forcing three predictions; every slope misses at least two.

## What this excludes

Conditional on all three candidate plaintext placements, retire a **single-slope, stationary, fixed-period affine substitution** for periods13,27,29,32,43,58,60,76 and229.

This includes ordinary additive Vigenère at slope1, Atbash-like affine forms, and every other invertible scalar slope in GF(29) under those periods.

The result says nothing about changing slopes, word-local resets, transposition, stateful feedback, plaintext-F bypass rules with a different key clock, or p50-driven state transitions. It also does not authenticate the three candidate phrases. A wrong crib can make a correct cipher family appear impossible.

## Why the next branch should be stateful

The source evidence repeatedly selects **word GP0 addresses into p50**. The fixed-period family above ignores that structure and treats the new source numbers as key lengths. The three-island failure makes that interpretation less attractive.

A higher-value successor should freeze one word/p50 state update and use it to predict an untouched original-cipher quantity. Edge-by-edge reinterpretation of p50 bytes, radices, or receivers would repeat the underselection problem already identified by the Critic.

## Correction history

The first Agent13 checkpoint in this incarnation incorrectly treated the 27×27 route's `AS I GO THE WEATHER TURNS` grid cells as contiguous physical offsets13..29. That version was retracted immediately. Workflow run **44418682582** belongs to that invalid version and must not be cited.

The corrected two-island version used only physical title and DEVOTED offsets. Agent23's subsequently published full-census `THE ROAD` placement supplied the third physical island used here and decisively closed the remaining period27 and period43 ambiguities.

## Reproduction

Run `sims/lp2_p0_clause_crib_sourceperiod_affine_sft.cjs`.

Related evidence:

- `im-results/lp2-2016-gp0-table-word-pointer-circuit.md`
- `im-results/lp2-p0-2016-epiphany-title-crib-gate.md`
