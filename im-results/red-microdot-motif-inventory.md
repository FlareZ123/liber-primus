# LP2 large punctuation: 36 marks, three rigid templates and one black exception

**Evidence class:** original-image structure, independently annotated rune/ink source, and exact reproducible census. **No recovered LP2 plaintext, cryptographic key or destination.** This consolidates the former 35-red-motif inventory and the new complete two-ink examination; it supersedes any reading of the older red-only count as the entire large-punctuation count.

## Complete image census

The original LP2 images are archive JPEGs \`17.jpg\`–\`74.jpg\` (physical pages 0–57). On all 58 native 2400×3600 scans, the [red component classifier](../sims/red_marker_shapes.py) identifies **35 red large punctuation glyphs** in exactly three fixed dot occupancies. A complementary black-ink component classifier identifies exactly **one additional 13-dot glyph**.

| Grid template | Red instances | Black instances | Total |
| --- | ---: | ---: | ---: |
| 13 dots: \` .#. / ### / ### / ### / ### \` | 30 | **1** | **31** |
| 10 dots: \` ### / .#. / ### / ### \` | 4 | 0 | 4 |
| 23 dots: \` .###. / ##### / ##### / ##### / ##### \` | 1 | 0 | 1 |
| **Total** | **35** | **1** | **36** |

**New exception:** original archive \`24.jpg\`, physical LP2 **page 7**, contains a black 13-dot shape at image-local top-left approximately **(1692, 2233)**. Its normalized 15×17-pixel component occupancy is identical to the red 13-dot shape. It appears at the end of the black-rune passage preceding a red heading near the bottom of the page. The red-only scanner omitted it because its ink is black, not because any dots were missing. The other two red 13-dot shapes on the same page occur on the following text line.

The red classifier uses RGB dominance (R>85, R>1.4G, R>1.4B, G<130), near-square connected components of width and height 7–12 pixels and area 55–120, then centroid grouping within 31 pixels. The black scan uses the maximum RGB channel below 105, 6–12-pixel components of area 40–130, and the same geometry with a cutoff of at least ten dots, excluding ordinary four-square black punctuation. Both reconstruct the original 13-dot grid identically. The normalization concerns dot *occupancy*, not pixel-exact equivalence after JPEG compression.

## Independent annotated reading and full rune-colour input

The historical [Rain-3301 transcription](https://github.com/cicada-solvers/Rain-3301/blob/main/Liber%20Primus%2057.txt) records brackets around coloured passages and distinct \`⁕\`, \`᛭\`, and \`᛭⁕\` symbols for the 13-, 10-, and 23-dot stencils. Its all-page rune stream matches the [canonical numeric corpus](../resources/liber-primus/lp2-corpus.json) on **every rune of every one of the 58 LP2 physical pages** (13,136 total runes, including the 180 runes of solved pages 56–57).

The new [compact derived annotations](../resources/liber-primus/lp2-ink-annotations.json) preserve original rune offsets for **225 red runes**, the full **36-event large-punctuation sequence**, and the single independently image-confirmed black-ink exception. It can be joined directly to the shared corpus without OCR or modifying original JPEG bytes. The source's bracket convention identifies red *runes*; a 13-dot punctuation symbol can lie outside a bracket and still be red, so ink of the stencils was decided by the image audit rather than inferred from brackets.

These data are now a complete input for explicit colour-aware section/cracked-title tests: a proposed plaintext can be checked against precise rune spans and punctuation positions. The red title patterns are already discussed in external work; copying the historical annotation is not claimed as a new cipher discovery.

## Cryptanalytic interpretation and limit

The glyph designs act as **fixed punctuation classes**, including the black 13-dot exception. Their fixed occupancy contradicts the idea that each 13-dot glyph carries an independently varying 13-bit bitmap payload. Their *position, class, and colour* may still carry a bounded side channel. The exceptional black mark occurs at a strong visual transition, but no repeatable rule yet maps its colour or any heading to a cipher key.

The image finding leaves the general 55 encrypted rune-bearing pages unsolved. It is useful primarily because it prevents dropping a genuine document boundary when translating original images into a cipher segmentation.

## Reproduction

- [Two-ink source audit](../sims/lp2_ink_annotation_audit.py): scans all 58 original images, verifies every colour-annotated rune against the canonical corpus, and checks all 36 image-detected large punctuation marks against the derived source annotation, including the exact black-mark location and its matching shape.
- [Original red-only shape census](../sims/red_marker_shapes.py): emits location and occupancy for the 35 red motifs.
- [Successful manual GitHub Actions run 42764773063](https://github.com/FlareZ123/liber-primus/actions/runs/42764773063): Python/OpenCV original-image audit passed for 13,136 runes, 225 red runes, 30 red-13, 4 red-10, 1 red-23 and 1 black-13 glyph, with zero source-count discrepancies.

Classification remains **source-side structural input**, not a validated key schedule or plaintext recovery.
