# Gilgamesh-era textual sources as exact original LP2 quotation cribs

**Agent 47, 13 November 2026. Evidence: completed, source-pinned finite negative.** No unknown plaintext, cipher key, or manuscript destination has been recovered.

## Human-visible hypothesis and strongest objection

The original LP2 pp33–39 show cuneiform-style numeral signs and a repeated six-glyph stamp. The following pp40–53 chapter contains four long visually quotation-delimited rune passages. A contemporary solver might ask whether these words quote a period-available English translation of the Epic of Gilgamesh or related ancient Babylonian literature. Three concrete pre-2014 editions were chosen independently of their word-length matches:

- [Stephen Langdon, *The Epic of Gilgamish*](https://www.gutenberg.org/ebooks/18897).
- [Morris Jastrow Jr. and Albert T. Clay, *An Old Babylonian Version of the Gilgamesh Epic*](https://www.gutenberg.org/ebooks/11000) (1920).
- [E. A. Wallis Budge, *The Babylonian Story of the Deluge*](https://www.gutenberg.org/ebooks/7096).

**The original manuscript never explicitly identifies Gilgamesh, one of these authors, or a particular English translation.** This thematic lead is conditional; the repeated six-glyph illustration may be an ornament. The test is intended to nominate real plaintext through distinctive preserved word lengths, and is not an asserted cryptographic instruction.

## Frozen original evidence

The independent runic transcript agrees with all **12,956** original unresolved LP2 GP rune indices. The existing [original quote annotation](../resources/liber-primus/lp2-quote-punctuation-spans.json) supplies seven quote spans of **18,19,12,58,68,160,70** runes. The four long spans, selected before searching translations, have:

| Original quote | Global rune interval | Rune count | Fixed GP-rune word-length array |
| --- | --- | ---: | --- |
| 4 | [9811,9869) | 58 | 5,7,2,3,4,6,4,3,3,4,4,4,5,4 |
| 5 | [10211,10279) | 68 | 9,8,3,4,6,3,10,2,4,7,6,2,4 |
| 6 | [10279,10439) | 160 | 4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5 |
| 7 | [12522,12592) | 70 | 5,7,2,3,4,10,3,9,7,3,7,4,3,3 |

All printed source words are converted to GP rune lengths with the independently attested contractions ING, TH, NG, EO, OE, AE, IA, EA (plus QU→CW, V→U, K→C, Z→S); source word boundaries remain fixed. Compare the entire source text with the four original word-length arrays using longest exact contiguous matching. The full historical eBook files, including their introductions and Gutenberg boilerplate, are included deliberately to avoid trimming away a potential long quotation. Boilerplate coincidences can artificially increase the maximum and therefore make the no-match finding conservative. There are no inserted or deleted words, string substitutions, fitted cipher keys, tolerance for mismatches or postselected source offsets.

## Byte-pinned original editions

The Git source files are read from these immutable GITenberg revisions, then checked against the *full original Git blob SHA-1* before matching. The public-domain source text remains on its original repository; no copyrighted text is copied into this repository.

| Original edition | Pinned Git commit | Source file | Git blob SHA-1 | Normalized source words |
| --- | --- | --- | --- | ---: |
| Langdon, PG18897 | 94cd8004ddb196a5fd3ab36914cdb842c32e3c13 | 18897.txt | 77a014b1e8bbf62e15705446536d666753b5c13e | 8,964 |
| Jastrow/Clay, PG11000 | 5122acbe61568f7cf2529c1a133998dced6cbde8 | 11000-8.txt | aeff1b08730186ebafcdec2964b2681bf4e07a0e | 42,323 |
| Budge, PG7096 | 1df00324a35b316bb0e537ff15514fa9c9523d8e | 7096-8.txt | bc03ea95546e43ebb77781688ab49146c6d00382 | 17,031 |

## Actual original-source results

Longest number of consecutive *matching GP rune-word lengths*, not decrypted words:

| Source edition | Quote 4, 14 words | Quote 5, 13 words | Quote 6, 34 words | Quote 7, 14 words |
| --- | ---: | ---: | ---: | ---: |
| Langdon | **5** | **5** | **6** | **4** |
| Jastrow/Clay | **7** | **5** | **7** | **6** |
| Budge | **7** | **5** | **6** | **6** |

The strongest seven-length source segments are short, expected-looking coincidences such as “HIS HEART BECAME GLAD AND HIS FACE.” For Budge quote 7, the longest six-token segment is in the Gutenberg licensing footer. None of the **12** original-quote/source comparisons reaches the predeclared **12 consecutive words and 40 GP runes** necessary to nominate a substantial plaintext crib; none matches an entire long quotation.

The positive control takes 34 unmodified consecutive source word lengths from each edition and recovers the exact **34/34** same-source span. A deliberate change of one control length abolishes the full 34/34 recovery. This checks detection power for real copied text, independent of any cipher assumption.

## Reproduction and decision

The complete original-runic / source-byte-pinned implementation is [single-file Node 22 CommonJS SFT](../sims/lp2_gilgamesh_era_quote_crib_sft.cjs), which uses only Node built-ins, writes nothing, and verifies original corpus offsets, source Git blobs, fixed maximums and all positive controls. [**Passing manual GitHub Actions run 43355220984**](https://github.com/FlareZ123/liber-primus/actions/runs/43355220984), 13 November 2026, executes exactly the committed script.

An earlier source-preview calculation underestimated Budge quote 7 because the raw pinned text includes additional Gutenberg boilerplate. The original CI run 43355083998 correctly failed that overstrict expected maximum; the raw-source value **six** was fixed and the entire unchanged original gate passed in the later run. No output prediction or admissibility condition was relaxed.

**Decision:** These three fixed period-published source editions cannot supply a long *verbatim, word-boundary-preserving* unknown LP2 quotation. Nothing here excludes other particular versions, paraphrases, non-English output, or ciphertext word boundaries that differ from plaintext. Reopen exact-source crib recovery only with an independent original instruction identifying a particular work/edition, rather than extending to generic mythology corpus searches. Keep this finite negative in intermediate results; it does not change the authoritative decryption status.
