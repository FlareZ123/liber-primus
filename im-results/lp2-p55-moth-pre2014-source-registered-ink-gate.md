# Physical LP2 p55 moth: no final-page-specific added black-stroke message

**Original-input decision, Agent33, 13 November 2026.** The p55 moth image has no independently visible dark-stroke additions compared with the same artwork on original p53. This excludes a p55-specific *drawn marks* key encoded at normal raster contrast in this motif. It does **not** exclude a shared artwork-derived key, subtler watermark, original JPEG coefficient channel, or another page's illustration. No GP29 unknown plaintext or encryption key is recovered.

## Independent source and possible causal path

The original p55 moth is registered to a [cicada-logo JPEG published in January 2014](https://www.cicadamania.com/cicadas/cicada-3301-logo/) before the final LP2 book. Independent source registration already recovered 561 robust SIFT inliers, fuzzy contour F1 **0.99405255**; an unrelated wings photo control yielded only two geometric inliers. Source JPEG SHA256 **0a7fb4199ae595802bfd45893107c0122d2d6b662a11cb908f64c19391224829**; original LP2 p55 `72.jpg` SHA256 **a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba**. The pre-2014 art supplies a powerful original-facing subtraction control: genuinely added strokes could be a page-local key for the last unknown 76-rune passage.

The exact registered source image was reprojected onto the original p55 motif crop **x650..1849, y2600..3299** at its recorded affine pose; original dark pixels at gray below160 were counted only when more than **3.5, 4.5 or 6.5** image pixels away from the transformed reference dark contour. At 4.5px, p55 has only **457** candidate pixels, forming four connected components of area≥20 pixels; largest sizes are **24,24,23,23 pixels**, each a 9–11px-wide thin contour segment. A genuine six-dark-circle source-frame implant at predefined positions recovers six large components and 2,262 extra pixels; a JPEG92 reencode of the same unmodified registered source has zero candidates. That initial comparison alone would not distinguish a message from source reproduction changes.

## Decisive native-source p53 control

Original p53 `70.jpg` SHA256 **4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548** carries the *same* illustrated insect. Register p53 native crop x600..1799 y2700..3299 against p55 x500..1899 y2600..3499 via unchanged normalized cross correlation. Best original translation is **(+66,+67)** pixels, normalized correlation **0.99990231**. The aligned 1,200×700 raster values differ at most **10/255 grayscale levels anywhere** (mean difference **0.3638631**, only **518** of 720,000 pixels differ in threshold160 dark/light class). This exact pairing directly excludes a final-page-specific visibly added ink stroke in the common moth region: no location is darker or lighter by even 11 grayscale levels.

The same source-logo exclusion-mask positions yield the following *almost identical* candidate residual counts on the two original pages:

| Source-contour exclusion distance | Original p55 pixels | Unmodified original p53 pixels | p55 components of area≥20 |
| --- | ---: | ---: | ---: |
| 3.5 px | 701 | 702 | 6 |
| 4.5 px | 457 | 459 | 4 |
| 6.5 px | 256 | 258 | 0 |

These ~700 native-source residual pixels, including four contour fragments, appear independently in p53; their two-pixel fluctuation between pages matches raster/encoding rounding. The same art's separate JPEG encode causes small grayscale differences, so exact bit/pixel identity is **not** claimed. The 256 count at 6.5px is **a threshold measurement**, not evidence of a 256-bit message.

## Research decision and reproducibility

Retire a unique **p55 overdrawn/added dark-stroke layer on the moth silhouette** as a source-selected key path. The physical last page's faint tree, printed red runes, line text, and JPEG coefficient structure are outside this controlled comparison. A historically grounded p55 decoder must come from a feature that actually differs from p53, a shared valid instruction, or another independent key source.

[Exact Python 3.11 SFT](../sims/lp2_p55_logo_registered_residual_sft.py) with pinned source SHA256, original p53/p55 SHA256, affine registration, image-space 3-threshold residual controls and planted six-dot positive. The original CI [Windows reproducible run 43525928532](https://github.com/FlareZ123/liber-primus/actions/runs/43525928532) passes; artifact `lp2-moth-jan2014-logo-registration` includes JSON and the original-p55 red residual overlay. See also the earlier [original artwork-axis comparison](../sims/insect_wing_fold_artwork_gate.py). The base source artwork's identity was known before this test; the new result specifically closes the untested **p55-only artist-added ink** route.
