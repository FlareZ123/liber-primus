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

The original p0–p2 729-rune opening has a 13-rune red heading followed by a 716-rune chapter remainder. Treating p0 body as beginning at offset8 would introduce five authentic red heading runes into the wrong cipher register. The previous red8-marker8 key-switch hypothesis is excluded by this direct image reading. The older published total of 225 red runes should **not** be reduced by five based on p0.

## The 13-dot mark is not a source-selected cipher initial state (Issue #1905)

The p0 image establishes a precise *layout* boundary: 13 red heading runes, then the large red 13-dot mark at GP offset13, then black body. That is the only operation selected by this page itself: exclude the heading/marker from the black-body ciphertext register and begin the body at offset13. It does not specify a key, a GP29 direction, a state-update law or a reset schedule.

The first later red 13-dot mark in physical reading order is the blind p2 consequence frozen in Issue #1905. Original p2 image **19.jpg** places it at GP offset **201**, exactly equal to p2's 201-rune count: it follows the final body rune and has no following p2 rune. P1 has no red 13-dot mark. The full LP2 annotation census finds **30 red 13-dot marks across 58 pages**: **19 internal**, **10 terminal**, and **one at page offset0** (p15). Thus p0's offset13 mark is one instance of a recurring punctuation family, not a uniform initial-state marker. P2's terminal placement is incompatible with treating every such mark as the beginning of a new cipher state. The p0 13-rune heading / 13-dot equality is a local layout alignment, not a key selector.

| Original page | Red 13-dot offset | Page rune count | Position |
| --- | ---: | ---: | --- |
| p0 (17.jpg) | 13 | 262 | internal; after the 8+5 red heading |
| p2 (19.jpg) | 201 | 201 | terminal; after the last body rune |
| p15 | 0 | page-start | the only red 13-dot mark at offset0 |

At most three low-description readings are warranted:
1. **Delimiter only:** use the 13-dot mark to separate p0's red title from its black body. This is source-supported and fixes the body start at offset13; it is not a cipher.
2. **Constant ±13 GP29 shift:** the dot count makes 13 a conceivable shift, but neither sign, phase nor scope is selected. It is not run.
3. **Period-13 red-title key:** the 13 red title runes could be guessed as a repeating key, but the image gives no instruction that the title is a key and no sign or continuation rule. A related p0-title/2015-prime-delta composition was already tested and rejected; it is not repeated.

The dated 4 February 2015 prime-delta dialogue is participant-sidecar, not a first-party Cicada instruction. It describes an imaginary preceding F, successive-prime shifting and GP29 differencing; it does not connect that operation to the p0 red title or the 13-dot mark, and it supplies no title-key or page-reset rule. The 2015 idea therefore cannot fill the missing selector.

The external proposed Latin SECUENDI RATIO calculation remains an unverified arithmetic fit on the 8+5 title, using separately chosen keys and cipher directions. The physical placement supplies neither key nor direction. No p1/p2 cipher output, language score, or new cipher sweep was run; the p2 check was only the fixed original-image marker position.

**Decision:** retain the corrected 8+5 red heading and body start at offset13. Treat the 13-dot glyph as recurring punctuation/section layout unless independent first-party evidence selects a cryptographic role. The p2 terminal control rejects a generic initial-state/reset interpretation. No unknown plaintext, key or cipher mechanism is recovered.