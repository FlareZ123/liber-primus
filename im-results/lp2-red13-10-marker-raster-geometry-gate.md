# LP2 large red marker raster geometry: one shared stencil, not a second key alphabet

**Agent23, 23 November 2026. Supporting original-image negative.** This is a source-visible check of a specific hidden-channel proposal, with a reproducible implementation. It recovers **no original unknown plaintext, cipher key, or intended decoder**. The author-controlled *positions* and *types* of marks remain open as potential instructions.

## Why examine this carrier

The manuscript's large punctuation marks form conspicuous 13-dot and 10-dot clusters. The existing [red-run/wordmark sidecar capacity theorem](lp2-redrun-wordmark-antirepeat-capacity.md) gives very generous freedom to move these clusters, and still leaves the specified fixed-length universal GP29 anti-repeat encoding short of information. A different possible carrier would encode further bits in the **individual dot offsets, spacing, or shape** of each visible mark. A human recipient of the actual 2014 JPEGs can inspect these features without obtaining a separate password. The decisive low-cost test is whether there is more than one printed layout of a given dot-count class, after accounting for one-pixel rasterization.

## Exact source and frozen measurement

Read the repository's original **58 LP2 2400×3600 JPEGs**, archive scans `17.jpg` through `74.jpg`, using physical page p = scan number −17. For every original image:

1. Locate chromatic red pixels by the same deterministic R/G/B dominance test in the standalone script. Connected components must be 8–11 pixels wide and tall, with 75–110 red-core pixels, to qualify as a small printed dot.
2. Group dot centres at Euclidean distance ≤26 pixels, preserving connected transitive groups. Record groups containing exactly 10 or 13 dots. For each group, order its dots vertically (and left-right when tied), subtract its top-left component origin, and retain the dot centres.
3. Within each dot-count class, take the coordinatewise median of every relative centre over the complete 58-image original sample. Measure the largest absolute horizontal/vertical deviation for every dot. No candidate key, origin phase, page subset, or template was selected through English scoring.

The implementation is [read-only Python SFT](../sims/lp2_red_marker_raster_geometry_sft.py). It has explicit expected counts and asserts a geometrically altered four-pixel offset would lie outside the measured one-pixel envelope.

| Original-dot class | All LP2 marker groups | Unknown p0–55 groups | Solved p56–57 groups | Maximum dot-centre deviation from source median |
|---|---:|---:|---:|---:|
| 13 small red dots | **30** | **27** | **3** | **1.0 pixel** |
| 10 small red dots | **4** | **3** | **1** | **1.0 pixel** |
| **Combined** | **34** | **30** | **4** | **1.0 pixel** |

All 34 isolated chromatic large-mark patterns are accounted for. The **30 unknown-page red marks** agree with the existing original source annotation, which also counts **one separate black mark**; that black mark is *not* measured by this red-only test. The source's three 10-dot unknown marks and 27 red 13-dot unknown marks therefore reproduce the independently annotated printed-type inventory.

A 13-dot mark is the same vertically staggered stencil each time: 5 central dots interleaved with 4 left and 4 right dots. Its relative median centre positions (pixels) are:

```text
(19.5,5), (4.5,17), (34.5,17), (19.5,24.5),
(4.5,34.5), (34.5,34.5), (19.5,43),
(4.5,51.5), (34.5,51.5), (19.5,62.5),
(4.5,68.5), (34.5,68.5), (19.5,81)
```

The maximum discrepancy across all source glyphs and all 13 locations is **one pixel per coordinate**; most are half a pixel, entirely compatible with integer JPEG pixel quantization of a shared printed vector. The 10-dot groups obey the same one-pixel bound within their own class.

## Cryptanalytic decision

There is **no visibly distinct alternative 13-dot or 10-dot geometric layout** in the original isolated red marks at this resolution. Therefore a decoder expecting a page-dependent dot to move at least two pixels beyond its class's common raster template cannot obtain any sidecar symbols from this carrier. Fixed cluster locations and 10/13-dot identity remain observable, but those are precisely the existing channels in the independent capacity model.

This measurement does **not** exclude subpixel glyph manipulation, JPEG DCT or color/antialias side channels, the separate black mark, other artwork, a deliberately encoded cluster placement, or unpublished external data. No language hypothesis or key was tested. A productive successor would need a first-party instruction selecting some finer measurable pixel property or an original untouched image that genuinely differs from this shared print stencil. Re-running arbitrary bit classifiers on ±1-pixel rounding is unsupported by these observations.

**Scope and provenance:** The source files are the historical unchanged May 2014 LP2 JPEGs already verified in [the source-carrier report](lp2-2014-original-distribution-carrier-gate.md). The shared-layout finding is a new local raster observation, not evidence of authorship for any key. It belongs in supporting `im-results`, not in the authoritative record of plaintext recovery.
