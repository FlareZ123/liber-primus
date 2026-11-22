# Original 2014 Liber Primus compositor/editable-source acquisition boundary

**Classification:** bounded negative source-acquisition result for [Director Issue #236](https://github.com/FlareZ123/liber-primus/issues/236). **No author-origin editable Liber Primus manuscript, source-derived cipher operation, unknown plaintext or destination has been recovered.** The examined collections are named, inspectable public archives; the negative is not a statement about private files or the historical creator's filesystem.

## The dated original-release witness

The clearest contemporary participant snapshot is [micheloosterhof/cicada-2014, commit `6c3421a4d245596e403c88e037509d162a2afd17`](https://github.com/micheloosterhof/cicada-2014/tree/6c3421a4d245596e403c88e037509d162a2afd17/stage11), timestamped **2014-05-11 18:33:43 UTC** in Git history. The complete, nontruncated recursive Git tree at **that historical commit**, rather than only today's repository branch, contains **156 blob files**, including exactly **60 under `stage11/`**:

- The 58 native release images `ky2khlqdf7qdznac.onion/0.jpg` through `57.jpg`;
- `ky2khlqdf7qdznac.onion/index.html`, a plain page referring to the 58 JPEGs and carrying `<title>133</title>` and `<div id="331">`;
- `message.txt.asc`, the preserved signed-message artifact.

The historical tree includes **no PDF, PostScript/EPS, SVG, XCF, PSD, Scribus/SLA, OpenDocument drawing, InDesign, TeX, or comparable editable/build file** anywhere in the 156-file snapshot. In particular the stage11 directory contains no runic compositor, font/graphics source, script generating all pages or layered source apart from the published raster images. The commit proves what the participant preserved, not which unpublished files Cicada may have possessed. [2014 snapshot tree API](https://api.github.com/repos/micheloosterhof/cicada-2014/git/trees/6c3421a4d245596e403c88e037509d162a2afd17?recursive=1).

## Additional named archive inventories

To avoid mistaking a later mirror or compiled PDF for the original editor project, the following complete, nontruncated default-branch recursive Git trees were checked as **separate source inventories**, with immutable commit heads recorded as of 11 November 2026:

| Archive and pinned snapshot | Blobs | Relevant contents | Creator-origin editable LP2 file? |
| --- | ---: | --- | --- |
| [micheloosterhof/cicada-2014](https://github.com/micheloosterhof/cicada-2014/tree/d2bb5ac1d957ff5de70c24303d0f5e3cfb3152aa) | 169 | Stage11 capture plus subsequent solver scripts and derived decimal files | None in inspected tree |
| [kenorb/cicada-2014](https://github.com/kenorb/cicada-2014/tree/0f1ebe4a7ce6e473d6f56ea1024dec76d3639362) | 174 | Derived/mirrored stage11 images, reader scripts and output | None in inspected tree |
| [ericvgriego/cicada-2014](https://github.com/ericvgriego/cicada-2014/tree/b1d7412afae69e4109223dd8561ae57b73ac4798) | 169 | Same Stage11 JPEG/index-style participant capture | None in inspected tree |
| [cicada-solvers/documenting-cicada3301-scream314](https://github.com/cicada-solvers/documenting-cicada3301-scream314/tree/53e4282d89229b98212ef4f2349310fab6c43532) | 410 | 75 published LP image scans, OutGuess extracts and walkthrough assets | None in inspected tree |
| [235711101131pp/cicada2014](https://github.com/235711101131pp/cicada2014/tree/a4bd92d3181a519f731dbd8114f1d7d6ac19eed5) | 8 | Includes `assets/0000/self.pdf`, a named literary-source PDF, not a Liber Primus compositor | No relevant LP2 build source |

The broad extension census was `.ps .eps .psd .ai .svg .xcf .odg .sla .tex .pdf .indd .idml .odt .docx .ppt .pptx .blend .kra .ora`. Absence in a tree means only absence from that inspected snapshot. The author provenance of any *newly proposed* object would require a genuine creator association and independent artifact match. Later assembled 75-page PDFs, including [pnotisdev/cicada3301's stated image-print PDF](https://github.com/pnotisdev/cicada3301/blob/main/docs/SOURCES.md), are derivatives unless such an association is supplied.

## What the pixels constrain

The independent [original JPEG container/ICC audit](lp2-jpeg-container-metadata-audit.md) shows all 58 LP2 pages are native **2400 × 3600 at 400 PPI**, corresponding to **6 × 9 inches**. They carry a common 2,576-byte Artifex sRGB profile, SHA-256 `942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0`, consistent with a Ghostscript-compatible document/image export pipeline. This narrows artifact screening if a candidate `.pdf`, `.ps`, drawing or typesetting build later appears. The profile names the color-profile manufacturer; it does not identify the historical manuscript editor, encryption software, or an extant master source.

## Decision

**Close this finite public-archive acquisition lane.** Within the dated May 2014 snapshot and four additional named archive inventories, there is no creator-authenticated editable layer to mine for keys, lost glyph choices, transform settings or plaintext. Searching arbitrary present-day PDFs and JPEG clones would repeat the same evidence. Reopen only on a *specific* newly found 2014-era source/build object with attributed origin, independent timeline and raster/layout correspondence to the original **6 × 9-inch** images; any purported cipher instruction must then be frozen before testing unknown LP2 ciphertext. No broader claim of historical nonexistence is justified.
