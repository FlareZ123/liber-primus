# Signed 2016 tree: BASE29 rune-word → pixel-coordinate gate

**Agent 3, 14 November 2026. Evidence class: original-source, conditional one-operation negative.** The direct, one-point-per-word interpretation of the authenticated Cicada 2016 “words are the map / numbers are the direction” clue does not select dark pixels more strongly than source-preserving controls. **No authentic LP2 plaintext, cryptographic key, image payload, or destination was recovered.**

## Clue and fixed proposed operation

The 2016 signed text refers to the *book's words* as a map and its numbers as a direction; its original signed picture is a **563×569-pixel** JPEG, with both side lengths prime. The authentic earlier 2013 Cicada puzzle used **BASE29**. These are independent source inputs, permitting a particular human-executable literal rule: convert each original complete rune-word, as printed, from its GP29 rune digits to an integer `N`; take image coordinate **x=N mod563, y=N mod569**; sample that single pixel without image registration, offsets, thresholds, learned maps, or ciphertext-dependent fitting.

The two axes are separate residues of the same original GP29 integer, computed incrementally from the unchanged printed rune sequence. Preserve original word boundaries across page wraps, never invent a word from physical line breaks. For a minimally large integer domain require word length **at least four**, since 29⁴=707,281 exceeds the approximately 320,000 image addresses. This yields **1,645** testable printed words among all **2,896** complete original unknown-book words and exactly **12,956** original runes, including p55 but excluding clear p56–57.

**Weakest assumption:** The signed clue does not specify BASE29, modular coordinates, a starting image pixel, any precise picture ink test, or an instruction to consume *the 2016 image* as the destination. The original image is largely dark in the decoded pixel register. This is a finite, source-motivated candidate consumer, not an authenticated decipherment rule. Earlier image checks used the different suggested 11×11 p32 prime-sum registration and should not be conflated with this per-word coordinate test.

## Executed original-cipher readout

The SFT reads the exact checked-in `resources/liber-primus/lp2-transcription.txt`, the canonical GP29 alphabet in `lp2-corpus.json`, and `resources/historical/cicada2016-4gq25.jpg`. The observed statistic is mean darkness `255−mean(R,G,B)` at the **1,645** source-selected original points. It then applies **5,000** seeded within-word rune permutations, keeping every word's number of runes and its rune-symbol inventory unchanged. Each null word is encoded with exactly the same modulus/coordinate rule and sampled from the same unmodified 2016 JPEG.

| Metric | Value |
| --- | ---: |
| Source LP2 words / sampled words | 2,896 / **1,645** |
| Decoded source image size | **563×569** |
| Original mean sampled darkness | **247.4960486322** |
| Within-word shuffle null mean | **246.7123781155** |
| Null SD of mean darkness | **0.9392064295** |
| Exact finite-control upper-tail probability | **0.2067586483** |
| Image-plane positive plant, blackened point recoveries | **1,645 / 1,645** |

The upper-tail value is a **conditional Monte Carlo count** (including the standard +1 correction), with a null that deliberately retains original rune and word inventories. It is no discovery-wide probability. Its unexceptional value means the proposed word-coordinate rule has **no evidenced preference for ink on the actual carrier**. In a synthetic copy, blackening the selected pixel for every original source point yields darkness exactly 255 at all 1,645 readouts, demonstrating the sampling, coordinate and image decoding path works. This positive control is an ink-location plant and cannot certify an encoded original message.

The first ten sampled source coordinates in frozen original-word order are `(283,174), (207,278), (239,190), (494,520), (518,100), (261,305), (229,56), (235,288), (190,145), (468,381)`; they are reproducible with no key search.

## Research decision

**Retire this exact GP29-word → modulo-(563,569) → single-pixel-darkness mapping as a path to recover an image-based key or original ciphertext.** The authentic word clue and picture remain independently valuable, but their combination does not select this coordinate operation. Alternate word order, raster morphology, pixel codings, image alignment, or another key cannot be inferred from this negative. Reopen only on a genuinely original instruction specifying a pixel/word-coordinate interpretation and a held-out unknown-rune inverse.

Reproduce: [single runnable source-exact CommonJS SFT](../sims/lp2_2016_wordmap_pixel_coordinates_sft.cjs). [Successful original-image GitHub Actions run **43600197758**](https://github.com/FlareZ123/liber-primus/actions/runs/43600197758), Node.js 22, full output with 5,000 shuffled controls and all-point planted detection. The established p32/2016 source-axis material is separately documented in [the 11×11 tree analysis](lp2-tree121-signed2016-source-gate.md); do not transfer its image-registration claims to this direct coordinate rule.
