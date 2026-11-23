# Original p49–51: raster-height resolution of all ten I/l source cells

**Agent10, 23 November 2026 — source-level disambiguation, not a Liber Primus decryption.** The original 2014 JPEG scans **66.jpg–68.jpg contain two physically different stem glyphs** at the ten base60 table positions previously treated as ambiguous uppercase `I` versus lowercase `l`. A fixed, fully image-measured cap-height/ascender-height rule identifies **all ten without choosing cases by downstream plaintext, hash, Bitcoin address or cipher scores**. The recovered classes agree with the current `lp2-grid-256.json` canonical table. The previously reported 2^10=1,024 numerical alternatives are useful as counterfactual robustness tests but **are not all equally admissible readings of the original JPEG raster**.

[Exact source-image Python/Pillow reader](../sims/lp2_p50_original_glyphcase_source_sft.py), [Windows original-JPEG PASS 45267807282](https://github.com/FlareZ123/liber-primus/actions/runs/45267807282). It also accepts the maintainer's independent original `liber-primus-jpegs.zip` via `--zip`; the latter was run locally with all case assertions passing.

## An independently anchored source font distinction

The original **32 rows × 8 cells** are distributed 10/13/9 across printed scans 66/67/68. Every row has the same source-pixel x-coordinate field 650..1760, row pitch179, and text baselines starting at y1250 in 66.jpg or y630 in 67/68.jpg. Use original 2400×3600 JPEG pixels, no optical character recognition, geometric image warping, threshold tuning, transcript-selected labels, language model or synthetic font. For each candidate token's **second glyph**, locate its horizontal projection component by its exact printed row and column and count occupied vertical pixel rows. The original raster at any grayscale threshold **70,90,120,140 or180** and a minimum 4 foreground pixels per horizontal projection column gives the same binary classes.

Two independent unambiguous control families in the **same printed Latin font and same three pages** fix the correspondence without relying on `I/l` transcription:

- The visibly capital **L** has a horizontal foot, unlike either thin-stem candidate. All **eight** independent L glyphs at source cells 30,82,128,133,183,187,207,241 have vertical occupied height **67 native pixels**, at all five tested thresholds.
- The visibly lowercase **h** has an unmistakable hump. Its independent source cell126 has ascender height **68 native pixels**, at all thresholds.
- The thin candidate stems fall **exactly** into those 67-pixel cap and 68-pixel ascender classes. In this source font **I=67px** and **l=68px**, not just differing by JPEG color speckle. Five independent thresholds preserve the one-pixel height difference and the final classification.

This is a reading of what is *printed*, not a conjectural secret bit steganography channel. A future vector-font-original could strengthen the letter-name inference, but the two fully source-visible reference shapes and the original threshold stability already distinguish the two classes.

## All ten original cells

Indices are zero-based on the 256-cell printed row-major table, 0-based rows/columns. All cells are **outside the independently proposed missing-L fifth column**.

| Index | Printed source row | Column | Native-height class | Pixel-inferred exact token |
| ---: | ---: | ---: | ---: | --- |
| 2 | 0 | 2 | 68px lowercase ascender | `2l` |
| 25 | 3 | 1 | 67px capital | `3I` |
| 45 | 5 | 5 | 68px lowercase ascender | `1l` |
| 50 | 6 | 2 | 68px lowercase ascender | `0l` |
| 90 | 11 | 2 | 67px capital | `3I` |
| 165 | 20 | 5 | 67px capital | `0I` |
| 175 | 21 | 7 | 67px capital | `0I` |
| 182 | 22 | 6 | 68px lowercase ascender | `2l` |
| 199 | 24 | 7 | 68px lowercase ascender | `0l` |
| 246 | 30 | 6 | 67px capital | `3I` |

Read all ten cases in source order with capital I=1, lowercase l=0: **`0100111001`** (binary 313; uppercase/lowercase sequence `lIllIIIllI`). That is only a *faithful convenient representation of the original printed case mask*. The number313 has **no authenticated semantic role**, is not a source-selected cipher key and must not be promoted because it is prime or seems meaningful.

The newly reproducible reading is the **existing canonical vector of 256 byte values**, not a new, altered transcription, and it leaves the fifth-column `1Meanpng` address calculation unchanged. Crucially, an analysis that treats all 1,024 I/l assignments as equally visually plausible has an incorrect source-artifact premise, even if its result remains a valid stronger robustness negative under forced case changes. Reconsider attacks that were blocked *solely because no exact table-reading was available*; do not repeat cipher family tests already negative under the actual canonical vector.

## Causal interpretation and next step

This resolves ten physical **input-symbol ambiguities**, not 10 bits of an author-authenticated hidden message, a cipher, an unknown manuscript plaintext, a new destination or any missing historical decryption operation. A concrete next research decision now can use the **one full image-selected base60 byte register** with high confidence, including outside the unambiguous fifth column. Still source-selected instructions are required before deriving a decryption from this exact register.

**Source exactness:** the runner pins original source dimensions, independently printed rows10/13/9, all 10 candidate source positions, 8 cap-L controls, 1 lower-h control, 5 literal grayscale thresholds, all 10 measured glyph-height labels, recovered ten-case mask, and exact match to existing working `lp2-grid-256.json`. Executed on unmodified original 66/67/68 JPEG bytes from the repository and separately from the maintainer's supplied ZIP. `results/README.md` must not treat the 1,024 numerical assignment counterfactuals as 1,024 genuinely undecidable source readings.
