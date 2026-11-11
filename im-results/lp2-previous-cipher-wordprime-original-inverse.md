# Previous-ciphertext-word GP-prime direction: exact causal full-stream inverse

**Status (11 November 2026):** bounded negative for a fully reversible, source-motivated **word-to-next-word** cipher family. The exact original ciphertext decodes to nonlinguistic rune statistics in all four frozen variants. Four independently encoded native-GP controls round-trip all **12,956** runes. This report establishes no unknown plaintext, authentic key, or destination.

## Why this operation is different from existing word self-sum tests

The original LP1 *Some Wisdom* elevates primes and the totient, while the 2013 `0_wisdom` word-to-number map uses literal GP prime-weight sums; the independently signed 2016 statement calls the manuscript's words a map and their numbers a direction. A human solver might read the sum of one printed word to move through the **next**. This yields a causal, fully lossless cipher without solving a nonlinear self-keyed equation. It is distinct from the [previous plaintext-word-self-sum gate](lp2_plaintext_wordsum_progressive_gate.md), in which each word's key must be inferred by exhausting 29 possible hidden plaintext sums.

The historical sources do **not** prescribe this exact preceding-word operation, sign, shift or within-word clock. The test chooses one simple finite mechanism and does not attempt to rescue it with tuned phases.

## One frozen fully reversible mechanism

Use the exact original complete word parser, which preserves 32 cross-page words, on physical LP2 pp0–55 (runeless p50 excluded). Let `C[w,j]` and `P[w,j]` be zero-based GP29 runes, `p[r]` the published GP prime for rune `r`, and `K[0]=0`. Compute the next-word key from **the previous ciphertext word**:

```text
K[w] = (sum_j p[C[w−1,j]]) mod 29           for w > 0
P[w,j] = (C[w,j] + sign*K[w]*factor(j)) mod29
C[w,j] = (P[w,j] - sign*K[w]*factor(j)) mod29
sign ∈ {−1,+1}
factor(j) ∈ {1, j+1}
```

The recovered plaintext of word `w` never affects the next key: both encoder and decoder use already available ciphertext word `w−1`. Thus every one of the four models is an exact bijection on every source-fixed word stream. Neither an invented secret key nor a lost side channel is needed. The initial empty word has sum zero, so there is no hidden fitted seed.

## Original result and native-language planted control

Construct a **12,956-rune** native GP control from the archived Gibran *The Prophet* reference using the established greedy historical GP normalization, then cut that stream at the exact 2,896 observed original ciphertext word lengths. This controls the cipher's input capacity and segmentation; the control's **word boundaries are synthetic** and cannot authenticate a literary plaintext source. The native GP rune IoC is **0.060420704867**, with **308/10,060** within-word adjacent equal pairs.

The original 12,956-rune LP2 ciphertext has IoC **0.034478397865** and **63/10,060** within-word adjacent equal pairs. For each model, produce a native-text **ciphertext** with the same source-prime feedback rule, recover that native plaintext exactly, and then decode and exactly re-encode the actual manuscript. An incorrect GP-ordinal previous-word key cannot recover the planted text.

| Previous ciphertext prime-sum direction | GP-native plant *ciphertext* IoC | Plant ciphertext within-word repeats | Original *decrypted* IoC | Original decrypted within-word repeats |
| --- | ---: | ---: | ---: | ---: |
| sign −1, constant factor1 | 0.03448909 | 308 | 0.03449000 | 63 |
| sign −1, progressive factor j+1 | 0.03445554 | 385 | 0.03449377 | 359 |
| sign +1, constant factor1 | 0.03448887 | 308 | 0.03448032 | 63 |
| sign +1, progressive factor j+1 | 0.03451640 | 369 | 0.03449871 | 333 |

**Important mechanistic discrimination:** all four native-English plants yield ciphertext global IoCs almost indistinguishable from the original. That single diagnostic **cannot reject this architecture**. However the constant-shift model preserves within-word runic doublets *exactly*, so its native control requires 308 rather than the original 63 (the exact wordwise-equality obstruction). The progressive shift does alter doublets, but both native controls **produce 369–385**, far above the original 63. Meanwhile neither progressive original inverse restores the native-GP IoC: both remain at **0.03449** despite within-word repeat counts moving toward language-like rates. A successful mechanism must jointly explain the suppressed ciphertext doublets and restore a linguistic plaintext register. These four variants do neither on the original.

The original heldout claim is limited to **fixed operation/parameters**. It does not exclude ciphertext-dependent moving alphabets, a different use of the GP sums, a third state, nonlinear transduction, omitted original word separators, different language registers, or keys selected by genuine historical material. Do not broaden into arbitrary lag/sign/seed searches without an independent instruction.

## Reproduction and action

[No-dependency Node.js SFT](../sims/lp2_previous_cipher_wordprime_sft.cjs) loads the canonical corpus, prints all original/plant results, asserts the original counts, performs **four exact original 12,956-rune re-encryptions**, proves four exact plant recoveries, and verifies wrong-source mismatch. It was executed successfully in [manual Actions run 43039420982](https://github.com/FlareZ123/liber-primus/actions/runs/43039420982), dispatching only the dedicated `prior-word-prime` selector of an existing manually triggered workflow.

**Decision:** retire only the simple previous-cipher-word prime-sum Caesar/progressive-shift interpretation. This experiment shows why almost-uniform LP2 IoC alone is not a decisive attack score: one may reproduce it from authentic GP prose while entirely missing the manuscript's repeat suppression. The next credible decoder needs an independently specified transition that satisfies both observations.
