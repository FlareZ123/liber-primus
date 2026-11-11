# LP2 p27 rune 93: original-image adjudication

**Evidence class:** direct visual source adjudication. This is a transcription check, not a plaintext, key, or cipher discovery.

## Decision

The canonical reading **ᚢ (U)** at LP2 page 27, zero-based rune index 93, is supported by the original page image. A separate OCR review flagged this position as a possible U→B change; the image does not support B. **Do not alter the canonical transcription.**

## Exact source and position

- Original page image: `resources/liber-primus/44.jpg` (2400×3600; archive image 44 is LP2 p27).
- Canonical corpus: `resources/liber-primus/lp2-corpus.json`, page 27, `runic_count=234`, `indices[93]=1`; GP index 1 is `ᚢ`.
- Text transcription: page-27 block in `resources/lp2-transcription.txt` also contains 234 runes. Rune 93 is on the fifth printed text line, seventeenth rune, in `ᚢᚣ` in the line:
  `ᛖᛚ-ᛇᚱᚾᛋᚩᚩ᳀ᚪᛖᚣᛖᛖ-ᛏᚱ-ᚢᚣ-ᛟᛄᛉ-/`.

## Same-page visual controls

Pixel coordinates below are inclusive `(x0,y0)-(x1,y1)` in the original 2400×3600 image.

| Glyph | Position | Bounding box |
|---|---|---|
| Target `ᚢ` | p27 rune 93; line 5, column 17 | (1404, 1671)–(1459, 1783) |
| Reference `ᚢ` | line 2, first word, third rune | (956, 1106)–(1008, 1244) |
| Reference `ᚢ` | line 6, fifth word, fourth rune | (1452, 1858)–(1504, 1988) |
| Reference `ᛒ` | line 2, second word, first rune | (1195, 1106)–(1234, 1243) |

The target has the same single-stave/descending-diagonal/right-stave construction as both U controls. The B control has two closed triangular bowls, which the target does not have. The target also does not have the two open arms of the page's F rune. This is a direct within-page comparison, not a language-model or context-based guess.

## Reproduction

Load `resources/liber-primus/44.jpg` with Pillow and crop each box above (Pillow's upper bounds are exclusive, so add 1 to each listed x1/y1). Place the four crops side by side without changing their aspect ratios. The target is visually U-shaped and matches both U controls; it is not B-shaped.

**Result:** retain `ᚢ` at p27:93. No change to `lp2-corpus.json` or `lp2-transcription.txt` is justified. No inference about the cipher mechanism follows from this single glyph.
