# LP2 cross-word anti-repeat: evidence that ciphertext word boundaries are coupled

**Evidence class:** established conditional structural observation and a bounded cryptographic model exclusion; **no plaintext or key recovered**. Source: [cross_word_repeat_invariant.cjs](../sims/cross_word_repeat_invariant.cjs). Full seeded on-demand [successful Actions run 42745733143](https://github.com/FlareZ123/liber-primus/actions/runs/42745733143). A distinct cross-word structural constraint is established without making assumptions about source language, spellings or the cipher alphabet.

## The test

Hypothesis: independently formed ciphertext words are subsequently placed in their existing order without special ciphertext-end/next-start coordination. If the words were order-exchangeable within their logical scope, how many adjacent word boundaries would have the *same rune* on each side?

Use canonical whole words in the unaltered Wulfic master transcription, with 9 unsolved LP2 sections, 2,896 words and 12,956 rune positions. Delimiters -, ., &, $ and § separate words or stronger text units. Printed line slash / and physical page % never split a lexical word. Current source corpus test confirms 2,896 words and 32 physical page-crossing words, so no synthetic page-start words are added.

For section s with N words, define each word's first and last rune as f_i and l_i. The observed number of cross-word repeated-rune boundaries is

    H_s = sum_{i=1}^{N-1} 1[l_i = f_(i+1)].

Under a uniformly random order of the **existing whole words within that section**, the exact conditional mean is

    E[H_s] = [sum_r (#last=r)*(#first=r) - (#words with first=last)] / N.

Reason: each ordered pair of two distinct words becomes adjacent with probability 1/N, while a word cannot follow itself in an ordinary random permutation. This null preserves every ciphertext rune, complete word pattern, all word lengths, and the source's section inventories. A separate test shuffles words only among positions of the **same word length**, preserving the exact full word-length sequence, and stricter tests restrict swaps to punctuation-delimited clauses.

## Key empirical evidence

| Position class | Eligible consecutive-rune pairs | Actual repeated rune pairs | Actual rate |
| --- | ---: | ---: | ---: |
| **Inside a canonical word** | 10,060 | 63 | 0.62624% |
| **Between consecutive words within a section** | 2,887 | **23** | **0.79667%** |
| **Between consecutive words in one clause** | 2,728 | **22** | **0.80645%** |

All 86 observed neighboring equal-rune pairs in the section-continuous rune stream decompose into **63 inside words** and **23 across words**. This is consistent with the existing independently reported 86/12,901 repeated within-page rune pairs; the section stream includes more consecutive pairs because it also spans physical page breaks, and none of those additional pairs repeats. The measured within-word and across-word rates are comparably suppressed. A Fisher exact comparison of those two observed proportions yields two-sided p≈0.302, providing no evidence of a different anti-repeat rate on physical word boundaries.

If the actual words are shuffled within sections, the exact expected repeat count is **99.806** instead of the observed **23**. For the narrower clause-only boundaries, the exact expected repeat count under clause-local independent ordering is **91.477** instead of observed **22**.

The completed GitHub Actions implementation performed 5,000 randomized books under *each* of four conditional nulls:

| Exact words preserved, shuffle restriction | Actual matches | Null mean | Null SD | Smallest of 5,000 nulls | Nulls at or below actual | One-sided empirical p resolution |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Arbitrary permutation inside each section | 23 | 99.625 | 9.727 | 67 | **0** | ≤0.000200 |
| Only swap words of equal length inside each section | 23 | 99.445 | 9.716 | 62 | **0** | ≤0.000200 |
| Arbitrary permutation inside each clause | 22 | 91.409 | 9.257 | 59 | **0** | ≤0.000200 |
| Only swap words of equal length inside each clause | 22 | 80.093 | 8.282 | 49 | **0** | ≤0.000200 |

The 5,000 draws per null and source are explicitly seeded by the reproduction code. The permutation p-values use the standard plus-one Monte Carlo estimator. The exact conditional mean is derived analytically for the unconstrained word-order model; the equal-length constrained null's mean is estimated by simulation.

**Unencrypted-language control:** 250 known-plaintext rune words from LP1 segments 2, 4, 6 and LP2 *PARABLE* segment 17 have 9 repeated boundaries among 246 word transitions. Their section-conditional exact shuffle expectation is 9.468, and the corresponding 5,000-null mean is 9.480 (SD 2.822), without unusual depletion. This rules out interpreting the cipher's strong cross-word depletion as merely the normal rate in this solved-text corpus. It is not a proof about all plausible plaintext languages.

## Mechanistic interpretation

The ciphertext has approximately the **same unusually low adjacent-rune repeat frequency** across word boundaries as inside words. The depletion survives nulls retaining every observed word's entire content, every section or clause's inventory, all section/clause separators, and even the exact word-length order.

This **directly rejects the specific model** in which the observed whole ciphertext words are created independently of their neighbors' endpoint runes and are then arranged in exchangeable order within the tested scope. A generator that forbids or strongly discourages matching adjacent ciphertext runes at the whole-stream level, or a cipher carrying state across word boundaries, is consistent with the observation. Purposeful selection/order of ciphertext words based on endpoints can also explain it. It is possible for a word-by-word encryption algorithm to coordinate endpoints explicitly while resetting most other state. The data do not prove a unique global filter, a given reject probability, or an encryption primitive.

**Cryptanalytic consequence:** a candidate independent-per-word mapping should be tested for the *cross-word endpoint coupling*. Preserving word-length signatures or within-word anti-repeat alone is insufficient. A credible mechanistic solution needs to generate the observed near-continuous suppression across word boundaries **while also recovering meaningful plaintext on unseen words**. The no-repeat rule alone is far too weak to decrypt the manuscript.

The result is preserved as a structural constraint relevant to the complete solution, not as a proposed plaintext fragment.
