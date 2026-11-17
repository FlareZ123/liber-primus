# Original LP2 H×G quotient: nine 28-value section keys fail the authentic F clock

**Agent42, 17 November 2026. Result: a bounded original-cipher negative, with no previously unknown plaintext or key.**

## Why this particular reversible route was tested

Three historical-source operands already have a verified exact algebraic relation: Cicada's signed 2013 BASE29 example gives H(X)=3+26X+24X², the original LP2 p39 red triad gives G(X)=27+5X+15X², and the 256 base60 numeric-table bytes on pp49–51, reduced modulo29, form a polynomial divisible by H×G. The product, in ascending coefficients, is [23,21,11,17,12], and division in the fixed descending convention gives **252** GP29 quotient values with four zero remainder coefficients, starting [0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7].

This quotient has **252=9×28** coefficients, while the unsolved manuscript has **nine original marked sections** and **28 non-F GP runes**. That is an independently observable numerical match and a plausible small human operation: divide the source table by its source-visible factors, split the remaining line into nine groups, and use each group as the circular additive key for its section. A critical rival is that 252 is simply the unavoidable 256−4 degree drop; no signed Cicada instruction currently authorizes the nine-group split or additive consumer. The nine groups have only 16–22 distinct values apiece, so they cannot directly be nine 28-symbol permutations.

The test freezes **one source-ordered 28-value key per section**, original section-local phase zero, GP29 addition and subtraction, and the historically established *plaintext-F transparent, key-nonconsuming* law. This is distinct from prior direct 252-periodic table-flank tests, raw-grid RC4, and a hash of the quotient as a long key. The original nine sections are p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, and p54–55.

## Exact original-cipher result

The standalone CommonJS SFT enumerates *every* legal plaintext-F bypass history for each original section and each sign, deduplicating states by the number of consumed key values. Because a nonzero ciphertext glyph cannot directly represent a non-consuming F, any consuming branch that decodes to F is illegal. If every legal state dies, this mode is impossible independently of word segmentation or language scoring.

| Original section | Runes | Q28 distinct values | First impossible original offset, P=C−K | First impossible offset, P=C+K |
|---|---:|---:|---:|---:|
| p0–2 | 729 | 16 | 40 | 39 |
| p3–7 | 1,145 | 19 | 142 | 19 |
| p8–14 | 1,729 | 21 | 0 | 13 |
| p15–22 | 1,903 | 16 | 60 | 113 |
| p23–26 | 1,021 | 19 | 37 | 24 |
| p27–32 | 1,433 | 16 | 8 | 2 |
| p33–39 | 1,680 | 18 | 43 | 67 |
| p40–53 | 3,008 | 17 | 18 | 40 |
| p54–55 | 308 | 22 | 0 | 36 |

All **18** source-fixed original-cipher inverses are impossible before any one section completes. Allowing an all-runes-consuming, nontransparent Vigenère clock instead produces full decryptions with exact re-encryption, but they remain uniform-looking (nine-section IoC29 approximately **0.9704–1.0305**) rather than recovered text. The SFT asserts exact polynomial division, all original section lengths totaling **12,956** runes, each legal-inverse first-dead position, uniform-clock exact re-encryption, and genuine F-bypass **95-rune p57 plaintext plants under each of 18 key/sign settings**. These plants check the hypothetical decoder's correctness; they are not a recovery of original unknown-page text.

## Decision

The **literal Q252→9×28 cyclic additive key** is incompatible with the original LP2 ciphertext under the documented F-transparent rule. The simpler all-runes-consumed mode also yields no readable text. The arithmetic factorization of the source table remains exact and may be useful if an independently authored instruction specifies a different output register or operation. Merely selecting an arbitrary alternate row phase, a different nonlinear transform, or more source-free password derivations would not follow from this result.

**Reproducer:** [single-file original-source Node22/CommonJS SFT](../sims/lp2_q252_nine_section28_original_sft.cjs). Inputs are only [canonical LP2 indices](../resources/liber-primus/lp2-corpus.json), [original-table transcription](../resources/liber-primus/lp2-grid-256.json), and the separately documented [H×G factor relation](2013-base29-gf29-grid-factor.md). This note records no claim to a solution.
