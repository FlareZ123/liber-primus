# Original LP2 small word-divider geometry: a 2-pixel shift channel has no support

## Scope and source-visible motivation

The 55 rune-bearing unresolved pages of LP2 contain 2,896 printed words. The tiny dark square between printed words is a distinct connected component in the source JPEG, separate from the 29 large GP rune forms. A deliberate displacement of the square could, in principle, carry a wordwise direction bit or a key tape even if glyph substitutions and allographs were absent. This report tests the **direct, human-visible, independently shifted two-pixel divider** idea on the original images, before any attempted cipher decoding. It is not a universal steganography exclusion.

A competing mundane explanation is consistent font spacing: the square is rendered at a nearly fixed clearance before the next full-height glyph. The original solved physical p56 and clear p57 are independent source-native compositor controls.

## Frozen original-image test

The reproducible test is [`sims/lp2_small_divider_2px_geometry_sft.py`](../sims/lp2_small_divider_2px_geometry_sft.py), read from the project's authentic 75-JPEG image archive or `resources/liber-primus/`. Pages 0–55 use scans `17.jpg`–`72.jpg`; the solved control pages 56–57 use `73.jpg`–`74.jpg`.

- Threshold black foreground at grayscale 160 and locate full-height rune components within x=440–2100, y=440–3250; use the same h=80–122, w=7–110, area>160 original-source segmentation gate as the completed glyph-allograph studies.
- Group glyphs by rounded 188-pixel line band. In successive glyph bounding-box gaps of 14–40 pixels, admit exactly one 2–16-pixel-wide-and-tall connected component of area 2–200 as the **ordinary square divider**. The count restriction excludes punctuation clusters and unrelated artwork; it does not rely on a ciphertext transcription or guessed plaintext.
- Measure integer right-edge clearance from divider to the following glyph: `next_rune_x − (divider_x + divider_width)`. The unmodified control distribution is measured before any synthetic plant.

| Source set | Recognized small dividers | Right clearance 6 px | 7 px | 8 px | Outside 6–8 px |
|:---|---:|---:|---:|---:|---:|
| Original unresolved p0–55 | 2,579 | 845 | 1,586 | 146 | **2** |
| Original solved p56–57 | 37 | 14 | 22 | 1 | **0** |

The two original outliers have right clearance 9 and 10 pixels; **no** observed unresolved-page divider has clearance below six. The right-clearance distribution is tightly anchored to the following glyph in the unknown pages, as in the independently solved pages. This supports ordinary glyph rendering/spacing over an independently displaced 2-pixel marker.

## Planted-message sensitivity

With a fixed source-independent RNG seed 3301, shift one half of the measured unknown-page square locations **rightward by two pixels** without moving their adjacent rune glyphs. The planted readout has **1,231/2,579 outside-interval clearances**. When each chosen square shifts symmetrically either two pixels leftward or rightward, the corresponding planted value is **1,047/2,579**. Both synthetic models are easy to distinguish from the real source's **2/2,579**. The test does not estimate how much subpixel anti-alias noise could encode data.

The test exercises a specifically recognizable 2-pixel geometric clock. It does **not** constrain one-pixel alternation confined to the original 6–8 range, dot shape/color microtexture, multi-dot ornaments, per-line global shifts, or deliberately coupled changes to the following glyph. The 2,579 sample is a geometrically recovered subset of 2,896 printed word boundaries, so it also cannot exclude a rare channel in inaccessible, oversized, page-carried or line-joined separators. In particular, this observation supplies no plaintext, key, or source-authored instruction to treat punctuation as ciphertext.

## Research decision

Retire ordinary word-square **2-pixel independent lateral displacement** as a source-visible one-bit-per-word LP2 key/clock candidate. The surviving short-spacing variation is already seen in genuine p56/p57 solved controls and has no source-selected binary receiver. Do not extend this branch by tuning positions, reading raw JPEG alias widths as arbitrary bits, or fitting an unmotivated codebook. An independently documented 2014 punctuation-bit convention or another original-page visual selector would be needed to justify further work on a different punctuation channel. The main unsolved cipher and 13/10/23-dot chapter ornament questions remain open.
