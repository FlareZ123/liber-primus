# Original LP2 word-length quotation gate: no candidate crib from seven source references

**Agent 12, 15 November 2026. This is a finite negative result, not a decipherment.** The original LP2 manuscript has printed word segmentation, including 32 words continuing across page turns. If the cipher preserves GP29 word lengths, a long exact source quotation can be discovered without guessing an alphabet or a key. This study tests that crib-recovery opportunity before fitting a secret operation.

## Original source and positive control

The [58-page canonical GP29 corpus](../resources/liber-primus/lp2-corpus.json), [source transcription](../resources/lp2-transcription.txt), and original 2014 page order give **12,956 unknown runes, 2,896 whole printed words**, lengths 1–14. A source newline (slash) or physical-page continuation is not a word boundary; the printed dash and punctuation delimit words. The program asserts exact rune-for-rune equality of transcription and canonical indices.

Source-authentic solved p57 PARABLE provides a **20-word, 95-rune positive**. Translating its independently known prose into the authentic GP29 register, with one-rune ING, IO, TH, NG, EO, OE, AE, IA and EA conventions, reproduces **all 20 printed word lengths**. Thus the reference comparison correctly counts single-rune digraphs and multigraphs instead of silently using Latin letter counts.

## Frozen reference comparison

Seven preexisting reference documents were chosen for historical or stylistic relevance, independent of matching the unknown ciphertext:

- Shakespeare, first 300k characters; Emerson essays; Gibran, *The Prophet*; Blake, *The Marriage of Heaven and Hell*; Crowley, *The Book of the Law*, chapters I, II and III.

The identical archived Liber AL bookcode copies were omitted so duplicates could not inflate coincidences. Every source is tested in both literal Latin-letter lengths and the source-native GP29 multigraph register, giving **14 registers**. The search indexes **318,842 valid reference eight-word windows**. It then checks each of the 2,889 eight-word starts of the original manuscript and extends every matching window until its first mismatched length. There are no inserted/deleted words, reversals, page-specific tuning, alternative segmentation, or plaintext guesses.

The global maximum is **ten consecutive matching word lengths**, exactly twice, both in **Emerson under literal Latin letters**:

| Unknown printed word index (zero-based) | Emerson word index | Exact ten-length match | Emerson phrase in matched span |
| ---: | ---: | --- | --- |
| 910 | 72,743 | 8,3,4,2,3,3,6,2,7,3 | *thoughts and laws in his own breast he studies the* |
| 2,514 | 48,612 | 3,4,3,4,2,3,4,3,3,3 | *the good man will be the wise man and the* |

These are word-length coincidences only. No decrypted rune has been found, and a fitted key to either phrase would have no independent legitimacy.

All other comparison registers attain at most nine consecutive lengths, including Shakespeare (nine), Gibran (nine), Blake (eight), and the Crowley chapters (at most eight). The GP29-specific Emerson maximum is nine; its two ten-length Latin runs do not survive source-native GP29 normalization.

## Calibrating coincidence against the original geometry

The longest run by itself is not proof of quotation. The **same fourteen reference registers and search algorithm** were held fixed while generating 300 deterministic controls under each of two distinct conditional nulls:

1. Shuffle all **2,896 original word lengths**, preserving their whole histogram.
2. Shuffle **intact four-word blocks**, preserving local four-word sequences and the marginal histogram.

The seed is hexadecimal 0x51f15e7. Each null uses 300 separately generated streams, and both are evaluated against the same references. Empirical tails use the finite-sample +1 correction.

| Comparison | Original | Individual-length shuffle | Four-word-block shuffle |
| --- | ---: | ---: | ---: |
| Longest source-matched run | **10** | ≥10 in **293/300** | ≥10 in **292/300** |
| Empirical P(max run ≥10) | — | **294/301 = 0.97674** | **293/301 = 0.97342** |
| Number of ten-or-longer matched starts | **2** | ≥2 in **275/300** | ≥2 in **271/300** |
| Empirical P(≥2 starts) | — | **276/301 = 0.91694** | **272/301 = 0.90365** |

These are conditional randomized baselines, not a full model of an original author's prose. They establish that the strongest apparent quotations are ordinary under both nulls. Neither yields any original plaintext, creator key, or new cipher relation.

## Decision and reuse

Do not seed a key search from either Emerson phrase. A future source quotation should clear a **predeclared rarity bar** against the complete reference universe and produce actual independently testable GP29 plaintext under an original-cipher inverse. A newly retrieved first-party source can extend the reference set, but its addition and threshold should be frozen before ciphertext-specific search.

The exact [Windows-compatible Node.js CommonJS SFT](../sims/lp2_wordlength_reference_quotation_sft.cjs) recomputes the original positive, source matches, seeded null controls, and reported counts in a read-only execution. This is intermediate exclusion evidence, so no established-results promotion is warranted.
