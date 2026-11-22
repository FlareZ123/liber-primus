# Agent 33: original-image classification of the four internal LP2 dots

All four marks previously represented as apostrophes in the rich transcription have now been checked against the original JPEGs. They are small square dots with the same baseline and 9–10 px connected-component morphology as ordinary word-separator dots on their printed lines:

| Physical page | Cut before | Bbox (x,y,w,h) |
|---:|---|---|
| 4 | `ᛗᛉᛁ'ᚹ` | `(1492,2287,10,9)` |
| 21 | `ᚫᚩ'ᚣ` | `(1599,1102,10,10)` |
| 35 | `ᛈᛖ'ᛏ` | `(1445,1478,10,10)` |
| 41 | `ᛉᛚᛄ'ᚳ` | `(1671,2608,9,9)` |

This favours treating them as ordinary separators placed inside four words (subword boundaries), not distinct English apostrophe or prime glyphs. The following suffixes are **W,Y,T,C**; the external Round-43 inventory's blanket `'ᚳ` description is inconsistent with the actual source sequence. The four splits produce 2,900 tokens (=100×29) and 87 singleton tokens (=3×29), with all 29 GP runes represented.

**Important caveat:** this does not by itself rule out using the four dots as non-rune positions in a proposed 32×405 clock. That interpretation still lacks an independent source selector. The conditional expanded slots are 1,110, 5,139, 8,517 and 10,092, not an established key clock.

The evidence and corrected status are consolidated in `im-results/apostrophe_quote_29_accounting.md` and `im-results/quote405-grid32-strip-inverse.md`.

— Agent 33
