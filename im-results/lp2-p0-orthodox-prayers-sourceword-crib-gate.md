# Orthodox-cross chapter and a source-cued literal prayer-text crib

**Agent34, 18 November 2026. Bounded original-cipher negative; no unknown plaintext, key or destination.** The original LP2 opening pp0–2 shows two inverted, repeated three-bar Eastern/Russian Orthodox crosses, independently identified and registered against original JPEGs in [the opening cross study](lp2-p0-p2-orthodox-cross-source-plate-gate.md). A period-available English prayer book, *Orthodox Daily Prayers*, Gutenberg ebook 34981, therefore supplies a historically plausible **specific** quotation source, distinct from the earlier full-KJV crib and Russian letter-inventory checks.

## Decisive source quotation test

The original unchanged [LP2 transcription](../resources/lp2-transcription.txt), parsed with [the common word-boundary parser](../sims/lp2_word_pages.cjs), yields exactly **158 complete printed words and 729 GP runes on pp0–2**. Page/line wraps never terminate a word. The control text is the repository-pinned [Gutenberg Orthodox prayers](../resources/control/orthodox_daily_prayers_pg34981.txt), restricted to its Gutenberg **START/END** main body and giving **25,088 English word tokens**. Encode each English word only to its **GP rune length**, using the standard QU→CW, V→U, K/Q→C, Z→S and digraph/ING condensation. No key, rune substitution, word insertion, deletion, offset, or page shift is inferred from the ciphertext.

Index every seven-consecutive-word source length tuple, find all matching original seven-tuples, and extend them exactly left and right. Four unique matches exist, **all exactly seven words long**:

| Original p0–2 word index (zero-based) | Source word index (zero-based) | Exact-length-matched control phrase |
| ---: | ---: | --- |
| 22 | 10012 | have we put our trust Do not |
| 73 | 21991 | she came with her heart so O |
| 98 | 21291 | nature by the descent of the Holy |
| 118 | 15845 | this present noise O my Guardian and |

There are **zero matches of eight or more consecutive printed-word lengths** anywhere in the frozen control. A genuine **16-word held-out slice** from that exact control source, at positions 7000–7015, is recovered in full by the identical matching code; the search can find a real source quotation if one is present.

## Decision

The original Orthodox crosses legitimately select an iconographic family, and the word lengths provide a key-independent necessary condition for an unchanged-word quoted passage. **No eight-word or longer contiguous quotation of this exact Gutenberg Orthodox prayer text can be the word-preserving plaintext of original pp0–2.** The four seven-word candidates are length coincidences without any ciphertext-to-plaintext decoder; they are not proposed decryptions.

A different historical Orthodox text, paraphrase, translation, deliberately altered word boundaries, or a valid encryption that changes the printed word lengths escapes this bounded test. The crosses also appear to be repeated compositor art, so their religious classification alone does not authenticate a prayer-book key. Do not generalize this one named-source negative to all Christian sources or claim a recovered unknown page. A productive successor would require the **exact original plate/caption or a source-authored quote reference**, rather than testing unbounded adjacent prayer books.

**Reproduction:** [Passing Windows Node22 Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/44212017932) and [single Windows Node22 test](../sims/lp2_p0_orthodox_prayers_contiguous_crib_sft.cjs), reading only the unchanged repository-pinned text and transcript. The output asserts the full source count, all four original matches, and the sixteen-word positive plant; no randomness or tuning is involved.