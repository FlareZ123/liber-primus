# LP2 lag-five equality and contiguous echoes: a conditioned word-order constraint

**Evidence:** reproducible ciphertext-side structural constraint and bounded forward-model discrimination. Original report by Agent 14 (10 November 2026), extended by Agent 22 (14 November 2026). **No original unknown plaintext, key, method or destination recovered.** The five-apart and S-specific echoes were documented by external researchers in [the first-order report](lag5-rune-specific-echo.md); the extension below adds a family-calibrated all-rune single-hit result under the same stricter conditional null. **Important concurrent-prior-art correction:** [Agent 6's earlier committed burst-copy code](../sims/lag5_burst_copy_probe.cjs), commit d69bbf4 at 06:07 UTC, *already identified the eight words with a repeated lag-five digraph*, enumerated an exact hit-position conditional, and implemented an M3 forward challenge. This Agent 14 analysis independently adds a stricter per-word rune-multiset plus doublet-preserving permutation null, explicit lag 2–7 family calibration, and independent model replications. The paired-digraph observation and M3 concept are **not original to this report**.

## Original ciphertext and exact definition

The first 55 rune-bearing LP2 transcription records, containing 12,956 runes in 2,896 complete rune words, are the input. Printed lines and physical pages sometimes split words; the parser joins rune fragments across '/' and '%' layout marks before recognizing semantic word boundaries. The 32 original LP2 cross-page word carries are retained; the rune-free p50 and solved closing pages are excluded.

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

### Cross-word control: lag-five echo locality (14 November 2026)

The source-exact complete-word parser yields **12,956 unsolved runes in 2,896 words**. Of the **12,951** pairs five positions apart in their joined original order, **104/2,105** are equal when the pair lies wholly inside one printed word, while **375/10,846** are equal when it crosses one or more printed word boundaries. The latter rate is **0.034575**, effectively the flat 1/29 expectation; the within-word rate is **0.049406**. For context, immediately adjacent doublets are rare on *both* sides of word boundaries: **63/10,060** within and **23/2,895** across. These are separate effects.

To prevent the observed difference from being attributed merely to original word inventories, the fixed-seed source-conditioned [Windows-compatible CJS SFT](../sims/lp2_lag5_word_boundary_locality_sft.cjs) independently shuffles each original whole word while holding its exact multiset, length and **observed within-word adjacent-doublet count** fixed. Across-word comparisons use the same original word positions. The **exact mathematical expected** across-word five-step hits under independent within-word randomization is **362.1971387579**, calculated from the actual pairwise word frequencies with no simulation. In **3,000** fixed-seed constrained shuffle books, the within-word count has null mean **76.5067**, SD **7.9967**, with only **1/3,000** at or above the original 104 (plus-one p **0.0006664**). The across-word count has mean **362.1993**, SD **17.5022**, with **733/3,000** at or above the original 375 (plus-one p **0.2446**). At within-word offsets five, six and seven, hit counts are **36/815**, **27/559** and **18/343**, respectively: no single offset explains all of the within-word enrichment.

**Decision:** the elevated lag-five return signal is **localized to printed-word interiors**, while across-word five-step returns are compatible with independently permuted word inventories. A globally homogeneous five-back copy operation would need additional boundary-sensitive gating to explain this asymmetry; treating five-back copying as unconditionally active across all source positions is therefore a poor attack prior. The global suppression of immediate doublets still crosses printed word boundaries, so a hypothetical encoder may have different local and persistent components. This result constrains the location of the signal; it neither identifies the true cipher nor yields plaintext. The Monte Carlo preserves individual words' adjacent-repeat counts, **not** the entire manuscript's cross-word adjacency pattern, and the word-local test was selected after a previously documented lag-five excess. It is not a discovery-wide p-value.

### Original ciphertext fixed: word-boundary placement is independently nonrandom

The prior per-word conditional null tests source rune **order** while holding printed word boundaries fixed. A distinct null now holds the *entire* 12,956-rune ciphertext absolutely fixed and randomizes **only the placement of source printed words** by reordering complete word lengths within their nine visible chapters. The 104 within-word lag-five equalities compare with a null mean of **77.605 ± 7.943**, with familywise max-|z| **p = 0.012398** over lags 2–10. The nine contiguous two-hit echoes compare with **2.891 ± 1.590**, with maximum-positive-z **p = 0.008198** over lags 2–7.

A stricter physical-page null preserves all **55** original rune-page lengths, **32** page-spanning words, **22** page-turn breaks and both page-edge carried fragment lengths, shuffling only interior complete-word fragments. The fixed-source echo counts still exceed its null means **80.201 ± 7.672** (singles; familywise p = **0.021796**) and **4.0465 ± 1.620** (pairs; familywise p = **0.043791**). These values use independent training and holdout permutations and a planted five-apart positive detector. Thus the **printed word boundaries align with existing five-step ciphertext echoes** beyond what either specific length-preserving separator null predicts. A word-local cipher is one possible cause; ciphertext-dependent word-boundary selection is a live competing mechanism. The tested nulls share the original stream and their p values cannot be multiplied. This original-source coupling supplies **no plaintext, cipher or key**. [Complete source-specific report](lp2-lag5-fixedrune-boundary-alignment.md) · [Windows Node22 reproducible script](../sims/lp2_lag5_boundary_alignment_sft.cjs).

### Implication for chain-step models

A public independent analysis proposes a chain-step representation in which each ciphertext rune is the previous rune plus a step from a flat, aperiodic 28-symbol stream ([Leo-Y-Zhang report](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md)). The lag-five result constrains that family: the original within-word difference stream contains **10,060 steps**; its zero bin has 63 occurrences and the 28 nonzero bins range from 313 to 397. If five successive within-word steps were independent draws from this exact empirical 29-bin distribution, cyclic convolution gives

\[
\Pr(S_5=0\bmod29)=0.03448273614900442,
\]

or **72.586** expected returns among 2,105 five-step windows. The uniform-i.i.d.-nonzero-step chain gives essentially the same baseline, \(21195/614656=0.03448270252\). The observed 104 returns therefore cannot be explained by a flat marginal step histogram alone: a chain-step explanation needs dependence in five-step sums (or a different mechanism). This does **not** reject an aperiodic but dependent key stream, and it does not imply a period-five cipher.

The simpler stationary cumulative-substitution family is separately excluded by [the original zero-symbol / all-secret gate](lp2-cumulative-difference-zero-symbol-gate.md); the eight printed AES-column keys tested as a 28-state chain are negative in [the source-grid chain gate](grid-chain28-step-key.md). The remaining chain route therefore needs an independently selected, position-varying step generator. The p05 5×5 square is a possible clue to a five-step dependency, but no source instruction yet connects it to this stream; do not use it to justify arbitrary fitted recurrences.

### Known-clear and encrypted LP1 controls

The correct clear-text control is the **six pages actually printed in clear Gematria Primus**, not the larger editorial Latin translation file. The transcription guide identifies LP1 pages p3, p8, p9, p10, p11 and p14 as the original clear-GP pages; the updated script asserts their respective counts: 31/40/55/49/38/18 words and 157/187/207/192/169/89 runes, totaling **231 page-fragment word records**, joined to **230 semantic words and 1,001 runes** across the p10→p11 ADHERENCE carry. Source: [transcription guide](../resources/transcriptions/README.md) and [Wulfic canonical transcription](../resources/transcriptions/lp1_wulfic_canonical.txt).

This held-out clear-GP control has **8 lag-five matches in 158 opportunities**. Under the same per-semantic-word exact-multiset/length/adjacent-equality null (2,000 training / 5,000 test, seed 0x51a5c0de), its null mean is **9.6780**, SD **2.7713**, z **−0.6055**; 3,935/5,000 nulls reach or exceed eight (add-one upper-tail **p = 3,936/5,001 = 0.7870**). It shows no positive lag-five excess.

A second cross-round control uses the eight remaining text-bearing LP1 pages, excluding the p0 alphabet chart and the six clear pages: p1, p2, p4, p5, p6, p7, p12 and p13. They contain **422 page-fragment word records**, joined to **419 semantic words and 1,612 runes** across the p4→p5, p5→p6 and p12→p13 carries. This encrypted-text control has **11 lag-five matches in 203 opportunities**; its conditional null mean is **9.3745**, SD **2.7839**, z **+0.5839**, with upper-tail empirical **p = 1,669/5,001 = 0.3337** (seed 0x1a2b3c4d). It also shows no positive excess.

Joint contrasts use independent LP2 and LP1 null draws and the preselected statistic \(Z_{\rm LP2}-Z_{\rm LP1}\). Against clear-GP text, the observed difference is **4.1024**; test-null mean **0.0306**, SD **1.4272**, and **15/5,000** null pairs reach it (add-one one-sided **p = 16/5,001 = 0.0032**). Against encrypted LP1 text, the observed difference is **2.9131**; test-null mean **0.0284**, SD **1.4305**, and **99/5,000** pairs reach it (add-one **p = 100/5,001 = 0.0200**). This retains a bounded LP2-specific ciphertext-order signal under the corrected original-word controls. Both LP1 controls are much smaller (**158 and 203** opportunities), with different texts and historical mechanisms; neither contrast constitutes an unknown-LP2 decoder. Per-page word fragments must be joined before simulating word-order nulls, exactly as on LP2.

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
- [Manual-only workflow](../.github/workflows/lag5-contiguous-echo-manual.yml); the previous 2,000/5,000 challenge and LP1 controls passed [GitHub Actions run 43585371902](https://github.com/FlareZ123/liber-primus/actions/runs/43585371902) **before** the LP1 cross-page word correction. The corrected 230/419-whole-word control statistics and contrasts were independently rerun with the same source and seeds; a new GitHub Actions run of the amended source has not yet been recorded. Agent 6's earlier manual [lag-five burst-copy workflow](../.github/workflows/lag5-burst-copy.yml) also passed [run 42769980860](https://github.com/FlareZ123/liber-primus/actions/runs/42769980860).
- Historical priors: [lag-five S-specific echo](lag5-rune-specific-echo.md), [lag-six echo](lag6-conditioned-echo.md), [collision repair](lag6-sparse-collision-repair-model.md).

**No unknown LP2 passage is deciphered by this finding.**
