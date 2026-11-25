# LP2 32 Paths of Wisdom source gate (#2803)

**Decision:** the proposed Sepher Yetzirah mapping has no independently selected decoder. The original p49–51 table does have 32 rows, but the first-page 10-row division is confounded by ordinary page layout; the exact tree lineage is a photographic source, and Westcott's archived text does not prescribe eight columns. No numeric/key sweep was performed.

## Original physical layout
Original owner-supplied scans 66–68.jpg (physical p49–51), 49.jpg (p32), 72.jpg (p55), 74.jpg (p57) inspected directly. The 32×8 grid is across **three** pages, not on p50 alone. Compare [canonical cells](../resources/liber-primus/lp2-grid-256.json).

| Physical page | Rune lines | Numeric rows | Total central lines | Numeric cells |
|---|---:|---:|---:|---:|
| 49 | 3 preceding | 10 | 13 | 80 |
| 50 | 0 | 13 | 13 | 104 |
| 51 | 4 following | 9 | 13 | 72 |

New directly executed raster measurement: in grayscale central columns [600,1800), select rows containing >10 pixels with gray<100, merge gaps of ≤12 pixels and retain clusters with >15 selected rows. On 2400×3600 original images the resulting line top coordinates are:

- p49: 673,861,1050,1245,1429,1608,1787,1966,2145,2324,2503,2683,2861.
- p50: 629,809,987,1167,1346,1525,1704,1883,2062,2241,2419,2599,2773.
- p51: 629,804,987,1167,1346,1525,1704,1883,2062,2284,2472,2661,2849.

The numeric line pitch is approximately 179 px; rune lines approximately 188–189 px. The printed text and number rows fill comparable vertical space. The 10+22 first-page division follows naturally if a 32-row grid is set into 13-line pages with three preceding and four following rune lines. This is a **specific competing layout explanation**, not proof that the number 32 was unintended. Reproduce with [script](../sims/lp2_p50_paths_layout_gate.py).

## Source selection
[Archived Westcott text](../resources/external/sefer-yetzirah-westcott-archive.json), archive page 2 chapter I.1–4: 32 paths, ten Sephiroth, 22 letters divided into 3 mothers, 7 doubles, 12 simples. Archive pp10–13 append the Waite enumeration, with ordinal paths I–XXXII; I–X named Sephiroth, XI–XXXII individually named intelligences. The actual letter order and the order grouped by letter class are different possible conventions. The explicit class boundaries are 10/3/7/12, cumulative 10/13/20/32; these do not correspond to physical page boundaries 10/23/32. The text does not identify an eight-member ordered field for each path, nor 13 and 9 letter subgroups. The supplement offers assorted planet/day/orifice attributes for seven doubles, not eight uniform attributes on all 32 paths.

The original central p32/p55 tree is an irregular botanical trunk and branch silhouette, with no discrete ten labeled circles, 22 labeled edges, or Hebrew path characters. The bilateral vine frame is visibly repeated on p49–51 and p55, with no row labels. Prior source identification [#1288](https://github.com/FlareZ123/liber-primus/issues/1288) and [DeadTree source report](dead-tree-commons-derivative-gate.md) attribute the central artwork to a reflected Wikimedia Commons photograph and its image-processing lineage, not a Kabbalistic diagram; reuse this stronger source evidence rather than repeating registration. The p57 clear text is the instar, circumference, inner divinity, and emergence parable (see [solved text](../resources/liber-primus/lp1-plaintext-reference.txt)); it contains no explicit path count, Hebrew letter, named book or ordered eight-field readout. Its stippled figure is independently identified as a GIMP insect treatment in [tree outline report](tree-outline-blur-crosspage.md), rather than a ten-node diagram. Generic terms such as divinity or wisdom do not disambiguate these sources.

## What would change the decision
Assigning path I to row 1 through XXXII to row 32 is an executable ordinal labeling, but it is just a relabeling of the physical row index. It fixes no transformation of the eight printed tokens. Even granting eight named attributes (none are source-selected here), arbitrary attribute-to-column matching alone has 8! = 40,320 assignments. Row order, numeric radix and recipient remain independent unknowns. The same row count is explained by a 256-cell data object formatted eight per line. No independently fixed mapping exists to freeze, no untouched ciphertext prediction follows, and no decryption or key has been recovered. Retire this specific attribution until a new first-party selector provides an actual 32-path/8-column operation; do not reopen table arithmetic or unrelated tree searches on the basis of 32 alone. Existing source-based circumference peel and ordinary image-processing relationships are unaffected.
