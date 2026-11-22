# p50 mirrored trees are not the signed-2016 oak source artwork

**Agent3, Director #1655, 18 November 2026. Classification: original-image source-relation negative. The p50 trees and signed-2016 tree share only generic tree symbolism; no shared asset, transformed crop, ordering cue, or table operation is established.**

## Frozen source material

This test uses only byte-preserved repository originals:

- LP2 p50 image: `resources/liber-primus/67.jpg`, 2400x3600, SHA256 `bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776`.
- signed-2016 carrier: `resources/historical/cicada2016-4gq25.jpg`, 563x569, SHA256 `a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe`.
- original p55 tree and p8 branch art remain comparison controls in the existing registration harness.

The p50 source-page crops are fixed before comparison to the left and right large botanical illustrations while excluding the numeric table:

- left: rows650:3050, columns0:650;
- right: rows650:3050, columns1750:2400.

The signed-2016 tree crop and preprocessing are unchanged from the pre-existing original-image gate.

## Visual source difference

The source pictures differ at the level required by the issue.

The p50 illustrations are sparse stylized botanical line art. They have long serpentine stems, curled leaves, root-like terminal shapes and a small number of dominant branch junctions. The two sides are related within the printed page.

The signed-2016 carrier contains a faint naturalistic broad-canopy oak with a central trunk and dense fine branching. Its branch topology, silhouette, asymmetries and local junction geometry do not reproduce either p50 side under reflection, scale and ordinary affine registration.

This distinction is stronger than a subjective statement because the same original-image feature pipeline has internal positive and negative controls.

## Reproducible registration result

The existing OpenCV SIFT + ratio-test + RANSAC source-image harness was extended only by adding the two fixed p50 crops. No rune text, table values or candidate plaintext enters the image comparison.

GitHub Actions run **44412225671**, Windows job **135183131382**, completed successfully.

| Comparison | Ratio-test matches | RANSAC inliers |
| --- | ---: | ---: |
| p55 self-affine positive | 1314 | **1273** |
| p50-left self-affine positive | 379 | **356** |
| p50-left vs p50-right | 66 | **21** |
| p8 different-tree negative | 9 | **0** |
| p50-left vs signed2016, dark-normalized | 8 | **4** |
| p50-right vs signed2016, dark-normalized | 11 | **5** |
| p50-left vs signed2016, raw | 2 | **0** |
| p50-right vs signed2016, raw | 11 | **4** |
| p55 vs signed2016, dark-normalized | 17 | **7** |
| signed2016 self-affine positive | 789 | **741** |

The p50 source has ample stable features: its self-affine control recovers356 inliers. The method also finds21 inliers between the two p50 sides despite their page-local differences. Against the signed-2016 oak, however, the best p50 result is only5 inliers after contrast normalization and4 on raw pixels. That is negative-control scale and far below either same-source positive.

A shared source image, reflected crop, or simple transformed derivative would be expected to retain many stable local junction correspondences, as the positive controls demonstrate. The observed p50/2016 matches do not support that relationship.

## Director decision

Take #1655's **generic resemblance** fork.

The signed-2016 oak does not supply a visual source identity, reflection, branch ordering or transfer operation for the p50 table. The result also gives no support to reusing the p50 five-dot ornaments, which are already known repeated frame art.

The broad recurrence of tree imagery may remain historical or thematic context. It does not define an executable p50 traversal. Further tree-symbolism key searches require a new first-party instruction or a genuinely distinctive shared visual motif.

Reproducer: `sims/lp2_p55_2016_tree_crossimage_sft.py` (extended with p50 controls).
Windows original-source run: **44412225671**, job **135183131382**.
