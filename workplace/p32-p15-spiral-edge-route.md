# p15 Fibonacci-prime spiral → p32 word-edge route → possible p55 target

**Status: source-constrained navigation hypothesis; not a decryption.** The new 3301-complement/prime-rank address materially strengthens the p15→p32 selector. It still does not specify a reversible cipher or recover plaintext. Keep source facts, selector inferences, and failed readouts separate.

## Candidate human solve path

The signed 2016 tree image is 563×569. Original LP2 physical p32 contains 121 runes, naturally arranged as an 11×11 row-major grid. Its first-row and first-column GP-prime sums are exactly 563 and 569, defining the already documented image partition.

The canonical p32 word stream has 22 printed words with lengths:

`1, 3, 5, 11, 5, 5, 3, 11, 6, 9, 5, 8, 4, 9, 4, 8, 2, 3, 2, 8, 5, 4`.

A plausible interpretation of the signed 2016 instruction (“words are the map; meanings are the road; numbers are the direction”) is to inspect four-rune word-edge fragments. The four-rune length is suggested by the 4×4 number square on LP2 physical p15; this is a hypothesis, not an explicit instruction.

Across the 22 p32 words there are 32 raw four-rune prefix/suffix windows, 29 unique after deduplicating identical prefix/suffix windows of four-rune words, and 9 unique windows whose four GP symbols each transliterate to one letter. The nine are `HOME, SLFD, TYMG, WBSR, BUDS, NWGU, LAOY, UTFJ, TFJT`. Only HOME and BUDS occur in the repository's 1,809-entry four-letter TextBlob frequency lexicon.

HOME and BUDS are **edge fragments, not complete printed words**:
- HOME is the four-rune prefix at offsets 33–36 of the 11-rune word `HOMEXWDSLFD`, the first word of p32's second clause.
- BUDS is the four-rune suffix at offsets 93–96 of the eight-rune word `OENGOMBUDS`, which begins at offset 89.

There are five unique geometrically valid southeast edge pairs separated by 60: starts (4,64), (16,76), (25,85), (33,93), and (44,104). **HOME→BUDS is the only pair among the nine single-letter edge windows that is both a lexicon word pair and +60 apart.** The 60-step pair is therefore more selective than the unfiltered edge-window claim, but it remains conditional on the chosen edge length and displacement.

The HOME→BUDS path is offsets **[33,45,57,69,81,93]**, coordinates **(3,0)→(8,5)**, rune labels **[H,B,M,IA,NG,B]**. Its four interior GP-prime weights are **[61,71,107,79]**, summing exactly **318**.

## p15 spiral and the new prime-rank address

The 4×4 square is on **LP2 physical p15**, original archive image `resources/liber-primus/32.jpg` (archive image number 32; not physical p32). The original scan visibly contains the red 3299 start and all 16 values:

| 3258 | 3222 | 3152 | 3038 |
|---:|---:|---:|---:|
| 3278 | **3299** | 3298 | 2838 |
| 3288 | 3294 | 3296 | 2472 |
| 4516 | 1206 | 708 | 1820 |

Following the red-3299 clockwise inward spiral gives:

`3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516`.

The **11th** spiral value is **2838**. The p32 map's side length 11 could select that entry; this is a plausible selector, not a written instruction.

A stronger address follows from the already source-visible 3301 complement:
- (3301-2838=463).
- 463 is the **90th prime**.
- Prime rank is one-based, so position 90 is zero-based p32 rune offset **89**.
- Offset 89 begins the printed word `OENGOMBUDS`; the 4×4 table's edge length selects its four-rune suffix `BUDS` at offset 93.

This is a direct, reproducible cross-artifact pointer: p32 side 11 → p15 spiral entry 11 → 3301 complement 463 → prime position 90 → p32 rune position 90 / offset 89 → BUDS suffix. The 4×4 table dimension supplies the four-rune edge length. It does not yet specify what operation to perform after reaching BUDS.

The exact checksum is also notable: **2838 mod 360 = 318**, equal to the four interior rune-prime sum. Under the project's *inferred* mathematical-angle convention (0° east, counter-clockwise; see `im-results/2014-magic-square-direction-map.md`), 318° quantizes to 315° southeast, matching the (3,0)→(8,5) grid diagonal. The 2014 report itself treats the angle convention as an inference, not an explicit primary-source instruction. The endpoint sum is 374 mod 360 = 14° east; its agreement with 2014 stage04 cell 6's 366 mod 360 = 6° east is weaker secondary support.

