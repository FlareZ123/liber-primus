# First-order plaintext-feedback affine recurrence: full direct inversion

**Classification:** bounded negative cryptanalytic experiment, Agent 26, 2026-11-10. **No LP2 plaintext, key or destination recovered.**

## Attack and exact coverage

The existing ciphertext-history feedback attacks do not cover the inverse of a recurrence that depends on the previously **recovered plaintext**. Here we exhaustively search a reversible symbol-by-symbol affine recurrence:

C[i] = A*P[i] + B*P[i-1] + D (mod 29), A nonzero.

Because 29 is prime, multiplying the plaintext alphabet by A is an IoC-preserving bijection. The equivalent decoder for U[i]=A*P[i] is U[i]=C[i]+b*U[i-1]+a with b=-B/A and a=-D. Let X[i]=C[i]+b*X[i-1], with X[-1]=0. For b other than 1, every constant intercept and fixed initial state contributes k*b^(i+1) plus a constant to X[i]. For b=1 the free term is k*(i+1) plus a constant. Constant shifts preserve IoC. The b=0 family collapses to the raw ciphertext. This reduces the entire direct IoC family to **1+28*29=813 classes** per reset mode.

We check every class without learning a separate parameter for any individual page or word. Three candidate resets are covered: (1) a single integrated state over all 12,956 runes; (2) reset at each of 55 physical rune-bearing pages; (3) reset at each of 2,896 complete rune words, preserving words continuing across page/line breaks.

## Observed and authentic control

| Reset policy | Winning b | Winning amplitude k | Best LP2 decoded IoC |
|---|---:|---:|---:|
| Global continuous | 14 | 21 | **0.034546425** |
| Each page | 6 | 22 | **0.034548975** |
| Each rune word | 3 | 24 | **0.034547247** |

The 29-rune uniform reference is **1/29 = 0.034482759**. No configuration yields the high symbol concentration characteristic of known GP-English. The maximum is within approximately 0.000067 of uniform, even after all 2,439 tested profiles.

A positive control uses *authentic previously decoded* LP1 rune plaintext from the canonical Wulfic transcription: sections 2, 4 and 6, 157+755+89 = **1,001 runes**. It is encrypted at the global/page/word reset granularity by the hypothesized mechanism with b=17 and a=5. The scanner searches the full 813 classes independently and ranks the correct **b=17, k=13** first in **all three modes**. The maximum decoded IoC is **0.059294705** in all modes, equal to the true source rune IoC. Direct decryption under b=17,a=5 also recovers every one of the 1,001 runes exactly, with strict assertions.

The control demonstrates power against the exact direct mechanism using genuine LP1-language GP symbols. It does not assume a particular English dictionary or external crib in scoring the unsolved text.

## Scope and reproducibility

This is evidence against direct LP1-like, one-rune-per-symbol **fixed first-order plaintext-feedback affine enciphering** under any of the three fixed reset models. It does not exclude per-word randomized initial seeds, a changing coefficient, key-dependent skips, symbol insertion/deletion, non-English intermediate text, arbitrary nonlinear recurrences, or additional encryption layers. Even one unmodeled skipped ciphertext symbol can desynchronize an integrated decoder. We make no stronger statement about the unknown cipher.

Run the standalone [CommonJS reproducer](../sims/plaintext_feedback_recurrence.cjs) with Node.js 22. It requires only the committed corpus, master LP2 transcription and solved LP1 rune transcription, verifies the 55-page/2,896-word/12,956-rune counts and authentic source plant, and emits full JSON results. No new scheduled workflow was added.

Related previous work: [ciphertext-history affine-feedback](affine-feedback-through-three-lags.md), which is a different recurrence.
