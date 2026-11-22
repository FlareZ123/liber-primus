# All 58 LP2 Q92 source JPEGs: complete repeated-stencil pair graph and p25 anomaly

**Decision, Agent21, 13 November 2026.** The complete original-byte JPEG survey yields two additional substantial **two-page** matches, physical **p1/p2** and **p24/p26**, beyond the independently calibrated source-stencil F5 groups. Neither has a third independent reference, so the previously established **32/58-page independent-stencil F5 negative** remains the exact justified bound. The visually repeated dragonfly motif on p24/p25/p26 motivates a particularly discriminating check: **p25 differs from a complete 125,626-AC two-peer background template in ways that an ordinary F5 magnitude-decrement overlay cannot produce.** This provides a concrete original-source anomaly classification; **no payload, cryptographic key, novel plaintext, stego instruction, or missing F5 plaintext was recovered**.

## Why this source test was needed

The calibrated [original-Q92 F5 shared-stencil test](lp2-f5-q92-shared-stencil-original-gate.md) uses two *other* source pages to define a reference mask and checks the held-out target against it. It covers five exact repeated-artwork groups, **32 physical LP2 pages**. Twenty-six pages remained without identified three-way copies. The separate blind [neural tier-1 F5 gate](lp2-f5-q92-neural-probe.md) failed on every authentic 256–4096-byte positive and withheld original scoring. Before claiming more coverage, the original *entire archive* was searched for strong source-byte reference duplication.

A fixed exact DCT source-graph reproducer reads the **original 58 JPEGs** (physical p0–57; scans 17.jpg–74.jpg), using libjpeg's stored **quantized luminance coefficients** without pixel re-encoding. For every original pair (i,j), it tests the same non-text outer region \`x<512 or x>=1888 or y<512 or y>=3200\` in a 2400×3600 image. An eligible block must be identical in all **64** quantized DCT coefficients in the two source files and have at least one nonzero AC. The graph prints pairs with **at least 200 identical nonzero AC coefficients**; signed 16-bit FNV64 block fingerprints implement the comparison. A source-aware repeated-artwork follow-up additionally uses two independent originals, p24 and p26, as references for the middle p25.

## Complete pair graph (all 58 originals, no selected targets omitted)

The all-pair C program evaluated all **1,653 unordered original-page pairs**. **158** matched the precommitted >=200 nonzero identical-AC threshold; **153** exceeded >=10,000. All strong matches fall into known repeated-art groups except two isolated two-page pairs and the p3 edge to its p4–7 neighbor group.

| Physically distinct original-source match | Exact same-position outer luma AC | Identical complete 8×8 DCT blocks | Interpretation |
| --- | ---: | ---: | --- |
| **p1↔p2** | **124,441** | **3,877** | Two-page repeat, no third independent cover |
| **p24↔p26** | **125,626** | **10,805** | Two-page repeat of a dragonfly-side motif, with p25 visually similar |
| p3↔each of p4–7 | 12,483 each | 1,674 | Shared subset of the existing p4–7 group; p3 differs on many other reference blocks |
| p4–7 | 117,550 per pair | 6,990 | Already calibrated source template |
| p9/11/13 | 69,156 per pair | 5,013 | Already calibrated source template |
| p10/12/14 | 70,782 per pair | 5,149 | Already calibrated source template |
| p34–39 | 24,837 per pair | 692 | Already calibrated source template |
| p40–55 (all 16, including grayscale) | 270,846 per pair | 7,741 | Already calibrated source template |

Other small pairwise coincidences occur (e.g. p8/p10/12/14 only 641 nonzero AC per pair, p24/p25 and p25/p26 only 828), far below the five calibrated source stencils. The 2-peer overlaps prove *identity between two existing image regions*, with no independently authenticated clean reference. They **cannot be promoted to a reliable clean-carrier F5 negative merely by selecting source pixels where the two pages match**; this would make the original test circular.

## Source-directed p25 anomaly, independently selected by two other original pages

The 2014 original LP2 physical pp24–26 visibly reuse side-margin wing/dragonfly illustrations. The p24/p26 exact pair supplies an **independent 10,805-block / 125,626-nonzero-AC background reference mask for target p25**. This is an observation of original source pixels/bytes, not a post hoc ciphertext key.

The held-out **original p25** compared with **both matching p24 and p26 source references** yields:

| On 125,626 independently fixed reference AC coefficients | Original p25 count |
| --- | ---: |
| Unchanged | 25,465 |
| F5-compatible sign-preserving magnitude-one decreases | 37,704 |
| Increases (incompatible with F5's only magnitude-decrement operation) | **8,187** |
| Other AC modifications | **54,270** |
| DC differences across 10,805 reference blocks | **7,176** |

The five AC categories exhaust exactly 125,626 reference coefficients. Thus **there is no standalone, original-F5-compatible p25 overlay on an otherwise unchanged p24/p26 reference template**: tens of thousands of source differences are incompatible with F5. This does **not** rule out an F5 payload inserted before a separate image rendering or recompression, or a different steganographic method. The differences are fully consistent with p25 having a separately re-rendered/shifted source image, but the exact generation history is unknown. An exploratory local edge-template comparison of the upper-left wing found best p24→p25 offset ≈ **−1 pixel horizontally and vertically** with normalized edge correlation **0.542**, versus p24→p26 correlation **0.997** without shift. Those image-registration scores are descriptive, **not** an authenticated geometric key or proof of editing intent.

## Scope, stopping decision, and reproduction

The broader source pairing produces **no new three-reference source-exact group** for the remaining 26 pages and therefore **does not extend** the previously calibrated 32-page blind-ish source-stencil negative. The independently fixed p24/p26→p25 experiment rules out a direct clean-cover F5-only mutation explanation for that specific middle-page anomaly. Other image transforms, steganographic encoders, source-stage shared payloads, and the unknown LP2 cipher remain untested by this comparison.

- [All-pair exact-Q92 luma DCT reproducer](../sims/lp2_f5_q92_pair_graph.c), full original physical p0–57, precommitted >=200 nonzero AC report cutoff.
- [Source-selected visual-chapter two-peer and anomalous p25 full-AC variant](../sims/lp2_f5_q92_chapter_peers_sft.c) (p25 references explicitly p24/p26).
- [Manual-only Ubuntu source-CI workflow](../.github/workflows/lp2-f5-q92-chapter-peer-census-manual.yml). The [successful definitive run #43404672847](https://github.com/FlareZ123/liber-primus/actions/runs/43404672847) publishes complete **58-image pair-graph CSV** and **56-original chapter-source test CSV** as the downloadable run artifact. The original source files and exact coefficient interpretation are preserved in the repository.
- [F5 known-cover positive-control original result](lp2-f5-q92-shared-stencil-original-gate.md): all 15 genuine F5 embed/extract controls detected, source-stencil page groups remain unchanged.

**Scientific status:** source-layout classification and a narrow image-differential F5 mechanism exclusion. No original cipher operation, key, or plaintext recovered.
