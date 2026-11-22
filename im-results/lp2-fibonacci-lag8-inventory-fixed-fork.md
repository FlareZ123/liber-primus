# Fibonacci-page lag-eight suppression survives fixed original difference inventories

**Agent 4, 13 November 2026. Original-source conditional statistical finding and an explicit cipher-mechanism fork.** No previously unknown Liber Primus rune is deciphered here. The earlier Fibonacci-page/lag-eight hypothesis remains retrospectively selected from a large research space. This study adds a different **within-page random-order diagnostic**, rather than repeating the chapter-label selection experiment.

## Why this experiment matters for an actual inverse

Physical LP2 p15 visibly supplies a Fibonacci-indexed prime spiral; the original pp49–51 numerical table has eight columns. The published **Fibonacci-number page mask** is p0,1,2,3,5,8,13,21,34,55. In the 29-rune ciphertext, nonzero within-page predecessor differences at an **eight-step distance** match unusually rarely on this page set (45/2226). A potential causal explanation is an eight-channel *without-replacement deck*: a designer could draw each new step from a shuffled alphabet and avoid repeats over several rotations. Such a mechanism would predict avoidance at **lag 16 as well as lag 8**. A different, narrower hypothesis is a *single lag-eight context check*, capable of suppressing immediate eight-step echoes while allowing sixteen-step echoes.

Both alternatives are **proposed mechanisms**, never printed author instructions. Their practical consequence is different. A deck would require reconstruction of a shuffle/reshuffle schedule and carry many observable cross-lag constraints; a one-step exclusion needs a lossless 29-symbol decoder with a reserved/escape output for the excluded difference, plus a source-selected key or state.

## Untouched original ciphertext and a stronger conditional control

Use each original physical page's exact GP29 rune indices. For each within-page adjacent pair form D_i = (C_i - C_(i-1)) mod 29. An equality comparison at lag k is eligible only when both differences are nonzero. Preserve **each of the ten pages separately**, its original length, every **zero-step position**, and its exact 28-bin multiset of nonzero difference values. Only the positions of these nonzero labels are permuted, using the same independently fixed shuffle rule for all pages.

| Original-source observation | Lag eight | Lag sixteen |
| --- | ---: | ---: |
| Equal nonzero-difference pairs | **45 / 2,226** | **80 / 2,147** |
| Analytic permutation mean, exact source inventories | **82.35281117** | **79.41806427** |
| 30,000 seeded independent permutations: mean | **82.1881** | **79.4496** |
| Permutation standard deviation | **8.86526** | **8.64486** |
| Permutations at or below original | **0 / 30,000** | **16,675 / 30,000** |
| Add-one one-sided lower tail | **0.0000333322** | **0.5558481** |

The analytic expectation for any fixed page and lag is **eligible_pairs × [sum over nonzero symbols n_s(n_s-1)] / [M(M-1)]**, where M is that page's original count of nonzero differences. This explicitly adjusts for the separately documented elevated χ² heterogeneity of first differences on the Fibonacci pages. It avoids the false premise that the nonzero differences are equally frequent.

For contrast, original **non-Fibonacci** pages have **372/10068** eligible lag-eight matches, or 3.69487%, versus 2.02156% on Fibonacci pages. Adjacent eight-step multiples in the original Fibonacci pages are:

| Difference lag | Equal / eligible | Rate |
| ---: | ---: | ---: |
| 8 | **45 / 2226** | **2.02%** |
| 16 | 80 / 2147 | 3.73% |
| 24 | 61 / 2069 | 2.95% |
| 32 | 73 / 1989 | 3.67% |
| 40 | 66 / 1910 | 3.46% |
| 48 | 58 / 1830 | 3.17% |
| 56 | 75 / 1753 | 4.28% |
| 64 | 71 / 1674 | 4.24% |

The **lag-eight-only repulsion** therefore survives conditioning on the actual source histogram, zero locations and each physical page, while lag sixteen is wholly typical of the same within-page null. This materially disfavors a simple eight-lane reshuffled 28-symbol deck with a no-replacement window longer than one row. Such a deck would suppress both first- and second-step same-lane collisions, including lag sixteen; the original does not do that. A deck that resets after every single row has no 28-card no-replacement constraint to test.

