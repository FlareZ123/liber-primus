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

The first later red 13-dot mark in physical reading order is the blind p2 consequence frozen in Issue #1905. Original p2 image **19.jpg** places it at GP offset **201**, exactly equal to p2's 201-rune count: it follows the final body rune and has no following p2 rune. P1 has no red 13-dot mark. The full LP2 annotation census finds **30 red 13-dot marks across 58 pages**: **19 internal**, **10 terminal**, and **one at page offset0** (p15). Thus p0's offset13 mark is one instance of a recurring punctuation family. P2's terminal placement only rejects a requirement that every mark introduce a new segment on the same physical page; it is compatible with a reset before the next page or section. The solved p56 prime-minus-one clock crosses internal marks without reset, rejecting a universal reset for that known cipher. The p0 13-rune heading / 13-dot equality is a local layout alignment, not a key selector.

| Original page | Red 13-dot offset | Page rune count | Position |
| --- | ---: | ---: | --- |
| p0 (17.jpg) | 13 | 262 | internal; after the 8+5 red heading |
| p2 (19.jpg) | 201 | 201 | terminal; after the last body rune |
| p15 | 0 | page-start | the only red 13-dot mark at offset0 |

At most three low-description readings are warranted:
1. **Delimiter only:** use the 13-dot mark to separate p0's red title from its black body. This is source-supported and fixes the body start at offset13; it is not a cipher.
2. **Constant ±13 GP29 shift:** the dot count makes 13 a conceivable shift, but neither sign, phase nor scope is selected. It is not run.
3. **Period-13 red-title key:** the image gives no instruction that the title is a key, but the simplest printed-order additive receiver has now been tested by Agent14 (25 November): use the exact 13 red GP29 values as a period-13 key from the first black body rune, with both arithmetic signs, on the 249-rune p0 body and the 716-rune p0–2 chapter remainder. Neither output develops a language signal; exact values and the bounded decision are below. This retires only the raw printed-order repeating additive key. The separate dot-ordered repeating-key and autokey tests are in [the p0 topology report](lp2-p0-red13-dot-topology-readout.md).

The dated 4 February 2015 prime-delta dialogue is participant-sidecar, not a first-party Cicada instruction. It describes an imaginary preceding F, successive-prime shifting and GP29 differencing; it does not connect that operation to the p0 red title or the 13-dot mark, and it supplies no title-key or page-reset rule. The 2015 idea therefore cannot fill the missing selector. Agent14's direct printed-order test below now supplies the first p0–2 output and language score for the raw title-as-key candidate, but it does not change this source-level conclusion.

The external proposed Latin SECUENDI RATIO calculation remains an unverified arithmetic fit on the 8+5 title, using separately chosen keys and cipher directions. The physical placement supplies neither key nor direction. No p1/p2 cipher output, language score, or new cipher sweep was run; the p2 check was only the fixed original-image marker position.

## Direct printed-order red-title Vigenère test (Agent14, 25 November 2026)

The source image fixes a 13-rune red heading in printed 8+5 order, then the 13-dot boundary and black body. A contemporary solver could try the title itself as a period-13 GP29 additive key, beginning at the first black rune. This is a compact, recognizable Vigenère hypothesis; it is not an operation prescribed by the image. The exact raw key is `[15,8,18,3,6,19,27,0,15,26,18,21,5]`. I tested only the two arithmetic directions, phase zero, with one continuous key clock and no F bypass or page reset.

| Target | Length | Raw IoC | C−K IoC | C+K IoC |
|---|---:|---:|---:|---:|
| p0 black body | 249 | 0.03436326 | 0.03462236 | 0.03355357 |
| p0–2 chapter remainder | 716 | 0.03410165 | 0.03435559 | 0.03419541 |
| Clear p57 control | 95 | — | — | 0.06270997 |

Neither direction yields a readable opening or a natural-language frequency signal. The chapter-remainder test starts the key at p0's first black rune and carries it continuously through p1 and p2, matching the original 716-rune opening unit. The direct printed-order test is distinct from the dot-topology permutation, the 13-rune autokey, and the 2015 D/E compositions already tested elsewhere. Exact inputs, original p0 image hash, both directions and round-trip implementation checks are preserved in [the Node 22 SFT](../sims/lp2_p0_red13_title_key_sft.cjs).

**Decision:** retire the raw printed-order period-13 additive receiver on p0 body and the p0–2 chapter remainder. This does not show that the heading has no puzzle role; it shows only that this obvious direct Vigenère consumer does not recover the black text. The image still selects the layout boundary, not a key role or cipher direction.


**Decision:** retain the corrected 8+5 red heading and body start at offset13. Treat the 13-dot glyph as recurring punctuation/section layout unless independent first-party evidence selects a cryptographic role; the raw printed-order period-13 additive guess is now also negative. The p2 terminal control does not reject a cross-page or section-specific reset. No reset rule is source-selected. No unknown plaintext, key or cipher mechanism is recovered.