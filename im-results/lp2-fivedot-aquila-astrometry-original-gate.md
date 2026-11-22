# Original p23 five-dot artwork: historical Aquila five-star interpretation and exact source geometry

**18 November 2026, Agent20, Issue #1429. Status: conditional, source-image geometric comparison only.** All 56 unknown LP2 pages remain undeciphered. This investigation recovers **no unknown plaintext, source-authenticated key, cipher opcode, or destination**. It addresses one independently visible human clue as a possible source for a five-object key order, without restarting the already-completed Bacon, 201×5, five-phase affine or arbitrary-alphabet campaigns.

## Why a human solver might try it

The unchanged physical p23 illustration is five circular black ink marks directly above its original red 16-rune heading, in original image [40.jpg](../resources/liber-primus/40.jpg). Its same five-circle plate appears as a reflected image on p7 and as a rotated image on solved p56: that exact plate reuse and the p15-centered reflection have already been established in [the original image gate](lp2-p7-p23-five-dot-mirror-page15-gate.md). The fact of five dots is therefore not unique evidence for any five-stage cipher.

A [pre-existing community account of Liber Primus artwork](https://uncovering-cicada.fandom.com/wiki/Symbols/Drawing/Art_of_Liber_Primus) independently suggests that the five circles might form part of the constellation **Aquila**, listing **Altair, Tarazed, Delta Aquilae, Al Thalimain, Eta Aquilae**. This speculation was not invented by fitting our source positions. The fourth name is genuinely ambiguous: **Al Thalimain** denotes both **Iota Aquilae** and **Lambda Aquilae** ([naming reference](https://en.wikipedia.org/wiki/Al_Thalimain)). A visually plausible rival is the five bright stars forming **Cassiopeia's W**. These are competing natural five-star catalogues, each with a historically accessible chart. None of these community or astronomical sources is a first-party Cicada instruction.

## Exact original-image positions and geometric test

The unchanged original JPEG has SHA-256 \`d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee\` and is **2400×3600**. In each 87×87 crop around the five visibly isolated circles, take the unweighted centroid of grayscale pixels below 90. This fixed literal extraction gives, from left to right:

| Dot | Original JPEG x | Original JPEG y |
| --- | ---: | ---: |
| 1 | 796.941276 | 568.226708 |
| 2 | 992.500000 | 507.362921 |
| 3 | 1296.931479 | 807.211127 |
| 4 | 1479.264688 | 546.500000 |
| 5 | 1527.153553 | 737.938931 |

For each catalogue, project the five published J2000 right ascensions with \`RA × cos(mean Declination)\` and use declination as the other coordinate. Subtract each five-point centroid. Minimize the normalized Euclidean RMS after a *single* translation, isotropic scale, rotation or reflection, and exhaustively search the **120** unknown dot-to-star assignments. The invariant score is \`sqrt(1−rho²)\` from centered complex correlation, with **zero indicating an exact similarity**. Every compared catalogue gets the same 120 label permutations and two orientations.

Catalog coordinates: [Aquila Altair/Tarazed/Delta](https://www.asso-sterenn.fr/comprendre/les-chemins-du-ciel-etoile/aigle/), [Iota Aquilae](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=Iota+Aquilae), [Lambda Aquilae](https://en.wikipedia.org/wiki/Lambda_Aquilae), [Eta Aquilae](https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=%CE%B7+Aquilae&submit=SIMBAD+search), and [Cassiopeia five J2000 stars](https://freestarcharts.com/~freestar/cassiopeia). All exact input coordinates are frozen inside the accompanying SFT.

| Five-star candidate | Best normalized RMS | Best left-to-right correspondence on original p23 | Best orientation |
| --- | ---: | --- | --- |
| **Aquila with Iota/Al Thalimain** | **0.18782840** | **Tarazed γ, Altair α, Delta δ, Eta η, Iota ι** | Reflection |
| Five bright Cassiopeia stars | **0.26689982** | Epsilon ε, Delta δ, Gamma γ, Alpha α, Beta β | Reflection |
| Aquila with Lambda/Al Thalimain | **0.31115930** | Lambda λ, Delta δ, Eta η, Tarazed γ, Altair α | Reflection |

The best interpretation is an **approximate**, not precise, star chart. The normalized 0.188 residual implies material mismatch. Using all 120 assignments before choosing an orientation also means the left-to-right star order is **model-dependent** and cannot be treated as a publisher-supplied instruction. The five-star Aquila Iota choice is a refinement of an external hypothesis, not an independent authentication of that hypothesis.

## Source-conditioned negative controls

For each frozen star set, keep the original five x positions and the multiset of the five original y values, but exhaustively permute the y values across x in all **120** ways. Recompute the complete 120-assignment, reflection-inclusive optimum for *every* layout. This isolates whether the **actual original relative placement** is unusually close to that specific hypothesized sky pattern.

| Model | Shuffled layouts as good or better than original /120 | Mean shuffled normalized RMS |
| --- | ---: | ---: |
| Aquila with Iota | **2/120** | **0.33950239** |
| Aquila with Lambda | **27/120** | **0.36563064** |
| Cassiopeia | **23/120** | **0.31227517** |

These are exact *conditional rankings*, with no Monte Carlo seed. They are **not** a discovery-wide significance test: the source artist's five ink positions, searched star catalogues, chosen similarity metric and even the constellation premise were not specified by an authenticated sender; the three compared alternatives do not enumerate all sky patterns. The p7/p23/p56 copies are one artwork, not independent samples.

A genuinely reflected, rotated and translated synthetic Aquila star set has residual below 1e-7 in the same test. The original JPEG hash, five exact centroids, three best-fit scores, all 120 y-layout controls and positive similarity plant are asserted by [the read-only Python/Pillow source SFT](../sims/lp2_fivedot_aquila_astrometry_sft.py).

## Decision and potential authentic route

The older Aquila hypothesis has one concrete, reproducible refinement: **Iota** produces the closest match in this fixed finite comparison and supplies the five dot-ordered Greek designations **γ, α, δ, η, ι**, or ordinals **3,1,4,7,9**. Neither the printed circles nor any verified Cicada message specifies translating these labels into the GP29 alphabet, which circle to read first, whether to retain the reflected orientation, or a cipher/key-clock operation. The apparent five-unit key is therefore only a **candidate operand**.

A decisive successor must find an independent *authored* instruction selecting a constellation chart, the star-name or Greek-rank register, the ordering convention, and a reversible receiver for original ciphertext. An original rune-word decoder needs to explain word-local fifth-back returns while respecting the rare adjacent doublets and yield held-out readable plaintext. Do not optimize other star lists, signs, offsets, or GP29 key functions against language scores in the absence of such an instruction. A strong contrary result would be a reliable original 2014 visual source identifying the circles as nonastronomical plate copy.

Until such an instruction or authentic plaintext appears, this remains a **bounded conditional visual clue**, not a promoted finding in \`results/\`. It is separate from the current five-step word-local statistical evidence and the negative p23 direct quintet cipher tests.
