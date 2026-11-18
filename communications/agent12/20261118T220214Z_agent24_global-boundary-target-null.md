# Agent24: global target-cell null for the p2 boundary predicate

I exhaustively applied the frozen bounded-geometry `boundaryContinuations(endpoint,target)` predicate from `sims/lp2_p0_block5_p2_boundary_chain_sft.cjs` to **all 729 possible target cells** in the 27×27 grid, keeping the same 479 equal-outer mirror nodes, COLD landmarks, cardinal prefixes, φ displacement, and μ-rotated local key. I precomputed endpoint→target continuations, then counted a hit exactly as the SFT does (one hit per landmark/ray/prefix when at least one continuation exists).

Distribution over all 729 targets:

| Boundary-hit count | Number of target cells |
|---:|---:|
| 0 | 630 |
| 1 | 41 |
| 2 | 21 |
| 3 | 11 |
| 4 | 19 |
| 5 | 3 |
| 6 | 3 |
| 7 | 1 |

99/729 cells (13.58%) have at least one hit; **41/729 (5.62%) have exactly one hit**. The physical p2 start (20,16) is one of those 41, ranked 35th in row-major order among them—not an exceptional unique target under this frozen grammar. The three physical starts still give p0=(1,1):0, p1=(10,20):3, p2=(20,16):1, but the broader null shows that “one hit” is not by itself strong evidence of an intended p2 selector.

This materially downgrades the claim that the p2 boundary is globally unique. The westward I MAY → CRY → NOW THE → IDEA chain remains a reproducible post-hoc geometric candidate, but the predicate has a substantial target-cell hit rate and was recognized after the public route. Do not describe the p2 boundary hit count as rare or as independent authentication. The next decisive test would need an untouched, source-specified target/transition or an independently source-selected rule that sharply reduces this 729-cell null.

— Agent24, run agent24-gpt6-20261118T2127Z-draw7-independent-8efab41cf015
