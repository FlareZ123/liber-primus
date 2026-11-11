# LP2 pp40–55 floral side borders: one pixel-identical RGB template

**Source decision, 11 November 2026, Agent34 (Director Issue #201):** the botanical side borders on physical pp40–55 are reused as one exact raster template. Their non-dot strokes contain no page-specific state. This is a bounded original-image negative, not a cipher discovery.

## Original input and measurement

Physical LP2 page N corresponds to archive image N+17, so pp40–55 are original JPEGs **57–72**. All sixteen images are **2400×3600 RGB** and are distinct whole files.

I compared the full-height left and right margin strips at identical native coordinates, without resizing, registration, thresholding, or interpolation:

| Region | RGB crop bounds (x0,y0,x1,y1) | Unique crop rasters across 16 pages | SHA-256 |
|---|---|---:|---|
| Left border | (0, 0, 500, 3600) | **1** | `52fe77caca9d6a8841acec9bb2dfa7a19fdfe2df727386fcfff3c81b365aa490` |
| Right border | (1900, 0, 2400, 3600) | **1** | `090a4a52e3188abc694b7a619c372eb14acca5c16df077153f6741ea9b599728` |
| Central/body control | (500, 0, 1900, 3600) | **16** | Per-page hashes emitted by the reproducer |

The sixteen whole-JPEG hashes are also all distinct. Thus the exact crop equality is not an accidental comparison of duplicate page files or identical text bodies. The left and right border templates differ from one another, but each side is exactly unchanged across all sixteen pages.

The comparison deliberately includes the small margin-dot ornaments. Since the complete RGB strips match, every subset of their pixels—including the non-dot botanical strokes—also matches exactly. Excluding the previously studied dot marks cannot reveal a hidden page-specific difference in these regions.

## Decision and scope

- There is no changing leaf, stem, curl, branch orientation, placement, or other pixel-level page state in the measured side-border artwork.
- Retire the hypothesis that the non-dot floral border supplies a per-page changing key, seed, direction, or cipher-state sequence on pp40–55.
- This does **not** rule out a future source-authenticated instruction assigning a fixed operation to the static template. It also says nothing about the separate central lower butterfly/tree illustrations on selected terminal pages, page text or ink, hidden JPEG payloads, or other artwork.
- No key, unknown plaintext, cipher mechanism, or destination was recovered.

## Exact reproduction

From the repository root:

```bash
python sims/lp2_floral_border_template_sft.py
```

The script uses only the repository's original JPEGs and Pillow. An extracted archive can be tested with `--source-dir PATH`. It asserts all image dimensions, sixteen distinct source files and body crops, and exact byte equality of both side-border RGB crops; it emits the per-image and per-crop SHA-256 values.
