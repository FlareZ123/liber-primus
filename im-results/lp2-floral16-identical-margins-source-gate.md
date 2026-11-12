# Original LP2 floral-border pages: fixed decorative pixel field

**Evidence: exact decoded-image equality on source-original page artwork. Status: extension from the independently completed p40–53 grayscale template audit to p54–55 and full RGB; no key or unknown plaintext.**

Original physical LP2 pages **40–55** (archive JPEGs `57.jpg`–`72.jpg`) share the ornate left/right vine, spiral and root illustration. Their source images are uniformly **2400×3600** pixels. Agent14 had already established **grayscale equality on the first fourteen pages p40–53** with a broader crop in [the original eight-column pointer report](lp2-p40-red8-eight-column-prime-pointer-source-gate.md). The only new coverage here is **p54–55** plus the stricter three-channel RGB comparison across all sixteen. The matching artwork is an unusually strong naturally repeated cover for a proposed steganographic directional cue: an authored per-page change to a stroke, root, bud or dot in the pictured margins would be directly observable after placing all images in common coordinates.

## Original-page decision

Decode all sixteen original JPEGs to RGB without resizing, and compare p41–p55 with p40 at exact image coordinates, inclusive/exclusive Pillow crops. The fixed left-illustration rectangle is **(70,600)–(550,2950)** and the right rectangle **(1850,600)–(2380,2950)**. These contain the large illustrated flourishes and are deliberately outside the central variable rune text.

| Original art region | Pixel dimensions | Source p40↔p41…55 exact pairwise tests | Nonidentical decoded RGB channels |
| --- | ---: | ---: | ---: |
| Left illustrated margin | 480×2350 | **15/15 exact** | **0** |
| Right illustrated margin | 530×2350 | **15/15 exact** | **0** |

The broad central-text control crop **(650,650)–(1750,2850)** differs from p40 on **15/15** other pages. A one-channel single-pixel mutation in the left artwork is detected by the same difference procedure. The margins are therefore genuinely page-invariant at **decoded RGB-pixel resolution** despite changing runic text. The old visual proposal that page-to-page changes in floral buds, roots, spirals or margin-dot positions provide a cipher clock has no such per-page signal in these regions.

This test is intentionally narrower than a JPEG steganography negative. Identical decoded RGB can coexist with different compressed bitstreams, quantization coefficient details, or a common same-payload watermark; the cropped test also says nothing about steganography inside the varying rune text or the separate p53/p55 insect art. It does **not** establish that the border is mathematically devoid of a global single-image clue. The exact repeated 16-page artwork is a stable shared template, without a decipherment operation selected by itself.

[Reproducer on original repo JPEGs](../sims/lp2_floral16_template_pixel_gate.py) uses Pillow and an explicit mutated-image positive control. The same experiment was independently executed on the separately supplied `liber-primus-jpegs.zip` archive in this invocation, with the above exact results. Other previously reported floral-frame arithmetic and terminal 256-cell grid tests are separate; this finding does not retest their ciphers.

**Novelty limit:** The 14-page shared-frame result and its missing operation were already established by Agent14. The present extension should not motivate another floral-border reanalysis.

**Next causal decision:** only pursue the margins as a *per-page* message if a source cue points to a meaningful difference beyond the tested decoded-pixel geometry, such as authenticated original DCT coefficient manipulation. For ordinary image-reading and fixed template comparisons, the absence of any changing marginal pixels is decisive.
