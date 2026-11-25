# LP1 moth caption omission: source-only decision for #2797

**Decision (Agent49, 25 November 2026): no independently selected missing text fragment.** The previously registered LP1 p5→LP2 p53/p55 insect is a complete, standalone illustration separated from two different adjacent text blocks. The exact original LP1 scan admits 33,649 vertical crop windows with identical nonwhite grayscale ink after translation onto white. Ordinary repeated-insect controls have comparable ambiguity. Neither a unique omitted caption nor a target plaintext offset follows. No ciphertext values, key search, or crib generation were used.

## Parent and rival

Choose only original archive 05.jpg (solved LP1 physical p5), whose illustration is already registered at 2.33091× scale to original LP2 p55 (72.jpg), with 313/316 SIFT inliers and grayscale correlation .973947. LP2 p53 (70.jpg) independently contains the nearly identical enlarged emblem. See [existing registration](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md). Do not treat the image as an exact external taxonomic plate. The [2012 campaign-use witness](lp2-moth-pre2014-logo-source-registration.md) also shows the emblem as a standalone image with an HTML title attribute; this is context, not text rasterized inside the insect. The historical source establishes reusable branding as a particularly strong rival to a selective caption deletion.

The exact original LP1 page has the four prose lines under SOME WISDOM above the insect, a separate KNOW THIS rubric and 5×5 table below it (see [solved LP1 transcription](../resources/liber-primus/lp1-plaintext-reference.txt)). Neither block is embedded in the drawing. These complete neighboring objects are not an identified deliberately truncated caption.

## New original-image experiment

Use the original 2400×3600 JPEGs. The source-only art-containing row bands are chosen from the visible layout before inspecting target cipher values. On LP1 05.jpg, in the full 2400-pixel width, threshold grayscale at <255, and use row band [1450,1900). The immediately preceding nonwhite row is 1439, the art band occupies rows 1600–1783 inclusive, and the next nonwhite row is 1992. Both intervening complete-width gaps are exactly white in the decoded grayscale array. Half-open crop coordinates top∈[1440,1600] and bottom∈[1784,1992] retain precisely the same nonwhite ink, differing only in white padding. The count is 161×209=33,649. Under independent artwork placement on white, padding provides no observable clipping coordinate. This is an ambiguity of geometric crop selection, not a count of identical full raster arrays.

A common central 900-pixel strip x=[750,1650), threshold <140, enables a fixed ordinary-art extraction comparison:

| Original archive | Role | Previous / first / last / next ink rows | Equivalent vertical crops |
|---|---|---|---:|
| 05 | sole candidate LP1 parent | 1437 / 1605 / 1773 / 1996 | 37,464 |
| 09 | ordinary repeated insect control | 1749 / 1940 / 2175 / 2398 | 42,593 |
| 13 | ordinary repeated insect control | 974 / 1084 / 1319 / 1494 | 19,250 |
| 16 | ordinary repeated insect control | 1351 / 1460 / 1695 / 1871 | 19,184 |
| 19 | same control reused in LP2 p2 | 2293 / 2647 / 2983 / 3600 | 218,418 |
| 70 | LP2 p53 target | 2364 / 2712 / 3103 / 3600 | 172,956 |
| 72 | LP2 p55 target | 1351 / 2779 / 3170 / 3600 | 614,040 |

Here 3600 denotes the page-bottom boundary (no subsequent ink in the fixed strip). The target counts concern visible layout only, not inferred author crop rectangles. A deliberately planted black strip at rows [1580,1590) in the parent art band moves the first detected ink to 1580 and reduces the exact full-width ambiguity to 29,469. This is an artificial boundary-sensitivity control, not a simulated authentic caption or cryptanalytic positive.

The target pages contain different text arrangements, and the artwork is complete on both. Even the selected crop family removes whole independent prose/table objects above and below, not a single clipped text-bearing fragment. One cannot infer which neighboring words to use, an exact GP transcription, or a target interval solely from this geometry. The independent historical emblem witness explains why the artwork can recur without its neighboring text.

## Scope and fork

Do not turn this result into adjacent LP1 quote/key testing: that is already a different prior hypothesis and does not follow from a cropping boundary. The current hypothesis specifically requires a demonstrably text-bearing cut. The inspected parent does not supply one. Other exact registered art families include an entire mirrored recumbent figure and a multiply reused LP1 insect; the recovered 1977-attributed web mayfly plate is a specimen illustration, its actual printed Dutch caption remains unavailable, and the Evans wing is rejected. These are triage observations from the [existing source crosswalk](lp2-original-art-source-crosswalk-20261122.md) and [updated mayfly registration](lp2-p23-26-original-art-source-gate.md), not new crop experiments on additional parents.

Close #2797 as no source-selected fragment in the inspected candidate, without a crib inverse. Reopen only with a genuinely registered parent whose text-bearing component intersects a uniquely identifiable cut or has independent authored evidence selecting a particular omission. No unknown LP2 plaintext, key, or destination was recovered. No claim is made about hidden JPEG channels, unseen parents, or deliberate removal of a complete independent text block by an otherwise unobserved rule.

**Reproduction:** [source-only SFT](../sims/lp2_moth_caption_crop_gate.py), [captured output](lp2-moth-caption-omission-gate.json). Executed locally using OpenCV and NumPy on the maintainer-provided original ZIP, not CI. The manual art-band choices are explicit in the SFT; no ciphertext supplied to it.
