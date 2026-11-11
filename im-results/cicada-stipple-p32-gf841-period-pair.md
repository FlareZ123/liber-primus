# p57 cicada stipple -> p32 prime-index -> GF(29^2) period pair

**Status:** exact conditional arithmetic and field identities; the p57 count-derived selector is GIMP-confounded and not source-authenticated; no decryption.

## Original-image measurement

On original resources/liber-primus/74.jpg (LP2 p57), the central illustration crop x=350..2049, y=1900..3449 yields **574 eight-connected components** at every grayscale threshold tested (40, 80, 120, 160, 200). The two largest components have areas **1,027** and **12,821**; excluding these two visibly non-stipple structures leaves **572 small components**. At the natural image midline x=1200, the small components split **241 left / 331 right**, invariant across all five thresholds. The two large components sit on opposite sides of the midline.

The split counts are both prime:
- 241 is prime ordinal **53**.
- 331 is prime ordinal **67**.

The exclusion of the two large structures is visually motivated but remains an interpretation: including them changes the split to 242/332, which is not prime.

## Original-image selector sensitivity (Agent 14, 11 November 2026)

A separate image-only [single-file control](../sims/lp2_stipple_component_selector_sft.py) uses original `74.jpg` SHA-256 `1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b`, exactly the same crop and threshold as above. This is a *selection-rule control* rather than an independent recovery of the GIMP reconstruction. It asks which equally reproducible connected-component choices produce the proposed prime pair.

| Connectedness | Largest components removed | Left/right counts at page x=1200 | Both prime? |
| --- | ---: | ---: | --- |
| 8-neighbour | 0 | 242/332 | No |
| 8-neighbour | 1 | 242/331 | No |
| **8-neighbour** | **2** | **241/331** | **Yes** |
| 8-neighbour | 3 | 241/330 | No |
| 8-neighbour | 10 | 240/324 | No |
| 4-neighbour | 2 | 337/475 | No |
| 4-neighbour | 10 | 337/467 | Yes (a different prime pair) |

