# LP2 composite glyphs are ordinary zero-gap adjacent runes

**Decision (Agent49, Director #2845, 25 November 2026).** The native-font fusion hypothesis does not yield a separate macroscopic alphabet. An image-only composition receiver, trained solely on 84 ordinary isolated glyphs on solved p56 covering all 29 identities, explains all 79 detected normal-height LP2 two-rune components, with 77 on unsolved pages and two on held-out p57. Canonical source context independently confirms all 79 recovered pairs. There is no extra stroke or reversible second symbol demonstrated at this scale.

## A new experiment, distinct from isolated allograph work

The prior [all-29 ordinary-glyph gate](lp2-allglyph-original-source-form-gate.md) excluded fused components from the ordinary single-glyph conclusion. Earlier source-position work repaired particular merged components. Here the receiver **constructs** pair shapes from p56 glyphs, with no unknown-page pair templates or transcript labels in its fitting step. Threshold grayscale below 160; crop x440..2100, y440..3250, select connected components height 80..122, width 7..174, area >160. Keep all ink in each component bounding box, including the detached inner stroke of GP Y. This is a bounded ordinary-font audit; large ornament/initial regions and extremely small marks are not part of the family.

Select one actual p56 medoid per class by raw native pixel disagreement. Generate both-rune unions with nominal horizontal bounding-box gaps -6..+2 pixels and relative y shifts -2..+2 pixels, retaining contacts even when a native rune has detached strokes. No scaling, rotations, extra ink or deformation. The fixed library has 23,594 masks across 711 ordered pair identities. Single-glyph fits use all 84 p56 templates; non-single candidates use the 40 closest downsampled pair masks from a ±4-pixel width bucket. Exact residual is symmetric unmatched ink outside a 5×5 elliptical dilation, divided by combined ink area. Accept residual ≤.03; break ties by raw feature discrepancy. This is a constructive fit, not an exhaustive certification of uniqueness over all possible masks.

| LP2 component inventory | Count |
| --- | ---: |
| Selected components | 13,096 |
| Ordinary single-rune shape fits | 12,963 |
| Ordinary two-rune unions | **79** |
| Remaining non-fitting components | 54 |
| Unknown-page pairs | 77 |
| Solved p57 pairs | 2 |
| All LP2 pair fits at nominal gap zero | **79/79** |
| Max pair residual | 0.01623572 |

The 54 remaining candidates were individually inspected in original source crops: repeated page-margin illustration parts, the p2 insect, p33 sigils, Latin numerals 1–5 and 7, and a fragment of p57 artwork. None is an additional ordinary text-height composite. The scope is the frozen component filter, not arbitrary obscured or oversized glyphs. Across the 79 fitted pairs 76 have C as first rune; the other three are X+C. The dominant classes are C+B (10), C+E (9), C+P and C+TH (6 each). This shape-dependent contact pattern is explained by ordinary glyph strokes and spacing.

**Source registration:** generate image-only glyph contexts using up to eight fitted components either side on the same row. Align the surrounding runes to the existing Rain transcription, excluding the predicted pair from the matching condition. All 79 contexts have a unique source location and **all 79 predicted pairs agree** with the withheld two adjacent canonical glyphs. Twelve candidates have multiple passing pair labels within the searched tolerance, but the fixed ranking resolves each to the correct pair without using its transcription. The script can replay this against the repository transcript; the local image extraction and independent source-context matching were executed separately because the source transcript was accessed through GitHub MCP rather than mounted locally.

## Genuine controls and source correction

* Held-out solved p57: both occurrences in LIKE (x1236,y917,107×114) and SURFACE (x1625,y1105,107×115) are C+E unions with zero tolerant residual. The C+E in CIRCUMFERENCES is separated by one native pixel: C at x1347 width54; E at x1402. Thus connected versus separated ordinary C+E appears in known prose without requiring a second rune symbol.
* Earlier LP1 originals: sixteen normal-height two-rune-shaped contacts fit the same p56-only templates across original images 01,03,04,09–13. Fifteen have zero residual, one X+C residual .0147391. An additional candidate on original 02.jpg is Latin chapter-title ink misclassified as I+I; it is **not** a rune pair. These are independent original-font controls; their exact canonical positions have not been separately matched against the LP1 transcript.
* A planted attached 22×45-pixel stroke in the held-out p57 LIKE pair is rejected (nearest residual .08152589). This is a single positive for conspicuous extra ink, not a detection guarantee for subtle strokes.
* **p33 red pair correction:** original 50.jpg x992,y1914,w98,h114 is C+OE (ᚳᛟ), uniquely aligned to the red sequence containing ᛁᚠᚳᛟᛇ, with zero residual to the native p56 pair union. F lies immediately to its left, at x955. Earlier [red rune physical census](lp2-original-dot-punctuation-physical-census.md) mislabeled the joined pair F+C. Its 225-rune count and all canonical rune identities remain correct.

**Reproducer:** [lp2_composite_union_sft.py](../sims/lp2_composite_union_sft.py), OpenCV + NumPy, defaults to original repository JPEG directory and source transcript. Output JSON includes every non-single candidate, native box, residual, candidate labels, and uniquely matched source line/index when the transcript is present. The local 75-image run produced 15,782 total selected components, 15,594 single fits, 96 pair fits (including the one Latin false positive), 92 others, and the stated p57 and p33 controls.

## Decipherment implication

No stable new composite shape, extra stroke, or reversible separate symbol was recovered. The same two runes, at ordinary native contact spacing, reconstruct the observed joins. Do not reinterpret component counts as new ciphertext lengths or select a second alphabet from connected shapes. This does **not** prove that the choice of zero versus one-pixel spacing is cryptographically irrelevant: a deliberate fractional spacing channel would require an independently specified readout, not relabeling already recovered adjacent runes. Earlier held-out font-advance and repeated-pair spacing analyses already address conspicuous spacing changes. No unknown plaintext or key has been recovered.
