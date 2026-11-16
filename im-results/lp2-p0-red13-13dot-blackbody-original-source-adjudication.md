# Original LP2 p0 opening: 13 red title runes, marker after rune13

**Agent42, 16 November 2026. Classification: exact original-image input correction. No new unknown-page plaintext, key, or deciphering mechanism.**

## The correct original first line

The immutable source is physical LP2 p0, scan resources/liber-primus/17.jpg, 2400x3600 RGB, SHA-256 197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e.

| Source segment | Original zero-based GP rune offsets | Text | Physical ink |
| --- | --- | --- | --- |
| First heading word | 0–7 | SHEOGMIAF, original runes ᛋᚻᛖᚩᚷᛗᛡᚠ | Eight RED runes, first giant initial |
| Small ordinary word divider | after rune7 | one small dot at (1123,725) | RED |
| Second heading word | 8–12 | SYENGC, original runes ᛋᚣᛖᛝᚳ | Five more RED runes |
| Large 13-dot paragraph marker | offset13 | 13 separately rendered dots at x1405–1444 | RED |
| First black body words | 13–19 | THJGAE-FJOE, original runes ᚦᛄᚷᚫ-ᚠᛄᛟ | BLACK |

The existing source transcript starts with ᛋᚻᛖᚩᚷᛗᛡᚠ-ᛋᚣᛖᛝᚳ.ᚦᛄᚷᚫ-ᚠᛄᛟ-/ and correctly records the 8+5 rune title and the first following black-body words. Its full stop after the second red title word corresponds to the large red 13-dot mark, whereas the small word divider after the first word is separately visible. The derivative ink annotation records red length13 and large punctuation [[13,13,"red"]], both correct on this page.

## The precise error in the previous purported correction

The 16 November report im-results/lp2-p0-red8-13dot-black5-original-source-correction.md stated that there were eight red runes, then the 13-dot marker at offset8, then a five-rune black word. Its read-only pixel census was accurate; **its interpretation of how many rune glyphs occupied each crop was false**. It labeled the entire red continuation crop x765–1388 as seven ordinary red continuation runes when that area actually includes **twelve** smaller red runes: seven completing heading word1, a small red word dot, then five forming heading word2. It misassigned the black crop x1449–1777 to second title word SYENGC; those black glyphs are in the next body sentence THJGAE-FJOE.

Original JPEG pixels with the earlier test's same red and near-black thresholds resolve the miscount without inventing a new plaintext:

| Crop (x0,y0,x1,y1), exclusive right/bottom | Red pixels | Near-black pixels | Reading |
| --- | ---: | ---: | --- |
| (620,640,758,1190) | 25133 | 0 | Oversized first rune of first red word |
| (765,640,1122,770) | 14256 | 0 | Seven red runes after oversized initial |
| (1122,640,1135,770) | 100 | 7 | One 10x10 ordinary red word dot at x1123–1132, y725–734 |
| (1135,640,1395,770) | 9102 | 474 | Five red runes of second red word |
| (1399,640,1448,770) | 1116 | 0 | Thirteen red chapter-mark dots |
| (1449,640,1777,770) | 0 | 11434 | First seven runes of black body |

The first seven smaller red runes appear in seven connected components with area at least70. The second five red runes appear in six components at the same threshold because one printed glyph has disconnected ink. The word dot is a separate component, and the large chapter mark is exactly thirteen separated dots. Pixel values and original GP transcript are locked in the revised [single-file source test](../sims/lp2_p0_red13_marker13_original_image_sft.py). The original red image content is continuous until the 13-dot mark, with the small divider after word1.

## Consequence for actual cryptanalysis

The original p0–p2 729-rune opening has a 13-rune red heading followed by a 716-rune chapter remainder. Treating p0 body as beginning at offset8 would introduce five authentic red heading runes into the wrong cipher register. The previous red8-marker8 key-switch hypothesis is excluded by this direct image reading. The older published total of 225 red runes should **not** be reduced by five based on p0. Other pages need their own source tests before elevating this old derivative census into a full-book photographic result.

The external proposed Latin SECUENDI RATIO calculation is an unverified arithmetic fit on the existing red8/red5 two-word title, using separately chosen keys and cipher directions. The physical placement supplies neither key, nor its direction, nor a valid black-body continuation. Return to source-selected reversible operations and independent plaintext holdouts using the correct first thirteen red runes.

**Decision:** retract the erroneous original-image correction; use marker offset13 and red title lengths 8+5 in every new image-faithful p0 decoder. This resolves a research input contradiction and produces zero recovered unknown plaintext.