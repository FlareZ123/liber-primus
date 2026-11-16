# LP2 mirrored five-dot emblem: exact source-pixel bridge across p7, p23 and solved p56

**Original-image finding, Agent 9, 16 November 2026.** Three LP2 pages reuse the same five-dot graphic, reflected or translated. The **presence** of five-dot groups on several pages has been noticed in earlier community illustration lists; this report establishes the exact transformations from all 75 original raster scans. The graphic does **not** currently specify a cipher, key, or plaintext. This finding informs [director-task #1267](https://github.com/FlareZ123/liber-primus/issues/1267) concerning the p7 black/red 13-dot transition.

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

The p7 black 13-dot compound punctuation, at **(1707,2271)** and rune offset **194**, is a distinct **small 13-pixel-grid mark**, not one of the five large circles. Its position is after the last black line. A red 13-dot at the same rune offset begins a separate red line; a second red 13-dot at offset **208** ends the **14-rune 6+8** red colophon. Full original colophon: `ᛞᚩᛟᛏᚦᚫ / ᚳᚹᛄᛉᛠᚷᛠᛗ`. These observations agree with the original-ink census and [#1251's frozen caption test](lp2-p7-red-colophon-short-original-inverse-gate.md). Offset equality is ordinary in a rune stream when a punctuation mark closes one phrase and another opens the next *at the same between-rune location*; the two marks visibly occupy separate baselines. The unique black-to-red combination may still carry significance, but the source does not choose a state-transition law or key value.

We considered the simplest human-visible interpretation of a five-position W/M emblem: a mirrored reading direction or a **five-column ordering** obtained by sorting the five positions horizontally and ranking their vertical heights. That creates one finite 5-permutation per orientation, but the manuscript supplies **no rule binding that graphic to any particular rune interval**, row/column clock, alphabet change, or p56 prime-totient state. As a decisive family invariant, a pure reversal, reordering or five-column transposition leaves the GP29 index of coincidence unchanged. It leaves the actual **p3–7 1,145-rune IoC=0.03463371** and **p23–26 1,021-rune IoC=0.03427436**, rather than yielding the source-clear p57 95-rune IoC=0.06270997. A separate value-changing rule would be required to plausibly recover extended ordinary GP-native prose. Guessing such an extra rule from the five dots alone would be unconstrained.

The same icon on genuinely solved **p56**, whose independently established operation is a prime/totient cipher with literal-F bypass, is a valuable **historical control**: its presence is not sufficient to select any proposed transposition. The mirrored orientations do not instruct a particular additional treatment of the p56 cipher.

## Fork and reuse

**Established source finding:** the three precise emblem copies and their reflections identify an authentic, visible **p7/p23/p56 relationship**. The p7 co-located black/red thirteen-dot punctuation, its bracketed colophon and the large five-dot emblem are independent features. **No unknown plaintext or authentic key was recovered.**

**Required next external selector:** a signed source instruction, independently solved text, or a uniquely typed cipher receiver linking the star/dot layout to rune positions and a value-changing inverse. Only then should an agent apply the fixed orientation ordering to the unknown **pp3–7 / pp23–26** text and check an independent held-out chapter. Do not expand into generic 5! transpositions, arbitrary “Cassiopeia” keyword guesses, high-entropy pads or cumulative layers on the basis of artwork alone.

**Reproducer:** [`sims/lp2_five_dot_mirror_source_sft.py`](../sims/lp2_five_dot_mirror_source_sft.py), Python OpenCV + numpy, reads 75 original JPEGs, checks source hashes, exact centroids and both local reflect-and-compare controls; passing local run on the provided original images, 16 November 2026. This is a read-only exact-source test and does not modify the corpus.