## Original word and line boundaries do not localize the lag-eight effect

The unmodified source transcription preserves word breaks and slash-marked printed lines. Among the source Fibonacci pages, current **word starts** give **9/474 = 1.90%** lag-eight matches and word **interiors** **36/1752 = 2.05%**; source non-Fibonacci comparisons are respectively **92/2256 = 4.08%** and **280/7812 = 3.58%**. Likewise, within one printed line the Fibonacci result is **31/1450 = 2.14%**, and across a line break it is **14/776 = 1.80%**. This weakens an explanation driven solely by a particular typography/line-wrap boundary or a simple per-word reset, without excluding a hidden state clock.

## Decisive additional test: an arbitrary secret alphabet per Fibonacci page cannot recover ordinary GP-native English

The lag-eight suppression invites a mathematically complete decoder: at every original physical-page position **i ≥ 9**, form the printed difference **D(i) = (C(i) − C(i−1)) mod29**. Reserve difference **0** as label0, reserve difference **D(i−8)** (when nonzero) as label1, and assign the other **27** nonzero differences in ascending numeric order to labels2..28. If D(i−8)=0, use 1 as a frozen deterministic fallback, keeping the two reserved outputs different. This produces a **reversible 29-category contextual step alphabet** with the page's first nine ciphertext runes as an IV. Applying a secret bijection from these 29 labels to 29 GP plaintext letters would be an economical no-erasure cipher. The source does not authenticate the algorithm, the fallback or which plaintext letters would occupy the special labels.

Rather than guessing those keys, grant **a fully arbitrary, independently chosen 29-symbol bijection on every one of the ten Fibonacci pages**. Such a key can relabel a page's 29 ciphertext categories, but it **cannot increase the count of any single plaintext letter beyond that page's highest category count**. The same holds for any two plaintext letters, bounded by that page's two highest category counts. Summing the ten pagewise histograms gives mathematical, **all-secret** ceilings:

| Original source data | Absolute capacity under any independent pagewise alphabet |
| --- | ---: |
| Total positions with nine-rune page IV removed | **2,256** |
| Count of category0 (zero-step marker) | **15** |
| Count of category1 (lag-eight repeat or deterministic fallback) | **46** |
| **Maximum possible occurrence count of any one GP plaintext rune** | **148 / 2,256 = 6.56%** |
| **Maximum combined occurrences of any two GP plaintext runes** | **279 / 2,256 = 12.37%** |

These maxima are keyless and exhaustive over *all possible* pagewise 29-symbol alphabet permutations, not a random sample of secret keys. To measure whether a proposed original solution could be ordinary GP-native English, use the independently corrected GP spelling from solved LP1 and LP2 p57: a single ING rune and single IO rune, with documented source C/K etc. For each of three independently pinned English sources, scan **every** complete contiguous 2,256-rune passage; divide it in order into the original ten page-associated lengths [253,257,192,208,254,246,263,264,252,67]. Even the loosest bound gives the following sharp contradictions:

| GP-native original-language control | Complete 2,256-rune windows | Smallest maximum *one*-rune count | Smallest maximum *two*-rune count | Windows satisfying both original limits |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | **214,851** | **195** | **386** | **0** |
| Gibran | **60,237** | **224** | **405** | **0** |
| Emerson | **319,072** | **214** | **407** | **0** |
| Separate heldout Latin Vulgate GP register | **145** | **293** | **517** | **0** |
| **Total** | **594,305** | | | **0** |

The most favorable English control still requires **195 copies of its most common rune** (the independently GP-encoded Latin sample requires at least **293**), where original source labels under *any page-specific bijection* can furnish at most **148**. The result is stronger than a guessed key or IoC failure and independent of how the 29 letters are secretly named.

A **positive planted control** uses exactly the first source-native 2,256 Shakespeare symbols, split into the ten source original page lengths; it encrypts all symbols after the nine-rune page IV through the stated lag-eight 29-category forward transducer, leaving each page its own unmodified nine source ciphertext runes as initial state. The exact inverse recovers **2,256 / 2,256** source-native plaintext labels, with complete forward reconstruction. Its category maxima rise enough to admit the planted English. This validates the necessary-condition gate on a genuine member of the proposed cipher family.

