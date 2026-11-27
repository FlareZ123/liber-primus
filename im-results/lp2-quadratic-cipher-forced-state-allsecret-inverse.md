# Quadratic ciphertext-forced state: exact all-secret original inverse

**Decision — Agent 7, 27 November 2026:** retire the entire defined quadratic ciphertext-forced scalar receiver on original physical p40–53. No unknown plaintext or authenticated key. The exact p39 red quadratic is included, but the wider parameter family is exploratory; no author-selected general quadratic law is asserted.

## Source and mechanism

The three original p39 red indices [27,5,15] define G(k)=27+5k+15k² (mod29), previously tested as an additive p16–21 clock in [Agent1's source report](lp2-p16-p39-nonlinear-forced-state-original-inverse.md). The following floral p40–53 chapter has 3,008 runes in 13 rune-bearing physical pages, including 125 ciphertext F; p50 is rune-free. This is an adjacent receiver with no assumed printed word boundaries.

All laws k' = αk²+βk+γw(C)+δ over GF29 with α and γ nonzero are conjugate by s=αk+β/2 to s'=s²+u w(C)+v, where u=αγ≠0 and v=αδ+β/2−β²/4. Test all 812 (u,v), either native GP ordinal or GP-prime residue w(C), all starting states. For the exact red G and ordinal forcing, (u,v)=(15,17); additive decryption P=C−k becomes P=C+27s+5. The source does not select prime-residue forcing or arbitrary coefficients; these are stronger encompassing alternatives.

## Exact arbitrary-row bound (physical clock)

For ordinary consuming ciphertext, the state is public given the law and start. Grant an arbitrary secret permutation π_s for each state, P=π_s(C). For a histogram H(s,c), the maximum possible count of any two distinct plaintext labels is exactly the sum over states of the two largest row counts. All 23,548 (law,start) combinations per forcing and reset convention are evaluated. Native English control floors are 563 across 59,485 Gibran windows and 518 across 214,099 Shakespeare windows (all length 3,008).

| Forcing | Clock | Max one | Max two | Exact-source (15,17) max two |
|---|---|---:|---:|---:|
| GP ordinal | continuous | 250 | 466 | 423 |
| GP ordinal | common initial state per page | 253 | 465 | 427 |
| GP prime residue | continuous | 251 | 460 | 448 |
| GP prime residue | common initial state per page | 254 | 464 | 446 |

If a plaintext-F hold still advances the physical ciphertext clock, two non-F target labels are bounded by U₂, while a pair containing F is bounded by 125+U₁. The displayed U₂ is the larger in all four cases. Thus even arbitrary secret row permutations cannot reach either finite donor floor in these physical-clock models. Four native arbitrary-row known-key controls reproduce 12,032/12,032 runes; this capacity proof does not depend on optimization success.

## Direct consuming-only authentic F inverse

For affine output, every nonzero ciphertext coefficient and nonzero state coefficient is represented by P=a(C+B s+D), a,B≠0. The literal-F hold yields C=0 without advancing the state; every consuming branch must produce P≠0. Whether P=0 is independent of a. For any (u,v,B,D) propagate the exact 29-bit set of reachable states: for nonzero C retain only nonzero-plaintext consuming transitions; for C=0 union unchanged hold states with legal nonzero consuming states. This is an exact simultaneous all-seed test with no beam, lexical score, fixed F mask or search cutoff.

| Forcing | Normalized nontrivial classes | Full continuous survivors | Longest legal prefix | Surviving common laws with independent initial states after p40,p41,p42,p43,p44 |
|---|---:|---:|---:|---|
| Ordinal | 659,344 | 0 | 691 | 7,610 / 93 / 4 / 1 / 0 |
| GP prime residue | 659,344 | 0 | 781 | 7,521 / 82 / 1 / 0 / 0 |

Every class covers all 28 output scales and all 29 starts; page-private starts can differ freely, but coefficients are shared. B=0,D≠0 necessarily fails at C=−D since all 29 labels occur; B=D=0 gives only a static rescaling of the near-uniform original, not an evolving key. For the exact p39 law the affine-family longest prefixes are 398/416 respectively; its source additive output dies at original offsets 61/71. No language scoring of original ciphertext is warranted after exact infeasibility.

## Blind inverse calibration and scope

Train a smoothed GP29 trigram model on Gibran first 40,000 and Shakespeare first 150,000 encoded runes. Construct disjoint 3,008-rune plants at native donor offsets 51,000/180,000; scan both forcing registers and every normalized ratio class using just the first 1,200 ciphertext runes. Five and seven ratios respectively survive in the correct register; zero in the other. Score all 28 scales of all surviving ratios by exact Viterbi on (state, previous two plaintext runes), retain the best law, scale, seed and terminal state, then decode the remaining 1,808 runes without parameter refitting.

| Plant | Selected secret | Training exact | Held-out exact | Forward replay |
|---|---|---:|---:|---:|
| Ordinal | (15,17,27,5,1,24) | 1,200/1,200 | 1,806/1,808 | 3,008/3,008 |
| Prime | (22,7,20,7,13,9) | 1,200/1,200 | 1,808/1,808 | 3,008/3,008 |

The two errors in the first held-out donor are real latent-hold ambiguity; full replay is not authentication. This is calibrated key recovery for the specified family, not proof of historical selection.

Arbitrary row permutations with a **consuming-only** F clock remain outside the exact affine exclusion. For the fixed (15,17) source law, an exact per-row reward DP over 126 zero-delimited segments, maximizing each row's two selected cipher labels over independent legal state paths, gives relaxed top-two upper bounds 697/689 (one-label bounds 378/381). These exceed the reference floor and are **inconclusive**; independent path relaxation cannot establish a realizable shared-path solution. Do not conflate these with the physical-clock cap. This top-two result remains inconclusive, but the exact joint rare-symbol bound below now rejects the fixed source law with arbitrary consuming-F row maps against both native donor sets. The all-law continuous extension below now closes both forcing registers for the finite donor sets. Other nonlinear state laws, secret input encodings and independently changed coefficients per page remain open.

[Standalone CommonJS SFT](../sims/lp2_quadratic_cipher_forced_state_allsecret_sft.cjs) · [Exact output with input blob pins](lp2-quadratic-cipher-forced-state-allsecret-output.json). The exact function in the SFT ran in connected V8 against the fetched repository inputs; the Node CLI wrapper was not separately executed. No workflow or original resource changes.

## Agent26 — exact shared-path rare-symbol capacity, 27 November 2026

**Decision:** retire the fixed p39 quadratic (u,v)=(15,17), continuous across original p40–53, even granting an independent arbitrary secret permutation for each of 29 states and all latent consuming-only F histories, for the two pinned native donor registers. This is a finite donor exclusion, not a key recovery or a theorem excluding all possible plaintexts. The prime forcing is an exploratory alternative.

For any legal path let H(s,c) count consuming occurrences, and z_s be the number of zero cells in row s. Since plaintext F is a literal hold, the row's F-preimage must be unused: z_s≥1. For any four fixed distinct non-F plaintext symbols, their four preimages plus the F-preimage are five distinct cells in each row. At most min(5,z_s) are unused. Every used cell contributes at least one occurrence of the four symbols. Their combined count is therefore ≥145−U, where U=Σ_s min(5,z_s). This applies equally to the four globally rarest non-F labels, without selecting them in advance.

Build a zero-delimited layered DAG from the original 3,008 rune tape (125 ciphertext F). Each edge chooses hold or consume at a leading zero and deterministically traverses the following nonzero runes. All 29 starts and all final states are allowed. Record edge count matrices. Every legal path selects one edge per layer. For candidate unused cells introduce y∈[0,1]; only cells avoidable on some complete path are candidates. Impose 1≤Σ_row y≤5, layer conflicts Σ_{edges consuming cell} x_e+y≤1, and exact pair conflicts y_i+y_j≤1 where no complete path avoids both cells. Greedy cliques of the exact conflict graph give Σ_clique y≤1. The x variables satisfy unit flow and 0≤x≤1. Every legal path with capped unused-cell selections has a feasible integral point. Maximizing Σy over the relaxation thus bounds U from above.

The following exact rational upper certificates were computed using integer arithmetic after numerical LP optimization. For inequalities A x≤b, equalities D x=d, objective c, integer scale S=10^6, nonnegative integer multipliers Y and free integer multipliers Z, the bound numerator is b·Y+d·Z+Σ_j max(0,S c_j−(AᵀY)_j−(DᵀZ)_j). This is valid for all x∈[0,1], irrespective of solver optimality, floating-point rounding, or timeout.

| Forcing | DAG edges | Pair conflicts | Cliques | Exact rational upper U | Integer U cap | Rare four non-F floor |
|---|---:|---:|---:|---:|---:|---:|
| Ordinal | 574 | 5827 | 3486 | 101502297/1000000 | 101 | **44** |
| GP prime | 560 | 1950 | 986 | 95854178/1000000 | 95 | **50** |

The pinned donor maximum of the sum of the four smallest non-F counts is 13 in 59,485 Gibran windows and 12 in 214,099 Shakespeare windows. Therefore zero of 273,584 windows survive either forcing, even under arbitrary positional transport of each donor window (its histogram is invariant). No space assumptions or language-score cutoff enter this result. This does not exclude untested donor registers, unknown prose with a sufficiently different histogram, page resets, or the other 811 normalized quadratic laws in the arbitrary-row consuming-F regime.

Legality alone is insufficient: a joint binary flow/forbidden-cell optimization found complete legal paths with 9 and 12 literal holds respectively. These are not plaintext candidates. The earlier independent-row top-two cap is also insufficient. The shared-path rare-cell bound is the decisive new constraint.

**Reproduction:** `python sims/lp2_quadratic_fhold_rare_capacity_sft.py --certificate im-results/lp2-quadratic-fhold-rare-capacity-certificates.json` checks the saved integer dual prices, rebuilding the original graph, pair conflicts and cliques, then checks donor counts. Omit --certificate to generate a fresh LP certificate; --save writes raw JSON. Dependencies NumPy, SciPy, Numba. The exact computational core ran in local Python on the original tape exported from connected V8, with independent matching FNV-1a64 d648cc2317d5021f and SHA256 over byte indices 260fc1ff6eee3d7a108ed43d5b8112cc5c332fa2f4460e71c563ad504de2a6b7. Donor scan ran in connected V8. The combined repository CLI wrapper (including the new known-key plant tests) has not yet been run end-to-end in a repo checkout.

Source blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85.

[SFT](../sims/lp2_quadratic_fhold_rare_capacity_sft.py) · [Saved exact certificates](lp2-quadratic-fhold-rare-capacity-certificates.json).

## All normalized quadratic laws: stronger seven-symbol bound (same invocation)

The four-symbol result above was source-specific. The stronger generalization takes k=7 non-F symbols and uses U₈=Σ_s min(8,z_s). Exactly the same argument gives combined seven-rarest non-F count ≥232−U₈. The native donor maximum is 68 (Gibran) and 54 (Shakespeare); a certified U₈≤163 thus excludes every one of the 273,584 original-length donor windows, including arbitrary histogram-preserving positional transport.

For each of the 812 normalized quadratic laws and both forcing registers, construct the exact all-seed F-hold DAG. A bitset dynamic program obtains the exact individually avoidable cells, then the cells jointly avoidable with each individually avoidable cell. Two candidate cells are incompatible iff no full path can avoid both. A disjoint clique partition of that incompatibility graph yields an integer upper certificate: at each prefix of a partition, each chosen clique contributes at most one selected unused cell, and the remaining cells contribute at most min(8, remaining row size) per row. Ten deterministic MT19937-seeded greedy partitions are used, always preserving the certificate inequality. The random ordering affects tightness only. No statistical significance or heuristic correctness is required. This excludes 745 ordinal and 734 prime laws before LP optimization.

For the remaining 67 ordinal and 78 prime laws, use a lighter LP on the exact pair-conflict graph, with row caps 1≤Σ_row y≤8 and every generated clique sum≤1. This LP can drop the joint flow entirely; each actual legal path's unused-cell selections still satisfy every retained constraint. Generate cliques greedily from each graph edge and retain all unique resulting cliques, including maximal pairs. The same exact rational dual calculation above certifies upper bounds for all remaining laws.

| Forcing | Laws | Cheap exact exclusions | Rational refinements | Largest refined integer cap U₈ | Combined all-law cap U₈ |
|---|---:|---:|---:|---:|---:|
| Ordinal | 812 | 745 | 67 | 153 | 163 |
| GP prime | 812 | 734 | 78 | 147 | 163 |

All 1,624 law/forcing combinations are excluded. Largest exact rational refined bounds: 153912585/1000000 at ordinal (9,3), and 147717759/1000000 at prime (26,26). Every tested quadratic recurrence with nonzero quadratic and ciphertext coefficient is conjugate to one of these laws; arbitrary secret state-indexed output permutations remain arbitrary under the conjugation. Therefore the finite donor exclusion covers the entire continuous consuming-F normalized quadratic family, not just affine output or the p39 law. **No source identifies the generalized coefficients as authentic.** No new plaintext, key, URL or destination was recovered; private page starts and non-native donor histograms are not covered by this extension.

[All-law SFT](../sims/lp2_quadratic_fhold_alllaw_sft.py) · [C++ exact bitset cover](../sims/lp2_quadratic_fhold_alllaw_cover.cpp) · [Recorded 1,624 cover caps and 145 rational refinement numerators](lp2-quadratic-fhold-alllaw-output.json). Local C++ covered every law and local SciPy/Python computed and integer-checked each of the 145 remaining rational bounds; native donor maxima were computed directly in connected V8. The committed all-law wrapper regenerates the proof with pinned tape SHA and exact cheap-cover output hash; the complete combined CLI was not executed against a repository checkout. The broad extension is stronger in scope than the four-symbol result but does not replace its source-specific 44/50 floor.

## Independent physical-page starts — partial generalized extension (Agent26)

Grant every one of the 13 rune-bearing physical pages p40–53 its own arbitrary start state, retaining a single arbitrary secret row table and common normalized quadratic coefficients. Empty p50 contributes no constraint. For each law, build a separate exact latent-F DAG per page. A cell is individually avoidable for the full chapter iff every page can avoid it; two cells are jointly avoidable iff each page independently has a path avoiding both. Thus intersection of the exact per-page absence bitsets supplies the same sound conflict graph, and the prior integer clique cover applies unchanged to total chapter counts.

The same 10 seeded partitions give **324/812 ordinal and 311/812 prime-residue law exclusions** via U8≤163. For the actual fixed p39 coefficient pair (15,17), U8≤158/142, hence seven rarest non-F runes total at least 74/90 respectively, exceeding the pinned native maxima68/54. This rules out the fixed source-law donor receiver even with independent per-page starts and arbitrary shared row maps. The remaining 488/501 generalized laws are **unresolved** by this cheap bound; no claim of feasibility or a family-wide page-reset exclusion. Small exact LP probes on four hard cases still yielded caps above 163, so further arbitrary-coefficient tightening is not prioritized without a new source selector. The stronger continuous result remains intact.

Run the existing all-law SFT with `--page-private`; C++ exact pair-absence intersection/cover core executed locally across all 1,624 cases. Byte sequence SHA256 of the 1,624 U8 integer caps in ordinal/prime, u, v order is e865e7f927000c06493f94b9485778f0d077a8de7aa25775facdb349d600ac17. The combined repository wrapper was not separately executed.
