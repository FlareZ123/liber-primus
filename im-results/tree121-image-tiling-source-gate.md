# Signed 2016 image as a literal p32 prime-width / prime-height tile map

**Agent 14, 11 November 2026. Classification: exact source-derived coordinate candidate plus bounded negative for text-gutter alignment. No original LP2 plaintext, cipher, key or destination recovered.**

## Literal coordinate map from existing p32 discovery

The independently identified 2016 signed Cicada tree JPEG (resources/historical/cicada2016-4gq25.jpg) is **563×569 pixels**, and LP2 physical p32 has **121=11×11 GP rune values**. The first row's GP prime values sum to 563, and the first column's sum to 569. The exact source match, orientation and image/tree linkage were first reported by Agent 21 in [the original p32 source analysis](lp2-tree121-signed2016-source-gate.md).

A literal way to use both dimension equalities is to interpret the p32 **top eleven GP prime values as consecutive image x-strip widths**, and the p32 **left eleven prime values as consecutive y-strip heights**. The source-defined cuts, measured from the image top-left, are:

- x: **[0, 73, 78, 179, 198, 299, 302, 345, 452, 465, 484, 563]**
- y: **[0, 73, 96, 101, 124, 203, 262, 315, 394, 453, 562, 569]**

This produces exactly 121 unequal rectangular tiles on the signed historical image, using source dimensions without fitting ciphertext, offset, phase, scaling or output key. The square's top-left L rune (GP prime 73) supplies the first width and height. The remaining 100 interior source runes are not needed to define the axes, and would require an independent source operation to become a map or register. **This partition does not itself authenticate the designer's intent.**

## One falsifiable image-alignment property

If the source intentionally placed grid boundaries as separators around the signed message's visible white lettering, internal lines should tend to cross fewer bright letter pixels than differently ordered layouts with the same widths and heights. This tests one specific *text-gutter* version of the tiling hypothesis, separate from tree-branch or path interpretations.

The [reproducer](../sims/tree121_image_tiling_gate.py) uses Pillow on the **unaltered checked-in signed JPEG** and unaltered LP2 corpus:

1. Construct the original ten internal vertical and ten horizontal pixel positions from the eleven source-prime widths/heights.
2. At every cut, count source pixels with luminance at least 180 in a centered three-pixel-wide band over the full opposite axis.
3. Permute the final ten widths on each axis independently, keeping both original first widths 73 fixed. Run 100,000 trials with random seed 0x20161132. All controls use the original values on each axis.
4. Evaluate the **lower tail** against the actual layout because fewer bright-stroke crossings would indicate letter-gutter alignment. This direction is fixed before scoring.

| White-stroke boundary statistic | Original source cuts | Null mean | Null lower tail (add one) |
| --- | ---: | ---: | ---: |
| Ten vertical cut bands | **533** | 528.8611 | **0.512725** |
| Ten horizontal cut bands | **649** | 461.5287 | **0.710013** |
| Both axes combined | **1,182** | 990.3898 | **0.713753** |

The original cutlines **do not preferentially avoid the image's white writing**. Their combined stroke intersections exceed the typical same-source reordered arrangement, so the suggested *text-gutter* interpretation lacks support. The cuts are nonetheless exact source-derived image coordinates.

This test does not exclude sampling pixels at grid intersections, inspecting the dark tree artwork, tracing directions using rune values, or another source-defined rule. Such interpretations need independently prescribed selection, image processing, traversal, and output to avoid post-selected pattern matching.

## Reproduction and handoff

The Python3/Pillow script asserts the GP source values, signed-image dimensions and page32's 121-rune count, and changes no source input. It ran successfully in [GitHub Actions run 42936548408](https://github.com/FlareZ123/liber-primus/actions/runs/42936548408) using the existing manual-only grid-256-tests.yml workflow and the tree-tiling probe.

Source geometry remains a possible visual representation, not an established cipher. Future Issue #18 work should prioritize a source-specified interior-cell operation producing a withheld LP2 prediction. Arbitrary new image thresholds are unlikely to resolve it.
