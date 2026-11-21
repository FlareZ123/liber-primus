# Terminal p22/p32 exact-252 quotient recipient: direct inverse excluded

**21 November 2026 | Agent31 | Intermediate, not plaintext.** An original-image-constrained two-page receiver for the newly source-connected p50 polynomial quotient has a uniquely matching rune count, but its four fixed zero-phase additive readings are nonlinguistic. An additional key-independent equality-pattern test excludes copying the quotient into these pages under a single secret fixed 29-symbol alphabet permutation. No unknown-page plaintext, key, authored page pairing, or general cipher was recovered.

## The specific human-visible receiver hypothesis

The original LP2 p22 scan (archive image 39.jpg) ends a section at a corpse and sword illustration with a red 13-dot marker; the original p32 scan (49.jpg) ends a later section at a blurred tree illustration with the same large red punctuation. Their canonical GP29 ciphertext counts are exactly **131 and 121**, respectively. Among all unordered pairs of the 55 original unsolved rune-bearing LP2 pages, they are the **only pair summing to 252**. Both are also among the nine actual illustrated/marked section-ending pages **[2,7,14,22,26,32,39,53,55]**.

A different source-derived result, established in [the p23/p39 factor report](lp2-p23-red-midpoint-p50-factor-bridge.md), identifies the original p23 midpoint red triple **[23,6,10]** and p39 page-midpoint red triple **[27,5,15]** as quadratic GF29 factors of the printed p50 table under conditional base60. Their product is **[12,16,7,24,5]** in ascending polynomial order. Dividing the exact 256 original base60 integer residues modulo29, in descending coefficient order, by the reversed product yields a **252-symbol** quotient starting **[0,23,10,15,28,2,3,4,20,15,4,6]** and exactly zero four-symbol remainder. The selected source factors are verified from the original page indices in the SFT.

This motivates the bounded receiver “252 quotient symbols correspond to the 131+121 ciphertext runes on the two section-ending pages.” The page pair and its length association were noticed **after** quotient252 was already known. The art does not provide a signed instruction to concatenate the pages or use an additive pad. The experiment below therefore tests the straightforward reading, without promoting the numerical match to an author-authenticated key.

## Frozen original-rune test

Apply one untouched quotient value to each original ciphertext rune, with page order p22|p32 or p32|p22, and the two conventional additive signs, all with index0 at the first rune. Every transformation is exactly invertible, and every complete 252-rune output forward-reencodes the original input. Nothing is fitted to candidate plaintext or rephased.

| Page order | P=C−Q IoC | P=C+Q IoC |
| :-- | --: | --: |
| p22|p32 | 0.034085878707 | 0.037880225131 |
| p32|p22 | 0.034275596029 | 0.032346803263 |

The original combined source has IoC **0.036267627901**, compared with **about 0.062710** for the authentic clear p57 original. All four outputs are rune-like noise; the first p22|p32 minus read begins **NGAEFLEORTHEAJOIACLRAUF…**. The authentic p57 95-rune cleartext was independently planted as a 95-rune synthetic ciphertext using the same quotient and decoded **95/95**; that is an implementation positive control only.

The much broader hypothesis “the quotient is the two pages under an unknown fixed GP29 letter permutation” has a direct necessary-condition test independent of key choice: for every pair of positions, equality of quotient symbols must match equality of ciphertext symbols. The exact original quotient and page pair have **2,224**, **2,232**, **2,234**, and **2,218** disagreeing position pairs respectively over the two page orders and both quotient directions. A fixed 29-symbol substitution, however chosen, requires zero disagreements. A page-dependent alphabet, transposition, stateful encryption or additional hidden layer is not covered by this test.

## Decision

**Retire the direct terminal-page quotient-as-rune-pad and any single fixed-alphabet copy of the 252 quotient into those two original pages.** Preserve the original factorization and the conditional, unique 131+121 cardinality observation as navigation hypotheses only. A next investigation needs an independently source-selected recipient and explicit reversible operation; do not phase-search the failed pad or rescore the same coincidence.

[Read-only Windows Node22 CommonJS SFT](../sims/lp2_p22_p32_q252_terminal_original_sft.cjs) uses exactly the canonical original two JSON sources, asserts the unique page pair, reconstructs the original source factor and quotient, reproduces all four original readouts and equality-pattern impossibilities, and completes an independently clear p57 positive control.
