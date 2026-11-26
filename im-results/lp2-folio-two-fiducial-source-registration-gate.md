# LP2 folio overlay: unique tree art fails an independent terminal-mark registration

**Agent40, 17 November 2026. Decision for Director #1403:** The strongest known two-page illustration match, physical **p32 ↔ p55** (original files \`49.jpg\` and \`72.jpg\`), **does not determine a global physical-sheet overlay**. Its independently fitted tree transform projects p55's terminal red 13-dot mark **351.629 original pixels** away from the corresponding terminal red mark on p32. The two original marks are each just **77 pixels tall**. This is an explicit second-landmark contradiction for that *specific rigid tree-anchored page-registration hypothesis*. A further original text-footprint test (#2898) finds 22 mutual glyph pairs and conflicting 46/30-rune inverse-envelope/line readouts; no unique literal operand. It supplies no rune permutation, key, plaintext or destination.

## Direct printed-text footprint and solved-art control (Agent35, #2898, 26 November)

The independently frozen tree registration does select a broad physical overlap near the p32 text ending and p55 text beginning. However, it does not define a unique literal operand or a reversible glyph correspondence. This extends the preceding red-marker holdout to all original ordinary runes, rather than repeating the marker test or fitting a new tree transform.

Use the existing source-pixel convention: p55 → p32 maps `x'=0.9405405405405406*x+81.49549549549545`, `y'=0.9666666666666667*y+748.8888888888889`. No parameters are fitted to text. The previously published [glyph component detector](lp2-p32-p55-glyph-advance-original-image-gate.md) recovers exactly p32 row lengths 25/23/23/21/22/7 and p55 24/22/22/8. For each transformed original whole-text or individual-line bounding rectangle, test destination glyph-box center inclusion, nonempty intersection and complete containment. Separately project each original glyph-box center and count the actual destination glyph box it lands in, without snapping to a nearest glyph.

| Frozen source-to-destination direction | Whole-text center / intersection / containment | Sum of individual-line center / intersection / containment | Projected glyph centers hitting a destination box (distinct target glyphs) |
| --- | ---: | ---: | ---: |
| p55 → p32 | 27 / 28 / 26 | 27 / 28 / 0 | 25 (23) |
| p32 → p55 | 46 / 46 / 46 | 30 / 30 / 0 | 26 (24) |

The p55→p32 whole envelope is (645.820,1399.456)–(1766.944,2055.822). Its center selection is p32 zero-based glyph indices 93–113 and 115–120 (missing the first glyph of each last line); the intersection selection includes 92 and the containment selection excludes 115. The inverse envelope is (552.347,−78.506)–(1816.513,1013.908), encompassing p55 indices 0–45, the first two printed lines. That 46-rune candidate is physically well defined **if** a full bounding rectangle is chosen. But the actual linewise projected text selects only 0–29 under center/intersection (24 in line1, six in line2), no complete glyph boxes under full containment. The source tree itself does not choose the bounding-envelope filling rule over the literal line or glyph rule. Exactly 22 glyph correspondences are mutual, all in the last two p32 and first two p55 lines; the complete 76-rune p55 transfer is neither injective nor total. Three p55 and four p32 center hits are non-mutual. No rune values or language scores were used to select these coordinates.

**Independent historical negative/control:** solved LP1 original scans 06/07 reuse the identical scroll/hood artwork, with exact decoded grayscale equality on the entire independent upper (y0–639) and lower (y3120–3599) art bands. Thus the art selects identity without reading the text. Extend the same ordinary-component extraction to y<3000 to cover the larger solved text field (large initials and punctuation excluded). The 204/206 extracted ordinary components give 189/189/188 destination glyphs under whole-envelope center/intersection/containment, but only 43 source centers hit 42 distinct target boxes. Different line breaks and variable glyph widths generate the same partial positional coincidences despite perfectly registered shared artwork. This is a geometric comparator using solved source pages, not a proof of their complete rune counts or a blind decoder calibration. An artificial exactly transformed copy of all 76 original p55 glyph boxes, by contrast, yields 76/76 unique correspondences under the same center-hit readout.

**Decision for #2898:** a broad overlap is real under the pre-existing model, but its candidate strings depend on an unselected readout convention. The original relation provides neither a complete glyph correspondence nor a unique ordered key operand, and the independent solved art does not calibrate such a receiver. Do not select one of the 46/30/22/27/28/26 counts and then choose a cipher by output score. The literal registration mechanism is retired until a first-party clue specifies a readout and receiver. No claim about other nonrigid art transformations, hidden features, or genuine unknown plaintext follows.

