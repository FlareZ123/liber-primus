# Source-text fingerprint inverse: whole-word transposition hypothesis

**22 November 2026, Agent32. Classification:** bounded original-cipher plaintext-source acquisition test; no authentic new plaintext or decryption. Executable [Node22 CommonJS SFT](../sims/lp2_source_wordlength_multiset_scan_sft.cjs), with passing *Windows* [Actions run 44991558291](https://github.com/FlareZ123/liber-primus/actions/runs/44991558291), job 137113524157. Its logged summary confirms 12 source files, two fixed encoding conventions, 162 original page windows, 0 exact multi-page matches and passing planted 120-word sources under both conventions.

## Decision and plausible way to recover plaintext

Original unknown LP2 has 12,956 runes separated into 2,896 printed words across 55 rune-bearing physical pages (the numeric table p50 has no runes). A deliberately rearranged set of words from a historically relevant literary passage can conceal adjacent word-length grammar yet preserve every page's **multiset of word lengths**. If an exact two- or three-page multiset is located in a contiguous independent literary passage, that passage becomes a specific, human-readable **plaintext candidate** to attempt to align on the actual ciphertext, with a separate untouched page as an important holdout. This bypasses an initial search for keys, provided the page-segmentation premise holds.

The source-based attack does not need to guess the page's word ordering. For each source contiguous window containing exactly as many words as the original page window, it computes a histogram over 18 length bins (lengths 1–16, bin 17 for longer words). It minimizes **half the L1 distance** between source and original histograms. Zero means a lossless multiset match, and a positive distance lower-bounds the number of word lengths that would require modification for such a match.

Every physical LP2 printed word is parsed with original `resources/lp2-transcription.txt` delimiter conventions; line and page wraps never split a word, and an original across-page word is assigned to its starting page. The GP source-length normalization follows the project's existing `ING` and GP digraph rules; literal Latin-letter length is a second, *fixed in advance* alternative, because a source quotation could have been written before or after GP transliteration. No source, page or normalization is selected by maximizing an apparent plaintext fragment.

## Locked source corpus and outcomes

The 12 included texts were independently available in this repository: Gibran's *Prophet*, Emerson essays, Shakespeare, the Latin Vulgate, all three books of Crowley's *Liber AL*, Blake's *Marriage of Heaven and Hell*, Caesar's *De Bello Civili*, *The Kybalion*, the King James Passion Gospels and Tennyson's *Lady of Shalott*. The original 55-page sequence is scanned as **55 single pages, 54 adjacent pairs, and 53 adjacent triples** in each corpus and encoding convention, regardless of visual motif.

| Check | Actual original-input result |
| --- | --- |
| Source files / source encodings | 12 / 2 |
| Original page windows per source convention | 162 |
| Exact **two-page** contiguous source multiset matches | **0** |
| Exact **three-page** contiguous source multiset matches | **0** |
| Three-page best near-matches | 3 word-length replacements at p48,p49,p51 in KJV GP, and the same three physical pages in Shakespeare GP; other corpora produce independent near-misses |
| Source-native positive | Exact 120-word source passage survives deterministic scrambling of each of three 40-word chunks, with a perfect 0-distance match under GP and Latin-length conversions |

A one-page 17-word signature at original physical p49 matches unrelated passages exactly in Gibran, Emerson and KJV. These collisions demonstrate why short-page or “one-rune word” fingerprints by themselves do not recover source plaintext. The p48/p49/p51 three-page near-miss is *not* an authenticated excerpt: different texts yield similar scores and no exact multi-page match exists.

## Consequence

For these **12 specific public texts**, there is no exact source-text passage at the two- or three-page scale compatible with simple page-local *whole-word permutation preserving word lengths*. Do not turn the closest single-page or three-page near-match into a running key or candidate decryption. The scan imposes no conclusion about original prose, other books, inserted/deleted words, changed GP spelling, cross-page word movement, per-word encryption that changes lengths, or cryptographic pseudo-spacing.

**Next meaningful fork:** apply the same frozen scanner only to a *new author-selected text or exact manuscript source* from authentic original clue material. A genuine long exact match (plus independent holdout and forward-original rune decoder) would immediately justify plaintext recovery. Without such a source, mathematical cipher inversion is higher priority than adding arbitrary literature to the search.

The original corpus and each source file are read directly from `resources/`; the read-only SFT prints source-specific minimum distances and offsets, allowing every candidate to be checked again.
