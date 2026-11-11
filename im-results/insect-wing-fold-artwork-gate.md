# Insect-wing symmetry does not select a literal FOLD

**Decision:** close the literal insect-wing FOLD hypothesis as underdetermined. The original art contains an ordinary bilateral insect-body axis, but it does not select a common axis across p27/p53/p55, a unique rune/word pairing, an endpoint, or a stop rule. No LP2 plaintext, key, or cipher mechanism is recovered.

## Original inputs and fixed method

Use the original LP2 scans in `resources/liber-primus/`: physical p27=`44.jpg`, p53=`70.jpg`, p55=`72.jpg`, and solved control p57=`74.jpg`. Each scan is 2400×3600. Reproduce with `python sims/insect_wing_fold_artwork_gate.py --image-dir resources/liber-primus`.

- Register the p53 insect crop `[600,2700,1800,3300)` against p55 search crop `[500,2600,1900,3500)` using grayscale normalized cross-correlation.
- Compare the p27 isolated-wing crop `[643,516,1787,856)` and the p53/p57 body crops at native scale. Reflection tests use the stated fixed thresholds; no orientation or phrase search is performed.
- The p55 last printed text line is measured in the fixed rectangle `x=550..1849, y=1238..1351`.

## Observations

| Test | Original-image result |
|---|---|
| p53→p55 insect registration | Best match is a translation of **(+66,+67) px**, normalized cross-correlation **0.9999045**; black-foreground IoU at threshold 100 is **0.99315**, Dice **0.99656**, grayscale MAE **0.4236/255**. The two pages reuse essentially the same insect artwork at a shifted placement. |
| p53/p55 side ornaments | The left and right border-vine crops at the same page coordinates are **pixel-identical**. The surrounding frame is a reused template, not an independent per-page fold state. |
| p27 isolated wing | Bounding box `x=643..1786, y=516..855`; principal axis **2.76° from horizontal**. Reflection mismatch is about **31%** around either its horizontal or vertical centerline at threshold 100. It is a single asymmetric wing image, not a bilateral pair with a selected fold axis. |
| p53 insect body | Best vertical reflection axis is **x=1203**; body-crop principal axis is **96.47° from horizontal**. |
| p55 insect body | The reused image is shifted, placing its body axis at **x=1269** (66 px right of p53's). |
| solved p57 insect control | The stippled insect's body-crop principal axis is **88.30° from horizontal**: the vertical body axis is ordinary insect morphology, not a unique p53/p55 cipher selector. |
| p55 final text line | Its ink extent is **x=600..1073**, entirely left of the p55 insect axis at x=1269. A full-page vertical fold therefore leaves this printed line without a right-side partner; choosing to stop before it would require an extra rule not supplied by the art. |

## Interpretation

The full insect on p53/p55 has a visually obvious vertical body axis, but that axis is generic bilateral anatomy. The p53/p55 insect is the same artwork shifted by 66×67 pixels, while the border vines are exact duplicates. The p27 image is a separate, single wing whose long axis is horizontal and whose pixels do not provide a bilateral partner. The solved p57 stippled insect independently shows the same generic vertical-body geometry.

The p57 parable's language about shedding circumferences and emerging supports the insect/cicada theme, not a geometric instruction to fold text. Nothing in these images fixes whether to fold the page, the line, the word, or the rune stream; nor does it specify facing, pairing, start, endpoint, or stop. In particular, the p55 last line is wholly on one side of the apparent axis.

**Conclusion:** retire the literal wing/body-axis FOLD operator. This does not invalidate the separate p55 17-rune text-segment/ornament fold hypothesis; that remains a conditional navigation interpretation and must not be described as selected by insect-wing symmetry. The exact p27/p55 repeated ciphertext bookend remains a corpus fact, but the artwork supplies no new decoder.