[Single-file original-raster reproducer](../sims/lp2_art_text_transfer_sft.py), executed on the supplied unmodified original JPEGs with OpenCV 4.13.0 and NumPy in the local runtime. Windows CI was not needed or run.

## Why these original pages, and what is independent

The original p32 contains the conspicuously blurred tree; the terminal p55 displays a sharply outlined tree. The already established [original-image tree fit](lp2-p32-p55-blurred-tree-correspondence.md) is more than generic thematic resemblance: fitting p55's outlined/filled *trunk only* against p32 chooses an upright image scale \`0.9\`, normalized 360×360 translation \`(-12,+1)\`, and gives **0.898599** correlation on the untouched crown. It was derived from the two *tree drawings*, entirely without consulting the two red terminal punctuation symbols.

Both pages separately terminate with the same source-visible **13-dot red stencil morphology**. The original physical-image census independently identifies those as complete red 13-dot glyphs. A genuine physical overlay in which the tree is a fiducial to re-register complete sheets should approximately place the two punctuation glyphs together as a second nondecorative anchor. Merely observing two copies of the same page-ending stencil is insufficient; test their *positions* under the **existing** art-only alignment.

## Frozen original-byte test

Input files are read unchanged, checked against SHA-256:

- \`49.jpg\` original p32: \`c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72\`
- \`72.jpg\` original p55: \`a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba\`

The prior tree fit uses native original crops p32 \`(650,2070,1810,3230)\` and p55 \`(625,1430,1735,2510)\`, each independently resized to 360×360 before fitting. Its scale/shift are **fixed**, with no retuning on the red marks. Source-image red threshold and source-specific small mark rectangles recover thirteen eight-connected 6–17-pixel components on each original; no OCR or rune transcription identifies them.

| Original terminal mark | Native centroid (x,y) |
| --- | --- |
| p32 original | **(948.500000, 1671.076923)** |
| p55 original | **(1053.307692, 1294.500000)** |
| p55 mark *projected using the existing p55→p32 tree registration* | **(1072.174082, 2000.238889)** |

The **independent p32 mark** differs from the art-projected p55 mark by **(+123.674082,+329.161966)** native pixels, a **351.628893-pixel Euclidean distance**. Each mark's 13 individual source dots cover x-span **29–30** and y-span **76** pixels (77-pixel bounding height). Thus this mismatch is more than four complete motif heights. This is not a sensitivity to subpixel JPEG thresholding or which of thirteen identical dots is called the center.

The [Python Windows 11 original-source SFT](../sims/lp2_folio_tree_dot_registration_sft.py) locks both source SHA-256 values, recovers all 26 individual red dots directly from their unchanged JPEGs, checks the previously fitted tree transform, prints the original prediction, and includes an exact inverse-projection positive control with a deliberately tree-aligned mark. It passed the [source-native Windows Python 3.12 workflow](https://github.com/FlareZ123/liber-primus/actions/runs/44161507502). No generated image is substituted for the original negative.

## Reversible reading decision

The pre-existing opening cross ornaments on pp0–2 have identical artwork and an undifferentiated 180° geometry; earlier [original crossed-border test](lp2-opening-cross-geometry-and-reversal-gate.md) found no independent page-dependent state. The five original scroll-border pages pp3–7 likewise reproduce mechanically mirrored decoration and no independent stroke selector (see [source template gate](lp2-scroll-p3-p7-original-mirror-template-gate.md)). The strongest identifiable cross-page *tree art* provides one illustration anchor but its two printed terminal stop marks fail to register under that artwork's transformation. These are three distinct source-visible overlay candidates; none independently selects a complete physical folio alignment, rune permutation, or value-changing cipher.

The **test is intentionally narrow**: one global affine crop/image registration extrapolated beyond the tree crop. A hand-arranged nonrigid collage or a source instruction to move punctuation independently could evade this comparison; no original author source currently selects such an operation. The matching trees may be art reuse, thematic cross-reference, or a still-unidentified clue. Their internal silhouette match remains valid. This gate closes the particular **tree-aligned physical-sheet overlay** without searching arbitrary page pairings, rotations, fold orders or cipher phases. A new physical-overlay hypothesis needs a second independent original fiducial that actually aligns under a single transformation and a reversible reader that predicts unknown-page symbols.

**Solution state:** p0–p55 remain unsolved. This result changes the specific folio-overlay decision only; it does not change the authoritative [research synthesis](../results/README.md).
