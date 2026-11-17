# Original LP2 stop, apostrophe, and word-length source-retrieval gate

**Decision (17 November 2026):** No original unknown-page plaintext was recovered. Two source-visible 260+ rune LP2 windows yield **zero exact word-length matches** in the frozen set of period-associated texts. Every available 150+ rune original solved-GP29 control is uniquely retrievable in its own native transcription. The independent editorial Latin version loses exact stop fingerprints for all five controls and loses exact word lengths for four. This is a finite negative for literal passage copying under the specified source editions and GP29 orthography. It does not exclude altered typography, a different source edition, independently authored prose, a key derived from these books, or an encrypted word-framing mechanism.

## Why these two original windows

Source: [canonical original rune transcription](../resources/liber-primus/lp2-transcription.txt), [canonical 29-rune alphabet](../resources/liber-primus/lp2-corpus.json), [four physical apostrophe strokes](../resources/liber-primus/lp2-quote-punctuation-spans.json). The parser preserves physical page/line carries and four-dot stops; it reproduces **2,896** printed words on the 12,956-rune unknown-page stream. Rune offsets are global zero-based positions, and ranges are half-open.

| Original window | Runes | Words | End-of-word four-dot stops (zero-based word index) | Ink apostrophe |
|---|---:|---:|---|---|
| p0 first two black sentences, [13,275) across physical p0/p1 | 262 | 58 | 32, 57 | none |
| First apostrophe's bounded context, [851,1111) across physical p3/p4 | 260 | 62 | 39, 47, 53, 61 | last word, after 3 runes; before source rune 1110 |

The second interval starts immediately after original stop851, includes the first image-confirmed raised apostrophe and ends at original stop1111. Its final cipher word is a four-rune printed contraction, MXI'W in GP transliteration, with a 3+1 stem/tail. Its context is selected from source ink and punctuation before source-text matching. The first interval starts after the physical 13-rune red p0 heading and preserves the first two black body sentences.

Word length counts are in GP29 runes. Latin comparison uses uppercase, V→U, K/Q→C, Z→S, *ING* as one NG rune, and TH/EO/NG/OE/AE/IA/EA as one rune each. Consecutive word lengths, end-of-word stops and within-word apostrophe positions constitute the strict fingerprint. A second length-only test discards stop and apostrophe positions to expose typographic sensitivity. Arbitrary shifts, resegmentation and approximate n-gram hits were not accepted.

## Authenticated solved text controls

The nine [solved-GP29 source records](../resources/external/relikd-solved-gp29-native-v1.json) supply authentic published plaintext transcription controls. Five independently picked text segments use words 7–60 inclusive, truncated only where a source record is shorter, and all span at least 150 GP runes. In the solved source index, each fingerprint returns **exactly one** matching window at the original position. No same-length fingerprint matches another solved record or the historical raw-text donors.

| Solved control | GP runes | Words | Same-native exact | Editorial Latin length-only min errors | Editorial Latin strict min errors |
|---|---:|---:|---:|---:|---:|
| WARNING | 156 | 38 | 1 | 0 | 7 |
| WELCOME | 211 | 54 | 1 | 1 | 4 |
| KOAN 1 | 198 | 54 | 1 | 20 | 26 |
| LOSS OF DIVINITY | 220 | 54 | 1 | 3 | 7 |
| jpg107–167 | 198 | 54 | 1 | 23 | 28 |

**Critical cross-edition failure:** The separate [LP1 editorial Latin reference](../resources/liber-primus/lp1-plaintext-reference.txt) contains the WARNING passage. All 38 queried word lengths match consecutively, but all seven source-visible stop constraints are absent or moved in that normalized Latin presentation. Thus a rigorous exact stop test would reject a known genuine same-text positive when only a different edited representation is available. WELCOME has one 54-word length mismatch and four joint mismatches; other editorial controls differ more. Same-transcription success therefore measures **retrieval specificity conditional on preserving the layout**. It does not validate exact punctuation matching across editions.

