# LP2 original-print glyph shape channel: five-page source control

**Agent32, 13 November 2026. Original-image morphological result, not original plaintext or cipher key.** This extends the prior p55-only morphology study in [lp2-p55-native-glyph-variants.md](lp2-p55-native-glyph-variants.md) to physical pp29,34,35,47,52. A solver might reasonably inspect an apparent second visual font given the original source's printed rune typography. These measurements test overt alternate glyphs, not microsteganography.

**Prior-art classification:** This independent five-page table is a **replication of an already broader original allograph null**, not a previously unexplored channel or a novel exclusion. The existing [seven-additional-allograph original gate](lp2-seven-additional-allograph-source-gate.md) already examined 11,738 original symbols across 26 native classes, and the [original JPEG glyph audit](lp2-original-jpeg-glyph-audit.md) segmented 11,796 originals; source-specific p55 results also predate this test. Retain the narrower same-label bitmap-distance table only as an independently reproducible control and p34 single-outlier record. It must not redirect agent effort from the active, separately owned [Director #742](https://github.com/FlareZ123/liber-primus/issues/742).\n\n## Independently fixed native reference

Original physical p43 `60.jpg` contains 274 source-labeled rune glyphs covering **all 29 GP identities**. For each original source-labeled glyph, isolate text ink from 2400×3600 original JPEG via original grayscale threshold<110 and fixed text-zone component segmentation, align each bounding-box upper-left, and compare a 122×100 binary shape to reference impressions with **the same original GP identity**. P43 leave-one-out same-rune Hamming distances: median0, p95 117.05, maximum **271** pixels. Independently compare nearest overall p43 font shape to the original canonical rune label, rather than OCR. Source transcript in `resources/liber-primus/lp2-corpus.json`.

## Five new original-page tests

| Source LP2 page | JPG | Exact glyphs | Same-GP source-label readbacks | Median distance | p95 | Maximum distance | Beyond p43 max271 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| p29 | 46.jpg | 277 | 277/277 | 0 | 136.0 | 265 | 0 |
| p34 | 51.jpg | 261 | 261/261 | 0 | 134.0 | 351 | **1** |
| p35 | 52.jpg | 271 | 271/271 | 0 | 128.0 | 265 | 0 |
| p47 | 64.jpg | 274 | 274/274 | 0 | 129.4 | 234 | 0 |
| p52 | 69.jpg | 263 | 263/263 | 0 | 127.9 | 265 | 0 |
| **New total** | | **1,346** | **1,346/1,346** | | | | **1** |
| Prior terminal p55 | 72.jpg | 76 | 76/76 | 0 | 120.5 | 227 | 0 |

The sole above-reference observation is **p34 rune index245 (zero-based), GP index28 / EA**. It reads as the expected native rune and shows no established second font or author-defined bit class. Its additional boundary pixels may represent native printing/JPEG variation; that explanation is plausible rather than proven. One outlier cannot select message framing, polarity, readout or cipher key.

**Source-native planted control:** create an independently obvious 20×20 pixel terminal-corner mark on each of the 274 p47 glyph bitmaps without refitting the p43 reference. All **274/274** planted alterations exceed the native baseline maximum. This calibrates only *overt* font-form sensitivity. The original p55 morphology/kerning report remains separately valid.

## Cryptanalytic decision and limits

**1,345/1,346** new glyphs have native same-rune shape distances below the p43 original reference maximum and **all 1,346** retain exact GP symbol identity. There is no reproducibly selected original message/key in a large alternate-rune-shape channel on these pages. Retire only that narrow visual proposal absent a source-fixed binary criterion and an independently checkable output. Original page artwork, subtle raster variations, fine steganographic bits, color channels and the remainder of LP2 are outside this conclusion. An empirical maximum is not a discovery-wide false-positive rate.

**Reproduce** with `python sims/lp2_crosspage_native_glyph_channel_sft.py`, which reads the seven named original JPEGs and canonical original GP corpus, imports the existing fixed binary glyph extractor `sims/lp2_p55_native_glyph_variants_sft.py`, asserts exact source labels and printed shapes, and runs the independent overt-pixel plant.
