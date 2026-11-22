# Three original source-matched artwork pairs: bounded common added-ink channel gate

**17 November 2026, Agent24, Director [#1344](https://github.com/FlareZ123/liber-primus/issues/1344). Classification:** a direct cross-artwork comparison under one frozen high-contrast added-stroke reading. **All three original pairs have zero coherent source-distant added strokes at the declared size.** Four deliberately planted marks are recovered on each source, and wrong-reference checks yield many false additions. **No unknown LP2 rune plaintext, cipher key, historical instruction or destination has been recovered.** This is a source-constrained exclusion of a simple human-visible markup channel, not an exclusion of faint ink, colored marks, transform-encoded data, keyed JPEG steganography, or hidden source-opacity changes.

## Why these three pairs belong together

Three independently original-matched illustrations offer possible *human-observable* keys without fitting rune scores:

- The 2012–14 Cicada emblem is printed on solved LP1 p05 and unknown LP2 p53/p55. Original moth p53 `70.jpg` to p55 `72.jpg` undergoes source-measured translation **(+66,+67)**, with static surrounding floral decoration. This report uses the better-conditioned native source p53 as the comparison; the separate original LP1 p05→p55 similarity at **2.330×** was previously established [here](lp2-moth-art-coordinate-registration-source-gate.md).
- The doubled p24 mayfly image (original `41.jpg`) is rendered as the dotted figure in original clear p57 (`74.jpg`). A GIMP-compatible dissolve rendering has already been demonstrated with a source-independent RNG-field alignment. Its original p57 source opacity is unavailable [here](lp2_p24_p57_dissolve_tone_controls.md); individual dots are therefore expected, not automatically intentional additions.
- Physical p55's pale tree (`72.jpg`) and p32's blurred tree (`49.jpg`) show held-out trunk-to-crown geometric correspondence. The earlier source-registered silhouette fill/blur was fitted to the **lower trunk only** and predicts the upper crown with correlation **0.898599** [here](lp2-p32-p55-blurred-tree-correspondence.md).

These are **different historical rendering operations**. The proposed shared feature has to survive each illustration's transformation and be readable without re-optimizing separately against ciphertext. We therefore freeze one *coarse human-visible contrast* test across all three. Previous tests already exclude p55-only moth overdrawn black strokes, but that alone did not compare three art families.

## Original-source and finite candidate grammar

[One read-only Python SFT](../sims/lp2_three_art_pair_common_added_stroke_sft.py) reads and SHA-256-checks **six unchanged 2400×3600 JPEGs** `05,41,49,70,72,74.jpg`. All image crops, page identification, and source-frame transforms come from the pre-existing studies cited above, with no LP2 ciphertext accessed. The p05 image serves as pinned cross-release identity; for higher-fidelity pixel subtraction the original p53 image is the operative same-logo control.

1. Normalize each source and later target crop to **360×360 grayscale** in ink-positive orientation. Moth: source p53 crop x600:1709,y2740:3149; target p55 crop x666:1775,y2807:3216. Mayfly: the existing p24-to-p57 source-only affine based on logical pixels `c,r`, original p57 region x600:1899,y1900:3249. Tree: original p55 crop x625:1734,y1430:2509, p32 crop x650:1809,y2070:3229; original independently selected hole fill, scale0.9, shift(-12,+1), Gaussian sigma9.
2. One fixed threshold detects dark source/target ink when intensity exceeds **100/255** on the ink-positive field. A target pixel is a candidate addition only when its distance to *any* source ink pixel is **greater than eight normalized pixels**. Eight pixels is a deliberately large tolerance for antialiasing and shape mismatch, so this is a conservative large-stroke reader.
3. An authored visible mark must contain at least **20 adjacent source-distant pixels** as one connected component. Isolated dissolved mayfly dots, blur-edge differences and sub-20-pixel marks fall outside this candidate grammar. No candidate positions, values, or English words are optimized.

The source→target matching transformations were known before this invocation, but the exact eight-pixel/20-pixel threshold was explored against the three given images in this invocation. Consequently this is **not a previously preregistered blind discovery test**. Its relevant independent check is the *source-only* positive-plant and wrong-source rejection, while the earlier p32 crown was genuinely held out from its trunk-registration fit.

## Three-pair original result with detection-power controls

| Original registered motif | Source dark ink pixels / target dark ink pixels | Source-distant target pixels | Candidate connected additions ≥20 pixels | Largest connected residual |
| --- | ---: | ---: | ---: | ---: |
| Moth p53→p55, translated original source | 22,803 / 22,782 | **0** | **0** | 0 |
| Mayfly p24→p57, dissolve-rendered source | 6,725 / 2,671 | **723** | **0** | 15 |
| Tree p55→p32, source-filled blurred drawing | 29,914 / 13,304 | **0** | **0** | 0 |

At native source resolution, independent source p53→p55 moth artwork has only **10/255 maximum grayscale disagreement**, across a 410×1110 registered crop. Thus a new human-visible p55 black-ink mark is absent from this same-source motif. The mayfly has 723 residual ink pixels after coarse normalization, spread across **356 tiny connected components, largest 15 pixels**; this is expected under source-tone/legacy dissolve uncertainty and supplies no obvious common rune-shaped mark. The p32 tree source-fill/blur has zero source-distant high-contrast residual in the selected normalized original crop. This is consistent with its previously reported specific crown/trunk registration.

A positive “author inserted four ink marks” control chooses four 12×12 blank regions **from the source image only**, one per quadrant, and paints them on the target. The exact same detector recovers **4/4 components of ≥20 px in all three matched artwork pairs**; source-distant ink rises by **576 moth / 575 mayfly / 576 tree pixels**. This shows the declared reading can detect moderately sized intentional additions even over image noise. Two negative source-identity controls replace the correct reference with another motif: using the mayfly as the moth source yields **48** spurious large components and **17,606** source-distant pixels; using it for the tree yields **3** large components and **7,563** source-distant pixels. The detector is not vacuously suppressing all errors.

## Cryptanalytic decision

**No shared author-visible added-symbol register emerges from these three pre-identified art matches.** The positive controls show that a common 12-pixel stamp would be detectable in the original artwork fields, but the real images do not contain any register under the fixed coarse rule. Because no art difference specifies a readable coordinate sequence, ordered symbol alphabet or GP29 value-changing operation, testing arbitrary values as a rune key would only be fitting random ink.

This retires the **common, large, added-high-contrast-stroke channel across these three pairs**. It leaves the historical artwork relationship and independent mayfly GIMP-compatible dissolve finding intact. No further cross-pair image-alignment search is justified without a specific original instruction identifying a different observable feature or external original source master. In particular the four isolated p57 dots cannot be called a code merely because they have low PRNG thresholds.

**Reproduction:** `python sims/lp2_three_art_pair_common_added_stroke_sft.py`, NumPy/OpenCV/SciPy, SHA-gated six image files. [One-shot Windows original-image workflow](../.github/workflows/agent24-three-artwork-pair-stroke-gate.yml). The same script was executed successfully against the exact supplied six SHA-matching original JPEGs locally, before submitting its Windows CI run.
