# LP2 page-authoring/compositor source acquisition bound

**Agent16, 28 November 2026 — Director #3352. Decision: no authentic editable LP2 page source is reachable in the concrete creator-era/public preservation graph checked here. The surviving publication envelope is flattened JPEG-only. Reopen on a new archive/ref, not another rewrap or community transcription.**

## Why this source would matter

The original LP2 page source is unusually high-value because one authentic PDF/PostScript/TeX/SVG/layout-project object could expose several currently missing variables at once:

- source rune strings before rasterization;
- the actual font/subset and its internal glyph mapping;
- text-object and drawing-object order;
- exact kerning/positioning arrays;
- page labels, layer names, comments, include paths or build scripts;
- a second representation of punctuation, colors, artwork and page ordering.

The new local JPEG audit gives a hard recognition contract for any claimed source: LP2 p0–p57 are 2400×3600 baseline JFIFs at **400×400 dpi**, i.e. exactly **6×9 inches**, with IJG Q92 luminance quantization and one byte-identical 2576-byte Artifex sRGB ICC profile. Prior controlled builds strongly support a Ghostscript-compatible render stage in the 9.05–9.14 era band; the later optimized JPEG writer is not uniquely identified.

Reproducer: `sims/lp2_jpeg_export_envelope_sft.cjs`; synthesis: `im-results/lp2-jpeg-export-envelope.md`.

## Concrete source packages and publication surfaces already exhausted

### 1. The original seventh-onion publication page

The period-preserved `micheloosterhof/cicada-2014` copy of:

`stage11/ky2khlqdf7qdznac.onion/index.html`

is a 1.6 KB image-only document containing exactly 58 references, `0.jpg` through `57.jpg`, inside `<div id="331">` and title `133`. It contains no stylesheet, script, PDF/PS/SVG link, source archive, font reference or alternate-format link.

This establishes the **published page envelope**, not the server's complete filesystem. A sibling-path/server-response recovery remains a separate archive problem (#3353).

### 2. The strongest live 2014 Git mirror

`micheloosterhof/cicada-2014` was created during the live puzzle. #3338 already established that the signed Gematria Primus table entered that history only as the original raster JPEG. Its Stage11 tree likewise preserves the LP2 release as JPEG files and solver-side derived material, not an editable compositor source.

A typed 2014-tree/path audit found no TTF/OTF/SFD, TeX, PDF/PostScript, EPS, SVG, Scribus, Inkscape, GIMP/PSD/XCF, keyboard map or authoring project that reproduces an LP2 page from editable content.

Lost refs/forks of this live-period repository are intentionally **not** claimed exhausted here; Director #3355 now owns that exact provenance surface.

### 3. Controlled local + mirror PDF/PS hunt

The strongest prior external source-acquisition campaign is:

`Dukotah/cicada3301@b271334d9718bf68187f7a1e6362731159c36a2a:liber-primus/analysis/round20/N1/RESULTS.md`

It used positive and negative controls capable of distinguishing a genuine typeset PDF from an image rewrap, then scanned:

- **195 distinct local PDFs** (545 paths after duplicates);
- complete iBotPeaches and micheloosterhof mirrors used by that corpus;
- the large krisyotam mirror state then available;
- two Internet Archive LP/Cicada items, including the 9 MB LP bundle.

No genuine LP2 PDF/PS with a runic text layer or embedded runic `/BaseFont` subset was found. The LP-titled documents that did exist were solver writeups or image rewraps.

### 4. Later source-artifact sweep

The later lane:

`Dukotah/cicada3301@b271334d9718bf68187f7a1e6362731159c36a2a:liber-primus/analysis/round36/O2-source-artifact-hunt/RESULTS.md`

extended the search to alt formats and additional large community repositories. It reports no PDF/PS/DjVu/SVG/TIFF/PNG source and no original rune-face source. Its coordinator addendum also ran authenticated GitHub code/tree searches across large surviving repositories and still found only icons, fan fonts and derived crops.

One explicit residual remained: the Wayback/CDX leg was unavailable at the time. That is a real open archive class, not evidence of absence.

### 5. Period IRC/source-link check

A targeted search of preserved 2014 solver IRC for LP/source-adjacent PDF, TeX, SVG, PSD/XCF and editable-source references did not surface a creator-attributable LP page package.

A January 2014 exchange mentions solver `PersonalKilljoy` using **PyX** because the library outputs EPS/PDF while creating a bitmap from hex/bit values. The same exchange points to a wiki revision as the "original source"; this is participant tooling/reconstruction from an already public clue, not an LP2 authoring artifact. It therefore does not satisfy #3352's provenance or page-reproduction bar.

## What is established

The available evidence now supports a constrained production history:

```text
editable/typeset LP2 source     [missing]
          |
          v
Ghostscript-compatible render, 6x9 in @ 400 dpi
          |
          v
optimized JPEG re-encode
          |
          v
58 flattened JPEGs 0.jpg..57.jpg  [authentic surviving publication]
```

The source upstream of rasterization is **inferred by the render behavior but not publicly recovered**. No current artifact exposes an internal source-text representation of the unknown rune pages.

This is stronger than "there is no PDF on GitHub": the negative covers the original publication index, the live 2014 public mirror, a controlled 195-distinct-PDF corpus scan, major mirror trees, Internet Archive LP bundles and later alt-format source sweeps.

## Exact residual acquisition classes

Do not repeat generic "Liber Primus PDF" or rune-font searches. Reopen #3352 only with a concrete new preservation surface in one of these classes:

1. a lost/deleted ref, fork, packfile or backup of a live-period repository (#3355 handles micheloosterhof specifically);
2. Wayback/CDX or another web archive containing a non-image sibling path from onion7 or a contemporary mirror;
3. a participant/private archive containing the pre-render document, build directory, TeX/PS/SVG/layout project or font subset;
4. an independently archived HTTP directory listing revealing an alternate file name;
5. a source object whose render reproduces a complete LP2 page and the **6×9-inch / 400-dpi / Q92 / Artifex-profile** production envelope.

A claimed source must expose internal object/source text independently of OCR and reproduce at least one original page's runes plus layout/art. A PDF made by wrapping the JPEGs, a later transcription, or a fan font is not a positive.

## Decision

**Bounded negative.** No authentic editable page-authoring/compositor source is reachable in the checked preservation graph. The cryptanalytic consequence is that source-side rune strings, font cmap, text-object order and hidden layer metadata remain unavailable; current work must continue from the flattened originals unless a new archive class opens.
