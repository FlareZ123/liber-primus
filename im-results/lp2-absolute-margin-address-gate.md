# Absolute text-margin address: source-selection decision (#2847)

**Decision, Agent18, 25 November 2026:** the tested original margin layout supplies the ordinary fixed column origin, with explicit typography explaining nonordinary offsets. No source-visible scale, tick marks or coordinate convention selects an interior rune. Retire this source-only address premise; no ciphertext was read or fitted, no new key/plaintext. A different independently selected projection remains possible.

## Source and test

Inspected all 75 original 2400×3600 JPEGs as contact sheets. Physical LP2 p=image number−17. The fixed crop bands and ordinary component dimensions reuse [Agent37's orientation extractor](../sims/lp2_orientation_original_gate.py) without its rune labels or recognition scores. See also [original compositor](lp2-original-linewrap-greedy-layout-gate.md), #2838, #2841 and #2846; no line-wrap, perimeter, traversal or language tests were repeated.

[Reproducer](../sims/lp2_margin_address_gate.py) runs with Python/OpenCV/NumPy on the maintainer's original ZIP. Grayscale <160; central crop x590:1810, y440:3250; retain components 7–110px wide, 80–122px tall, area>200, cluster top coordinates within 12px of first candidate, retain rows with ≥8 candidates. For each candidate row use median top and all dark ink in y[top−12,top+123), not just large components. All coordinates are 0-based original pixels. It emits all 730 candidate row records across the archive (including noncanonical or nonrune candidates); there is no claim of matching all 594 canonical unknown-page rows. Named panels were selected visually before measuring the coordinates, excluding mixed numerical/heading illustration plates from the principal plain panel. LP1 scroll/elephant frames intrude into the x590 crop and their all-ink origin is not a valid text-only control; LP1 corpse and solved LP2 are clean typography controls.

| Archive JPEG panel | Candidate rows | Leftmost ink x600 or 601 | Other x |
|---|---:|---:|---|
| LP1 corpse 14–16 | 20 | 20 | none |
| LP2 cross 17–19 | 33 | 33 | none |
| LP2 spiral 20–24 | 54 | 53 | 723 (24.jpg, y2458) |
| LP2 sparse tree 25–31 | 79 | 77 | 724 twice (25.jpg, y861,1050) |
| LP2 plain 33–38,45–48 | 120 | 120 | none |
| LP2 mayfly 41–43 | 36 | 36 | none |
| LP2 vines 57–66,69–72 | 145 | 145 | none |
| Solved LP2 73–74 | 9 | 8 | 890 (74.jpg, y1537) |

Across the six unknown panels above, 464/467 candidate rows share x600/601. The three exceptions are independently visually explicable: 24.jpg's centered red closing rubric (with red multi-dot mark), and 25.jpg's oversized red Y stem on two succeeding rows. The known p57 control visibly indents a fourth line below its giant red initial to x890. No unknown row in these panels supplies a distinct non-typographic displacement. The three unillustrated ordinary-component apparent offsets >620 — (33.jpg,y2744,x647), (36.jpg,y1050,x648), (37.jpg,y1803,x631) — all start with printed small punctuation omitted by the ordinary-component filter; raw ink returns x601. The 120 plain rows have raw origins x601 (105) or x600 (15). Their rightmost retained ordinary-component edges vary x1718..1795; component widths 9..107px. Median row tops follow ~188px pitch, with p21 (38.jpg) adding a visually ordinary paragraph gap (third row y1086 vs typical y1050). These are printer conventions, not a rune-cell ruler. Page-center x1200 is geometrically well defined but nearest retained glyph-center distance on the plain panel ranges 0..34.5px, and there is no printed rule selecting this axis, glyph, or one row.

A sensitivity control translates the eligible ink strip +32px on five separate rows (without reading rune identity), recovering exact origins (archive,y,original,shifted): (14,1274,601,633), (33,673,601,633), (45,673,601,633), (73,1889,600,632), (74,1725,601,633). This is a coordinate-extraction control, not a planted historical cipher or a claim of sensitivity to arbitrary shifts. The fixed threshold and row selection do not rule out small/short isolated inscriptions, arbitrary tiny pixel encodings, or a separate authorial projection.

## Interpretation

LP1 has explicit decorative frames on scroll and elephant pages; the unknown margins use ornaments, blank white areas, ordinary indents and the same centered 1200px-wide column. Previously established [tree/wing template identity](lp2-botanical-marginalia-template-gate.md) and [vine raster/DCT identity](lp2-floral16-identical-margins-source-gate.md) independently rule out page-varying border registration for their exact repeated copies. A constant drawing could still select an operation if an instruction supplies the relevant axis, row and mapping. There is no such independent cue in this comparison. The finite crop/panel census cannot establish absence of all typography steganography, and the one-pixel variation has not been interpreted as a key. Stop before selecting arbitrary pixel bins or an interior glyph, as required by #2847. Reopen only with an independently sourced discrete ruler/projection and a withheld address prediction.

Actual execution: local original ZIP, OpenCV, no CI. The exact coordinate output can be regenerated by the included SFT; no source images altered (only in-memory shift controls).
