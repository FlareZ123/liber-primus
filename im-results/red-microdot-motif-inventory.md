# LP2 image punctuation and dot motifs: 36 marks, three rigid templates and one black exception

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

## One reused five-dot graphic in three original orientations

**Source fact, 10 November 2026 (Agent 33):** Three visually recognizable five-black-circle groups are the same geometric artwork to within **one quarter of one original JPEG pixel**, under two independent axis reflections. The relevant files are physical **p7 = 24.jpg**, **p23 = 40.jpg**, and already-solved **p56 = 73.jpg**. These are large isolated dots in the white margins; they are distinct from the 36 small large-punctuation stencils classified above and the two five-position solid/hollow vine ornaments on p55.

The [original-pixel reproducer](../sims/lp2_fivedot_3page_d4.py) locates precisely five native **69–70 px** diameter circular connected components in the fixed observed source regions. It computes their grayscale centroid positions, tests **all eight** D4 planar orientations (identity, horizontal/vertical reflection, 90°/180°/270° rotations and diagonal/antidiagonal reflections), optimizes two-dimensional translation and **all 5! bijections of the five dots**, and scores residual RMS displacement. The operation is geometric and independent of ciphertext language or key fitting.

| Original pair and visual placement | Unique best D4 operation | Translation of transformed source (x,y), px | Five-centroid RMS, px | Best competing D4 RMS, px |
| --- | --- | --- | ---: | ---: |
| p23 upper dots → p7 lower dots | Vertical (top-bottom) reflection | (+0.0017, +3674.0309) | **0.068352** | 150.406 |
| p7 lower dots → p56 lower dots | Horizontal (left-right) reflection | (+2400.6839, −419.3271) | **0.148013** | 150.335 |
| p23 upper dots → p56 lower dots | **180° rotation**, the composition | (+2400.6822, +3254.7038) | **0.178934** | 150.374 |

The corresponding matched black component areas are within 20 pixels of one another, at roughly 3,550–3,625 pixels per circle. This is an exact positional/template reuse finding at native source resolution. It extends the already noticed p7↔p56 reflection with the **independently present p23 image** and a complete, unique eight-orientation check.

**Possible solver role:** the image supplies recognizable horizontal and vertical reversal operations and their composition, with a known-decrypted page p56 acting as one endpoint. That makes D4 orientations of original source structures such as printed tables a plausible *testable hypothesis*, provided a further clue identifies what to reflect and where to use the result. There is no source instruction to rotate ciphertext, no recovered key or plaintext, and artistic motif reuse is an adequate alternative to a cryptographic selector. The tiny geometric RMS is strong evidence for source artwork reuse; it is not a calibrated probability of hidden message intent.

## Terminal-page ornamental circles may encode 13 and 31

**Original-image observation, 10 November 2026 (Agent 24); interpretation explicitly provisional.** LP2 physical page 55, original archive [72.jpg](../resources/liber-primus/72.jpg), contains two mirrored five-circle ornaments on its left and right vines, horizontally flanking the pale central tree. The right five circles are fully black. The left five circles are **three black disks plus two intentionally present faint gray ring outlines with white centers**. This difference persists in the original native 2400×3600 JPEG; it is not produced by thresholding or omitted components.

Reading the five circle positions of each ornament in ordinary printed row order **top, middle-left, middle-right, bottom-left, bottom-right**, with black = 1 and white-centered ring = 0, gives:

| Ornament, p55 image coordinates | Observed five-bit pattern | Binary integer |
| --- | --- | ---: |
| Left (near x=367–424, y=1477–1540) | **01101** | **13** |
| Right (near x=1975–2032, y=1477–1541) | **11111** | **31** |

The pair **(13,31)** exactly matches *two previously independently recorded source facts*: the dominant large punctuation stencil contains **13 dots**, and the manuscript has **31 instances of that stencil across all 58 physical LP2 pages**, including one in black ink on p7. Those 31 marks divide the 13,136-rune corpus into 32 fragments, aligning numerically with the 32-row printed base-60 grid. This suggests a possible human-readable cue for attending to the 13-dot punctuation and counting every occurrence, rather than discovering that segmentation entirely through ciphertext fitting.

The [read-only original-image extractor](../sims/p55_binary_ornaments.py) verifies source SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`, tests **all ten fixed original-pixel centers** and their 9×9 center grayscale means, checks the two pale marks have actual gray annular outlines, computes both five-bit values, and independently counts 31 annotations. Black centers have mean grayscale **0.07–0.60** on the standard 0–255 scale, while the two pale centers have means **254.90** and **254.77** and more than 100 visible gray annular pixels each. The coordinates and thresholds are explicit; no guessed rune, image restoration or ciphertext score enters extraction.

**Evidence boundary:** the source image certainly has this 3+2 versus 5 asymmetry. The black/white-to-binary mapping and row-order reading were identified after noticing the 13/31 match, so their apparent numerical exactness has no calibrated discovery p-value. The circles could be decorative, and this observation does **not** authenticate Cicada's intended cipher, reveal any key or plaintext, or prove the 32-fragment/32-row numerical alignment is functional. The historically authentic black 13-dot exception remains vital if the hypothesis is pursued: counting only red stencils would give 30, breaking the proposed 31 target. A useful successor would extract a *second independent* image indication of the same bit convention, or a decoder that makes a previously unfitted original LP2 plaintext prediction under source-fixed states.

## Cryptanalytic interpretation and limit

The glyph designs act as **fixed punctuation classes**, including the black 13-dot exception. Their fixed occupancy contradicts the idea that each 13-dot glyph carries an independently varying 13-bit bitmap payload. Their *position, class, and colour* may still carry a bounded side channel. The exceptional black mark occurs at a strong visual transition, but no repeatable rule yet maps its colour or any heading to a cipher key.

The image finding leaves the general 55 encrypted rune-bearing pages unsolved. It is useful primarily because it prevents dropping a genuine document boundary when translating original images into a cipher segmentation.

## Reproduction

- [Two-ink source audit](../sims/lp2_ink_annotation_audit.py): scans all 58 original images, verifies every colour-annotated rune against the canonical corpus, and checks all 36 image-detected large punctuation marks against the derived source annotation, including the exact black-mark location and its matching shape.
- [Original red-only shape census](../sims/red_marker_shapes.py): emits location and occupancy for the 35 red motifs.
- [Successful manual GitHub Actions run 42764773063](https://github.com/FlareZ123/liber-primus/actions/runs/42764773063): Python/OpenCV original-image audit passed for 13,136 runes, 225 red runes, 30 red-13, 4 red-10, 1 red-23 and 1 black-13 glyph, with zero source-count discrepancies.

Classification remains **source-side structural input**, not a validated key schedule or plaintext recovery.
