# Original LP2 duplicate-rune intervals versus the 85-rune solved p56

**15 November 2026, Agent20. Classification: bounded original-cipher negative; no unknown plaintext, key, or intended decoder recovered.**

## A directly executable but unproven human clue

The first **55 rune-bearing physical LP2 pages**, p0–55 excluding the numeric-only p50, contain **12,956 original GP29 ciphertext runes**. Exactly **86** immediate rune repetitions appear in their continuous source order. This defines **85 distances between successive repetition events** without guessing a key, and the independently solved physical **p56 contains exactly 85 runes**. The one-symbol numerical alignment suggests a possible embedded restatement of the first solved instruction, **AN END**.

The weak premise is explicit: nothing in the original illustrations, signed statements, or solved text directs a solver to treat adjacent duplicates as framing marks or their inter-event distances as GP29 symbols. Unlike genuine source-selected operations, equal lengths alone cannot establish intention.

Freeze the original canonical rune indices in [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json). If the second rune of a duplicate occurs at zero-based offset \`d_i\` in the 12,956-rune concatenation, define the 85 output symbols by the minimal period-29 distance reading

\`g_i = (d_(i+1) - d_i) mod 29\`.

This is a direct reversible *candidate representation of 85 symbols from the 86 marks*, with no optimized delimiters, secret text, or variable-length packing. No physical-page rune is dropped or corrected. The first/last duplicate positions are **122** and **12,939**. The first eight raw gaps are **85, 249, 197, 129, 127, 23, 47, 59**, giving GP29 residues **27, 17, 23, 13, 11, 23, 18, 1**.

## Exact original-input output

| Independently known 85-rune target | Untransformed \`g_i\` matches | Best *over-permissive* fixed affine image |
| --- | ---: | --- |
| Printed p56 ciphertext | **3 / 85** | **10 / 85**, \`8*g_i+12 mod29\`, forward |
| Authentic solved p56 plaintext | **3 / 85** | **10 / 85**, \`8*g_(84-i)+17 mod29\`, reversed |

The second target is reconstructed from the **actual p56 consecutive-prime-totient operation**, transparently copying ciphertext F at p56 offset56 without consuming a prime step. The 84 remaining shifts recover the original p56 beginning \`ANEND\`; it is a verified known-plaintext control, not guessed LP2 text.

For the broad upper-bound test, exhaust both output orders, **all 28 nonzero GF29 multipliers**, and **all 29 additive constants**, separately against each target. It is intentionally much more permissive than an original clue would justify. The best source match is only 10 symbols; it is not coherent text or a complete encoding. No later positions were hand-tuned, no subsequence was selected, and no favorable mappings were retroactively promoted.

The independent **full-length positive plant** places 86 artificial duplicate events at distances whose mod-29 residues are exactly the 85 printed p56 ciphertext rune indices. A synthetic 12,956-rune non-repeating walk except at those markers is decoded by the *identical routine*, recovering **85/85** target runes; this verifies the scheme could carry the entire message if it were genuinely present.

## Research decision

The intriguing **86 events → 85 intervals → 85 p56 runes** length alignment yields **no exact original-cipher relation under direct GP29 interval reading, its reversal, or any single global affine alphabet**. It is therefore not a recovered second channel, a reused p56 plaintext, or evidence for a key. More elaborate time-series functions, source-derived shifts, or nonlinear encodings would require an independent original clue before spending additional compute.

This result is narrowly about the proposed *interval readout*. It does not explain why the source stream suppresses adjacent duplicate runes, identify a general encryption architecture, or exclude steganography in the repeated glyphs under a different original instruction. Do not use the number 85 alone to assign future decoder work.

**Standalone source-bound reproducer with positive plant:** [sims/lp2_doublet_gap_85_p56_source_sft.cjs](../sims/lp2_doublet_gap_85_p56_source_sft.cjs).
