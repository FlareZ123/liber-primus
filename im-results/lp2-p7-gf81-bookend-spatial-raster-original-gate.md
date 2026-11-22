# Original 81²/80² bookend: direct and source-field spatial-image inverses

**Agent50, 22 November 2026. Interim original-cipher result.** Neither a new LP2 plaintext nor a creator-supplied key was recovered. This is a bounded test of a different output type from the ordinary-GP-language additive receivers in [the field-bookend study](lp2-p7-gf81-bookend-original-negative-gate.md). It evaluates whether those same source-determined operations hide a spatial image whose pixel frequencies need not look like English letters.

## The simpler original-source image route: square layouts with any secret binary palette

The **source-defined** 81²/80² bookend does not in itself require a field, cipher or printed key to suggest that a human could physically lay out the source runes as a pair of square raster images. I therefore also tested the *literal original GP29 runes* in each of those two exact layouts before introducing a source pad. This is a genuinely independent receiver: each of the 29 rune glyphs is assigned a secret but **globally fixed black/white pixel color**; the palette may be any of the `2^29` assignments, including a choice made after viewing the page layout.

The same exact integer positive-semidefinite certificate derived later in this report applies to each original source square, with its own actual rune frequencies, width, edge count, and no secret palette enumeration:

| Unchanged original square | Real rune pixels | Valid orthogonal edges | Same-*rune* edges | Mathematically minimum fraction of shuffle-expected *binary* boundaries under any fixed secret palette | Maximum same-color edges for any balanced 40–60% black/white palette |
| --- | ---: | ---: | ---: | ---: | ---: |
| First bookend `A`, 81×81 | **6,561** | **12,960** | **256** | **0.9111111111** | **7,291** |
| Second bookend `B`, 80×80 with five true numbered holes | **6,395** | **12,620** | **263** | **0.9119809826** | **7,094** |

All **28 exact positive leading principal minors** of the integer certificate matrix pass for each unchanged source square. A source-faithful position layout containing an ordinary coherent two-color image would normally require a substantial deficit of black/white boundaries; these two squares cannot exhibit that deficit for any static rune→black/white mapping. This closes the **untransformed original-source static-color smooth-picture** mechanism, independent of p7 algebra.

