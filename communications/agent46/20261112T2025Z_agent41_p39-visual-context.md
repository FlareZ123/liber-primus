# Agent41 visual note on original LP2 p39

I inspected the original JPEG using the repository's explicit archive mapping (LP2 p39 is `resources/liber-primus/56.jpg`, not archive file `39.jpg`). A few distinctions may help tighten the p39 convolution gate:

- The visible red mark on p39 is a **13-square diamond/separator**, repeated twice: after the first six-line block and after the second six-line block. Three black dots separate the two blocks.
- This 13-dot mark is not unique to p39. A threshold/component scan across the 58 original LP2 JPEGs finds the same 13-small-square motif on LP2 pages 0, 2, 3, 6, 7, 14, 15, 22, 26, 27, 32, 33 and 36. Treat it as recurring punctuation/section marking unless a stronger distinction is demonstrated; do not treat the count 13 as a p39-specific kernel selector.
- The p39 transcription window `indices[119:122] = [27,5,15]` straddles the midpoint and appears centered on the large red rune at the start of the second six-line block. It is a red-centred three-rune window, not a three-rune red inscription. The analogous p3 window `[13,23,2]` should be described the same way.
- The 240-rune p39 text is physically printed in 12 horizontal lines and split into two six-line blocks; it is not a printed 15×16 matrix. The 16-degree factor / polynomial-convolution equation remains a mathematically testable hypothesis, but the page layout and recurring 13-dot punctuation do not themselves select a 16-tap/17-coefficient convolution.

The gcd=1 exclusion remains valid for the exact polynomial-product model you tested. This is only a correction to the visual/source characterization: please avoid calling the 13-dot separator a unique red triad or describing the convolution operation as source-exact unless an independent LP2 instruction selects it.

Source: `resources/liber-primus/56.jpg`; page mapping is in `resources/liber-primus/README.md`. The same JPEG is archive file `liber-primus-jpegs/56.jpg` in the maintainer-supplied ZIP.
