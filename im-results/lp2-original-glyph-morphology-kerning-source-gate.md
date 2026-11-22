# Original LP2 rune-glyph and fixed-font spacing gate

**Decision (15 November 2026, Agent 7):** An independently trained image-only reader recognizes all 29 GP29 rune silhouettes in the original LP2 JPEG corpus. The spacing between almost ten thousand source-rune pairs is explained by one ordinary, shared fractional font-advance/side-bearing model, including genuinely solved pages and a 17-page held-out section. A deliberately planted ±3-pixel spacing channel is detected with 128/129 recall at a threshold that flags **zero** original pairs. This is source-level evidence against a separately encoded, visibly large typographic spacing channel; **no unknown original plaintext, creator key or decryption operator has been recovered**.

## Source-first question and causal decision

A human inspecting a deliberately typeset runic cryptogram could ask whether two same-transliteration glyphs have distinct printed forms or whether variable inter-rune kerning carries an overlooked key or instruction. Such a second visual channel, if author-designed, would need to survive original source acquisition and be independently recoverable without guessing GP29 plaintext. Prior source-level work audited illustrations, image containers, ornaments and red headings. The fixed black-font advance and shape register was a different, cheap original-artifact test. A positive, repeatable bit class could have supplied key material to a rune decoder. A uniform source typography register tells the population to pursue the cipher operation, page boundaries, or external authenticated clue instead.

**Inputs:** all 58 unmodified original JPEG files `resources/liber-primus/17.jpg` through `74.jpg` (2400×3600), source-ordered physical p0–p57; `resources/transcriptions/liber_primus_master.txt` for independent printed-symbol totals and labels. No OCR engine or external substitution plaintext enters shape classification. The p0 original image supplies 29 training template classes from nine preselected, source-aligned black-text lines. Their positions are fixed in the SFT. All other page images, including solved p56 and clear p57, are independent test images.

## Image-only 29-class glyph recognition

For each original JPEG, rasterize its grayscale ink mask at threshold 150; identify text rows via the horizontal ink projection, and segment tall ink x-runs. Normalized glyph black/white masks (60×48) are assigned to the nearest glyph exemplar learned from the source first page. Require mean squared normalized-mask distance below 0.02 for a confident assignment. Independent canonical per-page rune histograms, withheld from image classification, check whether the recognized glyphs agree with the published textual transcription.

| Original-source measurement | Observed |
| --- | ---: |
| Classes learned on physical p0 | 29 of 29 |
| Total canonical rune glyphs across 58 physical pages | 13,136 |
| Segmented tall-glyph candidates | 13,272 |
| Recognized, high-confidence canonical rune silhouettes | 13,056 |
| Pages with complete exact all-29-symbol histograms | 35 / 58 |
| Uncaptured/disputed printed runes under the fixed threshold/line geometry | 83 |
| Extra tall non-rune shapes, mainly illustration intrusions | 3 |

The 83 unrecognized/missing positions concentrate in source-specific layout, line detection, dropcaps and colored/illustrative regions; they are *not* demonstrated glyph encodings. This model is a source-evidence probe, not a lossless new canonical transcription.

## Held-out inter-rune advance and a planted channel

Take only confidently recognized adjacent x-run segments with physical ink gaps of 0–14 pixels. Fit the entirely source-side linear font-renderer hypothesis

```text
x_next - x_current = a + L[current rune] + R[next rune] + e
```

where `a` is a shared advance and `L,R` are freely learned 29-class left/right side bearings. No original unknown text is decoded by this model. Fit the 59-column design on the physical **p0–p39** observations and freeze it before comparing **p40–p57**. This overparameterizes ordinary font spacing while leaving all held-out JPEGs untouched.

| Test | Observed |
| --- | ---: |
| Original adjacent glyph transitions (within selected small-gap regime) | 9,702 |
| In-sample p0–p39 transitions | 7,122 |
| Held-out p40–p57 transitions | 2,580 |
| Held-out root mean squared spacing residual | 0.458083 px |
| Maximum absolute held-out residual | 1.726001 px |
| Original held-out residuals exceeding 2 px | **0 / 2,580** |
| Solved p56/p57 transition RMSE | 0.445953 px |
| Positively planted held-out transitions (5% seeded sample) | 129 |
| Held-out RMSE after planted ±3 px spacings | 0.824512 px |
| Planted transitions detected at >2 px threshold | **128 / 129** |

Seeded RNG 3301 and the 3-pixel alteration are fixed by the committed program. A genuine independent 3-pixel glyph-spacing message affecting the well-segmented body-text pairs at a comparable rate would be readily detectable, but the source has none under this model. The solved p56–57 rows provide a real original-image font-matching control, distinct from the simulated alteration.

## Scope, reproducibility and next decipherment decision

This test concerns **font silhouette and printed horizontal spacing**, at the explicitly modeled raster threshold and confidently segmented positions. It cannot exclude subpixel modulation, images with unusual line spacing/paragraph breaks, JPEG-domain payloads, red glyphs omitted by the high-confidence classifier, layout-selective writing, or a cipher encoded in punctuation. The external source might carry another kind of steganographic object. Do not elevate the 83 unrecognized cells or three decorative strokes into a proposed key without independently inspecting their source context and a fixed readout. It also does not test a changing-state GP29 cipher.

**Reproduce** on Windows 11 or the manual Windows GitHub Actions runner with [the single-file source audit](../sims/lp2_original_glyph_morphology_spacing_sft.py). It asserts 29/29 classes, 13,136 original runes, at least 9,600 well-segmented transitions, maximum source held-out residual below 2px and >90% detection of the planted ±3px changes. [Actual original-input successful Windows run 43745160221](https://github.com/FlareZ123/liber-primus/actions/runs/43745160221) on `windows-latest`, Python 3.12, NumPy 2.5.4, Pillow 13.0 and OpenCV 5.0.0.93 reports the full numerical JSON in its logs. The workflow [is manual dispatch only](../.github/workflows/lp2-original-glyph-morphology-sft.yml).

**Research decision:** do not prioritize a broad search for two obvious rune-font variants or ≥3-pixel letter spacing as a key channel in original LP2 normal text. The remaining causal bottleneck remains an author-selected reversible cipher, external key, or an authentic instruction deciphered from GP29 original ciphertext.
