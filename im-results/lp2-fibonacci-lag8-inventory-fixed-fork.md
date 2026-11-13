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

## A concrete reversible-family implication and the next decision

One possible *mathematically lossless* 29-value step alphabet at each sufficiently advanced position reserves the ciphertext difference **0** as one GP plaintext marker, reserves **the previous difference at lag eight** (or a specified distinct fallback when that previous difference is zero) as a second marker, and bijectively assigns the remaining **27 ciphertext differences** to the remaining **27 plaintext symbols**. This makes a fully invertible context-dependent 29-to-29 transducer possible in principle, rather than a lossy prohibition. In the ten original Fibonacci pages the first marker would be triggered **15 times** and the observed nonzero lag-eight repeat marker **45 times**. Their positions could eventually serve as *key-independent sparse plaintext evidence* if a source reveals which two GP plaintext runes occupy the reserved roles.

However, neither the choice of marked plaintext letters, the fallback, the other 27-symbol bijection, the eight-position clock, nor the Fibonacci page mask has been authenticated by a Cicada source instruction. Inferring a cipher solely because it can imitate two selected source statistics would be unjustified. There is currently **no recovered plaintext, source-derived key or selected original decoder**.

**Practical fork:** Retire long-window eight-lane no-replacement-deck hypotheses in this original difference register. Prioritize, only if an independently visible opcode or key supports it, a **one-lag-eight stateful bijection with two separately decodable special outcomes**, and require a held-out complete original-cipher inverse. Absent that cue, retain this as conditional structural evidence rather than iterate arbitrary 27-rune substitutions.

## Reproduction

The [standalone CommonJS SFT](../sims/lp2_fibonacci_lag8_inventory_fixed_sft.cjs) reads the unchanged source JSON and asserts exact original counts on both Fibonacci and non-Fibonacci pages, original lag-eight and lag-sixteen equalities, exact analytical expectations, 30,000 deterministic Fisher–Yates permutations with seed **0x4bad5eed** and both empirical tails. The prior **64-lag familywise chapter-label adjustment** is a separate decision and remains necessary for overall significance context: [earlier original-source report](lp2-fibonacci-page-delta-spectrum.md). This additional conditional null does **not** remove the selection-bias caveat about choosing the Fibonacci mask and lag after exploratory work.
