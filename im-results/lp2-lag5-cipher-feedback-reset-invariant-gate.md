# Original LP2: all-secret five-step ciphertext-feedback reset decision

**14 November 2026, Agent 15; Director task #887.** **Finite original-cipher exclusion of one explicitly frozen GP29 state rule under native-GP-English plaintext.** It recovers no unknown LP2 plaintext or authentic creator key, and it cannot decide a universal reset scope.

## Source premise, candidate rule and unfitted invariant

The 2014 original pp0–55 contain **12,956 rune indices** across **55 rune-bearing pages**, **2,896 complete printed words**, and **nine source-visible illustrated top-level chapters** of lengths `[729,1145,1729,1903,1021,1433,1680,3008,308]`. Independent original-cipher research found **104 within-word five-apart equal-rune events** among 2,105 eligible positions and a conditional enrichment of five-apart echoes at printed word boundaries. That is a reason to consider a five-step state, but the author has supplied **no** instruction selecting the following model.

Freeze exactly one hypothetical ciphertext-feedback additive generator: within every segment chosen by the reset scope, for local `t≥5`,

```text
C[t] = (P[t] + K[segment,t mod 5] + C[t-5]) mod 29
```

The first five ciphertext runes of each segment are unconstrained initialization symbols. Every `K[segment,phase]` is a completely **unknown** GP29 constant. For all eligible sites, the observable delta `D[t]=(C[t]-C[t-5]) mod29` is just `P[t]` plus its class's constant rotation. This preserves the **exact pairwise equal-rune counts within every (segment, five-phase) class for every choice of all secret keys**, irrespective of the numbers' values. The model is bijective given a key and the initial five plaintext symbols; no collision-repair parameter, fitted prime phase, implicit F mask or guessed plaintext occurs.

For chapter- and page-reset candidates, grant **separate unrestricted five-symbol keys for every segment**. For word reset distinguish (i) one shared five-phase key reused on all words and (ii) separate completely secret five-phase key for each word. These are different key-equality assumptions.

## Full original and source-native positive comparison

The standalone [source-locked CommonJS test](../sims/lp2_lag5_cipher_feedback_reset_invariant_sft.cjs) asserts the complete original GP indices and all 2,896 words in their exact order, including every joined page carry. It encrypts **16 disjoint Shakespeare GP29 English windows**, each exactly 12,956 source-native rune indices, with deterministic prime-valued five-key plants `[2,3,5,7,11]`. These are positive checks, **not** trial keys for original LP2. The established source-calibrated encoder preserves the GP `ING`/`IO` orthography known from solved LP1. All planted ciphertexts re-decrypt exactly; every key-invariant class collision count exactly matches the original control plaintext count.

| State-reset/key model | Original eligible deltas | Comparable class pairs | Original GP29 class IoC | Minimum of 16 independently sourced English-plant IoCs |
| --- | ---: | ---: | ---: | ---: |
| **Nine illustrated chapters**, separate unknown 5-key per chapter | 12,911 | 2,332,072 | **0.034420035** | **0.058304375** |
| **55 physical pages**, separate unknown 5-key per page | 12,681 | 302,016 | **0.034438573** | **0.058953830** |
| **2,896 printed words**, one five-key shared across all words | 2,105 | 634,908 | **0.034362459** | **0.057017710** |
| **2,896 printed words**, independently unknown five-key per word | 2,105 | **92** | **0.065217391** | **0.021739130** |

All three sufficiently constrained original variants are essentially at the random GP29 baseline `1/29≈0.03448` and below every native-language control by a large gap. Their true synthetically generated controls remain recognizably nonuniform. Thus **no choice of any of their secret five-phase offsets can make their full original class distributions GP-native-English-like**. This is a necessary-condition rejection of the tested direct ciphertext-feedback mechanism for chapter/page resets and a common-key word reset, not an extrapolation to a different cipher.

The **independently keyed word-reset case is not excluded** by this statistic: only 92 comparable within-word five-phase pairs survive, with 6 equal pairs. Worse, 10,851/12,956 original rune sites fall in the first five positions of their respective words and are unconstrained IV sites in this model. Recovering their plaintext would demand genuinely source-selected per-word initialization and keys, not another fitted phase search. The control row spans a very broad expected range (0.0217–0.1087), so its single original IoC is not evidence for a word-reset mechanism.

## Research fork

This exact five-step ciphertext-feedback family **does not distinguish whether the real manuscript resets at the nine illustrated chapters or physical pages**: both hypotheses fail their key-independent plaintext invariant. The source-boundary clue remains available for a different, genuinely selected nonlinear/stateful cipher. Do **not** add undocumented collision repair, varying lag, secret per-symbol pads or alphabet remaps to salvage this model without independent original instructions. The test does not cover another language, compressed plaintext, further encryption layers or a different state update.

The single-file test ran successfully on **Windows/Node.js 22** against the current canonical original corpus: [verified Actions run 43603927151](https://github.com/FlareZ123/liber-primus/actions/runs/43603927151), source commit [fac0ff8](https://github.com/FlareZ123/liber-primus/commit/fac0ff8bb801afb6e0867545557cbe53751fc093). It returns the complete pair counts, 16 independent control minimums and all positive inverse assertions. **No unknown original LP2 plaintext, creator key or destination was recovered.**
