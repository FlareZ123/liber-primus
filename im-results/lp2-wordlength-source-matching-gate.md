# Exact printed word-length crib-search across historical literary corpora

**Agent22, 12 November 2026. Source-identification reconnaissance, not plaintext recovery.** This experiment searches a possible route to genuine unknown plaintext without needing the encryption key. The source-visible word segmentation of the 55 rune-bearing unsolved physical LP2 pages (pp0–49 and 51–55) gives **2,896 complete printed words / 12,956 GP29 runes**. If any original chapter encrypts a verbatim passage from a historical source while preserving word boundaries, a sufficiently long sequence of identical rune word lengths identifies its probable source, where the original text can become a plaintext crib. This is plausible because Cicada previously used literary sources such as William Blake, but the unseen text may instead be wholly original or the word boundaries may be deliberately rearranged.

## Source-exact positive control

The independent *solved* LP2 p57 PARABLE has 20 printed words in the original runic transcript. Translating the editor-normalized English reference using the repo GP29 greedy convention (TH/EO/NG/OE/AE/IA/EA count as one rune, ING contracts to NG, V=U K/Q=C Z=S) reproduces all **20/20** actual printed p57 word lengths, including the fourteen-rune long word CIRCUMFERENCES. The matcher independently detects the same 20-word run when implanted in a synthetic copy of the unknown word-length tape. Thus this lexical-fingerprint method would detect exact copied source prose of that form under the same boundary convention.

The original parse follows the repo's [existing word-clock parser](../sims/lp2_word_pages.cjs): '/', line breaks and '%' page boundaries do not terminate words; punctuation, dots and hyphens do. All 12,956 parsed source runes reproduce the canonical GP corpus byte-for-byte. Source text remains word-separated, so cross-word digraph contraction cannot produce a false length match.

## Seven actual source corpora, no ten-word verbatim runs

The deterministic scanner indexes **all** source-independent eight-word profiles from the 2,896-word original. It seeks exactly matching 8-word windows, extending each hit to its maximal overlap.

| External/literary source | GP-normalized source words | Exact 8-word window hits | Longest exact run detected |
| --- | ---: | ---: | ---: |
| Shakespeare, first 300k characters | 55,407 | 35 | 9 words |
| Gibran, *The Prophet* | 15,733 | 19 | 9 words |
| Emerson, *Essays: First Series* | 77,932 | 25 | 9 words |
| Blake, *A Song of Liberty* (pinned excerpt) | 479 | 0 | fewer than 8 words |
| Previously solved LP1/LP2 reference | 942 | 0 | fewer than 8 words |
| Latin Vulgate NT, GP29 word-preserving text | 39,835 | 7 | 9 words |
| Old English *Beowulf*, corrected GP29 word profile | 10,885 | 4 | 8 words |

**No run of ten or more consecutive unknown-page printed word lengths matches any source in this exact collection.** The source list is bounded and strongly biased toward repository-available literature, and the results do not establish that the LP2 unknown plaintext differs from all works by these authors. The Shakespeare text is truncated; sources include some edition-specific editor metadata; transliteration decisions matter. Short eight-/nine-word coincidences are common enough here to be unconvincing. A verified 15–20-word match in a newly motivated source would warrant a stricter original-rune/source-text alignment followed by a complete reversible cipher check.

## Reproduction and next use

The [single-file CommonJS matcher](../sims/lp2_wordlength_source_match_sft.cjs) uses the seven exact retained sources under \`resources/control/\` plus the original rune corpus and transcription. It asserts every original source length/count, all seven matcher outputs, positive p57 plaintext equivalence and planted known-plaintext detection. It is reusable for one new **independently plausible source text** by extending the source inputs; a source match is a *candidate plaintext crib* and never proves a page decryption without an original-cipher inverse.

**Decision:** Direct long verbatim copying from these specific seven source records is excluded for any ten-or-more-word segment under the explicit GP29 and word-boundary assumptions. The actual 56 LP2 encrypted pages still lack authenticated unknown plaintext.
