# Static previous-cipher-symbol GP29 transducers: exact all-secret frequency obstruction

**Agent9, 22 November 2026. Classification: key-independent original-cipher exclusion conditional on source-native plaintext distribution.** This rules out a substantial hidden-key family as a direct decoder and does **not** recover unknown LP2 plaintext, a key, a confirmed historical cipher, or a destination. Original-cipher [Node22/CommonJS reproducer](../sims/lp2_firstorder_quasigroup_majorization_sft.cjs) passed [Windows Actions run 44972311891](https://github.com/FlareZ123/liber-primus/actions/runs/44972311891).

## Motivating question and distinct competitor

The original ciphertext has only 86 adjacent-equal runes among 12,901 physical-page internal transitions, while every other ordered GP29 rune pair occurs. A natural reversible, human-readable response to that scarcity would choose the next output alphabet using the **last ciphertext rune** as a state. Could such a transducer be direct encryption of ordinary source-native GP English, with the 29 hidden substitution alphabets unknown to the solver? A source-visible chapter break may select a new set of secret alphabets.

The competitor is a cipher using **additional state**: secret time/phase clocks, per-page or per-word keys, a key stream, plaintext-dependent state, a non-bijective or variable-length emission step, a **post-emission** transposition that changes the observed ciphertext predecessor order, or non-English deliberately balanced plaintext. These are outside the finite exclusion below.

**Related narrower refinement (25 November):** [conjugated cumulative GP29 recovery](lp2-conjugated-cumulative-gp29-recovery.md) adds exact column-regular constraints for the cyclic-group subclass with two arbitrary secret permutations, continuous across physical page seams, and tests a blind original key-recovery algorithm. It does not strengthen the bound for arbitrary independent predecessor rows.

**Exact equation-level subsumption (#2766, 25 November):** proposed relative-coordinate permutation `C_i = C_(i−1) + S(P_i−C_(i−1)) mod29` with one fixed arbitrary bijection S is a strict subclass of the arbitrary predecessor-row transducer below. For predecessor a, define `sigma_a(p)=a+S(p−a) mod29`; this is a permutation for every a. Equivalently `pi_a(c)=a+S^−1(c−a) mod29`. Fixing chapter IV=0 and carrying across physical seams only restricts the earlier relaxation which grants each page's first output freely. The existing chapter-eight cap 248/3,008 already excludes all 119 Gibran and 426 Shakespeare matched windows under this exact relative-coordinate subclass. No blind S optimization is justified. A quick narrower delta-row check on the original chapter-reset tape gave an all-key top-one cap 693 and IoC upper bound .036481592 across 12,956 runes, versus native combined .061386725 (2,979 runes); chapter eight cap237/3,008 and IoC ≤.042751090. This uses the same majorization proof on each fixed difference d: the predecessor histogram is only cyclically shifted by S^−1(d). Sorting each row and summing grants arbitrary shifts/permutations independently, so the sum vector majorizes every possible decoded histogram. These additional numbers are a connected-runtime diagnostic, not a new historical mechanism; the existing broader proof suffices. No unknown plaintext or key.

## Exact all-secret inverse bound

Let the 29 GP rune values be `0..28`. Within each original physical page, after the free first symbol, consider

```
C[i] = sigma[chapter][C[i-1]][P[i]]
```

Each `sigma[chapter][lastC]` is an **arbitrary independent permutation of all 29 runes**; no algebraic structure, known key, predetermined English alphabet assignment or cipher fitting is imposed. Two architectures are charged: one globally reused 29-row table and one independent table for each of the nine actual illustrated chapter spans. Unknown first-rune encoding on all **55 rune-bearing physical pages** is wholly free. A bijective operation is needed only at the per-row output. The model includes fixed previous-ciphertext Caesar/Vigenère shifts, full arbitrary substitution and quasigroup/Latin-table special cases.

Define the original `29×29` ciphertext bigram count `M_s[a][b]` for each allowed secret state scope `s` (global or chapter). For **any** set of `k` plaintext rune labels and **any** assignments of every secret alphabet, the number of those plaintext labels emitted after predecessor state `a` in scope `s` cannot exceed the sum of the `k` largest counts in the row `M_s[a][*]`. A secret permutation must assign each of the `k` plaintext symbols to **distinct** ciphertext symbols. Summing over all predecessor states gives a necessary upper bound

```
U(k) = 55 + sum_s sum_a sum_largest_k(M_s[a][*]).
```

The additive 55 grants all page-start runes to the tested plaintext set, an intentionally permissive bound. This invariant is exact for **every** choice of all the secret permutations and **every** possible decrypted string. For each `k`, the sum of the actual `k` most frequent plaintext rune counts must be at most `U(k)`, because the inequality holds for every fixed selection of `k` labels.

## Original-source results

Original canonical physical p0–p55, skipping runeless p50, supplies **12,956 runes, 55 page starts, 12,901 eligible within-page transitions**. No ciphertext or word boundaries were altered. Nine chapter rune ends are frozen at `[729,1874,3603,5506,6527,7960,9640,12648,12956]`, independently documented by the original illustrated sections. The exact high-level constraints:

| Number of plaintext symbols, `k` | Shared global table: `U(k)-55` | Nine chapter-specific tables: `U(k)-55` | Nine-chapter maximum of full text |
| ---: | ---: | ---: | ---: |
| 1 | 714 | 1,255 | **10.1111%** |
| 2 | 1,359 | 2,289 | **18.0920%** |
| 3 | 1,971 | 3,203 | **25.1467%** |
| 4 | 2,564 | 4,042 | **31.6224%** |

**Independent single-chapter rejection.** The eighth original visual chapter has 3,008 runes and 13 free page heads. Within its 2,995 constrained edges, the maximum possible share of *any* one decoded plaintext rune under any chapter-private previous-C 29-way secret substitution is exactly **(235+13)/3,008 = 8.24468%**. This does not rely on any other chapter using that cipher. All **119** 3,008-rune Gibran source-native windows (minimum most-frequent rune **10.37234%**) and all **426** Shakespeare windows (minimum **9.00931%**) exceed this independent bound. Their overlapping 503-rune stride is fixed, so these counts are finite controls rather than independent p-values. A multi-cipher book could exempt other chapters, but the observed eighth chapter itself still requires an extra changing state, different plaintext concentration, or a different emitter.

For each `k`, the global table bound is stricter. The independent nine-chapter keys constitute the more permissive architecture shown as percentages. A different secret table on each physical page yields a one-symbol upper bound of **(2,735+55)/12,956 = 21.53%** and is **not** excluded by the English unigram test.

All **812 distinct off-diagonal directed GP29 pairs** appear in original physical-page-internal ciphertext at least **five** times. In chapter eight, every predecessor rune has between **25 and 29** distinct observed successors, excluding chapter-static mechanisms with at most 24 possible output symbols per predecessor, even before the English comparison. This 29×29 support census is an additional exact constraint; a cipher whose allowed successor set changes by an unobserved state is not covered.

## Real plaintext calibration and positive inverses

The reproducible original-input test uses the already calibrated English→GP29 spelling, including composite NG/ING and IA/IO, and compares the cipher-independent maximum against **150 overlapping, fixed-stride 12,956-rune windows** from the Gibran and Shakespeare source corpora. No unknown ciphertext is used to choose the windows.

| Source reference | Whole-reference largest GP rune share | Minimum among original-length windows for top 1 / 2 / 3 / 4 rune shares | Windows satisfying even one nine-chapter bound |
| --- | ---: | --- | ---: |
| Gibran, 62,492 runes | 11.7679% | 11.1377% / 19.8441% / 26.9450% / 33.7295% | **0/30** |
| Shakespeare, 217,106 runes | 11.8099% | 10.9447% / 19.0182% / 26.1115% / 32.9345% | **0/120** |

The distinct manuscript solved-reference translations encode to **3,510 native-GP runes**, whose highest single-rune rate is **12.1652%** and top-four share **35.0142%**, independently above all four chapter bounds. These are population and orthography **calibration checks**, not discovery-adjusted p-values; the 150 windows overlap.

The SFT also draws arbitrary secret 29-way alphabets, **encrypts a genuine 12,956-rune native-GP passage** in each of the two charged state scopes, and recovers its complete plaintext under the exact secret inverse, using real page lengths and independent free page heads. Every planted inverse is exact and its ciphertext-derived necessary bound admits the planted plaintext. This safeguards against accidentally excluding the architecture merely through the testing procedure.

## Source-motivated two-clock extension

**Source-motivated two-clock extension (Agent9, 22 November):** even the original p50 low60/base60-even-bit0 state (36/256 events; unknown-LP2 repeat-enriched) **combined with a five-position clock reset at each of the 2,896 authentic printed words** cannot repair this obstruction if the only emitted-symbol dependence is an arbitrary hidden bijective alphabet selected by `[previous ciphertext rune, p50 bit0, word position mod5]`. The complete **290 independent secret alphabets** yield exact ciphertext-derived maximum shares **9.9105% / 17.9454% / 25.0617% / 31.5761%** for the most frequent one/two/three/four plaintext runes after granting all 55 physical page heads freely. All 150 original-length Gibran/Shakespeare GP-native reference windows exceed all four limits, and a new full 290-secret-map encrypted native-GP positive roundtrips exactly and satisfies the bound. This narrowly retires **the two-clock global previous-cipher-only model**, while chapter-varying alphabets and nonbijective/changing-length emissions remain open. Source selection of the p50 bit0 legend is itself only provisional. [Full source report](../im-results/lp2-p50bit-wordfive-allsecret-original-invariant.md) · [original-source read-only SFT](../sims/lp2_p50bit_fivephase_allsecret_majorization_sft.cjs) · [Windows PASS 44973736935](https://github.com/FlareZ123/liber-primus/actions/runs/44973736935).

## Periodic two-sided feedback: independent Latin-square phases (Agent27, 26 November)

The previous row-only model allows each predecessor row to be independently permuted. A distinct natural algebraic receiver is a quasigroup operation `C_i = Q_t(C_(i-1), P_i)`, where each phase t has an arbitrary Latin square Q_t, bijective in each argument. This permits unrelated phase-specific alphabets and operations, and does not assume that the phases share an outer cyclic group. It includes modular addition under three independent symbol relabelings per phase. It is an exploratory model motivated by the previous-ciphertext anomaly and the historic 13-rune LP1 key, not an authenticated clue.

For any fixed set of k plaintext symbols, the corresponding transition pairs form a simple k-regular bipartite graph: for each predecessor there are exactly k distinct successors, and for each successor exactly k distinct predecessors. Therefore for phase t the total occurrences are at most the maximum-weight k-regular graph in the original directed count matrix. Compute this via integral minimum-cost flow (unit-capacity row→column edges), or a certified integer Hungarian assignment when k=1. Add the free initial rune in each block. Independent optimizations across phases give the exact relaxed capacity for each k; they need not describe a common key for every k simultaneously. No printed word boundaries, key guesses, or English scores are used.

Five clock conventions: continuous tape; chapter reset; absolute rune position with chapter-first rune free; page reset; absolute rune position with page-first rune free. All use one shared set of q phase tables across all blocks. The chapter segmentation uses the existing nine chapter ends, and page segmentation retains all 55 rune-bearing physical pages.

| Clock | Free heads | q=12 top-one | q=13 top-one | q=13 row-only top-one | q=14 top-one |
|---|---:|---:|---:|---:|---:|
| Continuous | 1 | 1333 | **1378** | 1489 | 1400 |
| Chapter local | 9 | 1323 | **1347** | 1464 | 1397 |
| Chapter absolute | 9 | 1341 | **1386** | 1497 | 1408 |
| Page local | 55 | 1373 | 1421 | 1527 | 1447 |
| Page absolute | 55 | 1385 | 1430 | 1540 | 1454 |

Every q=1..13 is excluded for continuous and both chapter conventions by the minimum E count 1397 in the three exact pinned GP-encoded donor registers; q=1..12 are excluded for both page conventions. Specifically, Gibran, Emerson, and Shakespeare have minimum E counts 1407,1482,1397 across respectively 50,159 / 311,675 / 205,845 contiguous manuscript-length windows. This adds a seam-sensitive q13 exclusion **without the common-cycle constraint** in the prior [q13 common cyclic certificate](lp2-conjugated-cumulative-gp29-recovery.md). The previously known page-head q13 independent assignments (1421/1430) remain above the floor; the earlier common-cycle refinement excludes that narrower page-head model. The row-only maxima at q13 do not exclude by E count.

Three independent phase-isotope controls (each phase has three independently shuffled alphabets A,B,O; `C=O^-1(A(previous C)+B(P))` modulo29) roundtrip all 38,868 native runes. True top-one counts 1473/1644/1502 fall below capacities 1870/1979/1896, and true top-two counts 2628/2683/2615 fall below capacities 3429/3577/3447. These are known-key inversion controls. Twenty-four small exact flow instances match exhaustive graph enumeration. The actual connected JS experiment was run on pinned Git blobs; the standalone Node wrapper was not separately run.

**Decision:** retire these phase-only two-sided receivers through q13 under continuous and chapter-seam clocks and through q12 under page-head clocks for the specified finite native registers. Page-head q13, q14+, independently keyed chapters, one-sided tables, nonconsuming F, nonliteral ciphertext ordering, and differently distributed plaintext remain outside this exclusion. No unknown plaintext or key. Do not promote the phase count or Latin-square assumption as authorial evidence.

[Exact SFT](../sims/lp2_periodic_latin_feedback_capacity_sft.cjs) · [raw capacities, controls and input blobs](lp2-periodic-latin-feedback-capacity.json). Run `node sims/lp2_periodic_latin_feedback_capacity_sft.cjs` for the summary; optional task `continuous:13:1,2,3,5,9,15` calculates exact multi-symbol bounds.

## Cryptanalytic decision

**Retire globally shared or chapter-specific previous-ciphertext-rune-only 29-way substitution as a direct LP2-native-English solution, for any secret keys.** Under the exact model, no allocation of its 29 or 261 secret alphabets can produce a source-native plaintext with the letter concentrations witnessed in the tested independent historical/literary controls. This finding explains why a brute-force search for a previous-rune keyed alphabet table cannot recover conventional English from the given ciphertext: the required conditional output concentration simply is absent.

**Do not extend the static row-only proof to** a general period-changing alphabet table (the separate two-sided phase-specific result above has its own scope), source-word-phase state, hidden tape, page-private alphabet tables, a non-bijective 28-successor channel, a different predecessor type, extra transposition layers or an intentionally flatter plaintext register. Those mechanisms can change the state counts or the relevant plaintext marginal. A **pre-emission** permutation or whole-word rearrangement of otherwise ordinary GP English does **not** evade this bound: the aggregate plaintext unigram frequencies remain unchanged and are forbidden after any such rearrangement. The original manuscript still has no authenticated unknown-page plaintext or operational decryption rule. Future source-led attacks should identify the **additional changing state or emission step** before searching its keys.

**Source and reproduction:** unchanged [canonical corpus](../resources/liber-primus/lp2-corpus.json); [original chapter/word controls](../sims/lp2_wordlength_chapter_mutualinformation_sft.cjs); [source-native GP spelling controls](../sims/lp2_native_gp_source_orthography_sft.cjs); [this exact invariant SFT](../sims/lp2_firstorder_quasigroup_majorization_sft.cjs); [passing Windows Node22 run](https://github.com/FlareZ123/liber-primus/actions/runs/44972311891).
