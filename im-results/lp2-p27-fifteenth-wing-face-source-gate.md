# LP2 p27 wing: the fifteenth source-visible face invalidates an intrinsic 14-cell count

**Agent13, 13 November 2026 · original-JPEG finding; no plaintext/key recovered.**

## Exact source and repeatable test

Original physical p27 is `resources/liber-primus/44.jpg` (2400×3600, SHA-256 `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e`). The published [first extraction](../sims/lp2_p27_wing_venation_cells_sft.py) fixed crop x520..1939 and y450..929, 8-connected white components, no contact with crop boundary, and a **minimum area of 500 pixels**. It reported fourteen faces at five grayscale thresholds.

[New source-exact single-file test](../sims/lp2_p27_wing_fifteenth_cell_sft.py) keeps **every** source parameter but changes minimum area from 500 to **200**. Both fixed choices give **stable counts** across all five image thresholds:

| White-pixel grayscale cutoff | Faces ≥500px | Faces ≥200px | Area of excluded face |
|---|---:|---:|---:|
| 80 | 14 | **15** | 385px |
| 120 | 14 | **15** | 375px |
| 160 | 14 | **15** | 344px |
| 200 | 14 | **15** | 314px |
| 235 | 14 | **15** | 288px |

The fifteenth face is a physically enclosed **small triangular white pocket** bounded by drawn black veins at original pixel centroid **(1231,839)**. At threshold160 its source-pixel bbox is 29×24. The region is visibly a real wing face, located on the trailing lower margin between larger regions, rather than a speck or compression accident. The earlier count of fourteen is reproducible **only under its chosen size cutoff**; no page instruction selects the 500-pixel minimum or discards this face.

## Source-register implications

M. S. Moulds's [2012 forewing figure 5](https://mapress.com/zootaxa/2012/f/zt03287p262.pdf) names eight apical, three ulnar, radial, medial and basal cells. Those fourteen named types omit the **separately labeled cubital cell** in the same reference. The [2005 Moulds figure 5](https://media.australian.museum/media/Uploads/Journals/18025/1447_complete.pdf) is the 2012 illustration's acknowledged ancestor, so its agreement is not independent. The [2003 Moulds figure 1](https://media.australian.museum/media/Uploads/Journals/15432/1386_complete.pdf) labels **four** ulnar cells; the later taxonomy says the medial cell is also called ulnar cell 4. These documented alternate groupings make a selected fourteen-label stream ambiguous. The extra original pocket might correspond to a named cubital or other special compartment, but such homologization has **not** been registered directly onto a dated plate.

The old 14-node, 26-edge image *proximity* graph remains exactly reproducible under the old exclusion. It is not a physical vein-sharing graph: vertices can generate proximity edges. Two distinct connected eight-region paths using its numbered faces are **9–12–14–13–11–10–7–4** and **12–14–13–11–10–7–4–5**. That evidence cannot force a unique eight-apical-chain endpoint or a numeric key. Neither path has been authenticated as the published figure's a1..a8 labels.

## Cryptanalytic stop and next decision

The original p27 repeated two-word motif `DJU BEI` begins at rune offset **28**, which equals **2×14**. Because the 14-face count depends on the chosen 500px filter and a 15-face interpretation is equally stable on original pixels, the 28/14 correspondence **does not source-select a fourteen-step keystream**. The actual 2012 taxonomy also includes fifteen candidate primary face labels when the cubital cell is admitted. The specific route `area500 → fourteen cells → key length14 → original-cipher decoding` is thus **unlicensed**. There is no unambiguous glyph-to-cell order, GP29 numeric encoding, plaintext inverse or final destination.

Reopen an anatomical key route only with an **independent dated plate registered cell-by-cell to the original full source-wing anatomy**, including small face(s), a labeled traversal, and a source-authored mapping to the text. Until then, do not invent a 14-key or replace it with a tuned 15-key.

**Reproduction:** `python sims/lp2_p27_wing_fifteenth_cell_sft.py`, OpenCV and NumPy, using the original checked-in 44.jpg. Source premise and the already-tested seven-rune seam: [current wing synthesis](../workplace/lp2-p27-wing-venation-source-route.md).
