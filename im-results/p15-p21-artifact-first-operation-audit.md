# Original-artifact audit of the p15–21 chapter opening

**Disposition (13 November 2026): bounded no-operator finding.** The original scans reveal no newly source-selected reversible operation on the unknown pp16–21 runes. This is a human-solve-path audit, not a decryption and not a new p15 key search.

## Source and page map

The archive mapping is physical LP2 page = JPEG index − 17: p15–21 are original scans [32.jpg](../resources/liber-primus/32.jpg) through [38.jpg](../resources/liber-primus/38.jpg). These pages belong to the source-visible p15–22 chapter (1,903 runes total): p15 159, pp16–21 1,613, p22 131.

| Page | Original image | Directly observable structure | Candidate instruction |
|---|---|---|---|
| 15 | [scan 32](../resources/liber-primus/32.jpg) | Two spatially separated red headings (9 and 11 runes), a 4×4 decimal grid with **3299** highlighted red, a hand-drawn infinity/lemniscate mark, and a large red initial at the start of the runic body | The grid's exact generator is already established: (N_n=|3301-p_{F_n+1}|) for the first 16 distinct Fibonacci values, placed in the visible outward square spiral from red 3299. This explains the **numbers**, not the following rune text. The infinity mark could invite continuation, but does not state an operand, serialization, clock, reset or cipher transform. |
| 16–20 | [scan 33](../resources/liber-primus/33.jpg), [34](../resources/liber-primus/34.jpg), [35](../resources/liber-primus/35.jpg), [36](../resources/liber-primus/36.jpg), [37](../resources/liber-primus/37.jpg) | Each is a monochrome, text-only block of 12 runic lines. No red ink, illustration, marginal note, page number, diagram or visibly distinguished line start/end appears. | No page-specific visual operand or reading instruction is present. |
| 21 | [scan 38](../resources/liber-primus/38.jpg) | Same 12-line monochrome text block; one larger vertical gap separates lines 2 and 3. | This is consistent with a paragraph separator, not a unique cipher instruction or state reset. |

## Measured layout facts

- The canonical transcription has 12 lines on each of pp16–21. That count is not distinctive: **35 of its 57 represented LP2 pages** have 12 runic lines.
- In scans 33–38, the six text blocks begin at approximately x=600 px. Ordinary line-start-to-line-start pitch is 188–189 px. All six pages have exactly 12 detected line bands under the reproducible threshold below.
- The sole within-scope vertical-spacing outlier is p21 (scan 38): the start-to-start pitch from line 2 to line 3 is **224 px**, 36 px greater than the ordinary pitch. The same 224 px pitch occurs elsewhere in the original corpus (pp4, 10, 41, 42 and 43), so it is a recurring paragraph-spacing convention, not a p15–21-specific selector. There is no accompanying horizontal indent or special rune.
- A simple red-ink pixel test returns zero red pixels on scans 33–38. The red ink is confined to the p15 source markings in this local sequence.

For exact reproduction, convert each original JPEG to grayscale, restrict to x=580:1850 and y=450:3250, mark a row when it contains more than 30 pixels below intensity 100, and merge contiguous marked rows. For color, classify a pixel as red when R>100, R>G+25 and R>B+25 (cast channel values to a signed/integer type before adding 25). This recovers the 12 line bands and the p21 224 px gap described above.

## Human solve path and the missing instruction

A solver in 2014 could reasonably notice the p15 red 3299 anchor, the 3301 reference, Fibonacci indexing, primes and the printed spiral; the exact 16-cell construction is real and reproducible. The infinity mark naturally raises the question of continuing the sequence. The next distinct Fibonacci value is 1597, giving prime index 1598 and prime 13477. But the page does not say whether that value is a byte offset, a rune shift, a word/line address, a state seed or something else. The bounded historical-source review found a partial earlier Cicada prime/3301 antecedent, but no source prescribing the complete p15 composition or a successor consumer. The already tested single base+13477 DATA/560.13 consumer had zero survivors in its frozen 720-candidate screen; do not repeat it.

The six following text pages add no visible operator or operand. Their ordinary line count and paragraph spacing preserve useful text segmentation but do not select a cryptographic family, key, or state clock. The two red headings are spatially separated by the grid and infinity mark; flattening or concatenating them is not an instruction visible on the page. No additional numeric transfer, arbitrary layer, or key sweep is justified by these scans.

## Conclusion and one follow-up

**Close this branch as “no new p16–21 operator visible.”** The exact p15 numerical construction remains established only as a grid decipherment; the surrounding 1,903-rune chapter remains encrypted.

One distinct next question is worth considering: **does the terminal p22 engraving ([scan 39](../resources/liber-primus/39.jpg)), at the end of this same visual chapter, supply a concrete selector or operand that the p15 infinity mark alone does not?** This is an artifact-first question, not a claim that the engraving is a key. Do not reopen p15 arithmetic or the already tested direct key families without a new source-selected instruction.

## Existing work deliberately not repeated

This audit read the scope and negative boundaries in Issues [#147](https://github.com/FlareZ123/liber-primus/issues/147), [#479](https://github.com/FlareZ123/liber-primus/issues/479), [#619](https://github.com/FlareZ123/liber-primus/issues/619) and [#677](https://github.com/FlareZ123/liber-primus/issues/677), together with the authoritative [p15 spiral result](../results/lp2-p15-fibonacci-prime-spiral.md) and [historical-source gate](p15-fibonacci-prime-spiral-historical-source-gate.md). Their established conclusions remain unchanged; this report adds only the direct pp16–21 visual/layout audit and the measured recurring paragraph gap.
