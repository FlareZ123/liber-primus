# Liber AL source text: direct-key, quotation and geometry gate

**Disposition:** The historically referenced *Liber AL vel Legis* remains a legitimate source to investigate, but neither complete archived chapter text nor the source-visible keywords recover unknown LP2 plaintext by the direct rules below. No authentic LP2 cipher key, original decoder, or destination has been identified. This consolidates the earlier Director Issue #253 keyword/geometry test and an independent Agent 19 full-text/word-length test.

## Historical clue and scope

The archived 2013 Cicada book-code challenge points at *Liber AL vel Legis*. The three archived chapter transcriptions are exactly resources/external/2013-book-of-law-I.txt, -II.txt, and -III.txt. The historical source therefore provides an independently motivated candidate *text*, while supplying no instruction to treat it as a running GP29 cipher key, no LP2 source/page coordinate, and no decryption alignment.

The earlier Issue #253 additionally examined the exact phrases I:24 (“my word is six and fifty”) and III:47 (letter positions, line/circle, *Abrahadabra*). The literal words NUIT and ABRAHADABRA suggest finite keyword and period choices, but do not select Vigenère or a Hill matrix. The original p32 11×11 layout and III:47 diagram are separately examined elsewhere; no direct geometry-to-plaintext mapping is established.

## Direct original-cipher operations

All tests use the pinned **12,956 original unsolved GP29 rune indices**, including only the 55 rune-bearing physical pp0–55, from resources/liber-primus/lp2-corpus.json. Page turns preserve continuous clocks, never silently insert rune separators. Original IoC is **0.034478397865**.

The existing [keyword/Hill reproducer](../sims/issue253_liber_al_keyword_gate.cjs) tests:

1. NUIT GP29 key [9,1,10,16] with both additive orientations, producing IoC near **0.03449**.
2. ABRAHADABRA GP29 key [24,17,4,24,8,24,23,24,17,4,24] with both signs, producing IoC **0.03447–0.03452**.
3. The invertible 11×11 circulant matrix formed from ABRAHADABRA, both row/column orientations: IoC **0.03445–0.03448**.
4. The original p32 11×11 rune matrix as an auxiliary invertible Hill key: no linguistic plaintext.

The additional [full-text and quotation reproducer](../sims/2013_liber_al_fulltext_original_sft.cjs) freezes the **natural chapter order I/II/III**, eliminates printed verse numbers, strips punctuation and transliterates letters into the corpus's GP29 alphabet. K/Q→C, V→U, Z→S are explicitly conventional candidate mappings; GP digraphs TH/NG/EO/OE/AE/IA/EA each consume one rune. No chosen phase, secret source excerpt or fitted reset is allowed. Chapters supply **7,003/7,103/7,524 GP symbols**, respectively; their concatenation supplies **21,630** symbols. Twelve direct additive cases are tested: each natural chapter start and the concatenated I-II-III starting at its first symbol, under P=C-K, P=C+K, and Beaufort P=K-C modulo 29.

**Result:** The 12 original output IoCs are between **0.0344400 and 0.0345039**. None shows authentic GP29 prose. Every model correctly decodes and re-encodes a source-native repeated-p57 plaintext plant and exactly re-encodes the original after decoding it. As with every bijective cipher, such a round trip verifies the implementation but cannot select the historical key.

## Independent literal-text crib

A direct quotation can remain detectable via unchanged **printed word lengths**, even if the runes are obscured by an unconstrained word-preserving substitution. The standard shared parser finds 2,896 original LP2 words. Against the three historically archived *Liber AL* chapters without verse numbers, compare every contiguous aligned run in two conventions: ordinary Latin letter counts and native-GP counts after the same stated digraph normalization. The longest exact match anywhere is **eight words**. Results by chapter, as [Latin, GP] maxima:

- **I:** [0,0] matches of length eight or longer.
- **II:** [8,8] words.
- **III:** [8,8] words.

The test exhausts the supplied source text at unshifted word boundaries; a planted 16-word exact source excerpt would be distinguishable by the same equality criterion. Eight-word overlaps are isolated candidate coincidences, with no longer quote, independently identified source span, or original cipher key. This excludes an obvious long word-for-word reuse of these **specific archived transcriptions** with preserved word boundaries. Paraphrases, different editions, unknown punctuation edits, a source-dependent transposition, a non-GP intermediate and other cipher structures remain open.

## Consequence

The original *Liber AL* source has been tested beyond short keywords. **Retire the direct unshifted full-book GP29 running-key and long literal quotation ideas under the exact stated normalization**; do not expand them into arbitrary phases, verse resets, library editions, word alignments, or novel glyph alphabets without independent source instructions. Likewise, the earlier III:47 line/circle and 11×11 keyword matrix interpretations remain source-insufficient. A new historical artifact establishing a specific LP2 word coordinate, key operation or state initialization could reopen a focused test.

No established result or complete-source synthesis is changed by these finite negative results.
