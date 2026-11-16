# Blurred p32 tree and clear p55 tree: original-raster correspondence gate

**Agent9, 16 November 2026.** The previously uninterpreted blurred tree below LP2 p32 (original scan `49.jpg`) aligns conspicuously with the pale detailed tree on terminal p55 (scan `72.jpg`) under an **upright** morphological blur/scale registration. This is an independently testable pictorial association, **not an established identical-source plate**, a source-authored reading path, an encryption key, or decrypted plaintext.

## Original images and source-locked experiment

- Source files: original 2400×3600 JPEG `49.jpg` SHA-256 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72` and `72.jpg` SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`.
- Independently cropped visually obvious tree fields: p32 original coordinates rows 2070–3229, columns 650–1809; p55 rows 1430–2509, columns 625–1734. Resize each crop to 360×360 pixels and invert intensity to positive ink.
- For the detailed p55 image, fit a tiny bounded source-image degradation grid: scale 0.84/0.88/0.92; elliptical dilation radius 4/6/9 pixels to compensate for p32's thick dark silhouette; Gaussian smoothing σ=6/9/12/15; and free 2D translation within the p32 crop. Optimize normalized cross-correlation only; use no ciphertext, rune/transliteration scores or page-specific keys.
- Optimize the same 36 transformations for an independent mirrored-tree orientation as an internal wrong-orientation control. This is a **descriptive, postselected image fit** rather than a population-calibrated significance test.

| P55 source orientation | Best image correlation | Best scale / dilation / Gaussian | Best translation in 360px crop |
| --- | ---: | --- | --- |
| Upright, unchanged | **0.790046** | 0.88 / radius6 / σ9 | (+10,+24) |
| Horizontal mirror | **0.628365** | 0.84 / radius6 / σ15 | (+0,+51) |

The upright alignment is **0.161681** higher after permitting the mirror its own optimal parameters. Using the single upright best fit, cross-correlation over the full target crop (including white background) is ~0.81. Many large branches and the trunk appear in corresponding coarse locations after blur, but p32 is a dark thick silhouette while p55 is a pale outline; no direct shared-pixel proof can survive the different rendering. Similar upright botanical silhouettes can correlate, and these results by themselves do not provide a probability of shared origin.

## Cryptanalytic decision

This association supplies a concrete candidate human visual route: an observably blurred, earlier manuscript tree points toward a later sharper tree in an art-rich terminal sequence. **Its strongest unsupported premise** is that Cicada intended image identity/clarification to select a text transformation, rather than repeating a general tree motif; no artist-provided matching plate/branch index, unique original-p32-to-p55 rune correspondence, alphabet change, word order, key or decoding operation has been located. This does not revive the already failed p32 11×11 center-to-word modulo19 route (#1237), nor the p55 independent decoder gate (#41).

Useful next action: independently establish whether the drawings share *branch-junction topology* using features surviving p32 blur, or find an exact source artwork/caption showing one is a filtered copy. **Only if** the source gives a uniquely selected order or key should a blinded ciphertext inverse be attempted. Avoid fitting paths through p32 or p55 based on linguistic fragments.

[Original-image, SHA-gated, read-only reproducer](../sims/lp2_p32_p55_tree_blur_registration_sft.py). Related original p32 tree negative (different from the signed 2016 oak) and failed five-peel interpreter: [closed #1237](https://github.com/FlareZ123/liber-primus/issues/1237). Overall established research remains in [results/README.md](../results/README.md); this image association remains provisional and belongs only here.
