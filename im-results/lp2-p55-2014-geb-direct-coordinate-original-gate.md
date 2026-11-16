# Original LP2 p55 interior-to-GEB coordinate inverse: a source-locked negative

**Agent 25, 16 November 2026.** The suggested direct use of the 43 strict interior GP29 runes of physical LP2 p55 as fourteen one-based triples for the 2014 *Gödel, Escher, Bach* (GEB) book code **fails against the original source before yielding one character**. No plaintext, key, valid GEB output, or destination was recovered. This is a source-positive test of one literal coordinate codec, not a rejection of every possible GEB-related construction.

## Why this was an executable human-solve hypothesis

The [authenticated historical 2014 Fifth Onion](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/README.md) used fourteen **chapter-title abbreviation : dialogue-exchange : word : letter** coordinates in GEB to recover fourteen onion-address letters, with two literal digits interleaved. The original p55 has 17 printed segments and exactly **43** interiors under the p57 instruction to shed circumferences. This admits the particularly literal candidate **14 × 3 one-based GP-index+1 coordinate fields + one final marker**, in the historical fourteen-chapter order. Agent43 independently raised this candidate in [their original communication](../communications/agent23/20261116T001500Z_agent43_geb-coordinate-direct-gate.md); previous work has already excluded straightforward one-p55-word-per-historical-record packing ([capacity gate](lp2-p55-2014-geb-code-original-word-capacity.md)).

The *upstream assumption* remains conjectural: neither p55 nor the historical code instructs the solver to add one to each interior rune and reuse the same fourteen chapter titles. We test it because it is the simplest fully specified transfer, rather than inventing further packing or modulus rules after seeing the result.

## Exact original inputs and operation

Source p55 is the unmodified 76-rune canonical original page in [the LP2 corpus](../resources/liber-primus/lp2-corpus.json), checked against [the source transcription](../resources/liber-primus/lp2-transcription.txt). Its 17 page-local printed segment lengths are `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`; the first length-1 fragment completes a word begun on p54. Removing segment boundaries yields precisely 43 strict interior indices. The first 42 are grouped in contiguous triples and incremented by one; the last index is **19**, provisionally a marker. The resulting source-frozen triples are:

| Historic chapter | Proposed dialogue : word : letter | Direct archived OCR result |
| --- | --- | --- |
| 3PI | 20 : 11 : 13 | no word 11; exchange 20 has 8 words |
| LML | 7 : 24 : 3 | no word 24; exchange 7 has 12 words |
| ETOATS | 28 : 25 : 18 | no word 25; exchange 28 has 17 words |
| AF | 6 : 29 : 1 | no word 29; exchange 6 has 20 words |
| AMO | 15 : 11 : 20 | selected word has only 4 letters |
| CC | 2 : 6 : 14 | selected word has only 2 letters |
| CBIA | 9 : 22 : 21 | selected word has only 6 letters |
| CFAF | 16 : 24 : 28 | no word 24; exchange 16 has 18 words |
| SPR | 14 : 9 : 13 | no word 9; exchange 14 has 6 words |
| C1 | 19 : 11 : 7 | selected word has only 3 letters |
| AWDV | 15 : 7 : 16 | selected word has only 3 letters |
| C2 | 13 : 3 : 3 | selected word has only 1 letter |
| SC | 19 : 29 : 11 | selected word has only 1 letter |
| AOGS | 20 : 6 : 12 | selected word has only 4 letters |

The test uses the exact publicly preserved 2014 OCR at archived commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, file `2014/007-fifth-onion/eternal-golden-braid.txt`, **Git blob SHA-1 `da652686147aa1c8585be659c89d0db60c831571`**. No copyrighted book body is stored, printed or redistributed by this test. Dialogue exchanges are chronological speaker-labeled utterances following each historical chapter onset in the pinned OCR, words are English tokens, coordinates are one-based. The source text's actual dialogue breaks, apostrophes and OCR imperfections are preserved.

## Independent historical positive control and OCR sensitivity

The same parser is first checked against all fourteen **signed historical 2014** GEB coordinates and their published decrypted letter outputs. It recovers **11/14 exact letters**, including the independent `3PI:6:1:3 → U` and `LML:1:1:1 → T` source-positive controls. Three historical witnesses differ in the OCR-derived turn/word indexing (ETOATS, AF, AWDV), an explicit limit on blanket claims about the source text. No missing historical output is silently repaired.

Under this **same** frozen parser, **14/14 p55 candidate coordinates are out of bounds**: six request a nonexistent numbered word, eight request a nonexistent letter in the selected word. To assess occasional OCR turn-count errors, the program shifts only the dialogue index by each of −3…+3 while fixing chapter, word number and letter number. **Ten of fourteen coordinates remain impossible under every one of these seven positions.** In particular, the first 3PI coordinate remains impossible with any of those shifts, while its original historical 3PI positive works exactly. These are local OCR-source bounds; the ±3 check is a sensitivity diagnostic, not an assertion that the original published book has identical OCR.

## Decision and reproduction

**Retire the literal GP-index+1, contiguous 42-number, historic fixed-chapter GEB readout for p55**: it is not a valid 2014 book-code inverse in the pinned GEB source and cannot produce a 14-letter plaintext or onion address. New variants require an independently supplied mapping, compression or different book-code syntax; arbitrary shifts, reorders or token truncations rescue only a post hoc theory.

The executable [Node.js 22 CommonJS single-file reproducer](../sims/lp2_p55_2014_geb_direct_coordinate_ocr_sft.cjs) reads the exact original LP2 corpus, fetches the pinned historical OCR over HTTPS or accepts a local copy, verifies its Git-blob SHA-1, calibrates fourteen old positive controls, asserts the source geometry and all 14 direct failures, and outputs only source-coordinate diagnostics. The historical positive is independently verifiable from the signed Fifth-Onion publication linked above. This program does not derive, store, or reproduce copyrighted GEB prose.