# Five numbered LP2 passages: a source-bounded alignment hub and failed inversions

**Classification:** Exploratory, selected ciphertext relationship. No LP2 plaintext, actual key, decipherment mechanism or destination is established. This is the consolidated current account of Agent 29's five-numbered-block investigation (10 November 2026).

## Original-source boundaries

Original JPEGs **53–55** visibly enumerate five passages with red **1–5**. The fifth passage ends at a conspicuous **red-dot separator** on JPEG55, before the following unnumbered paragraph. In the canonical master transcription the separator is the first `%\n` after the `5-` label; using the later `&` separator incorrectly incorporates the next paragraph. The corrected complete rune counts are **[139, 91, 98, 96, 171]**. Earlier analysis reported 290 for item 5 by including the following 119 runes; the earlier five-item span description and null calibration are superseded. A competing 129-rune count exists in a separate item-key experiment; this source-checked and transcription-reproducible boundary is 171.

This matters to a source-driven decoding hypothesis because five numerical labels define five specific items. The previously reported peak lag for item 5 uses only its first 130 runes, so the four selected equality peaks remain numerically unchanged when the source boundary is repaired. All null controls below were recomputed with the **171-rune** fifth item.

## Observed alignment: first item as fixed anchor

The script compares the 139-rune first item against each other whole item at noncyclic rune shifts `[-40,+40]`. For a candidate shift, `N` is overlap length and `E` exact runic equalities. Its standardised score is `z=(E-N/29)/sqrt(N*28/841)`. A four-link statistic is the **minimum** of the four independently maximized scores.

| Pair | Selected partner shift | Exact equalities | Full z | Held-out equalities | Held-out z |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 / 2 | −24 | 11/91 | 4.51684 | 6/46 | 3.56658 |
| 1 / 3 | −20 | 11/98 | 4.21891 | 5/49 | 2.59176 |
| 1 / 4 | −34 | 10/96 | 3.74186 | 5/48 | 2.64589 |
| 1 / 5 | −9 | 13/130 | 4.09399 | 5/65 | 1.87523 |

The full-score minimum is **3.7418562366**. Each shift's matched overlap is split in half; three training-best shifts are eligible for selection by the *unfitted* second half. The minimum of four such validation z-scores is **1.8752289238**. These are selected descriptive scores; interpreting an individual z as an unadjusted statistical test would be incorrect.

**Recomputed conditional empirical nulls, all 81 offsets and the same top-three holdout choice re-optimized in every trial:**

| Fixed-anchor control | Trials | Full-minimum exceedances | Full add-one p | Validation-minimum exceedances | Validation add-one p |
| --- | ---: | ---: | ---: | ---: | ---: |
| Four mutually disjoint authentic LP2 rune windows of item-matched lengths, LCG seed 1013539 | 10,000 | 0 | 0.000100 | 6 | 0.000700 |
| Independent within-item exact-histogram rune shuffles, LCG seed 730031 | 10,000 | 1 | 0.000200 | 2 | 0.000300 |

Both controls keep the original first item fixed. The authentic-window control preserves native neighboring-rune structure within each sampled window, and the shuffle control preserves each item's full unigram histogram. These p values condition on an *exploratorily chosen* first-item hub, number-labelled source group, offset window and score family, so they do not establish a puzzle-wide statistical discovery.

The **45** equalities are dispersed across **24 of 29** anchor rune types. Only five anchor positions appear in two or more partner-match sets; position 93 matches three partners. A concentrated single-rune anchor artifact does not explain the four selected links.

## Direct cryptographic inversions

**One common additive key fails transitivity.** Offsets `[0,−24,−20,−34,−9]` force six additional pairwise offsets. These compare items 2–5 at **16/541** matching runes (2.96%, below the 1/29 uniform reference), compared with the first-item hub's 45 matches. The exact forced pairs 2/3, 2/4, 2/5, 3/4, 3/5 and 4/5 yield respectively **3/91, 4/81, 0/91, 3/84, 3/98, 3/96**. A five-way shared reused modulo29 additive pad for ordinary, independently worded GP-English passages cannot be inferred from this hub. The existing source-matched English difference-distribution search also failed to recover a shared affine multiplier.

**Polynomial-share test motivated by red labels 1–5 and prime field F29.** If each numbered passage represented direct evaluations at x=1,...,5 of one rune-wise polynomial over F29, the first 3, 4 and 5 shares would satisfy, respectively,

- degree ≤1: `C1 − 2C2 + C3 = 0 (mod 29)`;
- degree ≤2: `C1 − 3C2 + 3C3 − C4 = 0 (mod 29)`;
- degree ≤3: `C1 − 4C2 + 6C3 − 4C4 + C5 = 0 (mod 29)`.

A common nonzero affine relabelling of output runes preserves these conditions. At the five natural item starts, their hits are only **4/91, 2/91 and 4/91**; at the pre-existing hub offsets they are **3/91, 4/81 and 3/81**. Exact genuine shares would satisfy *every* relation at every jointly valid site. A planted random cubic five-share construction recovers **81/81** exact fourth-difference relations.

For the three-item degree-one case, a wider exhaustive scan of `[-40,+40]^2` relative offsets tests **4,048** placements with at least 60 jointly covered rune positions. The maximum is 12/91 at shifts (−20,−20), z **5.09135537**. In **500 independently sampled pairs of authentic LP2 rune windows**, the same complete search attains or exceeds that z **87** times (seed **1901107**, add-one p **88/501 ≈ 0.17565**). It is an unsuccessful inversion, not a linear-share decoding. Arbitrary non-affine output permutations, nonuniform erasures, unread source extraction orders or additional encryption remain outside these exact-model negatives.

## Reproduction and decision

Run `node sims/numbered_five_alignment.cjs` for the corrected complete four-link scan, item-boundary assertions, 10,000-trial nulls and forced other-pair checks. Run `node sims/numbered_five_alignment.cjs --field-share` for the degree-one-to-three exact modular equations, the 4,048-placement degree-one scan, its 500 genuine-window controls and its planted full cubic-share positive. Requires Node.js 22, `resources/transcriptions/liber_primus_master.txt` and `resources/liber-primus/lp2-corpus.json`. Both modes read original committed resources and use fixed LCG seeds.

**Decision:** The corrected five-item source group still has a conditional first-item coincidence anomaly. It has no validated five-way common pad or simple 29-field polynomial-share rule. A useful next hypothesis must derive its relative offsets and reversible copying/key state from another source constraint and reconstruct independently held-out original plaintext. Re-optimizing the same four coincidences does not constitute decryption.
