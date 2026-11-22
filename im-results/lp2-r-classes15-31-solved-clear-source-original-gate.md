# Original LP2 two-form R glyphs occur in genuine solved plaintext

**Agent9, 22 November 2026, Director [#2280](https://github.com/FlareZ123/liber-primus/issues/2280). Classification: bounded original-image allograph key exclusion.** No unknown original LP2 plaintext, author-selected glyph-channel key, or new cipher mechanism recovered.

## Distinct previously surviving premise

Dukotah's independently clustered original glyph forms [Round9, commit 9087dc3](https://github.com/Dukotah/cicada3301/tree/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/retranscribe) assign **class15** to genuine GP29 **ᚱ** (R), and **class31** is unmapped. The source-column audit [Round9 independent source](lp2-round9-independent-unmapped-class-audit.md) identifies class31 as ᚱ at **123** original sites on p0–39 and **36** on p40–55. Some class15 and31 R runes share the same physical printed line. Although the full 29-rune overt-variant gate and 86-doublet audits already reject obvious extra strokes, the finite 15/31 source forms could carry an author-selected secondary cipher bit if *an independent original control distinguished them*.

This experiment freezes an original p17 two-form source pair and checks it on **four** other unknown images and **both independently solved pages**. Its semantic test is whether the two classes are specific to encrypted source symbols.

## Exact first-party glyphs

The two original p17 (34.jpg) training R rectangles are class15 (x1043,y862,w34,h113, **1,991** ink pixels) and class31 (x1604,y861,w35,h114, **2,097** ink pixels). With native 2400×3600 JPEGs, grayscale threshold128 and 120×45 top-left-aligned bitmaps, their IoU is **0.9013953488372093**. Each shape's every black pixel is **within one pixel** of some black pixel in the opposite form, using symmetric 3×3 dilation. There is no separately added visible diagonal/stem.

A frozen same-form nearest-overlap classifier, without consulting any plaintext on unknown pages, reproduces **8 of 8** class labels, two per original physical page:

| Original page | Independent class15 R coordinate, class15/class31 IoU | Independent class31 R coordinate, class15/class31 IoU |
| --- | --- | --- |
| p0 | (816,2745): .95552/.91916 | (1428,2745): .89593/.96679 |
| p7 | (1295,897): .94020/.92800 | (1610,1274): .90140/1.00000 |
| p27 | (1091,1482): .94020/.92800 | (1470,1482): .90140/1.00000 |
| p54 | (1278,2424): .98112/.89449 | (1138,2423): .90414/.98393 |

On authenticated **solved p56**, all **five** ᚱ glyphs from the 85-rune totient plaintext give **four class15, one class31**. On independently printed, **unencrypted p57 PARABLE**, all **six** ᚱ glyphs from genuine cleartext give **four class15, two class31**. The very same 15/31 morphological split therefore occurs in ordinary plaintext at least twice, with both classes present on *each* solved original page. Original p57 class15 R at (928,918) has a completely pixel-identical thresholded bitmap to the original p17 class15 R; original p7/p27 class31 R at (1610,1274)/(1470,1482) also match p17 class31 *exactly*. Source shapes are font-rendering variations shared by both cipher and clear printing.

## Cipher decision

**Retire the isolated class15/31 R glyph split as evidence of an encrypted-page-specific secondary alphabet.** Both source shapes already occur in known cleartext in precisely the same image format. The 1-pixel stroke differences and no author-visible key-reading rule are compatible with normal raster phase/antialiasing. A hypothetical micro-pixel data channel embedded even in cleartext, other rune classes, bit-level data or merged strokes remains unexcluded, but requires a *new independent source instruction* specifying its bits, order, key use and an original plaintext receiver. Existing original all-29 image-glyph studies and per-doublet reviews address the wider obvious-font-variation class; this test does not repeat them.

**Reproduce:** [single-file original-image Python SFT](../sims/lp2_r_twoform_solved_original_sft.py) uses NumPy, Pillow and OpenCV; with source originals in resources/liber-primus it needs no arguments, or pass the optional original maintainer ZIP. It checks 8/8 unknown-page R sites, **11/11 solved R** sites, both classes on each known clear control, source p17 IoU, 1-pixel stroke inclusion and an artificial extra-stroke positive. The same classifier is unchanged across all pages. It produces **no** decoded unknown original GP29 rune, no key, and no plaintext claim.
