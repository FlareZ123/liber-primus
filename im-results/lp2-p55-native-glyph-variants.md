# p55 original glyph morphology against an independent native-printing baseline

**Status:** bounded original-source negative on a possible typography-carried key channel. This test recovers no unknown LP2 plaintext or cryptographic key.

## Why this channel is worth a direct check

The terminal unsolved physical LP2 page 55 (original `72.jpg`) has 76 GP runes and unusually sparse text immediately before the separately printed 10-dot terminator, tree and insect artwork. A second bit layer could in principle be carried by deliberate per-rune shape alternates, independently of the cipher values. Because a 256-byte numerical grid elsewhere in the book is already heavily studied as a putative key, a font-shape carrier is a genuinely different possible source of missing key material.

The necessary gate is whether p55 has **rune-preserving binary glyph alterations beyond ordinary printer/JPEG variability**. Its original image is compared against physical LP2 p43, original `60.jpg`, without fitting plaintext or secret bits.

## Frozen extraction and test

The source-native [standalone test](../sims/lp2_p55_native_glyph_variants_sft.py) segments black ink in the normal text region of the unmodified 2400×3600 original JPEGs using the same geometric rule as the repository's [existing glyph-source readback](../sims/original_glyph_source_readback.py). Each component is matched to its exact GP symbol by original source order from `lp2-corpus.json`. The 86-pixel-high **red 10-dot mark** on p55 and the much larger central tree are explicitly excluded by their observed geometry; neither becomes an invented rune or payload bit.

Each isolated binary rune crop is zero-padded in a fixed top-left coordinate system. For p43, compute the nearest Hamming distance among **other** occurrences of the *same* rune, and separately verify that an unrestricted nearest template still identifies its true rune. For p55, use p43's unchanged occurrence templates, without any training on p55. This is a pixel-level source comparison, not a language-based decryption.

| Measurement | p43 independent-sample baseline | p55 original target |
|---|---:|---:|
| GP glyphs matched to source transcription | 274/274 | 76/76 |
| Median same-rune binary pixel distance | 0 | 0 |
| 95th-percentile distance | 117.05 | 120.5 |
| Maximum distance | 271 | 227 |
| Samples beyond p43 maximum | not applicable | **0/76** |

The p43 control is intentionally *leave-one-out* and the p55 comparison is out-of-page. The p55 nearest-template maximum of 227 lies **below** the p43 ordinary-printing maximum of 271. Several repeated runes on p55 have pixel differences of about 100–200 pixels under strict binarization, but equivalent native-shape variability is already present in the p43 control. These differences cannot be labelled concealed bits without a separately motivated decoding convention.

## Decision and scope

No original p55 rune is a **large binary font-shape outlier** against this independent native baseline. A proposal that p55 supplies an obvious alternate-glyph alphabet lacks its necessary distinct physical source feature. This test does **not** reject one-pixel microdots, subpixel kerning, a code that deliberately selects among ordinary renderer phases, a data-dependent JPEG coefficient channel, or a carrier present elsewhere in the book. The output is not plaintext and should remain intermediate evidence.

The next useful typography investigation would need an original-source visual instruction selecting a specific differentiating stroke, coordinate or font phase and must first show its operation on a solved page. Repeating generic image-quality threshold changes will not select a key.

Reproduction: `python sims/lp2_p55_native_glyph_variants_sft.py` from the repository checkout with NumPy and Pillow; original source `resources/liber-primus/60.jpg`, `72.jpg` and `lp2-corpus.json`. The script asserts source count, glyph-label readback, and exact native distance maxima.
