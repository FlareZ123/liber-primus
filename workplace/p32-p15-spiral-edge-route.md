# p32 word-edge diagonal ↔ p15 Fibonacci-prime spiral

**Status: source-constrained navigation hypothesis; not a decryption.** This is a materially tighter route than scanning arbitrary p32 substrings, but the two selector operations still need independent confirmation and the original 2016-image tile readout is pending.

## Candidate human solve path

The signed 2016 tree image is 563×569. Original LP2 physical p32 contains 121 runes, naturally arranged as an 11×11 row-major grid. Its first-row and first-column GP-prime sums are exactly 563 and 569, defining the already documented 11×11 image partition. The page's canonical word segmentation is 22 words with lengths:

1, 3, 5, 11, 5, 5, 3, 11, 6, 9, 5, 8, 4, 9, 4, 8, 2, 3, 2, 8, 5, 4.

A plausible interpretation of the 2016 signed instruction (“words are the map; meanings are the road; numbers are the direction”) is to inspect four-rune word-edge fragments. The four-rune length is suggested by the 4×4 number square on LP2 physical p15; this is a hypothesis, not an explicit instruction.

Across the 22 p32 words there are 32 raw four-rune prefix/suffix windows, 29 unique after deduplicating identical prefix/suffix windows of four-rune words, and 9 unique windows whose four GP symbols each transliterate to one letter. The nine are HOME, SLFD, TYMG, WBSR, BUDS, NWGU, LAOY, UTFJ and TFJT. Only HOME and BUDS occur in the repository's 1,809-entry four-letter TextBlob frequency lexicon.

The only valid southeast word-edge pair with start offsets separated by 60 (five rows and five columns in the 11×11 grid) that yields two lexicon words is:
- HOME: prefix of p32 word 8, offsets 33–36
- BUDS: suffix of p32 word 16, offsets 93–96

The six-cell diagonal is offsets **[33,45,57,69,81,93]**, coordinates **(3,0)→(8,5)**, rune labels **[H,B,M,IA,NG,B]**. The four interior rune-prime weights are **[61,71,107,79]**, summing exactly **318**. The two endpoint fragments sum **374**, which is 14° and points east under the documented 2014 nearest-45° convention; 318° points southeast (315°). The endpoint pair is a prefix-to-suffix extraction, not two complete printed words.

## p15 selector and cross-round direction

The 4×4 square is on **LP2 physical p15**, original archive image resources/liber-primus/32.jpg (the archive image number is 32; it is not physical p32). The original scan visibly contains the red 3299 start and all 16 values:

| 3258 | 3222 | 3152 | 3038 |
| 3278 | 3299 | 3298 | 2838 |
| 3288 | 3294 | 3296 | 2472 |
| 4516 | 1206 | 708 | 1820 |

Following the red-3299 spiral gives:

3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516.

The **11th** spiral value is **2838**. The p32 map's side length 11 could select that value; again, this is a plausible selector, not a written instruction. Crucially, **2838 mod 360 = 318**, exactly the interior diagonal prime sum. The documented 2014 direction convention maps both to southeast. The p32 endpoint sum 374° and 2014 stage04 cell 6's 366° both map east; the latter points to cell 7, whose totient residue is the oak rune Ac. This gives a possible semantic bridge from HOME/BUDS to the tree in p32 and the signed 2016 image, but that interpretation remains conjectural.

A previously recorded p32 fragment-7 sum of 661 also gives φ(661) mod 121 = 55, and 2838 mod121 is 55. Treat this only as a secondary arithmetic cross-check until the exact source segmentation and selector for that fragment are independently pinned; it is not needed for the route above.

## Conditional null, with limits

The exact conditional null preserves the 21 top/left p32 axis runes and each canonical word's rune multiset, permuting only free runes within their original words. Using the repository's TextBlob four-letter frequency lexicon:
- word-8 prefix: 9 lexicon outcomes among 720 ordered placements of its 10 free runes;
- word-16 suffix: 3 outcomes among 1,680 ordered placements;
- 7 endpoint-word pairs fall in the east sector;
- the four interior diagonal cells sum exactly 318 in 18 of 2,240 within-word placements.

The joint conditional probability is **1/21,504,000 ≈ 4.65×10⁻⁸**. A broader CMUdict 1.1.3 sensitivity gives **13/30,105,600 ≈ 4.32×10⁻⁷**. These are conditional diagnostics, not discovery-wide p-values. They do not correct for trying alternative fragment lengths, pages, spiral starts, edge operations, moduli, or direction conventions. The 4-rune edge extraction and 11th-spiral selector were recognized after inspecting the source and must not be presented as proven instructions.

There are five unique geometrically valid southeast word-edge pairs separated by 60: starts (4,64), (16,76), (25,85), (33,93), (44,104). Only (33,93) is HOME/BUDS. Of the 36 southeast diagonals, three have interior sum 318; only (3,0)→(8,5) is a word-edge pair. The other two 318 diagonals start at offsets 35 and 45 and have endpoint sums 444 and 394 (both northeast), not east.

## Fixed next test: original 2016 image tiles

The candidate path maps to six fixed rectangles in the original 563×569 signed image (x0:x1, y0:y1):

| Cell | Rectangle | Size |
|---|---|---:|
| (3,0) | (0:73, 101:124) | 73×23 |
| (4,1) | (73:78, 124:203) | 5×79 |
| (5,2) | (78:179, 203:262) | 101×59 |
| (6,3) | (179:198, 262:315) | 19×53 |
| (7,4) | (198:299, 315:394) | 101×79 |
| (8,5) | (299:302, 394:453) | 3×59 |

Agent46 has been asked for a fixed readout and matched controls. Do not rotate, shift, resize, choose a best tile, or infer plaintext from visual resemblance. If the fixed path has no independently measured structure, retire it rather than expanding the search.

## Reproduction and source files

- Executable source check: node sims/p32_p15_spiral_edge_route_sft.cjs
- p32 corpus and original transcription: resources/liber-primus/lp2-corpus.json, resources/lp2-transcription.txt
- p15 original table scan: resources/liber-primus/32.jpg (physical p15)
- p32 original page image: resources/liber-primus/49.jpg (physical p32)
- 2016 signed image: resources/historical/cicada2016-4gq25.jpg
- Word-frequency control: resources/control/english_wordfreq_textblob.txt
- Direction convention: im-results/2014-magic-square-direction-map.md
- 2014 Fibonacci-prime square reconstruction: https://cicadanotebook.com/sessions/3.html and https://github.com/scream314/cicada3301/blob/master/pages_and_ciphers.md

No plaintext, authentic key, complete cipher mechanism, or final destination has been recovered.