## Original ciphertext results on the source-bounded corpus

Historical raw-text donors are the three 2013 Crowley *Book of the Law* chapter transcriptions, the 1906 Blake *Marriage of Heaven and Hell* text, its 2012 Cicada-associated excerpt, and the clear part of the signed 2014 May 2 message. Crowley verse numerals are excluded from lexical tokens; period, exclamation and question mark are treated as terminal stops in the Latin donors. The 2014 signed message has only 18 prose words and thus supports no 58- or 62-word window.

| Raw historical donor | Eligible 58-word windows | Minimum GP length errors, p0 /58 | Minimum GP length errors, apostrophe /62 | Exact strict matches |
|---|---:|---:|---:|---:|
| Crowley I | 1,839 | 40 | 41 | 0 |
| Crowley II | 1,910 | 38 | 43 | 0 |
| Crowley III | 1,941 | 40 | 42 | 0 |
| Blake 1906 text | 4,523 | 39 | 42 | 0 |
| Blake Cicada-associated excerpt | 60 | 42 | 48 | 0 |

All exact **length-only** match counts for these donors are also zero. The best strict joint errors across donors are 43/58 on p0 and 48/62 on the apostrophe window. Normalization and punctuation of the historical files remain edition-dependent.

Additional independently archived GP29 word-length donors increase this finite coverage without requiring their copyright-protected full text:

| Derived historical donor | GP words | p0 minimum length errors /58 | Apostrophe minimum length errors /62 | Full exact length matches |
|---|---:|---:|---:|---:|
| Mabinogion story corpus | 105,582 | 35 | 36 | 0 |
| Mabinogion *Lady of the Fountain* subset | 10,395 | 37 | 41 | 0 |
| Gibson *Agrippa* 2012 witness | 1,682 | 38 | 42 | 0 |
| 2013 Crowley chapters I/II/III | 1,897 / 1,968 / 2,002 | 40 / 38 / 40 | 41 / 43 / 42 | 0 |

The *Lady* subset is contained in the larger Mabinogion donor; the archived Crowley profiles overlap the raw Crowley files. These rows are different views of overlapping source material and do not constitute independent trials.

## Interpretation and Director fork

This work is distinct from the prior thematic candidate audit [#934](https://github.com/FlareZ123/liber-primus/issues/934): it uses a frozen original fingerprint, physical punctuation and a mandatory solved-source retrieval gate. A literal >260-rune unknown plaintext quotation from the named editions, rendered as uninterrupted preserved GP29 printed words, would have appeared as an exact length-only hit. Neither original window has one. A few isolated matching words are expected in long unrelated material and supply no original cipher inverse.

The stronger obstacle is the solved-text cross-edition failure. A search strategy requiring byte-faithful punctuation cannot be relied on unless a source clue fixes the exact edition and its typography. The source corpus and query windows are finite, and no independently author-selected passage or decryption operation emerged. **Close the exact-passage fingerprint issue without launching a larger approximate-match book hunt.** Reopen only on an original clue that identifies a specific source edition and retains a reversible line/word boundary rule.

### Reproducibility

- [Single runnable Windows-compatible CommonJS test](../sims/lp2_punctuation_source_fingerprint_sft.cjs). It reads only pinned repository resources, prints SHA-256 hashes of all inputs and a structured JSON record, asserts original rune/word totals, verifies all five solved positive controls, then searches the two intact unknown intervals across all frozen donors. Its parser distinguishes printed word boundaries, chapter marks and four-dot stops.
- [Passed manual Windows Node 22 original-input run 44159887628](https://github.com/FlareZ123/liber-primus/actions/runs/44159887628), 17 November 2026. The companion run 44159891849 belongs to another SFT.
- Source hashes, every candidate window count, selected offsets, all minimum distances and calibration results are emitted by the test.

**Status:** Bounded negative; no unknown plaintext, authentic key, receiver, or Cicada destination.
