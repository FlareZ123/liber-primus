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

## Direct p56-keyed segment inverse: historical φ(prime) rule is impossible (Agent2, 21 November 2026)

A separate, closer-to-cryptanalysis explanation of the same 86→85 match is that **the 85 known p56 runes provide one seed for each of the 85 sections between original repeated-ciphertext-rune events**. This uses the independent, *authentically demonstrated* solved-p56 cipher family instead of assuming the inter-event distances themselves directly spell p56. The 85 source-position spans contain a total of 12,817 runes between the first and last doublet destinations. The original clear p56 GP29 text (85 runes) is checked **85/85** by re-encryption under consecutive-prime totients with the single literal plaintext-F bypass at p56 offset56. No unknown plaintext or key is supplied to the test.

The finite proposed decoder restarts the genuine GP29 `C=P+φ(prime)` rule on each interval at the **one-based prime ordinal equal to the GP prime weight of the corresponding known p56 rune**. The source rune is a natural key operand because GP29 explicitly associates every rune with a prime, but no original first-party instruction chooses repeated glyphs as segment separators or this ordinal interpretation. At every encrypted ciphertext F the inverse explores **both legal alternatives**, literal plaintext F with no key advancement and encrypted non-F with advancement. At every other ciphertext rune, only a decrypted non-F is legal. The test grants a fresh key clock for every interval and preserves all possible F-bypass histories.

The source also permits two natural delimiter cuts (include the following doublet's closing glyph, or exclude the next full two-glyph marker), and two simpler key interpretations (rune GP index+1 instead of rune GP prime weight, printed p56 ciphertext in place of solved p56 plaintext). To expose these dependencies rather than optimize a crib, all **four fixed key registers × two physical delimiter cuts** are reported:

| Per-gap first-prime ordinal source | Inclusive closing rune: fully decryptable of 85 | Full two-rune marker excluded: fully decryptable of 85 |
|---|---:|---:|
| **Solved p56 plaintext GP-prime weight** | **22** | **22** |
| Solved p56 plaintext GP index+1 | 19 | 20 |
| Printed p56 ciphertext GP-prime weight | 24 | 24 |
| Printed p56 ciphertext GP index+1 | 21 | 22 |

For the primary, source-prime-weight interpretation, the **second** gap, 249 runes long, becomes impossible at its **seventh rune**. Across the entire manuscript **63 of 85 gaps fail the exact original-cipher algebra**; even the most permissive listed option fails **61**. Thus there is no full-book plaintext in this **specific historical cipher family**, regardless of English scoring. This result holds even though every gap is allowed its own clear-p56 seed and arbitrary legal F skips.

Two independent full-length positive plants re-encrypt native clear p57 runes under the authentic F-transparent φ(prime) operation at each of the 85 original gap lengths, for **170** exact key-state recoveries. This demonstrates that an honestly generated text of the proposed form is accepted rather than misclassified by the F-branch search. Reproducer: [original-source CommonJS SFT](../sims/lp2_doublet_gap85_p56_phi_segment_key_sft.cjs).

**Bounded decision:** retire p56-rune-to-prime-ordinal keyed φ decoding across doublet-delimited segments under either literal delimiter convention, with all authentic F-bypass paths. The source's 86 doublets and p56's 85 runes remain genuine; an invented per-gap operation cannot be assumed in place of an independently supplied author clue.

## Research decision

The intriguing **86 events → 85 intervals → 85 p56 runes** length alignment yields **no exact original-cipher relation under direct GP29 interval reading, its reversal, or any single global affine alphabet**. It is therefore not a recovered second channel, a reused p56 plaintext, or evidence for a key. More elaborate time-series functions, source-derived shifts, or nonlinear encodings would require an independent original clue before spending additional compute.

This result is narrowly about the proposed *interval readout*. It does not explain why the source stream suppresses adjacent duplicate runes, identify a general encryption architecture, or exclude steganography in the repeated glyphs under a different original instruction. Do not use the number 85 alone to assign future decoder work.

**Standalone source-bound reproducer with positive plant:** [sims/lp2_doublet_gap_85_p56_source_sft.cjs](../sims/lp2_doublet_gap_85_p56_source_sft.cjs).
