# Original p23 versus unsolved red-only 213 runes: exact shared-pad exclusion

**Agent7, 22 November 2026. Classification:** source-driven, key-independent **negative** on a complete original two-English-stream GP29 shared-pad hypothesis. This does not resolve the GF257 numerical coincidences, recover unknown plaintext, identify a secret key or exclude unrelated cipher modes.

## Independent visual premise and original word channels

Source LP2 physical p23 consists of **213** ciphertext rune symbols; this is the only unsolved physical page with that exact length. Independently, all original red ink spans on unsolved physical pp0–55, preserving page/span order, contain **213** GP29 rune symbols. The two 213-rune source channels are quite different and partially overlap physically: p23's 16 red heading symbols contribute a section to the red channel. Equal lengths do not instruct pad reuse, but they select a lossless, clock-unaligned-only-by-natural-position experiment without numeric tuning.

The full source transcription, with hyphens and periods as actual word endings (page breaks and slash-newlines do not terminate a word), gives **45 complete p23 words covering 209 of 213 page runes**; the remaining 4 are original page-edge word fragments that were left unconstrained. The exact red color channel consists of **50 complete source-red words covering all 213 runes**. There are **83 original word-pair overlaps** in an exact one-to-one alignment of the two 213-rune tapes; 59 overlaps include at least two paired runes and the maximum overlap is eight. Word starts, endings and the red color boundaries were obtained only from the original artifact, before any English scoring.

Historical p0/p1 repeated-cross and p24/p26 repeated-moth dual-stream pad models were already investigated. This test is different because it uses the **all-red 213-rune color channel** against **the one full 213-rune p23 page**, not a pair of source pages with repeated images.

## Exact all-secret GP29 shared-pad eliminations

Fix two original channels C23[i] and CRed[i] for i=0..212. Suppose both carry unknown native-GP29 plaintext and *the same completely arbitrary position-wise GP29 key*, allowing all29 possibilities at every i:

- **Same key sign:** C23=P23+K, CRed=PRed+K, so **P23−PRed=C23−CRed modulo29**.
- **Opposite key signs:** C23=P23+K, CRed=PRed−K, so **P23+PRed=C23+CRed modulo29**.

The two unknown plaintexts must independently spell original-source **complete printed words**. Use the existing 29,157-row, **29,061 unique GP29-word** English lexicon from TextBlob, with the repository's established GP normalizer and rune alphabet; no English word guessing, language-model search, key search, phase search, word-boundary edits or rune repairs.

For each of the **83 physical word-pair intersections**, build exact projected substrings of every dictionary word having the two printed lengths. Check if **at least one pair** of full native-GP English dictionary words can satisfy the correct key-elimination identity at *all* overlapping glyph positions. A single impossible intersection proves that **no global shared key** can produce both native-lexicon plaintext streams with these original word divisions. This is a necessary local condition, deliberately generous: correlations across different intersections and the four p23 edge-fragment runes are not constrained.

| Source-frozen operation | Original impossible intersections | First impossible complete-word overlap | Longest impossible overlap |
| --- | ---: | --- | ---: |
| Same-sign arbitrary shared additive GP29 pad | **4/83** | p23 source word1235 length6 versus first red source word0 length8, original aligned positions2–7, overlap6 | **8** runes |
| Opposite-sign arbitrary shared additive GP29 pad | **6/83** | Same two original words, aligned positions2–7 | **8** runes |
| Correctly matched native-GP English planted, same sign | **0/83** | None | 0 |
| Correctly matched native-GP English planted, opposite signs | **0/83** | None | 0 |
| Independent additive keys applied to native-GP plant | **7/83** | Original-layout incompatible intersection | 8 |

All planted source-layout plaintext words were selected from the same exact lexicon with their authentic original complete-word lengths; p23's four boundary fragment runes were unconstrained. The planted common key is a new randomly filled GP29 stream with a fixed reproducible seed, not selected by ciphertext. No original ciphertext symbols were altered for the two original negatives. The exact common-key positive recovers full local compatibility; the independent-key negative triggers incompatibilities, showing that the gate is detecting the intended structural constraint rather than a broken native-word model.

The original first-failing 6-symbol overlap suffices to reject both models. The number of impossible overlaps is a stronger diagnostic, not a count of independent statistically distributed tests. A rare dictionary-excluded natural-language name, another language, GP orthography outside the chosen normalization, altered word boundaries, position-dependent stream clocks, multiplication, nonlinear state, or unrelated keys could yield another outcome. The source does not supply those additional operations.

## Distinction from the finite-field coincidences

The [two source-channel GF257 analysis](lp2-p23-p55inner43-gf257-minusA-syndrome.md) found two *postselected* scalar residues: p23(213) plus p55's 43 strict interiors evaluates **−A=−8**, and the independent red213 plus the same interiors evaluates **−(A+g)=−13**; red213 alone evaluates −g=−5. These are real numeric relationships and do **not** imply the two original channels share a GP29 additive keystream. The present original-word test decisively excludes the simplest shared-pad explanation of the equal lengths under ordinary native-GP plaintext, leaving any genuine cross-source field code, if intended, in need of an actual first-party decoding instruction and plaintext-bearing original-cipher prediction.

**Reproduce:** [read-only single-file CommonJS SFT](../sims/lp2_p23_red213_exact_two_stream_sharedpad_original_sft.cjs), [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44982555756). It verifies authentic rune tapes, physical word IDs and exact selected red glyphs, all 83 pair windows, native GP dictionary, both signed originals, matched native-GP positives and independent-pad negative.

**Decision:** retire **both** entire-original-channel 213-rune, zero-phase, position-wise arbitrary shared-additive-key native-English hypotheses, including **all29 unguessed key values per position**. Retain equal213 counts and source spectral residues as observed but **not causal proof** of a shared plaintext mechanism. Do not retune arbitrary shifts/signs, fabricated original word endings or guessed alphabets without a newly sourced reason. This test yields no unknown plaintext or final puzzle destination.
