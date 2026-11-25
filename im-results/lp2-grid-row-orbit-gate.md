# The physical p49–51 rows cannot be a common reversible byte-state orbit (#2696)

**Decision:** reject S_(r+1)=f(S_r) for a single permutation f of 0..255, with arbitrary independent column permutations, both source-fixed radix readings, and continuous physical row order. Even independently restarting on each physical page cannot save this law. The table's actual purpose remains unresolved.

## Source and exact obstruction

Input: [source-adjudicated 256 printed tokens](../resources/liber-primus/lp2-grid-256.json), blob 2550eae357442912220e05dc51147523a61dd75a. Physical row split 10|13|9; radix60 alphabet as supplied, radix59 omits unused lowercase f, as in #2626. No offsets, row reorder, reset within a page or alternative mapping searched.

The first two physical rows share the printed token **33**. The second and third share no token. A bijection preserves intersections: f(A ∩ B)=f(A) ∩ f(B). Hence |S0 ∩ S1| must equal |S1 ∩ S2|, but the source gives 1 versus 0. This contradiction is invariant under either injective radix reading (33 = 183 in base60, 180 in base59). It excludes every candidate f, regardless of how its 256 entries are generated.

More generally, let a(x) be the membership bitstring of x in rows 0..m−2 and b(x) the bitstring in rows 1..m−1. Then b(f(x))=a(x). A permutation exists iff every signature has identical source and target multiplicities. Sufficiency follows by constructing an arbitrary bijection within each class. Singleton classes identify precisely the forced edges; non-singleton classes admit swaps. Given a compatible prefix, the next-row set includes exactly k_s targets from each class s, where k_s counts last-row members of its source class. The exact number of possible next sets is the product of binomial(|class_s|,k_s).

| Reading | First inconsistent prefix | Source/target class counts (full) | Mismatched full signatures | Independent page-local model |
|---|---:|---:|---:|---|
| base59 | 3 | 96 / 94 | 142 | fails all 3 pages |
| base60 | 3 | 96 / 94 | 142 | fails all 3 pages |

At the first failure, signatures 00, 01, 10, 11 have source multiplicities 241,7,7,1 and target multiplicities 240,8,8,0. The first two rows alone admit 84,085,428,563,136 next sets, each sharing exactly one byte with row 2; original row 3 shares none. Thus even the earliest holdout is impossible.

## Calibration and limitations

16 seeded independently shuffled hidden byte permutations generated 33-row controls with independent row-order shuffles; the inverse saw only 32. All 16 reconstructed a valid witness; each forced edge agreed with the hidden map; explicit swaps verified every remaining edge was unforced. Forced counts 30–84, forced next-row members 0–3; each actual withheld row satisfies all exact class-count constraints. 80 five-symbol toy instances independently enumerated all 120 permutations each, validating feasibility, all forced edges and exact number of next-row sets (41 feasible). Tests executed in connected V8, not GitHub Actions.

[Runnable CommonJS SFT](../sims/lp2_grid_row_orbit_sft.cjs) · [Raw JSON](lp2-grid-row-orbit-gate.json).

The two radix results are the same equality structure under a relabeling, not independent evidence for or against radix59. This is a deterministic exclusion, not a p-value or a claim about arbitrary nonbijective maps, row-dependent maps, or the table's eventual consumer. No plaintext, key or continuation found. Do not widen this model absent a new source clue.
