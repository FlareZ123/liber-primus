# Physical page-start GP29 histogram: all-secret common-reset gate

**Agent7, 23 November 2026. Result: a key-independent necessary-condition constraint on a fixed shared physical-page reset. No unknown Liber Primus plaintext, authentic key, cipher instruction or destination recovered.** The source-exact [Windows Node.js22 CI run 45094976516](https://github.com/FlareZ123/liber-primus/actions/runs/45094976516) passed. The complete [read-only CommonJS SFT](../sims/lp2_page_start_fixed_reset_allsecret_sft.cjs) retains the original inputs and independent native-GP control.

## Defined candidate and stronger rival

Suppose a reversible one-carry rune transducer resets **all** of its internal state, including its previous-cipher register, to the **same constant** at every physical-page opening. Suppose the first emitted rune uses one unchanged secret GP29 bijection. Without assuming an affine, additive or prime cipher, every first rune must obey:

C[page,0] = pi(P[page,0]), for one arbitrary pi among all 29! GP29 permutations.

A permutation preserves every repeated-symbol relation, histogram collision, distinct-symbol count and normalized index of coincidence across page openings. This is an exact theorem **for that model**, regardless of the secret key. It fails as a necessary condition if the preceding ciphertext is carried across pages, an IV changes by page, the first step has a page-specific alphabet, or the plaintext is not an ordinary GP29 rune. No surviving first-party instruction has been found selecting physical-page reset. This is a bounded cipher-architecture gate rather than an assertion of historical author intent.

## Unchanged original-input observation and solved-native calibration

The [canonical LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) has 55 rune-bearing physical p0–55 pages, excluding number-only p50, and 12,956 unsolved runes. The actual **55 first runes** occupy **24 distinct GP29 glyphs** and contain only **52 equal unordered pairs among 1,485 pairs**. Their normalized GP29 IoC, 29 × 2 × 52 / (55 × 54), is **1.0154882154882154**. The most frequent type appears only five times.

Page breaks must not be mistaken for word breaks. The [original transcript](../resources/lp2-transcription.txt) supplies **34 page openings continuing a printed word** and **21 opening a new word**. These comprise 32 unique cross-page words because some continue over more than one page break. The [independently solved native-GP resource](../resources/external/relikd-solved-gp29-native-v1.json) supplies nine authenticated published solved passages with 2,979 GP runes in 740 printed words, split into 740 first-word-position rune examples and 2,239 interior-position examples. Controls independently draw each original page's initial plaintext rune from its matching first/interior solved-GP bag, with replacement. The 55 physical page-start types, sample lengths and rune spelling remain source-native. No unknown original ciphertext was fitted to select a key.

| Unaltered source selection | Observed normalized IoC | Null mean IoC | Simulated controls with no more collisions |
| --- | ---: | ---: | ---: |
| All 55 page starts | **1.01549** | 1.67783 | **19 / 90,000**; plus-one 0.00022222 |
| First 26 page starts | **0.71385** | 1.66520 | **276 / 80,000**; plus-one 0.00346246 |
| Remaining 29 page starts | **1.00000** | 1.66815 | **2,760 / 80,000**; plus-one 0.03451207 |
| All 46 starts without a red rune at offset zero | **1.12077** | 1.77041 | **477 / 80,000**; plus-one 0.00597493 |

The original 24 distinct first-symbol types are also unusually numerous in the all-55 source-native control: only 115/90,000 samples have at least24 (plus-one 0.00128887). This is **the same distributional signal**, not independent confirmation. Split halves and red-excluded variants are sensitivity analyses and not multiplicative evidence.

A full-secret-alphabet positive control uses real solved-GP word-position-matched runes and bijectively substitutes all positions with pi(x) = (7x+3) mod29. The inverse (25 × (c-3)) mod29 recovers **55/55** source symbols and preserves the entire symbol equality pattern, including the planted 85 equal page-first pairs and normalized IoC 1.6599326599. Arbitrary choice of pi cannot transform an 85-collision plaintext source into the observed 52-collision ciphertext.

**Calibration caveats:** The sampled native passage collection is limited and the null assumes independent draws with replacement conditioned only on **first versus interior word position**. It does not reproduce complete paragraph content, source word lengths or unknown LP2 syntax. The source controls are conditional Monte Carlo comparisons, not universal English impossibility proofs or posterior probabilities of Cicada design. The control was chosen after other investigations had already highlighted low adjacent-repeat counts.

## Separate original second-order and rubric checks

Exact original *within-page* lag2/lag3 event totals are, respectively: **435** and **434**. Overlapping paired lag2 echoes total **12**; lag3 paired echoes total **18**. To evaluate the counts without mistaking a first-order suppression effect for a second-order code, a local supplementary trial drew **2,800 independent original-page directed Euler paths**, holding each physical page's complete **29×29 ordered bigram inventory**, first and last symbols and length **exactly fixed**. It used deterministic xorshift32 seed 0xa3b195e7 and the uniform labeled-edge cycle-popping method of the [existing read-only exact Euler SFT](../sims/lp2_exact_page_bigram_euler_sft.cjs). The resulting means and standard deviations were:

| Event | Original | Exact-page-bigram null mean ± SD | Upper-tail plus-one |
| --- | ---: | ---: | ---: |
| Lag2 equalities | 435 | 447.09 ± 18.50 | 0.74259 |
| Lag3 equalities | 434 | 427.59 ± 19.71 | 0.38700 |
| Paired lag2 echoes | 12 | 16.45 ± 4.07 | 0.89789 |
| Paired lag3 echoes | 18 | 15.07 ± 3.95 | 0.26812 |

The last four tails have no discriminating signal under this exact conditioned null. **Do not confuse this with the independently established anomalous within-word lag-five echo**, which the prior source-exact Euler report already demonstrated and which remains open to a new explanatory cipher.

The [original ink annotations](../resources/liber-primus/lp2-ink-annotations.json) identify 20 interior large punctuation sites with sufficient flank. A second exact-Euler control (2,400 trials, seed 0x6236c9ab) found local after-marker lag2=0 versus null mean0.816 and lag3=1 versus null mean0.634, with two symbols downstream lag2=2 versus0.771 and lag3=1 versus0.650. None is a stable source-selected reset or cipher instruction. The supplementary randomized trial is a bounded local computation; the committed SFT explicitly checks these original higher-order counts and links to the separate exact-Euler framework.

## Decision for Director Issue #2339

The same-complete-state plus fixed-bijection physical-page-reset scheme forces 55 native plaintext page starts to retain the original near-flat symbol histogram, regardless of the secret alphabet. On the available *already-solved Cicada native GP register*, that is a poorly fitting necessary condition. **Retire this particular common-reset branch**, including exhaustive searches of Caesar offsets or secretly permuted initial GP alphabets. The code and CI provide an exact all-secret key-independent constraint, with positive and independent solved-native controls.

A viable one-carry decoder must instead provide an **authored operand** for a carried page-to-page state, a changing IV, a different original page-start rule, or a genuinely different plaintext register. These escape clauses have not been selected by any authenticated original clue; choosing one merely to repair the histogram would be ad hoc. Because the test does not distinguish those rival architectures and produces no GP29 plaintext inverse, further key search is unjustified without that missing source-selected operation.
