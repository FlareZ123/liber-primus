# Cross-clue AES/ChaCha with arbitrary unknown outer 29-rune permutation

**Evidence class: reproduced bounded negative; no plaintext or cipher key recovered. Agent 45, 2026-11-10.**

## Inversion architecture

This experiment takes two **independently evidenced** numerical sources and explicitly allows an unknown ciphertext alphabet. LP2's four-by-four page-15 Fibonacci-prime number square supplies one of four candidate **128-bit IVs** (row/centre-spiral reading × raw integer/complement to 3301, reduced bytewise modulo 256). The corrected 32×8 base-60 table supplies **eight distinct 32-byte vertical column keys** for AES-256-CTR or ChaCha20, one per contiguous text section. Exactly eight groups are obtained by merging the original two-word bridge with its following section; section lengths are [729,1145,1729,1903,1021,1524,1589,3316], preserving 12,956 original unsolved runes. Page boundaries within a section do not reset the stream.

Cipher model under test: C[i] = sigma((P[i] + sign · K[i]) mod 29), with **one unknown bijection sigma** of the entire 29-symbol outer ciphertext alphabet. The established direct GP index-of-coincidence approach in [the earlier cross-clue result](grid-square-iv-keys.md) cannot test this variant without knowing sigma. Here, the score is Agent 34's **permutation-invariant lag-2 through lag-16 equality composite log likelihood** in [the reusable sieve](../sims/equality_pad_scan.cjs). It asks whether C[i] = C[i-lag] matches the expected distribution of GP-English plaintext differences given candidate key differences. The source model is trained on separate Shakespeare GP text with an 8% uniform noise mixture. Adjacent rune equality (lag 1) is deliberately excluded.

The finite candidate space searches **four source-derived IVs × 16 common algorithm/key-direction/key-byte-reduction/arithmetic-sign settings × all 8! one-to-one column-to-section assignments**. The globally optimal key assignment is found by exact dynamic programming for each of the 64 source-derived IV/mode combinations.

**Avoiding post-selection:** key/IV/mode assignments are selected **only using the first 800 runes of each of the eight sections**. Once selected, the exact assignment and IV are evaluated without refitting on all remaining section tails (lengths 0,345,929,1103,221,724,789,2516). The held-out likelihood is a composite score, with correlated overlapping lag events, so it is calibrated by matched full searches rather than interpreted as an independent analytic p-value.

## Executed results

**Successful opt-in GitHub Actions [run 42754285658](https://github.com/FlareZ123/liber-primus/actions/runs/42754285658)**, Node 22:

| Input | Selected training score | Locked held-out score |
|---|---:|---:|
| Actual LP2 best of all source-derived candidates | −13,991.34822 | **−14,769.48271** |
| Mean best over 40 matched four-random-IV null searches | −13,988.36046 | −14,777.45195 |
| Highest null search (each dimension independently maximized over trials) | −13,977.86842 | −14,757.24319 |

Search-corrected empirical upper-tail p on training is **0.82927**. Locked held-out upper-tail p is **0.19512**. The apparently better-than-null-mean held-out score is well within this finite null range. Actual selected setting: **spiral printed IV**, AES-256-CTR, reversed 256-bit keys, byte%29, sign −1, column assignment **[3,1,0,2,7,6,5,4]**. The absence of an associated independently recovered plaintext or another verifying property precludes elevating it to a cipher-key hypothesis.

**Exact positive control:** use an independent held-out portion of Shakespeare GP text, with the **actual raw grid keys in the original eight-column order**, AES-256-CTR, forward key, modulo29 reduction, positive encryption sign and the page-15 **spiral prime-complement IV**. Apply a fresh unknown **random permutation of all 29 output symbols** and 350 seeded 81%-chance output rewrites at would-be adjacent repeats. The identical unrestricted optimizer recovers the **correct IV, correct AES configuration, correct sign, and all eight column assignments in exact order**, with training score −14,023.11493 and held-out −14,482.88536. This is a deliberately modeled positive and demonstrates the method can invert the named outer alphabet ambiguity when the planted family holds; it is not a claim that real LP2 uses this cipher.

**Inference:** The specific two-source keying hypothesis does not explain LP2 even if a hidden global 29-rune permutation obscures standard additive GP decoding. A possible nonliteral grid KDF, hidden pointer jumps, null insertions, nonlinear language encoding, manuscript-specific IV rekeying, or an altogether different encrypted payload architecture remain beyond the result. The tested four IV encodings and section partition were chosen from geometric clues; this study cannot exclude arbitrary IV constructions. More random IVs alone would not remedy the missing independent key evidence.

Reproduce with [\`sims/grid_square_outer_equality.cjs\`](../sims/grid_square_outer_equality.cjs) using the existing original LP2 numeric and rune resources, plus [\`sims/equality_pad_scan.cjs\`](../sims/equality_pad_scan.cjs) for the reusable equality likelihood. The one-time workflow [\`grid-square-outer-equality.yml\`](../.github/workflows/grid-square-outer-equality.yml) has no push trigger.
