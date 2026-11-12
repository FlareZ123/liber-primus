# Whole-LP2 original-word-length crib search against historically motivated texts

**Scope:** all 2,896 original printed LP2 unknown-text words (12,956 rune glyphs, physical pp0–55); exact contiguous word-length matching against four prior broad prose sources and four additional books directly connected to Cicada 2012–2013. **No original unknown plaintext, source-selected key, historical cipher, or continuation recovered.** This rules out the specified long verbatim-quotation register under preserved source word lengths; it does not rule out copied passages edited, reworded, resegmented, or otherwise transformed before encryption.

## Why word lengths provide a legitimate crib test

The original manuscript prints word-delimiting marks even though its rune identities are encrypted. A plaintext-preserving-word-boundaries cipher would leave the sequence of word lengths visible. An independently known book passage matching a *long* consecutive original word-length sequence could provide a credible ciphertext/plaintext crib without guessing any cryptographic key. Cicada historically used Blake's *The Marriage of Heaven and Hell* in its 2012 puzzle and Crowley's *Liber AL vel Legis* in its 2013 book-code chain. Those are more constrained candidate texts than generic corpus selection; the earlier English controls also remain useful matched comparators.

The canonical parser in [`sims/lp2_word_pages.cjs`](../sims/lp2_word_pages.cjs) preserves words across printed lines and page joins, correctly skips physical p50's runeless grid and finds **2,896 complete words / 12,956 runes**. Each source is compared in its original reading order under two independently specified length registers:

- **Literal Latin:** letters A–Z per word after ignoring nonletter marks.
- **Greedy GP29:** the source's solved-runic spelling conventions, recognizing `ING` before `NG`, and recognizing `TH NG EO OE AE IA EA` as single-rune digraphs.

For each source, seven consecutive equal lengths are used only as an efficient exact-match index. Every hit is extended maximally in both directions, and source/LP2 starting word indices and the original physical LP2 page are retained. This identifies intact copied passages only; the search does not fit cipher keys, reorder source words, change manuscript separators, or treat a short length coincidence as text recovery.

## Complete original-source comparison

| Independently pinned reference | Source words | Longest exact literal-word match | Longest exact greedy-GP match | Result |
| --- | ---: | ---: | ---: | --- |
| Cicada solved LP1 text, headings excluded | existing source | fewer than 8 | fewer than 8 | Prior bounded negative |
| Gibran, *The Prophet* | 15,733 | 9 | 9 | Prior bounded negative |
| Emerson, *Essays* | 77,932 | 10 | 9 | Prior bounded negative |
| Shakespeare excerpt | 55,407 | 9 | 9 | Prior bounded negative |
| *Liber AL vel Legis* chapter I | 1,897 | **7** | **7** | New historical-source test |
| *Liber AL vel Legis* chapter II | 1,968 | **8** | **8** | New historical-source test |
| *Liber AL vel Legis* chapter III | 2,002 | **8** | **8** | New historical-source test |
| Blake, *The Marriage of Heaven and Hell* (1906 transcription) | 4,609 | **7** | **8** | New historical-source test |

The additional four source files are `resources/external/2013-book-of-law-{I,II,III}.txt` and `resources/external/blake-marriage-1906-gutenberg45315.txt`, all preexisting historical source references in the research repository. A script using the original complete manuscript, preserving original page boundaries, found **no nine-word exact match in any of these four texts under either spelling convention**. For example, the best chapter-II literal match is eight lengths starting at LP2 physical **p16 / original word856**, aligned with the source opening “HATE THE HAND THE PEN BUT I AM”; this is a *length-pattern* match, **not a decrypted phrase**. The best Blake greedy-GP match is eight lengths at physical **p46 / original word2516**, aligning “BUT WHEN HE HAS DONE THIS LET HIM”. Those short motifs do not provide a defensible authored passage or key.

An additional exploratory fixed-width 24-word comparison, anchored by any four consecutive exact lengths, produced maximum **16/24** exact coincidences for any of the new GP-spelled sources, with eight other mismatches in that local window. This local post-selected statistic is insufficient to claim quotation. It is *not* used as a decryption criterion; no reference source approached an intact 12-word passage.

## Reproduction, power, and next decision

The existing [whole-LP2 broad-source crib SFT](../sims/lp2_allwords_reference_length_crib_sft.cjs) runs the four earlier controls and recovers a planted **16-word Shakespeare passage** within the untouched original 2,896-word length array ([successful source-backed CI](https://github.com/FlareZ123/liber-primus/actions/runs/42973182756)). The new [historical-book SFT](../sims/lp2_historical_book_length_crib_sft.cjs) performs complete seven-seed maximal-extension scans over all four added books, asserts their exact eight source/mode maxima and missing nine-word passages, and recovers its own planted **16-word GP29 *Liber AL* chapter-II passage** at original word1000. Both positive controls are required to distinguish an absent intact passage from a broken search algorithm.

**Research decision:** Do not treat a short word-length correspondence to Blake or *Liber AL* as a cipher crib. These historically anchored books supply no long original LP2 known plaintext under the simple word-preserving-cipher premise. Return to independently source-selected mechanisms, other original material or a new constraint that predicts authentic rune identities; a source name alone does not justify broader approximate matching or retuning the manuscript's word boundaries.
