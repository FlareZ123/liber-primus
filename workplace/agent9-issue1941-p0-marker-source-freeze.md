# Issue #1941 — p0 13-dot marker: source-first traversal freeze

**Run:** Agent9, `agent9-gpt6-20261120T033752Z-draw9-issue1941-p0-marker-order`  
**Scope:** original LP2 JPEG pixels only; no cipher output test.

## Source mapping and inspected objects

The source archive maps LP2 physical page (p) to `resources/liber-primus/(p+17).jpg`; this is documented in `resources/liber-primus/README.md`. The inspected pages were:

| Physical page | Original image | 13-dot marks | Marker centre(s), pixel coordinates |
|---:|---:|---:|---|
| 0 | `17.jpg` | 1 | (1424.3, 730.0) |
| 2 | `19.jpg` | 1 | (1645.3, 2236.3) |
| 6 | `23.jpg` | 2 | (762.2, 1295.0); (1350.7, 1782.3) |
| 54 | `71.jpg` | 1 | (1212.7, 974.0) |
| 56 | `73.jpg` | 2 | (983.5, 730.0); (1577.7, 2134.3) |
| 57 | `74.jpg` | 1 | (1159.5, 974.0) |

The complete source-image census finds 30 13-dot marks on 19 pages:  
`p0:1, p2:1, p3:3, p6:2, p7:2, p14:1, p15:3, p22:1, p23:1, p26:1, p27:1, p32:1, p33:3, p39:3, p53:1, p54:1, p55:1, p56:2, p57:1`.

The terminal p57 mark with 23 dots is a separate object, not a 13-dot instance. It is excluded from the 30-mark census.

## Observed geometry

All 30 13-dot instances share the same orientation and lattice:

- three vertical columns, left-to-right populations **4 | 5 | 4**;
- nine staggered horizontal bands, top-to-bottom populations **1 | 2 | 1 | 2 | 1 | 2 | 1 | 2 | 1**;
- approximately 9–10 px square red dots, roughly 15 px column pitch and 17.5–19.5 px vertical pitch in the 2400×3600 scans;
- no arrow, connector, numbered endpoint, dot-shape distinction, or color distinction that identifies a first or last dot.

For p0 specifically, the column centres are x≈1409.5, 1424.0, 1439.5, with counts 4, 5, 4. The nine y-bands are approximately 692.0, 704.0, 711.5, 721.5, 730.0, 738.5, 749.5, 755.5, 768.0, with counts 1, 2, 1, 2, 1, 2, 1, 2, 1. The p2, both p6 marks, p54, both p56 marks, and the p57 13-dot mark reproduce the same geometry.

The p0 marker is inline at the red-heading/body transition. Across the other instances, markers occur at line or paragraph boundaries, including after red spans. Their placement can suggest that the glyph is encountered in ordinary left-to-right text flow, but does not supply an internal dot-order or an endpoint.

## Frozen traversal family

Before consulting the named marker-state/residual reports, the only candidate traversals admitted are:

1. **R — physical raster / row-major:** sort all dots by increasing pixel y, then increasing x. This follows the scan's top-to-bottom, left-to-right order and the visible nine-band pattern.
2. **C — column-major:** group the three visible columns left-to-right, then read each column top-to-bottom. This follows the visible 4|5|4 vertical grouping.
3. **No serpentine candidate:** no connecting path, arrow, or alternating-direction cue is visible. A snake path would add an unsupported convention.

No other permutations, starts, reversals, or within-column reorderings will be searched.

## Source-only decision

The source clearly makes the three columns visible, so C is a reasonable hypothesis. It also presents a regular, staggered nine-band raster pattern, so R is independently reasonable. The object is left-right and top-bottom symmetric; every dot is visually interchangeable. The inline text boundary may orient attention toward the mark from the left, but it does not distinguish R from C or determine a first dot within the mark.

**No source-visible feature uniquely selects column-major traversal.** The same repeated geometry on all 30 instances establishes a stable glyph design, not an internal serialization. A traversal only becomes consequential if an external 13-value sequence is assigned to the dots; the image itself does not provide that sequence. Since neither R nor C is source-excluded, no traversal is selected and no untouched-page prediction is authorized. Do not use the p0 residual/state match to break the tie or expand the 13-atom schedule.

This is a negative result about source selection, not a decryption result.

## Blinding limitation

This invocation had already fetched the opening portion of `results/README.md` before selecting #1941, and the issue description itself summarized part of the candidate relation. I did **not** open `im-results/lp2-p0-marker-state-column-sums.md`, the existing marker-order/topology report, the p0 residual, or the underlying H-state packet before freezing the two traversal definitions above, and none of those outputs was used to choose them. Nevertheless, this is not a fully blind preregistration in the strictest sense. Treat the pixel geometry as reproducible source evidence, but obtain an independent source-only review before treating the negative fork as formally completed.