**Fork:** The original lag-eight effect survives the fixed-inventory shuffle control, yet **the most direct complete lag-eight 29-state alphabet cannot hide ordinary GP-native English under any static alphabet per physical page**. To obtain native prose, the mechanism must change symbol labels *inside* a page, rearrange positions, or operate on an independently authenticated non-GP plaintext representation. None of those alternatives follows solely from the statistical lag-eight anomaly. Retire pagewise arbitrary-key fitting for this conditional cipher family. A fully specified author-visible key-state rule, with held-out original plaintext and exact reencryption, remains the next indispensable input.

## Frozen direct inverse using the authenticated p56 prime-totient stream

The page-fixed 29-rune alphabet is excluded above, so a varying key is needed for that conditional cipher family to encode normal GP-English. Cicada's independently solved original p56 supplies an actual **varying numeric operation**, subtraction of Euler's totients of successive primes modulo29. A narrow source-led test is therefore to treat each page's lag-eight 29-category label as the ciphertext symbol and subtract the authenticated prime-totient schedule from it.

Only three simple source-defined clock alignments are tested: (1) reset the prime clock on the first non-IV symbol of every Fibonacci page; (2) use each original physical-page position, including the preceding nine IV positions; (3) run continuously across only the ten selected Fibonacci page tails. Fix the p56 **subtraction sign**, prime2 as initial prime, and the unchanged complete input, with no key fitting, alternative literal-F convention, or changing label alphabet. The transfer of the solved p56 operation to these earlier pages is itself a conjecture.

| Original 2,256-rune output | GP29 IoC |
| --- | ---: |
| Untouched source lag-eight label stream | **0.035465710557** |
| Totient subtraction, key reset after page IV | **0.034397949395** |
| Totient subtraction, whole physical-page clock | **0.034673145571** |
| Totient subtraction, continuous across F page tails | **0.034571322986** |
| Independently solved GP-native p57 plaintext reference | **0.062709966405** |

None approaches native GP prose or provides recognizable source English. All **three** complete original-input transforms re-encode the exact 2,256 input rank labels; an independent complete 2,256-rune native-GP English plant passes the full stateful forward encoding and exact prime-totient inverse in each clock. The test rejects precisely this direct p56-key transfer under the proposed complete lag-eight-rank alphabet, without ruling out a separately instructed intra-page evolving key or another cipher architecture. [Reproducer](../sims/lp2_fibonacci_lag8_prime_totient_original_sft.cjs).

## Reproduction

The [standalone CommonJS SFT](../sims/lp2_fibonacci_lag8_inventory_fixed_sft.cjs) reads the unchanged source JSON and asserts exact original counts on both Fibonacci and non-Fibonacci pages, original lag-eight and lag-sixteen equalities, exact analytical expectations, 30,000 deterministic Fisher–Yates permutations with seed **0x4bad5eed** and both empirical tails. The prior **64-lag familywise chapter-label adjustment** is a separate decision and remains necessary for overall significance context: [earlier original-source report](lp2-fibonacci-page-delta-spectrum.md). This additional conditional null does **not** remove the selection-bias caveat about choosing the Fibonacci mask and lag after exploratory work.

**All-secret source-language follow-up:** [reversible pagewise 29-category GP29 transducer and 594,305-window capacity SFT](../sims/lp2_fibonacci_lag8_allsecret_pagewise_capacity_sft.cjs) (Node.js 22). It asserts exact source page inventories, 15/46 marker outcomes, 148/279 all-secret bounds, three exhaustive English corpora and one independently prepared Latin heldout window scan, and full source-native English positive roundtrip.

**Exact manual CI:** both new original-source experiments and their independent native-English positive controls passed Node.js 22 unchanged in [GitHub Actions run 43407948437](https://github.com/FlareZ123/liber-primus/actions/runs/43407948437), main commit 0f1af429e0f3deee9e4b1ce7afafa813fbf52448.

**Extended exact manual CI:** the three-clock prime-totient original and positive-control SFT also passed unchanged on Node.js 22 in [GitHub Actions run 43409123237](https://github.com/FlareZ123/liber-primus/actions/runs/43409123237), code commit 96ff3897b8cee516f2ce27f409be5d0b878ac81d.
