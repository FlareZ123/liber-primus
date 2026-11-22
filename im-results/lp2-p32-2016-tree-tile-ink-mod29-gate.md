# Original LP2 p32 / signed-2016 tree: exact tile-ink residue test

**13 November 2026, Agent16. Classification:** source-registered, finite negative for two image-partition variants of the direct pixel-count-to-rune operation below. **No unknown original LP2 plaintext, recovered key, authenticated image-data decoding rule, or continuation.**

## Source-fixed hypothesis

The first row and first column of the original **121 GP runes on physical p32** have prime weights summing to **563** and **569**, exactly the pixel width/height of the independently signed 2016 tree JPEG `resources/historical/cicada2016-4gq25.jpg`. The established [original tree-source relation](lp2-tree121-signed2016-source-gate.md) selects the 11×11 GP-prime-weight tiling and its orientation.

The most literal potential hidden image channel is **inked pixel count modulo29**: a player with the published image and GP table can divide the picture into 121 integer rectangles using those exact prime widths/heights, count dark pixels inside each rectangle, reduce modulo29, and compare the resulting GP29 residue with the corresponding source rune.

Freeze the eleven x widths and eleven y heights from p32. Use **only the 100 interior runes** as independent targets; reserve all 21 header positions needed to determine the boundaries. For each tile count RGB pixels whose mean intensity is below **one of four standard fixed grayscale thresholds [32,64,128,192]**. Compare the count mod29 to either the original GP29 rune **ordinal** or its original GP-prime weight mod29. These eight fully declared readings are proposed tests: the source does **not** choose a threshold, direct count, or numeral interpretation.

## Original-source execution

The unchanged 563×569 JPEG is decoded with the repository's included `jpeg-js` decoder. There is no image resizing, filtering, binarization optimization, tile rotation, page offset, fitting of cipher parameters, or interpolation between cells.

| Fixed target | Darkness threshold32 | threshold64 | threshold128 | threshold192 |
| --- | ---: | ---: | ---: | ---: |
| GP29 ordinal equality, /100 | 4 | 4 | 6 | 5 |
| GP prime mod29 equality, /100 | 9 | 5 | **10** | 5 |

The best 10/100 is the maximum among the **eight** settings, leaving 90 independent original rune values mismatched. A strict direct pixel-residue encoding of all 100 symbols is therefore **ruled out** in every frozen setting, even if the best match count exceeds an approximate chance expectation.

For scale only, the SFT performs **20,000 fixed-source-marginal permutations** of the 100 interior GP29 rune identities. Each permutation preserves the exact original image features and the same deterministic relationship between GP ordinals and prime weights; it records the maximum of all eight settings. The original maximum is 10 versus permutation mean maximum **5.8675**, with corrected *within-this-eight-test-family* upper-tail rate **0.0228988551** and largest null maximum16. This rate is exploratory, conditional on the already-selected tree/tiling/model, and is **not** evidence for a decipherment or a discovery-wide significance claim. The 10 congruences cannot explain the remaining 90 positions.

A separately generated 563×569 RGB image encodes **100/100** predeclared valid residues as exact dark-pixel counts in the same tile boundaries; 99/100 synthetic targets retain the corresponding original p32 ordinal unchanged, with the one tiny tile using the largest value that physically fits its area. The extractor recovers **all 100 synthetic values**, establishing that the original failure is a property of the source images under this specific candidate operation.

## Independent two-word 11×10 image partition: complete 110-cell original negative

A same-day source-side discovery by Agent13 uniquely addresses p0 word6 and p1 word33 through GP-prime sums **563** and **569** respectively. Their actual rune lengths **11** and **10** suggest an alternative, completely source-defined **11-column × 10-row** partition of the same signed JPEG. This also gives a natural 110-cell original p32 target if its first eleven source runes serve as a row header: the exact original **last 110 p32 rune indices**. The image partition and target selection are plausible interpretations of the geometry; **no signed instruction specifies this pixel operation or 11-rune header role**.

Keeping the same eight predeclared threshold×numeral rules, the original 110-cell matches are ordinal **[1,3,1,3]** and GP prime residue **[5,5,5,5]**. The maximum **5/110** is entirely ordinary among 20,000 exact-marginal permutation controls (familywise upper-tail **0.8024098795**, null mean maximum5.935); a fully matched synthetic 110-cell image planting recovers **110/110** original rune residues without adjustment. **All 110 original tiles fail as a direct pixel-count encoding under these rules**, with 105 mismatches in the best case. The first-two-word clue may still have a different consumer, but the literal RGB dark-pixel remainder channel is closed without fitting offsets or thresholds.

Reproduce with [the independent source-word 11×10 CJS SFT](../sims/lp2_2016_two_word_tile110_mod29_sft.cjs) and successful manual CI [run43373820695](https://github.com/FlareZ123/liber-primus/actions/runs/43373820695). The [Agent13 source-word finding](lp2-2016-image-first-two-wordsum-gate.md) independently checks unique word identities and its different additive 11+10-key inverse.

## Decision and reproducibility

This closes **direct same-tile dark-pixel count modulo29** under the four frozen cutoffs and two GP numeral readings, on both the 11×11 p32-axis geometry and the independent 11×10 first-two-word geometry. It does not exclude a separately keyed hidden image payload, nonlocal path between tiles, encrypted image intermediate, another source-selected image code, or the independently established dimension match. Neither arbitrary threshold optimization nor explanation of ten accidental matches can supply the missing author-selected decoder. Do not use the 10-cell coincidences as a new key.

- [Standalone CommonJS original-image SFT](../sims/lp2_p32_2016_tile_ink_mod29_sft.cjs), built-in decoder and original archive input, Node22.
- [Successful source-original GitHub Actions run 43372461124](https://github.com/FlareZ123/liber-primus/actions/runs/43372461124), full eight-setting JSON, 20,000 permutations and 100/100 positive plant.
- [Existing independent image-intensity association gate](lp2-tree121-signed2016-source-gate.md) covers linear correlation of four tile texture statistics against the same 100 original held-out rune values; it does not test these exact modulo-count congruences.
