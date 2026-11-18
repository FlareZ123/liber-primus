# P57 GP0→p50 word graph: complete matched-multiset control

**Agent6, 18 November 2026. Classification: familywise calibration of the new p57 source-internal word graph.**

## Decision

The source-internal word graph contains real exact edges, including one omitted from the current human report:

- `WITHIN → CIRCUMFERENCES` under base59;
- `SHED → PARABLE` under base59;
- `CIRCUMFERENCES → PARABLE` under base60;
- `PARABLE → FIND` under base60;
- `TUNNELNG → AND` under base60.

The complete familywise control is much less selective than the individual semantic chains appear. P57 has **17 distinct canonical-GP0 word sums**. Across the exact 256-token p50 multiset, **36 tokens** decode under at least one of base59/base60 to one of those 17 sums. The original table places such tokens at **5 of the 17** p57-word addresses.

Under an exact without-replacement permutation of the original token multiset, the expected count is **2.390625** and the hypergeometric probability of **5 or more** hits is **0.0721127149** (about 1 in13.87).

Therefore the complete p57→p57 word graph is **not independently rare enough to serve as a familywise authentication of the GP0/table hypothesis**. Preserve the semantically motivated named chains as conditional solve-path clues, while avoiding multiplication of their post-selected token-placement probabilities as if the word edges had been independently predeclared.

The stronger `EMERGE/DIUINITY` bracket reconstruction is a different structural prediction and is unaffected by this calibration.

## Frozen family

Upstream hypothesis:

`canonical GP0 sum of a solved p57 word → zero-based p50 cell`.

The original p57 parable has 20 complete words but only 17 distinct GP0 sums because several words share a sum. Freeze those 17 addresses.

For each original p50 token, decode it under exactly the two terminal-table alphabets already in play:

- base59, with `f` removed;
- conventional base60.

Call a token hit-capable if either decoded value equals **any** of the 17 p57 GP0 sums.

This definition is fixed before counting which p57 source word produced which target word. It therefore controls the broad family that can discover any p57-word-to-p57-word edge after looking at the table.

## Exact observed edges

The five hit addresses are:

| Source GP0 address | Source word | Token | base59 | base60 | p57-word target |
| ---: | --- | --- | ---: | ---: | --- |
| 38 | WITHIN | `2D` | **131** | 133 | CIRCUMFERENCES via base59 |
| 64 | SHED | `22` | **120** | 122 | PARABLE via base59 |
| 94 | TUNNELNG | `0u` | 55 | **56** | AND via base60 |
| 120 | PARABLE | `0g` | 41 | **42** | FIND via base60 |
| 131 | CIRCUMFERENCES | `20` | 118 | **120** | PARABLE via base60 |

The `TUNNELNG → AND` edge is exact and source-internal. The same `0u` token's base59 value55 remains the independent p55/p56 terminal-page alignment documented separately.

## Exact multiset null

There are:

- population `N=256` exact table tokens;
- `K=36` hit-capable tokens;
- `n=17` frozen p57-word addresses;
- observed `x=5` hits.

Sampling without replacement gives

`E[X] = nK/N = 2.390625`.

The exact tail is

`P(X ≥ 5) = 0.07211271486670322`.

This null preserves the original p50 token multiset exactly and changes only token placement. It does not model cryptographic dependencies or claim authorial randomness.

## Why this changes the evidence classification

The existing p57 bridge reports a tiny conditional probability for a few named token placements after the EMERGE/DIUINITY route fixed GP0 addressing. That calculation remains arithmetically correct for those named placements.

The complete-family control answers a broader question: if all p57 words are allowed to point through the same table under either documented radix, how surprising is it to discover several word-to-word hits somewhere? The answer is only modestly surprising.

This prevents a common evidence error: treating each newly noticed semantic edge as an independent confirmation after the full graph was available for inspection.

## What remains strong

This calibration does not weaken source facts that use additional structure absent from the broad word-hit family:

- `EMERGE=83` enters one member of the unique nested duplicate bracket;
- local duplicate/adjacent structure reconstructs both prime-count circumference pairs;
- `DIUINITY=105` lands exactly at their shared midpoint;
- center cell105 uniquely prints `13`;
- `FIND → 28` selects physical p28, whose 269-rune prime count closes to57 under the bracket-selected prime-count operation.

Those are separate structural relationships.

## Disposition

Keep the five exact p57-word graph edges as conditional navigation hints. Add `TUNNELNG → AND` to the human-readable route.

Do not use the count of p57-word self-edges, or products of individually discovered edge-placement probabilities, as independent familywise evidence for the GP0→p50 mechanism.

No plaintext or key is recovered here.

## Reproduction

`node sims/lp2_p57_wordgraph_multiset_control_sft.cjs`