[The separate direct-square CommonJS test](../sims/lp2_bookend_direct_allpalette_image_sft.cjs) includes a demanding positive control: deterministic 9×9 and 8×8 coarse chessboards in which **each** glyph is drawn pseudorandomly from 14/15 different original-GP symbol classes according to its **secret palette**. This camouflage defeats trivial same-rune adjacency, yet the original-equivalent exact certificate *correctly fails* for both implanted pictures; each planted picture has fewer than 25% of the binary boundaries expected from shuffled controls. Both direct-square and GF81-field certificate tests passed [the shared Windows Node.js 22 workflow](https://github.com/FlareZ123/liber-primus/actions/runs/45060643895).

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

## Stronger exact result: all fixed grayscale, RGB and black/white palettes have a spatial-contrast floor

A color-as-rune result could conceivably hide an image through a **secret 29-to-2 black/white palette**, so testing literal 29-color matches is not sufficient. A fixed palette is an arbitrary function `b:{0,...,28}→{0,1}`, whose entire `2^29` assignment space is covered **without enumerating candidates** by a graph-theoretic bound. This gives a new exact, key-independent consequence stronger than the direct-pixel frequency-preserving shuffles.

For either fixed source reconstruction `Q=B±K`, construct the 29-vertex weighted symbol-adjacency graph: edge multiplicity between distinct symbol classes `a,b` is the number of their touching horizontal or vertical original pixel positions. Self-edges do not contribute to a binary color boundary. Let `L` be the graph Laplacian, `f[a]` the exact observed symbol occurrence counts across the **N=6,395** real pixels, and `m=12,620` the valid neighbor edges. For every secret palette vector `b∈{0,1}^29`, let `q=(f·b)/N` be its fraction of black pixels. Its color-boundary count is `E=bᵀLb`.

A mathematically sufficient all-secret certificate is the integer matrix

`H = 5N L − 18N diag(f) + 18 f fᵀ`.

For **each** original inverse sign, `H` is symmetric, every row sums to zero, and all **28** leading principal minors of its upper-left 28×28 submatrix are **strictly positive**. The SFT proves this **exactly using BigInt fraction-free Bareiss elimination**, with no floating-point eigensolver or palette search. By Sylvester's criterion and the known all-ones null vector, `H` is positive semidefinite, so **every possible fixed binary palette**, even chosen *after seeing the original image*, obeys

`E ≥ (18/5) N q(1−q)`.

For an independent uniform reshuffle of those same black/white pixels over the identical five-hole board, the exact expected number of boundaries is `2mN q(1−q)/(N−1)`. Therefore **every nonconstant secret binary palette**, regardless of its black/white proportion, has at least

`(18/5)(N−1)/(2m) = 0.9119809825673535`

times its random-shuffle expected number of black/white boundaries. Any source-derived image with large spatially coherent color regions would have far fewer boundaries than this **91.2%** floor. As a simple example, a 40%–60% balanced binary image under any unknown fixed alphabet mapping must have **at least 5,526** black/white boundaries and can have **at most 7,094 same-color edges**, versus 12,620 total. The positive 8×8-block synthetic image, genuinely encrypted/decrypted with the same K, has only **679** actual binary boundaries against a shuffle expectation of **6,286.4193** (10.80% of expected), showing the bound would distinguish an image with strong recognizable regions.

**The stronger mathematical consequence covers all real-valued and multichannel color palettes.** The matrix certificate is **positive semidefinite over every real vector** `v∈ℝ²⁹`, a much larger class than binary `b∈{0,1}²⁹`. Treat `v[a]` as an arbitrary secret grayscale intensity assigned to original rune `a`; its original pixel-weighted variance is `σ²=(∑f[a](v[a]−μ)²)/N`. The total original squared spatial neighbor contrast is exactly `E=vᵀLv`. Since `vᵀHv≥0`, the proof gives **for every possible secret fixed grayscale palette**

`E ≥ (18/5)Nσ²`.

A uniform reshuffling of the exact same grayscale values among the original real pixel positions (with original five holes unchanged) has expectation `2mNσ²/(N−1)`, hence **the same 91.2% lower bound** on observed versus shuffle-expected squared color contrast. No threshold or preferred luminance assignment is selected. For arbitrary **RGB palettes** `v[a]∈ℝ³`, apply this identical scalar theorem independently to red, green and blue, then sum: the same bound holds for summed squared Euclidean RGB neighbor contrasts. The theorem extends to any fixed finite-dimensional numerical color space and any fixed orthogonal channel basis. This **stronger all-secret color interpretation** is also exact for the *untransformed* source A81×81 and B80×80 registers, with their respective 91.1111% and 91.1981% floors. Explicit deterministic nonbinary grayscale palette witnesses and strong synthetic grayscale/binary image controls are checked by the two Windows Node22 SFTs.

The bound excludes *strongly spatially smooth, large-region naturalistic paintings or glyph pictures under a static rune-color palette*. It does **not** disprove a deliberately high-frequency checkerboard, tiny coded high-contrast symbols, a color image after a different spatial permutation, or a changing pixel-position palette. It is therefore an exact, transparent mathematical bound on a broad image receiver and a practical reason to stop optimizing static RGB palettes here, rather than an absolute proof that no information can be visually embedded.

**Decision strengthened:** no globally fixed 29-rune binary, real grayscale or RGB color assignment can reveal a strongly spatially smooth original raster under the literal `GF(81)` field-coordinate additive source pad, on either sign. This includes secret rune palette permutations, bitplanes, and thresholds. It still does **not** cover position-dependent palettes, nonlinear decryption, compression, or other unselected source operations. This is a **complete proof within a specified natural receiver**, not a claim that no unknown LP2 image or plaintext exists.

## Cryptanalytic decision and reproduction

A simple readable raster does **not** emerge after the suggested source GF81 address mapping. Because the same two inverses already fail linguistic-frequency tests, the spatial interpretation no longer gives an independent reason to prioritize this specific pad. Do not expand this negative into a free search over orientations, secret palettes, field generators or symbols. The real missing ingredient remains an **author-chosen reversible operation** capable of exposing unknown-page plaintext or a genuine linked key carrier.

The standalone [Windows 11 / Node22 CommonJS SFT](../sims/lp2_p7_gf81_bookend_spatial_raster_sft.cjs) reads the unchanged `lp2-corpus.json`; reconstructs p7 products and p8 original red words; derives the order-80 field generator; checks the bookend counts and exact numeral-hole geometry; computes the two original adjacency numerators; runs the deterministic 4,096-per-sign controls; verifies full original reencryption and a planted 8×8-block spatial image. The test's actual original source numerators, exact BigInt 28-minor PSD proof and all-real intensity contrasts run in [Windows Node.js22 workflow](https://github.com/FlareZ123/liber-primus/actions/workflows/agent50-gf81-palette-original-manual.yml), alongside the independent original-source direct-square and all-secret GP29 entropy SFTs.
