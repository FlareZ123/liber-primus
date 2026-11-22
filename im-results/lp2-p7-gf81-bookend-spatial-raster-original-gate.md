# A direct spatial-image receiver for the p7 GF(81) and 81²/80² bookend

**Agent50, 22 November 2026. Interim original-cipher result.** Neither a new LP2 plaintext nor a creator-supplied key was recovered. This is a bounded test of a different output type from the ordinary-GP-language additive receivers in [the field-bookend study](lp2-p7-gf81-bookend-original-negative-gate.md). It evaluates whether those same source-determined operations hide a spatial image whose pixel frequencies need not look like English letters.

## Source-selected image geometry and reversible receiver

The manuscript contains **12,956 unknown GP29 runes**. The only repeated adjacent six-rune *two-word* ciphertext type ends at global position **6,561 = 81²** and recurs at the manuscript end. The subsequent **6,395** runes plus the five original Arabic-numeral paragraph labels on pp36–38 form an **80×80** register when those five labels occupy genuine unfilled slots. The exact inserted slot offsets are **[2244,2384,2476,2575,2672]**. This alignment was established independently in [the original bookend report](bookend-81x81-80x80-ordinal-insertion.md).

The original physical p7 final five wholly red words have whole-word GP29-index products **[11,26,8,15,2]**. Their monic reduction over GF(3) is the irreducible `f(x)=x⁴+x²+x+1`; with the immediately following p8 red-word products **[4,3]**, a previous study found the primitive order-80 generator **g=x+1** and the source identity `g⁵=17` in the polynomial-basis index system. Both the field connection and its missing first-party cipher instruction were already published in [the GF81 original-source analysis](lp2-p7-gf81-bookend-original-negative-gate.md). They are the fixed inputs here.

Treat the first source block as an **81×81 matrix A** indexed row-major by polynomial-basis field coordinates **0…80**. Treat the second source block with the five numerals reinserted as **80×80 B**, indexed row-major by the exponent coordinates **0…79**. Freeze the source-unit address operation

`K[r,c] = A[index(g^r),index(g^c)]`

and the two immediate GP29 inverse candidates `Q⁻=B−K` and `Q⁺=B+K`. Preserve all five paragraph labels as holes: they contribute no invented pixels or runes. Both inverses are lossless on all original 6,395 rune cells given the fixed source pad.

A binary/color image can have **uniformly populated color bins**, especially after an arbitrary palette assignment. Previous GP29 IoC and top-frequency tests alone therefore did not exclude a possible *spatial* output. The new diagnostic asks whether equal-valued pixels cluster as horizontal/vertical neighbors under the **one source-defined coordinate system**, without optimizing field generator, phase, matrix orientation, threshold, palette or cipher parameters.

## Original pixel-neighbor result

The 80×80 mask has exactly **6,310** valid horizontal edges and **6,310** valid vertical edges (12,620 total); the five printed labels remove ten edges in each direction. Every original rune is used once in B. The observed source-mapped outputs are:

| Fixed original receiver | Horizontal equal-value edges | Vertical equal-value edges | Combined / 12,620 | 4,096 frequency-preserving shuffle mean | Upper-tail shuffle p |
| --- | ---: | ---: | ---: | ---: | ---: |
| `Q⁻=B−K` | **206** | **238** | **444 / 12,620** | **434.7488** | **0.33415** |
| `Q⁺=B+K` | **202** | **246** | **448 / 12,620** | **434.6602** | **0.26947** |

Each null uniformly shuffles exactly the **6,395 actual recovered GP29 values** while preserving the original five missing-cell positions and scoreable edges. The pseudorandom generator seed is `0x7e13b4f7`; the two shuffles are deterministic and non-overlapping. Both originals fall inside the ordinary shuffled range; no prominent same-pixel adjacency is present. A full original-image-like positive control with **8×8 spatial color blocks, each 10×10 pixels**, encrypted by the **same source K**, exactly decrypts and gives **over 10,000 equal neighbor edges**. This test is sensitive to coherent regions with a fixed GP29 palette. Exact forward reencryption of each original candidate recovers all 6,395 original runes.

This is a **negative for direct color-as-GP29-pixel images under precisely these two fixed field-indexed additive source pads**. It does not exclude a thresholded/parity bitplane, a genuinely encrypted or compressed image, a different non-additive field transform, an unknown pixel palette varying by position, a nonnative-language output, or an independently selected source operation. An exploratory threshold scan was inconclusive; the exact all-secret binary-palette certificate below subsumes every globally fixed threshold and symbol partition without selecting one.