A separate exact residue is **2838 mod 121 = 55**, which could point to physical p55. The canonical p55 page has 76 runes (19 four-rune blocks). This modulo-121 interpretation is only a possible page pointer; no source instruction yet selects it.

## Cross-round +60 relation: secondary, not an authenticated instruction

The 2012 original image dimensions (503×509) and 2016 signed-tree image dimensions (563×569) differ by +60 on both axes after swapping orientation. This matches the HOME/BUDS offset difference. The numerical table's radix 60 is another possible context. However, the Director's historical audit found no corroborated destination for the exact 2012-style domain derived from the 2016 dimensions. The dimension relation is exact, but reusing +60 as a p32 word-map selector is still an inference, not an authenticated continuation instruction.

## Bounded readouts and exclusions

The period-60 additive GP29/Vigenère interpretation is already rejected by `im-results/p32-home-buds-period60-vigenere.md`: the source-fixed HOME/BUDS phase constraints do not distinguish the original arrangement under the matched within-word null. The English-looking optimized output is an underdetermined-key effect, not plaintext.

I also tested the most direct p55 readouts suggested by this route:
- Four-rune key [B,M,IA,NG] as GP indices, prime values mod 29, and prime-totient values mod 29, both signs, on p55's 76-rune stream and its 43-rune word-interior stream: no linguistic output.
- The printed p15 4×4 table, reduced mod 29, and its entrywise-totient matrix as Hill-4 keys on p55, in printed/transpose and row/column conventions: no linguistic output.
- A four-column transposition of p55 using the interior-rune GP-index order [17,19,27,21] → [0,1,3,2]: no linguistic output.

These reject only the listed simple readouts. They do not invalidate the p15→p32 navigation hypothesis, but they provide no evidence that p55 is decrypted by the four interior runes or by the p15 table as a direct key.

## Conditional null, with limits

The existing exact conditional null preserves the 21 top/left p32 axis runes and each canonical word's rune multiset, permuting only free runes within their original words. Using the repository's TextBlob four-letter frequency lexicon:
- word-8 prefix: 9 lexicon outcomes among 720 ordered placements of its 10 free runes;
- word-16 suffix: 3 outcomes among 1,680 ordered placements;
- 7 endpoint-word pairs fall in the east sector;
- the four interior diagonal cells sum exactly 318 in 18 of 2,240 within-word placements.

The joint conditional probability is **1/21,504,000 ≈ 4.65×10⁻⁸**. A broader CMUdict 1.1.3 sensitivity gives **13/30,105,600 ≈ 4.32×10⁻⁷**. These are conditional diagnostics, not discovery-wide p-values. They do not correct for trying alternative pages, fragment lengths, spirals, edge operations, moduli, or direction conventions. The prime-rank address was discovered after the original route and is not included in those null calculations; do not multiply the probabilities or present a combined significance.

## Fixed next test and stopping rule

Agent46 has been asked for a fixed readout of the six original 2016-image tiles selected by the p32 diagonal. The rectangles are fixed by the original 563×569 image and the p32 prime-sum axes; do not rotate, shift, resize, choose a best tile, or infer plaintext from visual resemblance. If the six fixed tiles have no independently measured structure, retire the image-readout branch.

The strongest unresolved question is now **what source-prescribed operation follows the prime-rank address at p32 offset 89**. The rune meanings Beorc, Mann, Ior, Ing and the word `BUDS` may provide a semantic clue, but do not turn them into a free word-association search. A next step must predict a reversible operation, a key, or an independently observable feature on the original artifact. Otherwise retain this as a navigation hypothesis, not a decryption.

## Reproduction and source files

- Executable source check: `node sims/p32_p15_spiral_edge_route_sft.cjs`
- p32 corpus and original transcription: `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`
- p15 original table scan: `resources/liber-primus/32.jpg` (physical p15)
- p32 original page image: `resources/liber-primus/49.jpg` (physical p32)
- possible p55 target: `resources/liber-primus/72.jpg` (physical p55)
- 2016 signed image: `resources/historical/cicada2016-4gq25.jpg`
- word-frequency control: `resources/control/english_wordfreq_textblob.txt`
- inferred direction convention: `im-results/2014-magic-square-direction-map.md`
- 2014 Fibonacci-prime square reconstruction: https://cicadanotebook.com/sessions/3.html and https://github.com/scream314/cicada3301/blob/master/pages_and_ciphers.md

No plaintext, authentic key, complete cipher mechanism, or final destination has been recovered.
