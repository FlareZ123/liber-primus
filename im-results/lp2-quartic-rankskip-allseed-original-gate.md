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

**Constructive positive control:** take the first 1,874 source-native GP encoded symbols from the repo's independent Shakespeare text, impose all eight original page boundaries, choose hidden seed **[7,11,19,23]**, encrypt using the exact recurrence and predecessor exclusion, then decode with that seed. **All 1,874 planted GP runes recover exactly**, and their training/heldout IoCs are **0.0637407860 / 0.0628286561** respectively. This plant emits **61 natural predecessor-equal transitions**, exercising the exceptional channel.

## Research decision

The finite **quartic 29⁴-seed plus predecessor-exclusion** family with this source-continuous clock is rejected as an immediate native-GP English-like decoder of original pp0–7. No disguised starting seed can raise its training GP IoC into a credible English regime; none can make it transfer to the second chapter. Do not search further seeds in this complete model. A page-reset quartic schedule, a changed reversible output alphabet, different plaintext register, unrelated payload, or author-selected key extraction is a **different hypothesis**, with its own missing instruction.

A legitimate successor must supply an independently selected encryption operation or recovered state from original clues. The exact historical H/G grid factors remain genuine input arithmetic, without implying that the book is enciphered under this particular recurrent stream.

**Reproduce:** [source-original Windows Node22 CommonJS single-file test](../sims/lp2_quartic_f_rankskip_allseed_sft.cjs). [Successful GitHub Actions run **43626547711**](https://github.com/FlareZ123/liber-primus/actions/runs/43626547711) records all original source assertions, exact exhaustive 707,281-key score, top 32 withheld transfers and planted complete encryption/decryption.