## Stronger exact result: all fixed black/white palettes excluded as coherent raster receivers

A color-as-rune result could conceivably hide an image through a **secret 29-to-2 black/white palette**, so testing literal 29-color matches is not sufficient. A fixed palette is an arbitrary function `b:{0,...,28}→{0,1}`, whose entire `2^29` assignment space is covered **without enumerating candidates** by a graph-theoretic bound. This gives a new exact, key-independent consequence stronger than the direct-pixel frequency-preserving shuffles.

For either fixed source reconstruction `Q=B±K`, construct the 29-vertex weighted symbol-adjacency graph: edge multiplicity between distinct symbol classes `a,b` is the number of their touching horizontal or vertical original pixel positions. Self-edges do not contribute to a binary color boundary. Let `L` be the graph Laplacian, `f[a]` the exact observed symbol occurrence counts across the **N=6,395** real pixels, and `m=12,620` the valid neighbor edges. For every secret palette vector `b∈{0,1}^29`, let `q=(f·b)/N` be its fraction of black pixels. Its color-boundary count is `E=bᵀLb`.

A mathematically sufficient all-secret certificate is the integer matrix

`H = 5N L − 18N diag(f) + 18 f fᵀ`.

For **each** original inverse sign, `H` is symmetric, every row sums to zero, and all **28** leading principal minors of its upper-left 28×28 submatrix are **strictly positive**. The SFT proves this **exactly using BigInt fraction-free Bareiss elimination**, with no floating-point eigensolver or palette search. By Sylvester's criterion and the known all-ones null vector, `H` is positive semidefinite, so **every possible fixed binary palette**, even chosen *after seeing the original image*, obeys

`E ≥ (18/5) N q(1−q)`.

For an independent uniform reshuffle of those same black/white pixels over the identical five-hole board, the exact expected number of boundaries is `2mN q(1−q)/(N−1)`. Therefore **every nonconstant secret binary palette**, regardless of its black/white proportion, has at least

`(18/5)(N−1)/(2m) = 0.9119809825673535`

times its random-shuffle expected number of black/white boundaries. Any source-derived image with large spatially coherent color regions would have far fewer boundaries than this **91.2%** floor. As a simple example, a 40%–60% balanced binary image under any unknown fixed alphabet mapping must have **at least 5,526** black/white boundaries and can have **at most 7,094 same-color edges**, versus 12,620 total. The positive 8×8-block synthetic image, genuinely encrypted/decrypted with the same K, has only **679** actual binary boundaries against a shuffle expectation of **6,286.4193** (10.80% of expected), showing the bound would distinguish an image with strong recognizable regions.

**Decision strengthened:** no globally fixed 29-to-binary pixel assignment can reveal a strongly spatially clustered original raster under the literal `GF(81)` field-coordinate additive source pad, on either sign. This includes secret rune palette permutations, bitplanes, and thresholds. It still does **not** cover position-dependent palettes, nonlinear decryption, compression, or other unselected source operations. This is a **complete proof within a specified natural receiver**, not a claim that no unknown LP2 image or plaintext exists.

## Cryptanalytic decision and reproduction

A simple readable raster does **not** emerge after the suggested source GF81 address mapping. Because the same two inverses already fail linguistic-frequency tests, the spatial interpretation no longer gives an independent reason to prioritize this specific pad. Do not expand this negative into a free search over orientations, secret palettes, field generators or symbols. The real missing ingredient remains an **author-chosen reversible operation** capable of exposing unknown-page plaintext or a genuine linked key carrier.

The standalone [Windows 11 / Node22 CommonJS SFT](../sims/lp2_p7_gf81_bookend_spatial_raster_sft.cjs) reads the unchanged `lp2-corpus.json`; reconstructs p7 products and p8 original red words; derives the order-80 field generator; checks the bookend counts and exact numeral-hole geometry; computes the two original adjacency numerators; runs the deterministic 4,096-per-sign controls; verifies full original reencryption and a planted 8×8-block spatial image. Its original numerators and null means were independently executed against the exact GitHub-retrieved source corpus in the invocation's JS runtime; no GitHub Actions run is claimed for this script.