Under eight-connectivity, the image contains 574 components with top areas **[12821, 1027, 614, 613, 585, 398, 385, 373]** native pixels. In particular, choosing exactly two non-stipple structures excludes an area-1,027 component but retains an area-614 one. The count **241/331** survives whole-page vertical axes x=1198 through x=1205 inclusive; a center at x=1213 (the largest component's area-weighted x centroid, distinct from its bounding-box midpoint) gives **248/324**. Standard four-connectivity instead yields **814** components. The original rule is visually plausible, but *neither the integer pair nor its primality is invariant to how components are defined or excluded*. The alternative 337/467 prime pair illustrates why choosing segmentation by a desired prime result would be circular.

This does not disprove intentional alignment with the **page** midline x=1200, a natural coordinate, and does not replicate SECRA's predicted GIMP mask. It strengthens the existing requirement: freeze the historically intended component/connectivity/exclusion rule from source evidence, then compare the actual output with a GIMP-rendered negative control *before* using 241/331 to select a rune or cryptographic state. No unknown LP2 plaintext follows.

## Source-predicted native rendering fingerprint (Agent 14, 11 November 2026)

The independent [native-GIMP source SFT](../sims/lp2_p57_gimp_native_threshold_sft.py) now reconstructs the p57 insect's **293-row × 267-column** one-cell raster directly from the original JPEG, by thresholding and reducing the 2400×3600 image to a 576×864 base raster, then extracting native source coordinates **x=158..424, y=475..767**. The crop has **2,033 black pixels**, unchanged at original JPEG grayscale thresholds 40/64/100/128/192/200, and **574** eight-connected components; discarding the two largest reproduces **241/331** at native x=130. The 293×267 and 2,033 numbers agree with independent SECRA native-crop measurements. This is a deterministic source fact, not a decryption.

More decisively, the native crop contains **391 isolated one-cell black dots**, and their historically frozen GIMP GLib v2.2 `GRand` values at the previously published **(x+4, y−9 mod 4096)** alignment average **9.370844/254** (sum 3664 across 391 sites). In the **1,680 other** integer translations within ±20 cells, the lowest alternative average is **113.826087/254** (sum 44,506), against the generator's approximately **127/254** unconditional mean. **65/391 singleton dots have generator threshold zero**, including the four separately published lower-left dots at native crop coordinates **(53,250), (44,256), (41,265), (57,269)**. The SFT checks the original JPEG SHA-256, native raster, source-code MT19937 vectors, exact threshold placements and local-offset competitors, and was executed locally successfully.

This **independently reproduces the critical existing SECRA GIMP fingerprint on authentic original source cells**, without fitting plaintext, selecting a new seed or using the output of a decryption search. The GIMP offset and four special-dot coordinates were *already known* from SECRA; the local 41×41 offset contrast is a focused reproduction rather than an independent discovery-wide significance test. It does **not** reconstruct a pristine opacity master, recover SECRA's full 166-cell residual, or predict the 241/331 component split from a source-fixed opacity image alone. The prime-based selector remains unauthenticated, and the lossless original-LP2 cipher remains unknown.

## Confidence downgrade: p57 stipple may be a GIMP rendering artifact

SECRA's 15 October 2026 report, [Inside Liber Primus](https://secra.tech/research/liber-primus-strongest-findings/), reports that the p57 dotted-insect positions strongly match the deterministic legacy GIMP Dissolve field: 268,435,456 offset/orientation/polarity configurations, 96.0% whole-image F1, 93.9% held-out F1, and 166 residual cells. Its [evidence index](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html) reports 100,000 local-pattern-preserving randomizations without a comparable match. The fixed seed 314159265 is a GIMP default, not a π key.

The exact 574 component count and 241/331 split in this report have not been compared against SECRA's reconstructed mask. Therefore the 53/67 prime ordinals, p32 antipodal positions, 101/11 GP-prime weights, 84/10 field periods, 7×82 arithmetic and all downstream GF(29²) selectors are **conditional on an unverified premise**: that the measured dot counts were intentionally selected rather than produced by the rendering field. The field-pair and matrix tests below remain valid negative results for their exact transforms, but they do not validate the input selector.

The next discriminant is not another key or exponent sweep. Obtain the frozen GIMP-predicted mask/residual and recompute the exact crop x=350..2049, y=1900..3449, 8-connected component count, removal of the two largest components and x=1200 split. If the model predicts 574 and 241/331, retire the selector chain. If a structured residual survives, test only that residual. Existing GIMP source-field work is in [the source-pad gate](gimp-dissolve-source-pad-gate.md); do not repeat its direct-pad or 2D field searches.

## The selected p32 positions

LP2 p32 contains 121 runes and is independently implicated by the 2016 signed tree image / 11x11 dimension relation. Using the prime ordinals as **zero-based** positions in its row-major 121-rune sequence selects offsets **53** and **67**:

| Quantity | Left | Right |
|---|---:|---:|
| Small-component count | 241 | 331 |
| Prime ordinal | 53 | 67 |
| p32 cell (zero-based) | (4, 9) | (6, 1) |
| Original GP-prime weight | 101 | 11 |

The selected cells are antipodal about the p32 center cell (5,5): their row and column coordinates sum to (10,10). Their offsets also satisfy 53+67=120 and 67-53=14=2x7. The seven-word opening sentence of the solved p57 Parable is LIKE THE INSTAR TUNNELING TO THE SURFACE.

The GP-prime-weight difference is 101-11=90, exactly the small-component split difference 331-241. This is not unique among arbitrary p32 pairs: three of the 60 antipodal pairs have a prime-weight difference of 90. Across all 11 unordered prime pairs summing to 572, however, (241,331) is the only pair whose prime ordinals sum to 120 and differ by 14. A random permutation of the fixed p32 prime-weight multiset would put a difference-90 pair at two fixed positions with frequency 78/7260 ~= 1.074%; this is a descriptive conditional diagnostic, not a discovery-wide p-value.

**Indexing caveat:** the one-based alternative positions (52,66) have GP-prime weights (29,53), difference 24, not 90. The zero-based convention is natural for the canonical array and pixel coordinates, but is still a convention that must be justified in any proposed human solve path.

## Conditional GF(29^2) period pair (if the stipple selector is real)

The p3 red triad has GP-prime weights [13,23,2], giving

\[
13+23u+2u^2=0 \pmod{29},\qquad u^2=8+3u.
\]

The p3 element u has multiplicative order **840** in GF(29^2). Reducing the two selected p32 prime weights modulo 29 gives the ordered left-to-right field element

\[
z_{LR}=14+11u=u^{50},\qquad \operatorname{ord}(z_{LR})=84.
\]

Reversing the image direction gives

\[
z_{RL}=11+14u=u^{588},\qquad \operatorname{ord}(z_{RL})=10.
\]

Exact checks include zLR^3=2, zLR^42=-1, and zRL^5=-1. The product of the two orders is 84x10=840, the order of u; however, their multiplicative product has order **420** (lcm(84,10)), not 840. A product mask built from the two clocks therefore does not traverse all 840 nonzero field elements.

The period lengths have retrospective source-sized correspondences (not independent evidence of intent):

- 84 = 51 + 33: p53's original red span has 51 runes; p32's first printed clause has 33.
- 10 is the marked ten-dot punctuation size.
- 127 = 84 + 43, where 43 is the first GP-prime weight of the red p57 heading PARABLE.
- Separately, 82 = 51 + 31, where 31 is the total number of thirteen-dot marks; and 574 = 7x82, where 7 is the word count of the opening Parable sentence.

If the p57 counts were intentionally selected, they would yield a compact candidate architecture: opposite p32 cells, two direction-ordered GF(29^2) elements with periods 84 and 10, and size correspondences to the p53 red span, p32 clause, ten-dot marks and 51x127 register. The GIMP rendering confound means the selector premise is not established; treat the entire chain as conditional.

## Bounded original-cipher test

The existing source-sized register hypothesis retains the first two original runes and groups the remaining 12,954 runes into **51x127 adjacent GF(29^2) pairs**. The 256-byte base-60 grid is divided by the source-marked (X-24)^2 factor to obtain 127 quotient pairs Q[j]. The p53 red rune indices are R[r].

Two deterministic uses of the new field pair were tested on the unchanged original payload:

1. **Direct two-clock mask:** K[r,j] = zLR^R[r] * zRL^j * Q[j], decoding with either C-K or C+K.
2. **Row-reset feedback:** S[r,0] = zLR^R[r]; S[r,j+1] = zRL*S[r,j] +/- Q[j], decoding with either C-S or C+S.

All six variants exactly re-encrypt the original and invert a 12,954-rune native-GP positive-control plant. None produces language:

| Measure | Raw payload | Best of six variants |
|---|---:|---:|
| IoC | 0.03447896 | 0.03454249 |
| Shakespeare-GP trigram score (nats/rune) | -13.28405598 | -13.23700365 |

The best decode is only 0.0471 nats/rune above raw ciphertext. The worst minimum among 300 same-length native-GP control windows is -8.40039103 (Emerson); the best original decode remains **4.8366 nats/rune below** that floor. This is a bounded negative for these two fixed masks/state updates, not for every nonlinear or stateful use of the selector.

## Interpretation and next discriminant

The exact **241/331 -> 53/67 -> p32 weights 101/11 -> GF(29^2) periods 84/10** arithmetic chain is reproducible, but its initiating counts are confounded by the reported GIMP Dissolve field and have not been checked against the reconstructed mask. It does not recover plaintext, an authentic key, or a complete mechanism. Its vulnerabilities include the GIMP rendering explanation, exclusion of the two largest components, zero-based indexing, and retrospective combination of source counts.

A productive next test is to compare the exact component measurement with the GIMP-predicted field and residual. Do not use the pair as a source-fixed selector or run further exponent/diagonal/row-clock variants until that control is complete. The direct two-cycle masks, M-state recurrence and SE-diagonal row-seed recurrence are already negative; see the consolidated [51×127 gate](red-triad-51x127-byte-register-gate.md).

**Reproducer:** sims/cicada_stipple_p32_gf841_period_pair_sft.py (original image component counts, prime-index mapping, field orders, source arithmetic, and the bounded 51x127 tests).
