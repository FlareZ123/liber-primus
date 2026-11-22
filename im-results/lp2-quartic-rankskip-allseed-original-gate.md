# Historical H/G quartic × nonlinear GP29 predecessor exclusion: complete 29⁴-key original inverse

**14 November 2026, Agent 11. Classification: full-key-space source-motivated direct decipherment negative, with a complete English-message positive.** This finite experiment yields no unknown LP2 plaintext, author-selected cipher, authentic key or destination. It does **not** erase the independently demonstrated historical H/G factorization of the 256-byte grid.

## Human clue, fixed operation and strongest unsupported step

Cicada's signature-verified 2013 TCP challenge explicitly prints \`BASE29 3301 = 3QO\` (GP indices [3,26,24]). The original LP2 p39 uniquely red-inscribed triple is [27,5,15]. Both yield distinct polynomial factors of the original numeric table over GF29 in the source-derived ascending-GP-index convention, whose product is the original quartic \`g(X)=X^4+28X^3+13X^2+9X+14\`. Separately, actual unsolved pages suppress immediately repeated runes. It is therefore affordable to check an unknown-seed **four-register recurrence** driven by the old factors while using a **reversible predecessor-exclusion** code to accommodate the conspicuous anti-doublets.

One serious missing premise remains: neither the signed 2013 message nor the red inscription tells a reader to use the quartic as a running mask for an LP2 predecessor-exclusion channel. The **source factor**, a candidate cipher **structure**, and the lack of plaintext **must be distinguished**.

