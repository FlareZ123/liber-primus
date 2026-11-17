# LP2 original vertical rune baselines: source-image and planted controls

**Current decision (Agent6, 15 November 2026; Agent47, 17 November 2026):** The ordinary source JPEGs do not exhibit a dense, whole-source-pixel vertical-shift key channel. The original seven-page baseline finding now has a distinct twenty-five-page, same-rune/same-line test with an independently planted JPEG positive. Neither test decrypts unknown original GP29 ciphertext, supplies a source-selected key, or finds a hidden message.

## Human-visible clue and receiver

Cicada previously used image steganography, and the 2014 Liber Primus was delivered as 2400×3600 JPEG images. Shifting printed GP29 glyphs vertically by one pixel could in principle carry a bit without changing rune identity. A *whole-glyph vertical shift* moves both the top and bottom ink boundaries together; ordinary antialias and rune-shape changes can alter a single ink boundary. The manuscript does not specify this channel, so its actual presence must be demonstrated on original glyph positions before treating such offsets as keys. Compare glyphs of exactly the same GP29 identity within the same printed line to remove baseline/font-contour effects.

## Earlier exact baseline source result (Agent6, 15 November)

The previously checked [source-seven-page SFT](../sims/lp2_original_vertical_glyph_baseline_sft.py) covers original 26.jpg,29.jpg,36.jpg,43.jpg,49.jpg,64.jpg,72.jpg. It uses first-party p32/p55 training and p9,p12,p19,p26,p47 as five full-line source additions. An independent classifier correctly recognized 1,339/1,339 original glyphs across those five test pages. The common source glyph-bottom baseline for zero-indexed printed row r is **786 + 188r + floor((r+1)/3)** pixels, the extra pixel every three rows consistent with fractional line spacing. Among 1,536 source glyphs, 1,423 bottoms lie exactly on the baseline, 97 one pixel above and 16 two pixels above. All 113 off-baseline positions belong to four specific classes: GP indices 12 (31 cases), 13 (39), 17 (36), 21 (7). All 25 other GP classes sit exactly on the baseline. The baseline formula was identified from these pages and is an empirical rendering constraint, rather than a blind authorial prediction.

## Extended native 25-page matched test and Q92-positive plant (Agent47, 17 November)

The [new source-JPEG SFT](../sims/lp2_original_rune_vertical_baseline_sft.py) reuses the established 29-class source font detector, trained on 197 original p32/p55 glyphs. Its 25 originally held-out twelve-line ordinary pages supply **300 printed lines and 6,673 confidently classified original glyphs** at fixed threshold ≥0.88. It measures the top/bottom positions of each full-height rune at native grayscale threshold 155. Every pair of matching GP29 rune identities on the *same physical printed line* is compared, giving exactly **2,179** source-aligned glyph pairs.

| Input | Same-rune same-line pairs | Both top and bottom move together by exactly ±1px | Only one boundary changes ±1px |
| --- | ---: | ---: | ---: |
| Unmodified original 25 JPEGs | **2,179** | **10** | **369** |
| Same source pages unmodified, JPEG Q92 re-encoded | **2,179** | **10** | **369** |
| Selectively shifted whole glyphs +1px, JPEG Q92 re-encoded | **2,179** | **1,457** | **232** |

The positive plant moves *the last occurrence of each rune identity repeated within a physical line* one full original pixel downward, without changing glyph shape or GP identity. This source-fixed selection plants exactly **1,491 distinct glyph shifts** (~22% of confidently classified glyphs). The whole 2400×3600 page is then JPEG Q92 reencoded and decoded by the same source glyph detector. All **1,491/1,491** target glyphs independently move their measured top and bottom by exactly one pixel, and the matched 2,179 pair comparisons and rune labels remain intact. A Q92 recompression without any glyph shift reproduces the source baseline counts exactly. The original 10/2,179 co-moving pixel events (0.46%) contrast with 1,457/2,179 (66.9%) in the planted output, showing this exact whole-pixel channel would be easy to detect under the actual receiver.

## Inference, scope and next decision

These source measurements **exclude a dense one-pixel vertical glyph-position bitstream among repeated same-rune/same-line glyphs**, a potential historical image carrier. The original 369 one-edge changes mostly reflect font edge geometry or antialiasing rather than whole-glyph translation. The result leaves possible sparse signals at rune classes occurring only once per line, subpixel movements, separate entire-line shifts, ink color, original JPEG DCT coefficients, and irregular art regions. No plaintext, key material, or next-stage destination was recovered. Revisit vertical placement only with a creator-visible operation specifying an independently testable readout. The existing [horizontal microspacing innovation bound](lp2-original-microspacing-innovation-bound.md) and [allograph bit split](lp2-allograph-full-source-controlled-split.md) are distinct, independently completed carriers.

**Reproduction:** The older [seven-page test](../sims/lp2_original_vertical_glyph_baseline_sft.py) needs NumPy and Pillow. The separate [25-page native JPEG + positive plant test](../sims/lp2_original_rune_vertical_baseline_sft.py) needs NumPy, Pillow and OpenCV; it reruns the existing original rune source classifier, asserts all counts, alters only in-memory copied images, and prints machine-readable JSON. No original file is overwritten.
