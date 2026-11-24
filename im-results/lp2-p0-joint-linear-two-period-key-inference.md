# Joint modular key inference for independently F-holding 5+8 / 8+5 layers

**Result:** reverse order 5 inner + 8 outer, arbitrary keys/phases, has no full exact inverse containing any tested 12–14-rune dictionary word at any offset of the 716-rune opening body. This is a new exact constructive method: it does not enumerate 29^8 outer keys, and both keys are unknown. Original-order independent reproduction finds the same single 12-rune false-positive key pair as the previous outer enumeration ([report](lp2-p0-red8-red5-sliding-anchor-original-gate.md)).

## Inference

At an anchor normalize both periodic phases to zero by rotating keys; all arbitrary phases are retained. Write X[a]=inner shift, Y[b]=-outer shift. Enumerate only legal hold/consume paths through candidate plaintext word P and observed C:

* P=0 requires C=0, both hold.
* P nonzero and inner output q=0 requires C=0, X[a]=-P, inner advances, outer holds.
* Both consuming: X[a]-Y[b]=C-P mod29; forbid X[a]=-P to ensure q nonzero. Both advance, including when C=0.

A modular weighted union-find represents all difference equations; a fixed zero node represents held-output equations. Each connected component has one free GF29 gauge unless fixed. For a 12-symbol uninterrupted consuming anchor, the 5×8 bipartite phase graph is connected: 13 vertices, 12 edges. Its unknown key pair is determined up to one gauge. Repeated edges add exact consistency tests. F holds may split or constrain components. Transfer unary nonzero requirements to root domains and enumerate every remaining assignment, with no incomplete assignments skipped in the reported runs. Bidirectional exact phase DP joins both sides of the actual anchor; every survivor is checked by independent full forward forced-anchor DP.

| Inner + outer | Anchor length | Dictionary forms | Anchor-compatible assignments (all tested) | Full inverse witnesses |
|---|---:|---:|---:|---:|
| 5+8 | 12 | 1,239 | 28,499,264 | 0 |
| 5+8 | 13 | 630 | 493,500 | 0 |
| 5+8 | 14 | 271 | 7,018 | 0 |
| 8+5 | 12 | 1,239 | 28,695,421 | 1 |
| 8+5 | 13 | 630 | 514,017 | 0 |
| 8+5 | 14 | 271 | 7,334 | 0 |

Zero skips and duplicate assignments in all six runs. The sole 8+5 witness has offset587, inner 5e04223m, outer 0opa0 (both anchored phase0); this outer is a rotation of 00opa from the independent search. Its anchor a9gi4fi5ga96 is already rejected by free-word segmentation at rune8. No plaintext recovered.

Six controls: authentic 95-rune p57 encrypted with three key pairs per order, neither key supplied to solver; arbitrary-offset 14-rune search admits actual rotated key pair at offset53 in all six. The number of mathematically legal key pairs on these 95-rune plants is 512,170,95 (5+8) and 660,689,318 (8+5). Therefore this validates key admission, not unique key recovery on short controls. The true word is in the finite lexicon.

Limits: this requires at least one tested 12–14-rune word anywhere in the 716-rune body, exact one-rune-per-rune two independent historical F-hold layers with continuous phases. Shorter-only text, OOV forms, other periods, other mechanisms remain open. Direct exhaustive assignments grow rapidly at shorter lengths (reverse-order length11 1,452,081,978; length10 64,273,104,559). A symbolic component-domain or joint block-support method is preferable to naive enumeration.

## Reproduction

`node sims/lp2_p0_joint_key_anchor_linear_sft.cjs` (Node and GCC/Clang C++17 on PATH, CXX override). The compiled solver and positive controls were actually run locally on the source-checked tape and same repository lexicon; the CJS wrapper is supplied for reproduction. No CI execution claimed.
