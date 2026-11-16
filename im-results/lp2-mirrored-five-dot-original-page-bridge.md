# LP2 mirrored five-dot emblem: exact source-pixel bridge across p7, p23 and solved p56

**Original-image finding, Agent 9, 16 November 2026.** Three LP2 pages reuse the same five-dot graphic, reflected or translated. The **presence** of five-dot groups on several pages has been noticed in earlier community illustration lists; this report establishes the exact transformations from all 75 original raster scans. The graphic does **not** currently specify a cipher, key, or plaintext. A 16 November solved-p56 control test additionally rejects the simplest reversible affine coordinate/value maps; the exact scope and reproducer are below. This finding informs [director-task #1267](https://github.com/FlareZ123/liber-primus/issues/1267) concerning the p7 black/red 13-dot transition.

## Which source images and what is actually shared

| Original file | Physical LP2 page | Visible role | Five dot centres at native 2400×3600, sorted left to right |
| --- | ---: | --- | --- |
| `24.jpg` | 7 | Under the black-to-red 14-rune ending of the spiral-bordered chapter pp3–7 | (797,3106), (992,3167), (1297,2867), (1479,3128), (1527,2936) |
| `40.jpg` | 23 | Above the red giant-cap start of chapter pp23–26 | (797,568), (992,507), (1297,807), (1479,546), (1527,738) |
| `73.jpg` | 56 (solved) | Under the authenticated `AN END` passage | (873,2517), (921,2708), (1104,2447), (1408,2747), (1604,2686) |

All images are the original JPEGs in `resources/liber-primus/`. The three source SHA-256 hashes are checked by the accompanying [read-only image SFT](../sims/lp2_five_dot_mirror_source_sft.py). The strict native-size component selector is grayscale <75, 8-connectivity, bounding width/height 65–75, and 3,000–3,900 black pixels of connected ink. A complete **75-image scan** finds five qualifying discs on exactly **24, 40 and 73**; `50.jpg` independently contains only **three** such large discs. This is a reproducible morphological classification, not a claim that no other different-sized dot ornament exists.

The five dot positions obey simple, coherent first-party coordinate transformations:

* **p7→p23:** (x_{23}=x_7), (y_{23}=3674-y_7). This is exact to the rounded integer centre of every dot: a **vertical reflection**. At the source grayscale threshold, each 93×93 image-centred blob, flipped vertically, agrees with its p23 counterpart at IoU **[1, 1, 1, 1, 0.997365]**.
* **p7→p56:** (x_{56}\approx2400-x_7), (y_{56}\approx y_7-420), with ≤1px centroid differences and reversed left-to-right dot order. This is a **horizontal reflection and vertical translation**. Local blob IoUs under the fixed reflection are **[0.969376, 0.956259, 0.977965, 0.961216, 0.977681]**.

The extraordinary p7→p23 four pixel-exact reflected black discs and coherent fifth confirm intentional **graphic reuse**, independent of transcription or proposed cryptographic key. The three copies supply a compact source-original cross-page bridge: *one symbol, placed at two chapter boundaries and in the solved p56 finale*.

## Distinct p7 punctuation and what is *not* selected

The p7 black 13-dot compound punctuation, at **(1707,2271)** and rune offset **194**, is a distinct **compound 13-dot punctuation mark**, not one of the five large circles. Its position is after the last black line. A red 13-dot at the same rune offset begins a separate red line; a second red 13-dot at offset **208** ends the **14-rune 6+8** red colophon. Full original colophon: `ᛞᚩᛟᛏᚦᚫ / ᚳᚹᛄᛉᛠᚷᛠᛗ`. These observations agree with the original-ink census and [#1251's frozen caption test](lp2-p7-red-colophon-short-original-inverse-gate.md). Offset equality is ordinary in a rune stream when a punctuation mark closes one phrase and another opens the next *at the same between-rune location*; the two marks visibly occupy separate baselines. The unique black-to-red combination may still carry significance, but the source does not choose a state-transition law or key value.

We considered the simplest human-visible interpretation of a five-position W/M emblem: a mirrored reading direction or a **five-column ordering** obtained by sorting the five positions horizontally and ranking their vertical heights. That creates one finite 5-permutation per orientation, but the manuscript supplies **no rule binding that graphic to any particular rune interval**, row/column clock, alphabet change, or p56 prime-totient state. As a decisive family invariant, a pure reversal, reordering or five-column transposition leaves the GP29 index of coincidence unchanged. It leaves the actual **p3–7 1,145-rune IoC=0.03463371** and **p23–26 1,021-rune IoC=0.03427436**, rather than yielding the source-clear p57 95-rune IoC=0.06270997. A separate value-changing rule would be required to plausibly recover extended ordinary GP-native prose. Guessing such an extra rule from the five dots alone would be unconstrained.

The same icon on genuinely solved **p56**, whose independently established operation is a prime/totient cipher with literal-F bypass, is a valuable **historical control**: its presence is not sufficient to select any proposed transposition. The mirrored orientations do not instruct a particular additional treatment of the p56 cipher.

### Registered-rune correspondence gate

The dot-derived p7→p23 transform fixes the complete two-image overlay *without* fitting any rune alignment. The original p7 and p23 both contain ten source-printed text lines, with respectively **208** and **213** GP29 runes. Under the vertical mirror, printed line order reverses, while left-to-right text order is preserved. Reading 10 pairs of reflected original lines with the natural shared left edge gives **8 exact equal GP runes among 198 paired positions (4.04%)**. A hypothetical right-edge anchor gives **12/198 (6.06%)**, but the left-set typography and unchanged dot x-coordinates do not select that alternative. Compared against the corresponding reverse-line left-anchored pairing of p7 with all other 57 LP2 pages, p23 is only **19th** in same-rune match rate. Even the seemingly improved right-edge 12/198 is only rank three with small and ragged pages included, and is not an authored operation. These comparisons do not show a reused page-pair keystream.

A distinct image-level fixed-reference control crops p7's original black-text region at x610..1810/y650..2640, mirrors every other 58-page LP2 candidate vertically around the dot-established y=1837 axis, and compares binary <130 grayscale pixels. Original p23 ranks first with **pixel IoU 0.1718**, against **0.1521** for second-place p15, but p23's ink still has no legible common overprint or row-wise cipher exchange. This result is compatible with a shared font and mirrored page template. **The five-dot stamp provides definite visual registration; it does not bind a rune-pair operation.**

## Solved-p56 coordinate-plus-value gate (Agent30, 16 November 2026)

A human could notice five dots, the 85-rune solved p56 passage (17 consecutive quintets), and try a small coordinate/value cipher rather than another pure permutation or transferred additive pad. The p56 original-image dot coordinates, sorted left-to-right, give vertical ranks **[1,3,0,4,2]**; equivalently their top-to-bottom x-rank order is **[2,0,4,1,3]**. These are the inverse permutations, not interchangeable lists. The exact centroids and reflections remain independently fixed by the source-image SFT above.

Three finite, reversible families were calibrated using only the independently known p56 plaintext and its original 85-rune ciphertext:

1. **Direct coordinate-affine value map.** With five-rune block index t, lane j, and p56 dot-height rank y[j], test
   \`C[t,j] = a*P[t,j] + b*j + c*y[j] + d*t + e (mod 29)\`.
   The first five blocks give 25 equations for five coefficients. The coefficient matrix has rank **5** but the augmented system is **inconsistent**: no coefficients fit even the first 25 authentic p56 symbols. This also rejects its constrained additive-key subfamily (a=1).
2. **General fixed 5×5 Hill map.** Fit \`C[t] = K P[t] (mod 29)\` from the first five blocks. The plaintext training matrix is invertible (determinant **1**); the uniquely fitted key is itself invertible (determinant **14**). On the twelve withheld p56 blocks it makes **58 errors in 60 symbols** (only 2/60 matches).
3. **Affine 5×5 Hill map.** Fit \`C[t] = A [P[t];1] (mod 29)\` from six blocks. Its 5×5 linear part is invertible (determinant **18**). On the eleven withheld blocks it makes **53 errors in 55 symbols** (only 2/55 matches).

The two Hill maps are genuine held-out known-plaintext failures, not language-score judgements or round-trip claims. The more tightly source-coordinate-parameterized affine map is rejected earlier by an exact overdetermined inconsistency on its 25-symbol training prefix. The full matrix model already subsumes row/column-vector convention changes; coordinate reflections or rotations merely change the affine coordinate basis and cannot repair the inconsistent coordinate-affine fit. The dot stamp is also physically **after all 85 p56 ciphertext runes**, so p56 supplies no post-marker symbols from which to infer a forward clock advance, reset or five-symbol consumption rule.

**Decision:** the original five-dot geometry gives an exact page-to-page graphic registration, but does not determine a reversible value-changing operator, a key, or a clock. Retire these direct affine coordinate/value and fixed five-symbol matrix interpretations. This does not exclude a separately sourced nonlinear operation or an external key; neither is supplied by the five-dot figure alone.

**Reproducer:** [\`sims/lp2_fivedot_coordinate_value_gate.cjs\`](../sims/lp2_fivedot_coordinate_value_gate.cjs), Node.js 22, using the canonical p56 GP29 ciphertext, the independently established AN END plaintext, and the original p56 dot coordinates. No unknown LP2 page is used to fit or select parameters.

## Fork and reuse

**Established source finding:** the three precise emblem copies and their reflections identify an authentic, visible **p7/p23/p56 relationship**. The p7 co-located black/red thirteen-dot punctuation, its bracketed colophon and the large five-dot emblem are independent features. **No unknown plaintext or authentic key was recovered.**

**Required next external selector:** a signed source instruction, independently solved text, or a uniquely typed cipher receiver linking the star/dot layout to rune positions and a value-changing inverse. Only then should an agent apply the fixed orientation ordering to the unknown **pp3–7 / pp23–26** text and check an independent held-out chapter. Do not expand into generic 5! transpositions, arbitrary “Cassiopeia” keyword guesses, high-entropy pads or cumulative layers on the basis of artwork alone.

**Reproducer:** [`sims/lp2_five_dot_mirror_source_sft.py`](../sims/lp2_five_dot_mirror_source_sft.py), Python OpenCV + numpy, reads 75 original JPEGs, checks source hashes, exact centroids and both local reflect-and-compare controls; passing local run on the provided original images, 16 November 2026. This is a read-only exact-source test and does not modify the corpus.
