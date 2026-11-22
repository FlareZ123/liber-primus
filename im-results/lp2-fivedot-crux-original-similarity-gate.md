# Original LP2 five-dot stencil versus five principal Crux stars: source-fixed similarity gate

**Agent20, 16 November 2026. Supporting original-image/historical hypothesis test. No unknown GP plaintext, original-cipher key, or intended destination recovered.** This test bounds one geometric interpretation of the newly raised Vespucci/constellation lead, rather than excluding astronomy altogether.

## Why this one candidate was selected

The original five-dot stencil occurs on physical LP2 p7, p23, and p56 (original `24.jpg`, `40.jpg`, `73.jpg`); these are authentic repeated drawings, with reflections between pages. Agent30 measured original p56 dot centroids in [its 16 November source-first note](../communications/broadcast/20261116T215649_agent30_vespucci-orthogonal-triangle-lead.md). The sorted-leftmost three dots have angles **49.1430°, 92.7516°, and 38.1054°**. A prospective human might interpret the near-right triangle and the 3+2 visual grouping as stars.

The relevant historical *Mundus Novus* passage describes southern stars, a three-star right triangle and further groups. [The Morgan Library's historical-edition record](https://www.themorgan.org/printed-books/176346) specifically reports a three-star diagram and a distinct six-star diagram, with **no authored five-star constellation diagram documented in that edition**. [An astronomy history review](https://www.imcos.org/wp-content/uploads/2016/09/Imcos114_Autumn2008_web.pdf) notes competing identifications: Chamaeleon, Apus, Triangulum Australe, and a six-star group involving Crux/Alpha and Beta Centauri. The direct source-object count already demands an independently selected omission or combination to obtain the LP2 five.

The concrete test here instead concerns the **five brightest traditional Crux asterism stars**, alpha, beta, gamma, delta, epsilon, one naturally imaginable five-point constellation. Their J2000 right ascensions/declinations are independently published in [*Guide to Observing Deep-Sky Objects*, Crux table](https://naedine.astrolab.ru/sites/default/files/books/farinacci.pdf), also summarized by the [southern-star reference](https://www.daviddarling.info/encyclopedia/C/Cru.html). The only explicitly known external Cicada/Crux connection is an [unauthenticated 2019 gHOST3301 interview](https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/) claiming the LP2 dots refer to constellations; it is participant opinion rather than a Cicada-signed clue and does **not** select these five stars.

## Frozen, complete geometry test

Original p56 five centroids, in increasing x coordinate, are:

`(873,2517), (921,2708), (1104,2447), (1408,2747), (1604,2686)`.

Compute a small-angle tangent-plane approximation `x = 15 * RA_hours * cos(mean Dec)`, `y = Dec_degrees` from the independent J2000 star coordinates; center and Frobenius-normalize each five-point set. For **all 120 assignments** of alpha–epsilon to the original five dots, minimize residual under **unrestricted rotation, reflection and one uniform scale** (standard centered orthogonal Procrustes). No fitted projective or per-point affine distortion; no star positions are adjusted; no LP2 ciphertext or alleged plaintext enters selection.

The exact original-data result is:

| Quantity | Result |
| --- | --- |
| Best Crux assignment in increasing-page-x order | gamma, delta, beta, epsilon, alpha |
| Reflection allowed/selected | yes |
| Best normalized residual | **0.399401809** |
| Approx. original-image RMS position residual | **122.142 px** |
| Synthetic known-similarity positive | exact, residual below 1e-7 |
| Random comparator | **2,000** uniform five-point clouds in the measured 731×300 source bounding rectangle; seeded deterministic generator |
| Comparator median best residual | **0.353177** |
| Comparators fitting the LP2 dots better than the actual five Crux stars | **67.45%** |

The null benchmark is deliberately descriptive: the five-star identity was entertained after the five-dot visual observation, so this is **not a discovery-corrected hypothesis-test p-value**. Its role is to show that the full five-point Crux geometry is not distinctive under a generous search that already grants *every* matching and mirror.

## Cryptanalytic consequence and fork

Under the simplest period-visible operation of copying/sketching an asterism with translation, scale, rotation and optional reflection, the five brightest Crux stars **do not explain the five-dot stencil**. A visually near-orthogonal three-dot subset cannot rescue that five-point claim by itself, and the original *Mundus Novus* source does not offer a direct five-star receiver. This neither excludes an artistically distorted map, another historical asterism, nor independently authored astronomical instructions.

**Decision:** Do not allocate cipher key searches, inferred bearings, GP phase clocks or novel celestial projection degrees of freedom based solely on this Crux match. Reopen only upon an original-authored constellation identity plus a constrained projection/ordering rule that predicts an unseen dot or unknown GP ciphertext span before tuning. No change to the established-results summary is warranted.

**Replay:** [`sims/lp2_fivedot_crux_similarity_sft.cjs`](../sims/lp2_fivedot_crux_similarity_sft.cjs), standalone Node22 CommonJS, exact original centroids, published J2000 source data, positive geometry control and deterministic null benchmark. Run with `node sims/lp2_fivedot_crux_similarity_sft.cjs` in a Windows 11 or other Node22 environment. The measured values above were independently reproduced in a Python NumPy/SVD check and the Node22 source-specific SFT.
