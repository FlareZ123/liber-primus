# Archived Beorhtnoth typeface vs LP2 p57 original red runes

**Decision (14 November 2026):** The archived `BabelStoneRunicBeorhtnoth.ttf` in `krisyotam/cicada3301/tools/solvers/iddqd/ttf/` is **not an exact unmodified source font** for the LP2 p57 red `PARABLE` word in the original JPEG. The historical TTF was an independently suggested source-font candidate, never authenticated as the actual Cicada typeface. This result removes that *exact* candidate from a future original-PDF recovery search; it identifies no encryption key or new plaintext.

## Original-source and independent font inputs

- Source original physical `resources/liber-primus/74.jpg` = solved LP2 p57, SHA256 `1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b`, 2400×3600 JPEG rendered at 400 DPI, source red `ᛈᚪᚱᚪᛒᛚᛖ`.
- Original red glyphs 1–5 occupy x ranges inclusive `890–922, 928–961, 966–999, 1004–1037, 1044–1076`, each at y `917–1030`. The last `ᛚᛖ` are visually adjacent and are deliberately excluded to avoid a segmentation-dependent claim.
- Candidate is the separately archived `BabelStoneRunicBeorhtnoth.ttf` GitHub blob `414f3b5852438dd8450411e204aeff75adab0d42`, 55,556 bytes, 2048 units per em, with an OS/2/GDEF/GPOS/GSUB/glyf TTF. The original 2013-era version, rather than the changed 2023 download, is tested. Source citation: [archived candidate TTF](https://github.com/krisyotam/cicada3301/blob/master/tools/solvers/iddqd/ttf/BabelStoneRunicBeorhtnoth.ttf); [official Beorhtnoth typeface description](https://www.babelstone.co.uk/Fonts/AngloSaxon.html).

## Frozen shape test

Source-pixel red mask uses `R>95, R>1.6G, R>1.6B, G<180`. Crop each original rune to its observed ink bounds and nearest-neighbor normalize to 144×144. Parse the candidate TTF's Unicode cmap/glyf contours, crop to vector ink bounds, rasterize its exact angular on-curve polygons with knockout contours, and normalize to the same 144×144. Compare intersection-over-union (IoU), with no tuning to the source page.

| Rune | Source pixel width | Candidate TTF vector width | IoU |
| --- | ---: | ---: | ---: |
| `ᛈ` | 33 | 1200 | 0.4081 |
| `ᚪ` (first) | 34 | 1000 | 0.5388 |
| `ᚱ` | 34 | 1200 | 0.4479 |
| `ᚪ` (second) | 34 | 1000 | 0.5299 |
| `ᛒ` | 33 | 1000 | 0.5313 |

The source's first five letter widths are nearly uniform (33–34 px), while this TTF varies its 1800-unit-high glyph outlines by 20% (1000 vs 1200 units). One common nonuniform page scaling cannot make those relative widths equal. The normalized silhouettes differ more fundamentally: the original `ᛈ` has two short rightward arms near the top, whereas the candidate `ᛈ` forms a tall, doubly forked/hourglass motif. Even source-independent normalization yields IoU 0.4081 for that glyph. The two independently rendered source `ᚪ` copies produce close IoU scores, supporting segmentation repeatability.

**Reproduction:** [single-file source and archived-contour test](../sims/lp2_p57_archived_beorhtnoth_outline_sft.py). Font outline coordinates for precisely these four rune identities are reproduced as data; no third-party font file is redistributed. Original ink masks are read directly from the unchanged repository JPEG. A preliminary source-aligned Noto Sans Runic font control produced IoUs `[0.5111,0.3980,0.5120,0.3976,0.4679]`, illustrating that a moderately high IoU on one individual rune is insufficient for source-font identification.

## Consequence and next fork

The unaltered archived Beorhtnoth TTF is not a supported candidate for reconstructing the original PDF text layer or an encoded ligature. This **does not** exclude an independently edited relative, a renderer applying individual-glyph transformations, or unrelated runic fonts. The only worthwhile next font-specific task is to obtain a source-authenticated original PDF/font or a **different named font with exact outlines** on several original glyphs before hunting font-driven ciphertext side channels. Existing pixel studies already found that most LP2 rune identities are repeatable vector glyphs; this limited gate does not independently establish the original composition program.

**Status:** constrained source-artifact exclusion. No unknown LP2 rune deciphered.
