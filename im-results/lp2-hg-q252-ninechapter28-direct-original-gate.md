# Nine-chapter 28-symbol reading of the original 252-residue table quotient

**15 November 2026, Agent9. Classification:** a newly evaluated source-constrained direct-key hypothesis, rejected in four fully reversible original-input models. **No unknown LP2 plaintext, authentic key, or continuation recovered.**

## Candidate human path and its independent inputs

Original physical pp49–51 print exactly 256 two-character numeral tokens in 32 rows of eight. Earlier source studies identified an exact polynomial divisibility relation over GF(29), using the **original p39 red three-rune polynomial** `G(X)=27+5X+15X²` and the **signed 2013 BASE29 3301→3QO example** as `H(X)=3+26X+24X²`. Decode the 256 original grid cells using the conventional printed base60 alphabet, reduce each byte modulo29, and treat the resulting 256 residues as coefficients in descending order. The fixed degree-four divisor has descending coefficients `[12,17,11,21,23]`. Long division yields **exactly 252 GF29 residues**, beginning `[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]`, and a **zero four-residue remainder**.

A possible downstream arrangement arises because **252 = 9 × 28**: the original book visibly has **nine illustrated/rubric chapters**, and the multiplicative group of GF(29) has **28 nonzero elements**. Original p39's leading coefficient **15** is independently a primitive root of order28 modulo29. Under a hypothetical human reader's path, the quotient could supply nine chapter keys with 28 repeated positions each, used either as GP29 Vigenère shifts or as exponents of primitive root15.

The weakest premise is exactly this quotient-to-cipher instruction: **no surviving Cicada-authored source selects polynomial division, nine 28-item key rows, a chapter-reset stream, or either cipher operation**. The numerological 252=9×28 match follows mechanically once a degree-four divisor is chosen. The four candidates below are a bounded test of this one literal interpretation.

## Frozen original decoder and complete-book result

The original visual chapter lengths, fixed before inspecting the quotients, are `[729,1145,1729,1903,1021,1433,1680,3008,308]`, summing to all **12,956** unknown original GP29 runes. For chapter `h=0..8` and local rune `i`, select `k=Q[28h+(i mod28)]`. Decode without padding, phase search, byte projection or word-reset changes:

1. **Additive:** `P=(C ± k) mod29`.
2. **Multiplicative:** `P=C×15^(±k) mod29`, with exponent reduced modulo28.

The latter maps zero to zero and is bijective in all 29 source rune symbols. Neither model implements the separate solved-p56 *nonconsuming* F-key skip. A different F-clock therefore remains outside this finite gate.

| Exact original original-cipher inverse | Whole 12,956-rune GP29 IoC |
| --- | ---: |
| Additive, subtract quotient | **0.0344931972** |
| Additive, add quotient | **0.0344482153** |
| Multiply by 15^(+quotient) | **0.0344715940** |
| Multiply by 15^(−quotient) | **0.0344871440** |
| Independently solved original clear p57, for context | **0.0627099664** |

All nine chapter output streams remain GP29 near-uniform under each of the four fixed candidates; none yields coherent plaintext. The candidate formulas exactly forward-reencrypt every original ciphertext rune, demonstrating correct inversion. A separately **known solved-p57 95-rune original-register plant** encrypts and decrypts **95/95** under each operation/sign using unchanged quotient key symbols.

A second direct-codebook reading fails at the source algebra level. The numbers of distinct residues in the nine 28-item rows are **[16,19,21,16,19,16,18,17,22]**. None is a permutation of 28 distinct symbols. Any interpretation requiring the raw quotient rows to be nine literal 28-symbol permutation alphabets is therefore impossible without another transformation.

## Decision

The simple source-derived **nine chapter × 28 quotient-stream additive and power ciphers** give no recovered unknown plaintext. No independent original clue authorizes further phase, key, root, source-register or F-skip variants. The quotient polynomial and its GF29 integrity consequences remain valid mathematical facts; the present result only bounds this direct consumer. A next attempt should first recover an independently sourced quotient-use instruction or another specific key recipient, then freeze one original-page prediction.

**Reproduction:** [single-file Node22 CommonJS SFT](../sims/lp2_hg_q252_ninechapter28_direct_sft.cjs) reads both original-derived 256-table fixtures and canonical GP29 corpus, checks exact divisibility, primitive-root order, row collisions, four complete-original inverses and solved-native positive plants. [Passing Windows Actions run 43768594248](https://github.com/FlareZ123/liber-primus/actions/runs/43768594248). The original source inputs remain unchanged.
