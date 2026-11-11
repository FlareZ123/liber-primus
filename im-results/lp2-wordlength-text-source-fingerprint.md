# Source-text fingerprints from original LP2 word lengths

## Original-input decision

A cipher preserving the manuscript's printed word boundaries must also preserve the number of Gematria Primus runes in each underlying plaintext word. We tested whether a contiguous passage of the 56 unknown pages was directly copied, in unchanged word order, from five existing literary/control references in this repository: Gibran's *The Prophet*, Emerson's essays, the available first 300,000 characters of Shakespeare, Blake's *A Song of Liberty*, or the already-solved LP1 plaintext reference.

**Result:** the original p0–p55 text has **2,896 printed words** and **12,956 runes**. Across **150,455 reference word positions**, **no ten-word consecutive rune-length fingerprint matches**. Gibran, Emerson, and Shakespeare each reach a maximum nine-word accidental-looking match. Blake and the LP1 reference have no eight-word matches. This is a bounded negative for verbatim copying from these particular versions and only under a word-boundary-preserving encoding. It does not recover plaintext or a cipher key.

## Canonical rune-length grammar and positive control

- Manuscript input is the original-word transcription in **resources/lp2-transcription.txt**, stripping display line wraps, page markers and section markers while respecting the printed word delimiters; take the first 2,896 words through physical p55. Its 12,956 runes agree with the established corpus count.
- English-to-GP word length uses greedy **ING, TH, NG, EO, OE, AE, IA, EA**, then one rune per remaining Latin letter. Crucially, the GP rune ᛝ can represent **ING**. Treating it merely as NG creates a false mismatch for TUNNELING.
- The historical solved p57 *PARABLE* passage is the positive control. All **20 of its 20** original rune-word lengths equal the predictions of the English GP grammar, independently of the unknown pages.

## Frozen scan

For each reference, tokenize all ASCII alphabetic runs, convert each to GP rune length, and find every consecutive eight-word length vector shared with the manuscript's 2,896 unknown words. Extend every shared vector to its longest contiguous exact match. Do not change word order, delete words, modify the encoding, or select ad hoc variants in response to a hit.

| Source in the repository | Word positions | Eight-word matches | Longest exact match |
| --- | ---: | ---: | ---: |
| Gibran: resources/control/gibran_prophet_58585.txt | 15,733 | 19 | 9 |
| Emerson: resources/control/emerson_essays_2944.txt | 77,932 | 25 | 9 |
| Shakespeare: resources/control/shakespeare_first300k.txt | 55,407 | 35 | 9 |
| Blake: resources/control/blake_song_of_liberty_train.txt | 479 | 0 | below 8 |
| Solved LP1: resources/liber-primus/lp1-plaintext-reference.txt | 904 | 0 | below 8 |
| **Total** | **150,455** | **79** | **9** |

Examples of the maximal nine-word coincidences: Gibran “that no one has gone his way with empty” (original LP2 word offset 638); Emerson “high board Their virtues are penances I do not” (offset 280); Shakespeare “rule you not their teeth Have you not set” (offset 2358). None matches the tenth printed word length. They are comparisons of *lengths only*, not recovered text.

A separate self-repetition calibration checks that LP2 has only 12 repeated seven-word length windows and no repeated eight-word length window. Among 200 fixed-seed shuffles of its exact 2,896-word length multiset, 96 have zero repeated eight-word windows, so LP2's zero is not statistically distinctive by itself. Across 150 overlapping 2,896-word controls from the three longer English references, 15 have zero repeated eight-word windows; these overlapping controls are descriptive and not independent samples.

## Limits and next decision

The result cannot exclude original Cicada prose, edited quotations, synonym changes, alternate editions, non-English text, a key that changes word segmentation, or plaintext in another encoding. The unknown pages might also comprise unrelated cryptosystems. The p57 positive control validates the counting mechanism, while the unknown-text test provides no independent cipher key, plaintext, or authenticated source-selected operation.

The narrow exact-copy route requires no further searching around these accidental length matches. Revisit only when a distinct source document is identified by an original Cicada clue or when a historical plaintext fragment survives. Source-derived key/state recovery remains higher priority than unrestricted literary-corpus scans.

**Exact single-file reproducer:** sims/lp2_wordlength_source_fingerprint_sft.cjs, requiring Node.js and the repository's existing text files. The test asserts the p57 20/20 positive control, original corpus counts, reference input counts, and the five observed maximum match lengths. It performs no file writes.
