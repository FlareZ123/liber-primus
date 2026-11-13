# LP2 p32 word-prime coordinate readout on the signed 2016 image

**13 November 2026, Agent19. Source-exact original-input negative.** This direct map does not recover any of the 56 unknown LP2 plaintext pages, a key, image-borne instruction, or an authenticated destination. It was tested in the [passing original-JPEG GitHub Actions run 43365148862](https://github.com/FlareZ123/liber-primus/actions/runs/43365148862).

## Human-solvable proposed route and its source limit

The independently signed 2016 OutGuess message says: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” Earlier Cicada material uses Gematria Primus **prime sums of words**. Physical LP2 p32 visibly contains **22 words and 121 runes**; its 11×11 rune-grid first-row and first-column GP-prime sums equal **563** and **569**, respectively, the signed 2016 JPEG's actual pixel dimensions. These prior facts motivate testing whether the 22 p32 word numbers map to eleven concrete pixel addresses, without selecting a new key or fishing for a phrase.

**Frozen consumer:** read complete p32 words in source order; sum the GP-prime weights in each word; pair successive sums as zero-based **(x,y)** positions on the original 563×569 JPEG, upper left origin. If outside image bounds, mark the pair invalid. Otherwise read the **exact pixel** in grayscale and ask whether it belongs to the pre-existing visible white-text layer, using fixed threshold **≥180**, already established by the earlier signed-2016 word/tile image extraction. Do not wrap, scale, transpose, reorder, fill invalid coordinates, change threshold, or select neighbors.

The tenable premise is that “words are the map” refers to p32's printed words and that two successive GP-prime sums form an image coordinate. No source *explicitly* instructs the two-word pairing or pixel polarity, so even an enrichment would first be provisional.

## Exact source output

The original 22 p32 word sums, computed with full original rune/token boundaries, are:

```
73 125 | 267 613 | 191 184 | 14 540 | 458 535 |
183 442 | 196 497 | 160 446 | 98 203 | 96 348 | 160 216
```

The second address **(267,613)** lies outside the 569-pixel height; the other **10/11** addresses are valid. The source image has **2.511339266%** white-text pixels at the frozen threshold. **Zero of the ten valid source-ordered addresses** lands on one of those pixels. The direct binary pixel readout is `0?000000000`, with `?` marking the out-of-bounds address, so it does not yield an instruction or a lossless codeword.

A fixed-seed control (`0x20261113`, 20,000 Fisher–Yates permutations) randomly pairs the **same 22 source-derived word sums**. This preserves all marginal numerical values, including the one out-of-bounds 613, and changes only the proposed successive-pair association. The number of white-pixel hits is:

| Bright hits among ten valid pixels | Control permutations |
|---:|---:|
| 0 | **14,558** |
| 1 | **5,143** |
| 2 | **299** |
| ≥3 | **0** |

All **20,000/20,000** controls attain at least the observed zero white pixels. The upper-tail statistic is **1.0**, so the source order has no white-text enrichment under this conditional control. The control is a model-specific reference, not a global significance estimate for all potential source-image interpretations.

The script verifies the exact 22 word-sum list, source rune indices, 563/569 axis sums and original image dimensions before measuring pixels. Its only image dependency is Pillow 11.3.0 on the complete original `resources/historical/cicada2016-4gq25.jpg`. The [read-only, single-file reproducer](../sims/p32_wordprime_signed2016_pixel_map_sft.py) and its [manual workflow](../.github/workflows/p32-wordprime-signed2016-pixel-map-manual.yml) preserve all coordinates, grayscale values, null seed, and full result JSON in the workflow logs.

## Research decision

**Reject literal source-order successive GP-prime word pairs as an unwrapped signed-2016 white-text pixel map.** One address is invalid, the ten legal addresses give no visible-message bit, and random re-pairings of the same numbers perform at least as well. This does not erase the separately established 563×569/11×11 p32 correspondence, the verified 2016 instruction, or the already tested signed-image **tile-area** hypotheses. Any further image-map theory needs a new independent printed mapping rule; rescue by choosing a pixel radius, coordinate offset, alternate word group or threshold after observing this zero is uninformative.