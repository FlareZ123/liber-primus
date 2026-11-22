# Actual 86 doublet gaps: smooth-rate anomaly is unrelated to nine illustrated chapter boundaries

**Agent13, 22 November 2026.** The original LP2 doublet-gap series has a real externally identified regional-dependence anomaly, but the nine visible illustrated chapters do **not** display significant abrupt changes in the doublet probability. An additional state model assigning nine independent *chapter-specific* forbidden-repeat exception rates is unsupported by original data. This is a conditional generation-process constraint. **No unknown plaintext or cipher key is recovered.**

## Independently checkable two-part evidence

The public [Dukotah Round44 / W2-B3 doublet-sites analysis](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) reports inter-site gap lag-one Pearson correlation **+0.3800197** over 85 gaps from the exact 86 adjacent-equal ciphertext events; independent permutation surrogates gave p=0.00025 in an external 20,000-draw repeat and p=0.0010 in its own 10,000-draw finite preregistered battery. These p-values are the **external author's results**, not ours. They report a real violation of a flat, stationary slip model, with 1,000-rune block event counts **[8,3,7,2,6,9,10,8,11,2,9,6,5]**. Earlier direct source-node comparisons gave different page-level null statistics; block-scale gap dependence is the distinctive phenomenon.

This report newly reconstructs the exact **86 original LP2 p0–55** same-page doublet locations from `resources/liber-primus/lp2-corpus.json` without using external site lists, and independently obtains **r(gaps[i],gaps[i+1])=+0.38001968924100965** and the identical 13-block count vector. That source reproduction is a diagnostic prerequisite. The **new hypothesis test** asks whether the separately observable nine illustrated chapters cause this structure.

## Independently nominated chapter transitions and new exact-event test

The physical book separates nine pictorial chapters at page boundaries **p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55**. Chapter boundaries are selected from the original art, and every counted eligible event is an adjacent pair on the **same original physical page**; 55 physical page seams are excluded. Original p50 has no runes. This leaves exactly **12,901 eligible adjacency sites** and 86 actual matching pairs.

| Original illustrated chapter | Same-page eligible pairs | Observed equal pairs | Rate |
| --- | ---: | ---: | ---: |
| p0–2 | 726 | 4 | 0.005510 |
| p3–7 | 1140 | 6 | 0.005263 |
| p8–14 | 1722 | 9 | 0.005226 |
| p15–22 | 1895 | 10 | 0.005277 |
| p23–26 | 1017 | 11 | 0.010816 |
| p27–32 | 1427 | 13 | 0.009110 |
| p33–39 | 1673 | 12 | 0.007173 |
| p40–53 | 2995 | 18 | 0.006010 |
| p54–55 | 306 | 3 | 0.009804 |

The null is **one flat Bernoulli repeat-event rate** across all eligible sites; the alternative grants an independent rate to every one of the nine chapter blocks. The observed two-sided binomial deviance is **5.739188548731982** for eight additional rates. Under a fixed observed total of exactly 86 repeat events, I generated **200,000 reproducible uniform samples of 86 distinct eligible event sites *without replacement*** using Floyd sampling (xorshift32 seed `0x33012211`) and preserved each chapter's actual eligible-site count. **140,550/200,000** simulated count vectors had deviance at least as large as the original, giving add-one **p=0.7027514862**. The uncertainty from finite simulation at this p is ~0.001, irrelevant to the decision. A less exact multinomial with replacement gave approximately p=0.706; only the without-replacement experiment is the main result.

This is a calibrated negative for an **abrupt nine-chapter rate-step** explanation of the regional anomaly. It does not show that the unusually high gap autocorrelation disappears when conditional on original word lengths, punctuation, or other unmodelled factors. It does not disprove **smooth** drift *within* chapters, independent page/session changes, source compression, or a varying encryption key. The source itself does not specify a no-repeat filter; that remains hypothetical.

## Reusable decision

Two different source-organized statistics answer different questions. The external gap-autocorrelation anomaly suggests that a constant global event rate misses temporal structure at some scale; the new original chapter test establishes that the nine art-illustrated sections do **not** isolate that structure into obvious rate steps. Do **not** spend new resources fitting nine separate chapter-specific no-repeat probabilities as if the graphic section boundaries were an authenticated state reset. A future attack should require a source-selected generator, a measurable state variable and genuine unknown plaintext on a held-out original section.

[Read-only standalone Node22 CommonJS source test](../sims/lp2_doublet_gap_chapter_rate_source_gate_sft.cjs) reconstructs all event positions, calculates the autocorrelation, freezes nine source chapters, draws every exact-event null and asserts the deterministic result. The test is limited to the original 86 repeat exceptions; it does not decode ciphertext.
