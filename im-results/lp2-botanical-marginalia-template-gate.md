# LP2 p8–14 marginal trees and p24–26 wing ornaments: source-template gate

**Original-image evidence, Agent 17, 11 November 2026, Director Issue #187.** The botanical/2016-tree navigation proposal supplies no selected cipher-state or address operation. This is a bounded source finding, not a decryption. No unknown LP2 plaintext, key, or destination was recovered.

## Source and the human-solvable route

LP2 original scans (physical page = JPEG number minus 17) show upright sparse **tree/roots drawings** in the outside margins of **p8–14, JPEG25–31**, alternating left/right with page side. Original **p24–26, JPEG41–43**, show an entirely **different visual family**, two-ended dragonfly-like wing figures on *both* sides of the text. The page-14 central flying insect is separate from its marginal tree. These are two kinds of source artwork rather than a sequence of distinct tree branch states.

The signed 2016 oak image carries the authenticated message that Liber Primus words are the map, their meaning is the road and their numbers the direction. The earlier documented image lineage joins the oak to the blurred p32 tree and outlined p55 tree in [tree-outline-blur-crosspage.md](tree-outline-blur-crosspage.md). No source instruction identifies or enumerates the sparse p8–14 trees as numeric coordinates. A human could notice the seven-page run, roots and page placement, but a unique page/word/rune address needs distinguishable states or a rule selecting an exact branch.

## Original-image reproducible test

The [standalone source-image SFT](../sims/lp2_botanical_template_source_sft.py) uses Python, NumPy, SciPy and OpenCV and reads the original 2400×3600 JPEGs under resources/liber-primus. Reproduce via: python sims/lp2_botanical_template_source_sft.py. No ciphertext score, guessed key, OCR or edited derivative image enters the measurements.

Crop bands: for p8–14, x=0:600 on left pages, x=1800:2400 on right, y=580:3080; p24–26 use the same x-bands and y=900:2500. The central rune block is excluded. Compare original RGB crop bytes, threshold grayscale for registration (trees less than 125, wings less than 155), and use FFT cross-correlation to register fixed-shape ink masks. The SFT emits crop SHA-256 and the exact registration results.

**Exact RGB-pixel copies in different ciphertext-bearing pages:**

| Figure | Independent original source regions | Exact result |
|---|---|---|
| Left sparse trees | p10 = p12 = p14 | Identical entire 600×2500 RGB crops |
| Right sparse trees | p9 = p11 = p13 | Identical entire 600×2500 RGB crops |
| Two-ended wing figures | p24 = p26, each side separately | Identical entire 600×1600 RGB crops |

These are pixel-array equality tests, stronger than resemblance. Original printed runes differ between the pages. Thus no **page-varying secret branch label** can be read from those exact repeated template areas, although a constant universal drawing could symbolize a separate operation.

**Registration against the p10 source tree crop:**

| Source | Best image-only translation (dx,dy) | Thresholded ink IoU | Horizontal-reflection control IoU |
|---|---:|---:|---:|
| p10/p12/p14 | (0,0) | 1.0000000 | 0.1018986 |
| p9/p11/p13 | (-16,0) | 0.9699053 | 0.1007897 |
| p8 | (0,0) | 0.7761889 | 0.1015811 |

The trees on alternating sides preserve **the same chirality**, with the right-group image positioned 16 pixels differently in its own margin. Reading left/right page alternation as an independently chosen orientation or bit adds no source information. The p8 threshold divergence is caused by fine raster/stroke shading differences without a visually identifiable missing or moved branch: maximum nearest-ink distances to p10 are 4.0 and 2.236068 pixels in opposite directions. The large red initial on p8 is a separate text marker outside the tested tree crop.

The p24/p26 wing ornaments reproduce exactly on both sides. The p25 left and right ornaments register to p24 at (-1,-1) with IoU 0.8794326 and 0.9470374, respectively; this is the same visible stencil with a slight raster placement difference, rather than a reproducible three-page sequence of new branch labels.

## Cipher gate and falsifiable limits

An already executed [p10/p11 sevenfold to p55 gate](tree-facing-pages-sevenfold-p55.md) grants an **arbitrary secret stationary output codebook** and obtains a maximum original p55 fit of only **34/76** runes. Its four-rune trim and target assignment were never authenticated by the illustrations. Independently, the genuine solved-2014 [seven-position operation on p8–14](2014-outguess-period7-lp2-p8to14-inverse-gate.md) did not recover LP2 plaintext. These exact tests should not be repeated merely because the imagery occupies seven pages.

The 2016 oak clue does not prescribe which sparse-tree branch to read, how many to count, a page/word/line clock or a reversible original-runic inverse. Repeating fixed art does not exclude a universal mnemonic; it **does exclude differential per-page branch-state extraction from those crop regions**. Since no external rule selects a complete address or key, there is no valid withheld LP2 ciphertext prediction to test for Issue #187. A new authenticated original instruction or a genuinely different source-visible mark would be needed first.

## Director decision

**Retire the unsupported source-tree-to-key path as presently formulated.** Preserve p8–14's seven-page boundary and the fixed illustration orientation as layout observations. Keep the p24–26 two-ended wing art as a different family. No selected cipher state, key, plaintext or destination follows from this source-only gate; avoid branch-count numerology and repeated sevenfold sweeps.
