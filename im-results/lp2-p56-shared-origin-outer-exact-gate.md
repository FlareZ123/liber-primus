# Exact shared-origin p56 prime-clock exclusion, arbitrary alphabet pair

**26 November 2026 — Agent 10.** Language-free original-cipher impossibility for a shared page-reset origin over 0..3301 inclusive. No new plaintext or authentic key. The chapter-reset variant remains open.

## Model and exact reduction

Use the authentic p56 consuming shift `K[j]=(prime[j]-1) mod 29` (zero-based prime index). Independently arbitrary permutations alpha and beta of the 29 rune labels are fixed across all tested scopes; normalize alpha(F)=0 by common translation. Every plaintext F emits the original F glyph and does not advance the cursor. Non-F plaintext consumes one shift and satisfies beta(C)=alpha(P)+K[j] modulo 29. Consequently a consuming event is possible iff beta(C)!=K[j]; a hold is possible exactly at a visible ciphertext F. Opposite subtraction sign is included by negating both normalized alphabets. No text segmentation or linguistic distribution is assumed.

The original input is all 12,956 runes on p0–55 (55 rune-bearing pages, nine illustrated chapters). Reset each scope to the *same* unknown index o in 0..3301. This range is a declared computational bound, not an authenticated clue selecting 3301.

1. Before the first visible F in every scope, all shifts must consume. Every such position forbids one edge in the outer-permutation bipartite graph. A perfect matching is necessary.
2. For each possible edge beta(c)=k, compute the exact backward cursor reachability over an entire scope with that edge alone constrained. Represent all initial cursors simultaneously in BigInt bitsets; shift right for inverse consumption, mask K[j]=k at c, and union the unchanged cursor at visible F. Intersect the allowed-origin masks over scopes. A perfect matching across these unary projections remains necessary but is not sufficient, since different edges can use incompatible hold paths.
3. For page reset, enumerate **all** hold paths on each of the 11 pages containing at most four visible F. Each complete path yields a set of forbidden permutation edges. The global problem is the conjunction of the mandatory pre-first-F edges on every page and one existential path disjunction for each of the 11 pages. At each node intersect domains, retain only edges lying in some perfect matching via alternating-cycle reachability, remove dominated alternatives, propagate forced alternatives, and branch exhaustively. A failure on this subset proves failure on the full manuscript.

## Original results

| Shared reset scope | Origins tested | Prefix Hall | Full unary Hall | Joint path subset |
|---|---:|---:|---:|---:|
| Physical page | 3302 | 818 | 371 | **0 / 371 SAT; all UNSAT** |
| Illustrated chapter | 3302 | 3302 | 3302 | Not tested |

The exact joint path stage visited 557 total nodes, at most 11 per origin and depth at most three. No node cap was hit. The 11 complete low-F pages are p6,p7,p14,p32,p35,p38,p39,p49,p51,p54,p55. All other pages enter through mandatory prefix constraints and the separate unary projection. The necessary subset is sufficient for exclusion.

## Calibration and limits

6,240 independent small-alphabet backward-vs-forward pair/origin checks passed. Two independently planted shared-origin controls use complete native Shakespeare GP text windows with secret input/output maps and origin137/page or 911/chapter. Both true origins and true beta edges survive the full unary stage. The exact disjunctive stage passes 80 small-alphabet exhaustive all-permutation reference cases and retains the hidden control origin137. The control has two low-F pages; the arbitrary subset matching is not legal on every held-out page, so it is a feasibility control, **not a recovered key**. The actual planted key does replay all 55 pages. No original candidate reaches the inverse-scoring stage.

Independent page origins, independently keyed scopes, a different held glyph or clock stream, internal resets, rearranged ciphertext, and origins above 3301 remain outside the proof. The chapter-reset unary projections alone provide no rejection; avoid presenting their all-origin survival as a key recovery. The authentic p56 calibration from Agent3 independently rejects a shared *p56-derived* alphabet at first-prime origin; this experiment does not assume those known alphabets extend to unknown pages.

## Reproduce

- [All-origin unary projection](../sims/lp2_p56_shared_origin_outer_projection_sft.cjs) — frozen 9d85b28e.
- [Compact projection output and input blob IDs](lp2-p56-shared-origin-outer-projection-output.json) — fa72ae64.
- [Exact joint path SFT](../sims/lp2_p56_shared_origin_joint_paths_sft.cjs) — frozen 99d0789d.
- [Raw joint output and input blob IDs](lp2-p56-shared-origin-joint-paths-output.json) — be29843a.

Run the two Node.js scripts in order from a checkout. The second reads the committed compact projection artifact; the first prints a more detailed reproducible output. Both committed study cores executed on the exact GitHub inputs in connected V8. Standalone Node wrappers and CI were not independently executed. The first full raw artifact exceeded the connector's request handling capacity; the compact artifact preserves every surviving origin and the counts, with full domain details reproducible from the code.
