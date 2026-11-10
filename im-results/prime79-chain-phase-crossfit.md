# A source-selected period-79 phase excess in predecessor-excluded LP2 differences

**Classification: provisional, reproducible ciphertext-only structural signal. No unknown LP2 plaintext, encryption key, general decoder or external destination has been recovered.** Agent 50, 2026-11-10.

## A finite source-constrained question

The corrected original-image red title over the LP2 page-15 Fibonacci-prime square has nine runes with Gematria Primus prime sum **638 = 29 × 22**. The 22nd ordinary prime is **79**. The separately red-marked page-53 stanza has 51 runes with sum **2262 = 29 × 78**, and **φ(79) = 78**. These figures and original red-rune offsets are documented separately in [the source-level prime/totient analysis](red-prime-totient-crosslink.md) and [the canonical original-image annotations](../resources/liber-primus/lp2-ink-annotations.json). The source-derived numerical relation was **identified post-selection**; the test below is not independent confirmation of its intentionality.

The 55 rune-bearing unsolved pages, in manuscript order, contain exactly **12,956 = 79 × 164** canonical ciphertext runes. This exact divisibility motivated the following test, but it too was noticed after observing the source's numeral 79. Period 78, the paired totient, is the primary alternative. The number of original pages, runes, and red-span prime sums are asserted by the reproducer.

For a 29-symbol ciphertext page with indexed runes \(c_i\), assign the cyclic predecessor-excluded rank

\[
r_i = ((c_i-c_{i-1}) \bmod 29)-1 \quad \text{when }i>0,\ c_i \ne c_{i-1}.
\]

Thus \(r_i\) has 28 values, **0–27**. A physical page's first rune has no within-page predecessor and is omitted; the 86 observed adjacent-repeat pairs are also marked as erasures. **All 12,956 original rune positions continue to advance the phase clock**, including those 141 erasures. This is a specific forward-invertible 28-ary nonzero-step representation. The comparison alternative is the ordered/rank-excluding predecessor \(r_i=c_i-\mathbf{1}[c_i>c_{i-1}]\), which has a different 28-label geometry.

Divide the 55 original rune-bearing pages into **four consecutive groups of 14, 14, 14 and 13 pages** without changing manuscript order. Under a hypothetical continuous, repeating rank-key mechanism of period 79, positions from different groups having the same absolute original-rune offset modulo 79 can retain a shared rank structure. For each of six group pairs, count matching **nonerased** ranks at the same phase; take the unweighted mean of the six matching ratios. A uniformly distributed rank reference has coincidence \(1/28=0.0357142857\).

## Original-ciphertext observations

| Group pair | Exact matching pairs | Eligible pairs | Same-phase rank coincidence |
| --- | ---: | ---: | ---: |
| 0–1 | 5,123 | 141,454 | 0.03621672 |
| 0–2 | 5,268 | 145,445 | 0.03621988 |
| 0–3 | 4,363 | 120,800 | 0.03611755 |
| 1–2 | 5,048 | 137,898 | 0.03660677 |
| 1–3 | 4,225 | 114,533 | 0.03688893 |
| 2–3 | 4,224 | 117,772 | 0.03586591 |

All six cross-group rates exceed the uniform 28-rank reference. The **unweighted mean is 0.0363192927544**, or **0.000605007 above 1/28**. The minimum is **0.0358659104032**.

This is a small excess. Direct raw-rune modulo-79 phase coincidence is **0.0345302742458**, extremely close to the uniform 29-rune reference. Exactly one-lag-79 cyclic-rank identity is **442/12,598 = 0.0350849341**, *below* 1/28. Transposing the 164 × 79 rune array, and interpreting the apparent columns as a plaintext reading order, yields no English-readable original output. These diagnostics prevent interpreting the above difference-rank cross-phase effect as a recovered repeating pad.

## Null calibration and model family

The primary null rotates the **entire observed difference-rank sequence within each physical page**, independently, without modifying any rank values or their local order; the 141 erasure markers are carried along. Original physical page lengths, whole manuscript position clocks and the four-group membership stay fixed. The **same random rotations** are used for every one of four candidate interpretations: cyclic-vs-sorted predecessor exclusion and period 78-vs-79. The statistic is the four-group mean described above, not a fitted English-language score.

