# EA-feedback original-cipher language and word-reversal gate

**Classification:** bounded source-language test of an unverified reversible mechanism; original ciphertext tested, no LP2 plaintext or author-selected key recovered. Agent 5, 13 November 2026.

## Decision and why it matters

The canonical unknown LP2 cipher has **86 equal neighboring runes** across **12,901 within-page transitions**, of which **23** fall at printed word starts. A fully reversible GF(29) ciphertext-feedback rule proposed in [the existing original gate](lp2-gf29-multiplicative-feedback-original-gate.md) has a concrete cryptanalytic consequence:

```text
C_i = (C_(i-1) + K_i * (P_i + 1)) mod 29,  K_i in {1,...,28}
C_i == C_(i-1)  iff  P_i == 28 (EA)
```

This *hypothesis* would recover one authentic plaintext symbol at each of the 86 observed equal steps **without knowledge of the key**. The previous English-only calculation found the correct scale for total EA frequency (81.513 expected), but only 5.445 eligible EA word starts versus the observed 23. Two independent explanations deserve a tightly controlled check: the original runic register could be Old English or Latin, and the plaintext might undergo a *whole-word reversal* before feedback. Old English uses the EA diphthong as a natural orthographic symbol; Latin uses EA in independent words and inflections. Word reversal is a familiar historically simple operation. Neither is an authenticated LP2 instruction.

## Fixed original-cipher test

Reproducer: [`sims/lp2_ea_language_reversal_original_sft.cjs`](../sims/lp2_ea_language_reversal_original_sft.cjs). It reads the source-original 29-index corpus and original transcription, keeps source words intact across wrapped lines and page joins, and **resets only the consecutive-pair observation at physical page changes**. A printed word can therefore contain an unscored position at a page turn. It asserts **12,956 runes; 2,896 words; 86 equal steps; 23 equal steps at word starts; 85 words bearing equal steps**.

Before examining the original masks, it fixes three separate native-GP source references already held in `resources/control/`:

- **Modern English:** 29,058 distinct encodable TextBlob GP29 wordforms with original corpus occurrence weights; the spelling contract uses ING and IO folding.
- **Latin:** 39,835 source-pinned Vulgate New Testament GP29 word tokens, retaining observed source frequency. The complete-language identity of LP2 is not assumed.
- **Old English:** the **corrected** source-pinned 10,885-word Beowulf GP29 encoding (`beowulf_oe_gp_profile_corrected.json`, 48,012 GP runes). The superseded incorrectly normalized Beowulf profile is expressly excluded.

For each original word length and the exact set of positions where a cipher predecessor exists, the SFT evaluates the empirical source-language expectation of plaintext EA at every eligible position and at the word start, under both source word orders. It checks all original repeat-bearing word masks against the corresponding full fixed control lexicon. The source words are never fitted or reweighted to the original repeats. Variances assume independent word draws conditional on the manuscript's printed word lengths.

| Control register | Source word order | Expected repeat total (±SD) | Expected word-start repeats (±SD) | Original repeat-bearing word masks absent from fixed source |
|---|---|---:|---:|---:|
| Modern English | Forward | 81.513 ± 8.86 | 5.445 ± 2.33 | 5 / 85 |
| Modern English | **Reversed** | 81.49 ± 8.86 | 1.51 ± 1.23 | 4 / 85 |
| Latin Vulgate | Forward | 26.74 ± 5.08 | 11.49 ± 3.27 | 36 / 85 |
| Latin Vulgate | **Reversed** | 26.72 ± 5.08 | 11.38 ± 3.25 | 38 / 85 |
| Old English Beowulf | Forward | 260.19 ± 15.08 | 48.75 ± 6.78 | 11 / 85 |
| Old English Beowulf | **Reversed** | 260.05 ± 15.08 | 19.65 ± 4.17 | 14 / 85 |
| **Original LP2** | Observed ciphertext | **86** | **23** | Not applicable |

The English forward baseline exactly reproduces the previous independent GP29 TextBlob estimate. English word reversal makes the word-initial discrepancy *worse*. Reversed Old English brings the expected start count close to the observed 23, but predicts approximately **three times** the observed repeat total. Latin has too few EA occurrences overall. The original p27 length-12 repeat-bearing mask `000001000001` is absent even under the forward and reverse checks for **all three finite source corpora**. This is a lexical-coverage diagnostic, not a mathematical exclusion of an unknown coined or compound word.

An exact synthetic positive control enciphers GP-native `EACH` (index sequence `[28,5,8]`) using nonzero multipliers `[2,3,5]` and initial feedback 17; the first ciphertext output repeats 17, and the strict GF29 inverse recovers **3/3 original plaintext symbols**. This validates the hypothesized equality identity, rather than the existence of the model in LP2.

## Research decision

Under the *specified* one-symbol-EA feedback architecture, **neither alternate native register nor whole-word reversal explains both independent manuscript observables**. These finite controls do not disprove GF29 ciphertext feedback with an additional source-selected transposition, changing word segmentation, an author-specific mixed register, or a different repeat-suppression architecture. A source-selected key, state/clock, or true plaintext anchor is still needed; do not infer 86 actual EA plaintext runes from ciphertext equality alone. No further ungrounded language variants should be fitted to these same two counts.

This report is an intermediate conditional gate, not an established LP2 decryption. The authoritative solution status remains [`results/README.md`](../results/README.md).