Use a continuously advancing field-register stream \`K[i]\`, regardless of physical page boundary. Every initial seed \`K[0..3] in GF29⁴\` is allowed. Its recurrence is exactly

\`\`\`text
K[i+4] = -14*K[i] - 9*K[i+1] - 13*K[i+2] - 28*K[i+3] (mod 29)
\`\`\`

At every physical page's first rune, let \`U[i]=C[i]\`. At all other positions the **reversible 29-output predecessor-exclusion rule with marker zero** is

\`\`\`text
U[i] = 0                                  when C[i] == C[i-1]
U[i] = 1 + C[i] - (C[i] > C[i-1])      otherwise
P[i] = U[i] - K[i]                         (mod 29)
\`\`\`

The inverse adds \`K[i]\` to \`P[i]\` modulo29 to get \`U[i]\`, then emits the previous ciphertext rune if \`U[i]=0\`; otherwise emits \`U[i]-1\`-th value in the sorted list of the 28 glyphs *excluding* the previous output. The rule is bijective at each step, carries full GP29 information and does not require guessing 86 exceptional symbols. This differs from prior *additive-only quartic LFSR* inverses and fixed page/phase predecessor-rank alphabet models. It is an exact candidate cipher, albeit not authenticated.

## Entire initial-key search, independent physical-chapter prediction

The SFT takes **unchanged** physical p0–7 rune sequences from the original GP29 corpus and asserts their exact physical lengths \`[262,266,201,217,261,263,196,208]\`, giving the first visible chapter p0–2 **729** runes and next p3–7 **1,145**. It also verifies the field recurrence by exact code generation. It constructs four one-hot basis streams, then exhausts **every 29⁴=707,281 initial seed** once. Only the first 729 ciphertext runes select a seed, using pooled native-GP plaintext index of coincidence. The complete next chapter is untouched by seed selection. The top 32 training seeds receive held-out IoC and literal GP opening checks; no optimization is applied to the later chapter.

| Source-original prediction | Result |
| --- | ---: |
| Seeds tested in total | **707,281 / 707,281** |
| First-chapter original direct inverse-rank IoC (before key) | **0.0353562761** |
| Largest 729-rune native-GP IoC after any four-state key | **0.0368297683** |
| One highest-training seed [K0,K1,K2,K3] | **[20,8,26,5]** |
| Seeds achieving first-chapter IoC ≥0.05 | **0** |
| Highest second-chapter IoC among the **32** frozen training leaders | **0.0350795493** |

The score is sharply incompatible with a direct native-GP prose decoder for this fixed original-page operation and global clock. Positive native English strongly separates itself from this near-uniform output.

**Constructive complete-search positive:** take the first 1,874 source-native GP encoded symbols from the repo's independent Shakespeare text, impose all eight original page boundaries, choose hidden seed **[7,11,19,23]**, encrypt using the exact recurrence and predecessor exclusion, then run the **identical exhaustive 707,281-key original-search algorithm** on only its first 729 encrypted symbols. **The generating key is uniquely recovered at rank 1**, with precisely **1/707,281** candidates meeting the plant's 0.05 training-IoC threshold; the plaintext roundtrip recovers **all 1,874/1,874 GP runes**. The genuine plant's training/heldout IoCs are **0.0637407860 / 0.0628286561** respectively. This plant emits **61 natural predecessor-equal transitions**, exercising the exceptional channel. The test therefore demonstrates practical **key discovery** within the proposed cipher family, independently of knowing the planted seed beforehand.

## Source-continuous predecessor state: independent full-key test

The manuscript's anti-repeat mechanism extends across printed word boundaries, and source-runic words sometimes cross physical page boundaries. The original page-reset predecessor is therefore **not the only plausible causal scope**. A separate exact [book-continuous SFT](../sims/lp2_quartic_f_rankskip_bookcontinuous_sft.cjs) invokes the same code with **no predecessor reset at physical page boundaries**: every following rune uses the previous actual manuscript rune, including p0→p1, p1→p2, … p6→p7. The quartic key clock remains uninterrupted as before. No other operation, seed, phase, length, orientation or scoring parameter changes.

**Every one of the 707,281 candidate keys** was again evaluated against the source-original first 729 runes. The maximum training IoC remains **0.0368297683112**, reached by seed **[20,8,26,5]**, and **0** seeds reach the predeclared 0.05 threshold. The strongest frozen top-32 heldout IoC across pp3–7 is **0.0350719149846** (the page-IV variant had 0.0350795492717). These near-identical, nonlinguistic outcomes are expected since only the few physical-page leaders differ, but the second model is independently run rather than assumed to be equivalent.

On a **separately reencrypted book-continuous native-GP Shakespeare plant**, the full exhaustive algorithm again uniquely identifies the true four-symbol initial seed **[7,11,19,23]** at rank **1/707,281**, and decodes **1,874/1,874** planted runes. Its training/heldout IoCs are **0.0637407859630 / 0.0628286560601**. [Passing Windows Node22 original-input CI run 43628505167](https://github.com/FlareZ123/liber-primus/actions/runs/43628505167) contains the complete seed and heldout results for this independent feedback-scope challenge.

**Decision update:** both the physical-page-IV and genuinely book-continuous predecessor versions are exhausted. Further initial-seed fitting, first-page shifts or GPT-based short-text guesses do not repair either model. A different **source-selected** register/cipher operation is now required.

## Research decision

The finite **quartic 29⁴-seed plus predecessor-exclusion** family with this source-continuous clock is rejected as an immediate native-GP English-like decoder of original pp0–7. No disguised starting seed can raise its training GP IoC into a credible English regime; none can make it transfer to the second chapter. Do not search further seeds in this complete model. A page-reset quartic schedule, a changed reversible output alphabet, different plaintext register, unrelated payload, or author-selected key extraction is a **different hypothesis**, with its own missing instruction.

A legitimate successor must supply an independently selected encryption operation or recovered state from original clues. The exact historical H/G grid factors remain genuine input arithmetic, without implying that the book is enciphered under this particular recurrent stream.

**Reproduce:** [source-original Windows Node22 CommonJS single-file test](../sims/lp2_quartic_f_rankskip_allseed_sft.cjs). [Final successful GitHub Actions run **43627821964**](https://github.com/FlareZ123/liber-primus/actions/runs/43627821964) records all original source assertions, the exhaustive 707,281-key original score, top32 frozen heldout transfers, and the **separate exhaustive 707,281-key plant retrieval** (unique true-key rank 1). The earlier original-only [run 43626547711](https://github.com/FlareZ123/liber-primus/actions/runs/43626547711) also passed.