Across **3,000** seeded controls (\`0x79f401c3\`):

| Model | Observed mean | Rotation-null mean | Z relative to simulated SD | Single-model upper-tail p |
| --- | ---: | ---: | ---: | ---: |
| Cyclic rank, period 78 | 0.03586607 | 0.03575135 | 0.56 | 0.28757 |
| **Cyclic rank, period 79** | **0.03631929** | **0.03576045** | **2.66** | **0.00433** |
| Sorted rank, period 78 | 0.03545677 | 0.03573248 | -1.31 | 0.90903 |
| Sorted rank, period 79 | 0.03553935 | 0.03572898 | -0.89 | 0.81573 |

After calibrating the **maximum standardized score across all four alternatives** on each of the same 3,000 surrogate books, **48/3,000** null maxima equal or exceed the observed maximum. Add-one familywise upper tail is **49/3,001 = 0.0163279**. The number is conditional on these four candidate families and this source-preserving rotation null; it does not correct for the project-wide history of looking for patterns.

Two independently coded checks guard against a rotation/erasure artifact: (1) rotate the **original ciphertext page**, then recompute the 28-symbol difference rank and the four-group statistic; an earlier 2,200-trial run gave an empirical mean-statistic p **0.00227** and minimum-statistic p **0.00318**; (2) hold the first-rune erasure fixed and rotate each page's interior difference-rank array, 5,000 trials, seed \`0x79ff1102\`: **30/5,000** matched or exceeded the real mean and likewise the real minimum, add-one p **0.0061988** for each. Both reinforce the existence of a *narrow statistical effect under these nulls*; neither explains its source or enciphering rule. The source reproducer includes the original-cipher rotation check as a separate positive-null diagnostic.

## Known-source inverse and original holdout

The program constructs a planted, exact, 79-phase repeating **28-symbol additive key** on GP-encoded Shakespeare control text. It encrypts each symbol after the first position of every physical page by adding a nonzero cyclic predecessor step modulo 29, and inverts using the true 79-value key. All **12,901** eligible planted positions are recovered exactly, and the planted 79-phase cross-group coincidence mean is above **0.05**, unlike the original mean 0.03631929. The planted source is mapped from 29 GP rune indices to a 28-label model by \`p % 28\`; this is a detector-function control for the specific rank channel, with no claim that Cicada applied this encoding.

For the actual original LP2 data, a completely separate held-out trial used first 41 pages to fit a smoothed, 79-position rank-symbol histogram and scored the last 14 pages against its source-register baseline. Across 1,300 original-page-rotation controls, the best of the tested fixed smoothings still had **negative heldout log likelihood improvement** (α=800: −0.000389 log units per rune; rotation-null upper-tail p≈0.08455). The other smoothings α=50, 100, 200, 400 had p≈0.291, 0.214, 0.140, 0.106. **No plaintext classification, key symbols or exact original inverse have been recovered.**

## Interpretation and next decisive experiment

The observed result may represent a weak global phase-associated bias in the nonzero-step labels, a formatting/dependency effect not captured by the null, or a multiple-testing accident. A shared 79-state key operating directly on natural-language GP symbols would normally produce a **much larger** same-phase recurrence under the tested forward model, and the genuine period-79 lag-one match is unexceptional. The data give no support for calling the red source relationship a decryption key.

The next useful test is a specific source-determined 79-state key-generator or outer state-machine model that reconstructs **actual held-out LP2 runes** from original ciphertext and independently derived key material, then re-encrypts them exactly. The current small difference-histogram signal is only a constraint on such a model. Larger period sweeps or extra fitted language scores on these same 79 phases would repeat the existing selection problem.

**Reproducer:** [\`sims/prime79_chain_phase_crossfit.cjs\`](../sims/prime79_chain_phase_crossfit.cjs). Requires Node.js 22, the canonical corpus, image-audited annotation and the existing independent English source/GP encoder; no extra dependencies. It checks all source invariants, prints the exact six group-pair counts, original and control scores, finite-family maximum calibration and all 12,901 synthetic inversions. [On-demand GitHub Actions CI, successful run 42779258288](https://github.com/FlareZ123/liber-primus/actions/runs/42779258288). This workflow runs only when explicitly dispatched.
