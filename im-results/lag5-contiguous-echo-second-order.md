# LP2 lag-five contiguous echoes: a second-order constraint on copied-rune models

**Evidence:** reproducible ciphertext-side structural constraint and bounded forward-model discrimination. Agent 14, 10 November 2026. **No original unknown plaintext, key, method or destination recovered.** This extends the externally discovered five-apart and S-specific echoes documented in [the first-order report](lag5-rune-specific-echo.md). The *new* measured feature is **two adjacent runes repeating together five positions later**. No priority is claimed for the underlying five-position anomaly.

## Original ciphertext and exact definition

The first 55 rune-bearing LP2 transcription records, containing 12,956 runes in 2,896 complete rune words, are the input. Print lines and physical page boundaries never split a word; the runeless page 50 and already solved closing pages are excluded.

For a complete word, a lag L hit at word-local index i ≥ L means C[i] = C[i−L]. A **contiguous pair of hits** requires the same equality at i−1, equivalent to the two adjacent target runes matching the two runes exactly L positions earlier. Three consecutive matches contribute two overlapping pair events.

At lag five, the original has **104 single hits among 2,105 eligible comparisons**, **nine overlapping contiguous two-hit events** and one three-hit run. Eight distinct words contain at least one two-hit run; a ninth word contains two separated hits, giving **nine words with multiple lag-five matches**. The highlighted 11 S-to-S hits are a previously established independent first-order constraint.

Examples are original ciphertext, zero-based whole-word indices:

- Word **2722**: ᛋᛞᛝᚷᛚᛋᛞᛝ, first **three** runes copied at offset five, giving two overlapping pairs.
- Word **2148**: ᚢᛈᛋᚦᛁᚳᛈᛋᛁᚹ, the two-rune substring ᛈᛋ occurs at positions one and six.
- Word **2891**: ᛖᛋᛇᚦᚦᛖᛋ, with ᛖᛋ at positions zero and five.

The other contiguous-run words are 513, 519, 1405, 1500 and 1967. Word 1220 has two nonconsecutive lag-five matches at positions seven and nine. None of these strings is claimed as plaintext.

## Controlled null and predeclared finite lag family

The new deterministic [CommonJS challenge](../sims/lag5_contiguous_echo_challenge.cjs) independently permutes the letters of each original whole word, keeping that word's exact rune multiset, length and observed number of immediately repeated neighbours. There are **2,000 training** permutations to estimate means and standard deviations and **5,000 independent test** permutations to calibrate the maximum standardized score across **all lags 2 through 7**, seed 0x6aab5501.

| Lag | Original single hits | Original adjacent-hit pairs | Null mean pair count | z |
| ---: | ---: | ---: | ---: | ---: |
| 2 | 252 | 5 | 7.449 | −1.006 |
| 3 | 181 | 7 | 4.363 | +1.294 |
| 4 | 131 | 4 | 3.008 | +0.575 |
| **5** | **104** | **9** | **1.729** | **+5.592** |
| 6 | 32 | 0 | 1.031 | −1.010 |
| 7 | 30 | 1 | 0.632 | +0.451 |

Four of 5,000 independent null manuscripts had a maximum over the six tested lags at least as strong as the original lag-five score: **finite-family empirical p = 5/5,001 = 0.0009998**. At the historically identified fixed lag five, 2/5,000 nulls reached nine contiguous pairs (**p = 3/5,001 = 0.0005999**), with test mean **1.7664 ± 1.3377**. The original **nine words** with at least two lag-five hits compare with null mean **3.4426**, 42/5,000 upper-tail exceedances (p = 43/5,001 ≈ 0.008598). The null mean of S-to-S hits is **2.051**, never reaching the original eleven in those 5,000 tests, corroborating prior analysis.

**Important conditional limit:** holding *each word's actual number k of five-lag matches* fixed, the expected number of adjacent-hit pairs from uniformly placing those hits among n eligible positions is exactly the sum of k(k−1)/n over all words, or **6.952381**. Thus the most substantive effect is the **concentration of multiple lag-five hits in a small set of words**. These observations cannot uniquely establish a literal two-rune copy operation. The 0.001 maximum-null result accounts for six tested lag choices, whereas the historical discovery involved much broader selection.

## Existing forward model M3 fails the second-order constraint

The published [pnotisdev M1/M3 forward mechanisms](https://github.com/pnotisdev/cicada3301/blob/main/work/mech25/sim25.py) assume independent uniform modulo-29 tentative ciphertext symbols with a global approximately 81% suppression of repeated consecutive outputs. From word-local position six onward a suppressed collision is replaced with T(C[i−6]) = (24−2C[i−6]) modulo 29. M3 then independently copies C[i−5] at word index five or later with probability 0.015 on non-repair steps.

The new [8,000-book-per-model challenge](../sims/lag5_block_echo_forward_challenge.cjs) uses these prior-art mechanisms, fixed q=0.818, the exact original 2,896 word lengths and independent seeded draws. It does not seek a plaintext and does not assume that either mechanism is the real encryption architecture.

| Original-data measurement | LP2 | M1 mean | M3 mean |
| --- | ---: | ---: | ---: |
| Lag-six affine T hits | **80** | 78.364 | 78.419 |
| Lag-five individual equalities | **104** | 72.646 | **102.123** |
| **Lag-five contiguous pair events** | **9** | 1.568 | **3.100** |
| S-to-S at lag five | **11** | 2.502 | 3.524 |
| Words with multiple lag-five hits | **9** | 3.068 | 5.915 |

The first-order M3 five-lag hit mean is close to the original **104**, but its pair-event mean is **3.100 ± 1.831**, with only 44/8,000 reaching the original nine (**empirical upper p = 45/8,001 = 0.005624**). Its S-to-S mean is **3.524 ± 1.882**, with only 12/8,000 reaching the original eleven (**p = 13/8,001 = 0.001625**). No simulated M3 book met both thresholds, but these correlated, historically selected events cannot be treated as independent or discovery-wide tests.

**Interpretation:** the independently applied five-back-copy extension M3 can fit the total number of five-back rune equalities while missing their second-order word-local pattern and S-specific concentration. This sharpens the forward-model architecture constraint. Copy bursts, plaintext structural correlations, symbol-conditioned states, and other reversible cipher systems remain live hypotheses. An actual advance to decipherment requires recovering an external or independently predicted key/state and re-encrypting genuine readable LP2 plaintext. The M1/M3 overwrites are many-to-one unless another information channel restores what was erased.

## Independent reproduction

- Input: [original LP2 normalized transcription](../resources/lp2-transcription.txt), with the canonical whole-word parser from [the prior lag-six study](../sims/lag6_conditioned_echo.cjs).
- New scripts: [exact word-multiset-conditioned six-lag challenge](../sims/lag5_contiguous_echo_challenge.cjs) and [M1/M3 second-order forward test](../sims/lag5_block_echo_forward_challenge.cjs).
- [Manual-only workflow](../.github/workflows/lag5-contiguous-echo-manual.yml); successful 2,000/5,000 and 8,000+8,000 original-input [GitHub Actions run 42769197879](https://github.com/FlareZ123/liber-primus/actions/runs/42769197879).
- Historical priors: [lag-five S-specific echo](lag5-rune-specific-echo.md), [lag-six echo](lag6-conditioned-echo.md), [collision repair](lag6-sparse-collision-repair-model.md).

**No unknown LP2 passage is deciphered by this finding.**
