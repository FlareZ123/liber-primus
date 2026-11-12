# LP1 Wisdom 5×5 magic square as a direct p55 Hill cipher key

**Agent49, 12 November 2026. Outcome: full original-cipher, source-key invertible decoder tested; no unknown plaintext recovered.** The specific five-symbol block Hill cipher is retired, with its source conditions stated below.

## Historically plausible clue-to-decoder path

The original LP1 page5 (archive 05.jpg) has a moth immediately above the **5×5 1033 Wisdom magic square**. The nearly identical moth artwork appears on LP2 physical p55 and p53. The exact 2014 Stage04 outside-JPEG (OOB) 5×5 square is independently preserved in `resources/cicada2014-openpuff-magic-squares.txt`; the binary original/hidden-square relation and visual reuse were established earlier ([2014 source certificate](cicada2014-stage04-256-p50-direct-identity-gate.md), [art link](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md)).

Physical LP2 p55 contains **76** ciphertext GP29 symbols with one literal **F at position25**. Skipping *only* this F as a p56-style non-consuming interrupt leaves **75 symbols = 15 complete five-symbol blocks**. These clues motivate a **standard five-by-five Hill cipher over the 29-element GP field** using the original Wisdom magic-square integers as a key. The row-major square, field, five-symbol blocks, cipher family and convention are fixed in this one test; no secret key, beam search or fitted offset is introduced. Neither the source art, the original p55 F nor solved p56 explicitly orders a Hill cipher on this page, so this is a conditional hypothesis.

The exact source key matrix is

```text
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

Reduced modulo29 it has **determinant 3**, invertible in GF29. The standard ciphertext-column inverse `P_block = K⁻¹ C_block mod29` is therefore executable without ambiguity. The inverse matrix modulo29 is

```text
23 22 15  2 17
24 25  4  2 24
20 28 12 28 20
24  2  4 25 24
17  2 15 22 23
```

## Original-cipher outcome and controls

All **15 original p55 ciphertext blocks** decrypt to this full 75-symbol GP transliteration, with F25 removed:

```text
WUEARFRNGWNSOEOOEIALFYAEEAROEOEALWSUBYPMAEEAJNGAPREAAEDNGOEOEJOEASAITHDUBWNGTHORPTLSTHNJILJEJAAENY
```

The raw 75-symbol p55 IoC is **0.0381981981982**; decoded IoC is **0.0385585585586**. No coherent plaintext sentence or GP-native word structure emerges. Exact re-encryption reproduces **75/75** original symbols. An independent 75-symbol planted solved-p57 sequence encrypts under the actual source key and decrypts **75/75**; all original-source matrix and inverse assertions pass. The F is preserved literally as a marker for total round-trip completeness.

## Decision

**Retire this source-specific standard 5×5 Hill inversion for p55.** It is mathematically reversible and offers a human-motivated, independently sourced *candidate key*, but fails to decipher the unknown page. A row-vector or transposed matrix convention would be an additional unselected hypothesis, not a rescue justified by the original. The copied moth also appears on p53, so art alone does not designate p55. This decision concerns this exact Hill operation; it does not exclude original key reuse through a different creator-specified cipher.

[Single runnable CommonJS source-input test](../sims/lp1_wisdom5_hill_p55_sft.cjs) reads the original GP29 corpus and original 2014 square, computes the modular matrix inverse, requires determinant3, fixes F25, completes both ciphertext and solved-native positive controls, and asserts the entire decoded string. It was independently executed from committed GitHub source with every assertion passing.
