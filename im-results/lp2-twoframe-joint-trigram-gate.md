# Two-frame additive-pad elimination: p0–2 versus p23–26

**Decision (#3282, Agent22, 28 November 2026).** The exact joint GP29 trigram inverse does not recover native or original plaintext reliably. Its marginal likelihood distinguishes five planted common-pad examples from six independent/misaligned-pad examples in this small calibration, but the frozen original pair has a likelihood in the rival range. Do not extend this alignment to a fitted pad generator; no authentic common pad or plaintext was established.

## Source-selected alignment and assumptions

Use all 716 black-body runes after p0's 13-red-rune title to p2's terminal 13-dot mark, aligned at the first black rune after p23's 16-red-rune title through p26's terminal 13-dot mark (1,005 body runes). Both are independently framed by a red heading and terminal 13-dot mark. No offset search, page reset, or printed-word assumption. No source establishes a shared pad; this tests that hypothesis. The model is ordinary GP29 addition at every rune, including F, without transparent F holds. The unequal second interval's 289-rune tail has no paired observation; the raw file preserves it untouched. Without an independently specified pad generator its inverse is not identifiable. Earlier #3212 sought an explicitly related cross-chapter key; #3046 pooled a shared secret alphabet with independent q8 vectors. Neither is this additive elimination.

## Exact inverse and calibration

Let d_i=c_i-e_i mod29, x_i and y_i=x_i-d_i mod29. Each candidate x path defines y and k_i=c_i-x_i. Fit a smoothed trigram Markov model using 306,590 GP-normalized Emerson runes and 1,444 runes from the seven nonheld solved-native records (native weight32). Hold the 778-rune source-corrected KOAN1 and 755-rune DIVINITY separately, plus disjoint Gibran/Shakespeare windows. The SFT pins every input blob, corrects the two external KOAN WHAT->WHO transcription pairs, specifies greedy word-local literary normalization and deterministic random pads. No word positions are supplied.

Viterbi state (x_{i-1},x_i) has 841 states and 29 incoming transitions. Pair transition weight is T(x_i|x_{i-2},x_{i-1})T(y_i|y_{i-2},y_{i-1}). Exact sum-product on the same lattice gives log Z=log Pr(d|shared pad and independent language draws). Under two independent uniform additive pads, Pr(d)=29^-n, so log BF/n=(log Z+n log29)/n. Best-path posterior surprisal is (log Z-best log joint)/log2; this is not Shannon entropy or a count of language-valid messages. Full re-encryption is automatic for every path and not evidence of correctness.

| Calibration | Cases | Exact shared-pad key/rune accuracy | log BF/n (nats) |
|---|---:|---:|---:|
| Native KOAN1 vs DIVINITY, same pad | 1 | 161/716 (22.49%) | +0.034398 |
| Independent literary donors, same pad | 4 | 120–180/716 (16.76–25.14%) | +0.018473 to +0.029144 |
| Independent pads | 5 | not a valid shared key | -0.043797 to -0.023665 |
| One-rune circular misalignment, same pad | 1 | not a valid aligned shared key | -0.030318 |
| Original p0–2 vs p23–26 | 1 | unknown | -0.029806 |

The preregistered useful-control gate requires >=70% accuracy in both lanes of every same-pad control and separation of shared/rival marginal scores. Accuracy fails for all five. Even when true D is supplied, the highest-scoring pair outperforms the real pair in the model while recovering little truth. This exposes a mechanism-specific false-prose failure: plausible local words and exact replay do not authenticate the key. The best path's posterior surprisal is 423–455 bits on shared controls; original 434.74 bits. These probabilities are conditional on the specified small model and are not calibrated confidence in the historical cipher.

For diagnostic comparison only, the frozen original alignment was evaluated despite the failed recovery gate; do not treat this as authorized original plaintext recovery or a successful held-out test. Its log BF/n and best-path log score/n (-3.817965) are rival-like, neither full output reads coherently, and 1,432 overlap cipher symbols replay exactly. Both full candidate rune arrays, the implied 716-rune pad, and all 289 unmatched ciphertext runes are preserved in the raw output. No continuation was attempted because no source-derived pad generator is present. The test does not exclude all reuse models, different clocks, language models, or other pairs.

## Reproduction

- [SFT](../sims/lp2_twoframe_joint_trigram_sft.cjs): run from repository root with Node; output is JSON.
- [Executed output](lp2-twoframe-joint-trigram-output.json): numerical core actually executed in connected JavaScript V8. Standalone Node hash-check wrapper not independently executed because local Git DNS was unavailable.
- Source: [#3282](https://github.com/FlareZ123/liber-primus/issues/3282), [canonical LP2 corpus and ink annotations](../resources/liber-primus/), [native controls](../resources/external/relikd-solved-gp29-native-v1.json).

A future attempt needs either a source-selected common-pad relation or a substantially more discriminating receiver that first recovers independently held native pairs; merely scoring more alignments is not justified by this result.
