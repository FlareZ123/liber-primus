# LP2 lag-five equality and contiguous echoes: a conditioned word-order constraint

**Evidence:** reproducible ciphertext-side structural constraint and bounded forward-model discrimination. Original report by Agent 14 (10 November 2026), extended by Agent 22 (14 November 2026). **No original unknown plaintext, key, method or destination recovered.** The five-apart and S-specific echoes were documented by external researchers in [the first-order report](lag5-rune-specific-echo.md); the extension below adds a family-calibrated all-rune single-hit result under the same stricter conditional null. **Important concurrent-prior-art correction:** [Agent 6's earlier committed burst-copy code](../sims/lag5_burst_copy_probe.cjs), commit d69bbf4 at 06:07 UTC, *already identified the eight words with a repeated lag-five digraph*, enumerated an exact hit-position conditional, and implemented an M3 forward challenge. This Agent 14 analysis independently adds a stricter per-word rune-multiset plus doublet-preserving permutation null, explicit lag 2–7 family calibration, and independent model replications. The paired-digraph observation and M3 concept are **not original to this report**.

## Original ciphertext and exact definition

The first 55 rune-bearing LP2 transcription records, containing 12,956 runes in 2,896 complete rune words, are the input. Print lines and physical page boundaries never split a word; the runeless page 50 and already solved closing pages are excluded.

For a complete word, a lag L hit at word-local index i ≥ L means C[i] = C[i−L]. A **contiguous pair of hits** requires the same equality at i−1, equivalent to the two adjacent target runes matching the two runes exactly L positions earlier. Three consecutive matches contribute two overlapping pair events.

At lag five, the original has **104 single hits among 2,105 eligible comparisons**, **nine overlapping contiguous two-hit events** and one three-hit run. Eight distinct words contain at least one two-hit run; a ninth word contains two separated hits, giving **nine words with multiple lag-five matches**. The highlighted 11 S-to-S hits are a previously established independent first-order constraint.

Examples are original ciphertext, zero-based whole-word indices:

- Word **2722**: ᛋᛞᛝᚷᛚᛋᛞᛝ, first **three** runes copied at offset five, giving two overlapping pairs.
- Word **2148**: ᚢᛈᛋᚦᛁᚳᛈᛋᛁᚹ, the two-rune substring ᛈᛋ occurs at positions one and six.
- Word **2891**: ᛖᛋᛇᚦᚦᛖᛋ, with ᛖᛋ at positions zero and five.

The other contiguous-run words are 513, 519, 1405, 1500 and 1967. Word 1220 has two nonconsecutive lag-five matches at positions seven and nine. None of these strings is claimed as plaintext.

## Conditional null: single-hit and contiguous-pair families

The deterministic [CommonJS challenge](../sims/lag5_contiguous_echo_challenge.cjs) independently permutes the letters of each original whole word, keeping that word's exact rune multiset, length and observed number of immediately repeated neighbours. The same 2,000 training / 5,000 independent test draws support two distinct families: single-hit equality counts across lags 2–12, calibrated by max-|z|, and contiguous pair events across lags 2–7, calibrated by the maximum positive z. Both families use seed 0x6aab5501 and the same source-conditioned null.

### Single-hit equality family (lags 2–12)

The same null also calibrates the **total number of single within-word equalities** at each distance, without requiring the two matches to be contiguous. The family statistic is the maximum absolute standardized score across all eleven lags 2–12. Under the 2,000 training / 5,000 independent test draws (seed 0x6aab5501), the observed lag-five count remains unusually high after preserving each word's exact rune multiset and adjacent-repeat count:

| Lag | Observed hits / opportunities | Null mean | Null SD | z |
| ---: | ---: | ---: | ---: | ---: |
| 2 | 252 / 7,247 | 277.0550 | 11.9298 | −2.100 |
| 3 | 181 / 4,882 | 176.9405 | 11.4979 | +0.353 |
| 4 | 131 / 3,237 | 118.1520 | 9.4557 | +1.359 |
| **5** | **104 / 2,105** | **76.2970** | **7.9220** | **+3.497** |
| 6 | 32 / 1,290 | 45.8995 | 6.3478 | −2.190 |
| 7 | 30 / 731 | 26.7790 | 4.8748 | +0.661 |
| 8 | 10 / 388 | 14.3355 | 3.7061 | −1.170 |
| 9 | 5 / 201 | 7.6035 | 2.6152 | −0.996 |
| 10 | 2 / 92 | 3.1995 | 1.7064 | −0.703 |
| 11 | 1 / 35 | 1.3105 | 1.1136 | −0.279 |
| 12 | 0 / 10 | 0.3375 | 0.5680 | −0.595 |

The absolute maximum is lag five, **|z| = 3.49695**. **67/5,000** independent null books reach or exceed it, giving max-|z| empirical **p = 68/5,001 = 0.0135973** over the eleven tested lags. At fixed lag five, 2/5,000 nulls reach 104 (add-one p = 0.0005999), but the familywise value is the relevant summary. A second independent seed, 0x13b4c7a1, gives **z = 3.45307** and max-|z| **p = 63/5,001 = 0.0125975**; reproduce it by passing 2000, 5000 and 0x13b4c7a1 as the script's three CLI arguments. A seven-hit synthetic five-back word is counted exactly 7/7 by the positive-control assertion in the updated script.

Independent corroboration: the public [ZzNible findings release](https://github.com/ZzNible/cicada3301-liber-primus-findings/blob/main/FINDINGS.md) reports the same 104/2,105 observation with z = 3.75190 and max-|z| p = 0.00860399 under a different null preserving global rune multiplicities, word lengths and total adjacent-equality count. Its public release is a sanitized summary without executable source; the result above is our own reproduction under the **stricter per-word** multiset and adjacent-count conditioning, not a reuse of its p-value.

### Implication for chain-step models

A public independent analysis proposes a chain-step representation in which each ciphertext rune is the previous rune plus a step from a flat, aperiodic 28-symbol stream ([Leo-Y-Zhang report](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md)). The lag-five result constrains that family: the original within-word difference stream contains **10,060 steps**; its zero bin has 63 occurrences and the 28 nonzero bins range from 313 to 397. If five successive within-word steps were independent draws from this exact empirical 29-bin distribution, cyclic convolution gives

\[
\Pr(S_5=0\bmod29)=0.03448273614900442,
\]

or **72.586** expected returns among 2,105 five-step windows. The uniform-i.i.d.-nonzero-step chain gives essentially the same baseline, \(21195/614656=0.03448270252\). The observed 104 returns therefore cannot be explained by a flat marginal step histogram alone: a chain-step explanation needs dependence in five-step sums (or a different mechanism). This does **not** reject an aperiodic but dependent key stream, and it does not imply a period-five cipher.

The simpler stationary cumulative-substitution family is separately excluded by [the original zero-symbol / all-secret gate](lp2-cumulative-difference-zero-symbol-gate.md); the eight printed AES-column keys tested as a 28-state chain are negative in [the source-grid chain gate](grid-chain28-step-key.md). The remaining chain route therefore needs an independently selected, position-varying step generator. The p05 5×5 square is a possible clue to a five-step dependency, but no source instruction yet connects it to this stream; do not use it to justify arbitrary fitted recurrences.

This is a whole-alphabet lag-five signal, including the 11 S-to-S matches; the nine contiguous pair events below measure a separate second-order clustering. It does not establish a period-five cipher, a key, or plaintext. The lag family was chosen from prior research, so neither this nor the external p-value is a discovery-wide correction over all historical searches.

### Contiguous pair events, lags 2–7

| Lag | Original adjacent-hit pairs | Null mean pair count | z |
| ---: | ---: | ---: | ---: |
| 2 | 5 | 7.449 | −1.006 |
| 3 | 7 | 4.363 | +1.294 |
| 4 | 4 | 3.008 | +0.575 |
| **5** | **9** | **1.729** | **+5.592** |
| 6 | 0 | 1.031 | −1.010 |
| 7 | 1 | 0.632 | +0.451 |

Four of 5,000 independent null manuscripts had a maximum over the six tested lags at least as strong as the original lag-five score: **finite-family empirical p = 5/5,001 = 0.0009998**. At the historically identified fixed lag five, 2/5,000 nulls reached nine contiguous pairs (**p = 3/5,001 = 0.0005999**), with test mean **1.7664 ± 1.3377**. The original **nine words** with at least two lag-five hits compare with null mean **3.4426**, 42/5,000 upper-tail exceedances (p = 43/5,001 ≈ 0.008598). The null mean of S-to-S hits is **2.051**, never reaching the original eleven in those 5,000 tests, corroborating prior analysis.

**Important conditional limit:** holding *each word's actual number k of five-lag matches* fixed, the expected number of adjacent-hit pairs from uniformly placing those hits among n eligible positions is exactly the sum of k(k−1)/n over all words, or **6.952381**. Thus the most substantive effect is the **concentration of multiple lag-five hits in a small set of words**. These observations cannot uniquely establish a literal two-rune copy operation. The 0.001 maximum-null result accounts for six tested lag choices, whereas the historical discovery involved much broader selection.

## Existing forward model M3 fails the second-order constraint

The published [pnotisdev M1/M3 forward mechanisms](https://github.com/pnotisdev/cicada3301/blob/main/work/mech25/sim25.py) assume independent uniform modulo-29 tentative ciphertext symbols with a global approximately 81% suppression of repeated consecutive outputs. From word-local position six onward a suppressed collision is replaced with T(C[i−6]) = (24−2C[i−6]) modulo 29. M3 then independently copies C[i−5] at word index five or later with probability 0.015 on non-repair steps.

The independently implemented [8,000-book-per-model challenge](../sims/lag5_block_echo_forward_challenge.cjs) uses these prior-art mechanisms, fixed q=0.818, the exact original 2,896 word lengths and independent seeded draws. It does not seek a plaintext and does not assume that either mechanism is the real encryption architecture.

| Original-data measurement | LP2 | M1 mean | M3 mean |
| --- | ---: | ---: | ---: |
| Lag-six affine T hits | **80** | 78.364 | 78.419 |
| Lag-five individual equalities | **104** | 72.646 | **102.123** |
| **Lag-five contiguous pair events** | **9** | 1.568 | **3.100** |
| S-to-S at lag five | **11** | 2.502 | 3.524 |
| Words with multiple lag-five hits | **9** | 3.068 | 5.915 |

The first-order M3 five-lag hit mean is close to the original **104**, but its pair-event mean is **3.100 ± 1.831**, with only 44/8,000 reaching the original nine (**empirical upper p = 45/8,001 = 0.005624**). Its S-to-S mean is **3.524 ± 1.882**, with only 12/8,000 reaching the original eleven (**p = 13/8,001 = 0.001625**). No simulated M3 book met both thresholds, but these correlated, historically selected events cannot be treated as independent or discovery-wide tests.

**Independent, better-conditioned earlier implementation:** Agent 6's [prior burst-copy script](../sims/lag5_burst_copy_probe.cjs), now actually executed in [CI run 42769980860](https://github.com/FlareZ123/liber-primus/actions/runs/42769980860), counts **eight distinct repeated-digraph words** (rather than our nine *overlapping pair events*) and samples 12,000 independent-copy M3 books. It reports mean **3.137** distinct repeated-digraph runs, fixed lag-five upper-tail p≈**0.01525**. More importantly, its **model-aware max-of-lags 2–8 upper-tail p≈0.08591**, so this specific repeated-digraph signal does **not by itself provide a decisive familywise rejection of M3** after comparison to that explicit mechanism. Its exact Poisson-binomial test conditional on each original word's observed number of lag-five hits expects 5.652 distinct repeated-digraph words versus eight observed, **p≈0.05858**. These independent results are the strongest currently available *conditional* assessment and should take precedence over an unqualified burst assertion.

**Interpretation:** the independently applied five-back-copy extension M3 can fit the total number of five-back rune equalities while underpredicting fixed-lag second-order patterns and S-specific concentration. The stricter exact-word-multiset null remains strongly unusual, but conditioned-on-hit-count and model-aware familywise tests weaken claims of a new burst mechanism. This supplies an actionable joint benchmark. Copy bursts, plaintext structural correlations, symbol-conditioned states, and other reversible cipher systems remain hypotheses. Decipherment requires an independently recovered key/state and exact re-encryption of readable original LP2 plaintext. The M1/M3 overwrites are many-to-one without an information-restoring channel.

## Independent reproduction

- Input: [original LP2 normalized transcription](../resources/lp2-transcription.txt), with the canonical whole-word parser from [the prior lag-six study](../sims/lag6_conditioned_echo.cjs).
- Complementary to Agent 6's [previously committed digraph and exact conditional-hit-position challenge](../sims/lag5_burst_copy_probe.cjs); this report does not claim the pair or M3 finding as first discovery. The updated [word-multiset-conditioned challenge](../sims/lag5_contiguous_echo_challenge.cjs) calibrates single-hit equality counts at lags 2–12 and contiguous pair events at lags 2–7, with a seven-hit synthetic positive control; the second seed is reproducible through the optional fourth CLI argument. The separate [M1/M3 second-order forward test](../sims/lag5_block_echo_forward_challenge.cjs) remains unchanged.
- [Manual-only workflow](../.github/workflows/lag5-contiguous-echo-manual.yml); updated 2,000/5,000 original-input single-hit and pair-family challenge, including the seven-hit positive control, passed [GitHub Actions run 43584152154](https://github.com/FlareZ123/liber-primus/actions/runs/43584152154). Agent 6's earlier manual [lag-five burst-copy workflow](../.github/workflows/lag5-burst-copy.yml) also passed [run 42769980860](https://github.com/FlareZ123/liber-primus/actions/runs/42769980860).
- Historical priors: [lag-five S-specific echo](lag5-rune-specific-echo.md), [lag-six echo](lag6-conditioned-echo.md), [collision repair](lag6-sparse-collision-repair-model.md).

**No unknown LP2 passage is deciphered by this finding.**
