# Five numbered LP2 passages: a source-bounded alignment hub and failed inversions

**Classification:** Exploratory, selected ciphertext relationship. No LP2 plaintext, actual key, decipherment mechanism or destination is established. This is the consolidated current account of Agent 29's five-numbered-block investigation (10 November 2026).

## Original-source boundaries

Original JPEGs **53–55** visibly enumerate five passages with red **1–5**. On JPEG55 the fifth passage consists of six printed lines and ends at a **red-dot separator**. A subsequent paragraph starts below the dots with no number. The annotated source `resources/liber-primus/lp2-transcription.txt` encodes that paragraph break as `&` immediately after the fifth item; its exact item rune counts are **[139, 91, 98, 96, 129]**.

The less richly annotated `resources/transcriptions/liber_primus_master.txt` does not preserve this same paragraph break at that location. Its next `%` denotes the **physical-page boundary** after **171** runes, and its later `&` occurs after **290** runes. Thus the original 290-rune item included 161 unnumbered runes; a provisional attempt to stop at `%` still included 42 unnumbered runes. These earlier boundaries and their trial calibrations are **superseded**. The physical image and the independent page-annotated source fix the 129-rune span. The selected first-item-to-fifth-item shift of −9 still compares 129 valid runes, retaining all 13 previously observed equalities. All controls below were recomputed against this exact five-item source boundary.

## Source-bounded 79/78 radix packet inversion

The list's 553 original runes occupy **global LP2 ciphertext offsets [8,805, 9,358)**, indexed from zero, with the five item starts at **8,805; 8,944; 9,035; 9,133; 9,229**. Both ends are congruent to **36 mod79**. The previously investigated manuscript-wide 79/78 model has exactly one numerically surviving global source packet phase, **35** under an *unknown fixed cyclic rune order*. Therefore an exact 7×79 fit to the five numbered passages does **not** make those passages seven packets of that existing global phase. It instead specifies a *separately reset* candidate starting at 8,805, immediately after the rune at the global phase35 boundary (8,804).

We applied the **unmodified public Gematria Primus 29-rune cyclic order** to the original source and performed complete BigInt 79-digit base28 to 78-digit base29 inversion, followed by exact forward re-encoding. The seven source-local blocks contain exactly **one** immediately repeated rune, at global index **8,934** inside the second block. The other **6/6** are numerically valid under the exact capacity `integer < 29^78`, recovering 6×78 = **468 candidate GP digits**, but those digits have **IoC 0.0349567159**, near 1/29, with **no coherent plaintext**. The repeated-output block is not invertible under the strictly predecessor-excluding numeric model. Exact re-encryption of the six clean blocks checks arithmetic implementation only. Using the known global phase35 boundary at 8,804 instead, five of its six locally clean blocks are valid under the public order; one fails. This does not replace the earlier global all-orders exclusion.

The source explicitly supplies possible independently fixed secret alphabets: in each numbered item, take its **order of first rune appearance**, then append missing GP labels in canonical order. This is a deterministic first-occurrence permutation per item, involving no ciphertext-language optimization. Against the same six clean source-local packets, item-derived orders 1–5 validate **3, 3, 3, 4, 1** packets respectively. None is a recovered 79/78 packet key. Across the complete book, only **48 of 95** repeat-free global-phase35 packets satisfy the full capacity condition with the public order; the five source-derived orders yield **57, 60, 50, 52, 46 of 95**. Each is decisively insufficient to explain a globally fixed packet order without further key state.

A separate original-source check asks whether the 553-rune interval acts like seven simultaneously aligned substitution/additive streams. Comparing all 21 distinct pairs of 79-column slices yields **57/1,659 exact equalities (0.03436)**. Across **12,404** other possible, overlapping original 553-rune windows (including the selected window), the mean is **56.725** and **54.10%** have as many or more same-column matches. There is no evidence for directly shared rune labels at those local 79 columns.

Finally, among the **12,403** other noninitial possible windows of length553, **2,047** contain precisely one repeated adjacent rune, and **59** additionally pass the exact two-leading-digit capacity condition on all six nonrepeating 79-symbol subpackets using the *same public cyclic order*. The chosen numbered span is one of those 59, giving a descriptive selected-window frequency **59/12,403 ≈ 0.00476**. All candidate windows overlap heavily, and the 79 hypothesis, chosen original source interval, public order and rule were jointly noticed in exploratory work. **This fraction is neither an unconditional p-value nor evidence that the packet code is historical.** The source-defined 553-rune interval is the new reusable input; any worthwhile successor needs an independently selected key, restart/escape specification, genuine plaintext and original heldout re-encryption.

Reproduce the complete, source-asserted 79/78 packet and genuine-ciphertext window checks with `node sims/numbered_five_alignment.cjs --packet79` (Node.js 22), alongside the pre-existing exact five-item analyses below. The existing manual [workflow succeeded](https://github.com/FlareZ123/liber-primus/actions/runs/42821065345) on the new original-source test. The code retains a 7-packet exact forward/reverse plant check and no new always-on CI workflow was introduced.

## Observed alignment: first item as fixed anchor

The script compares the 139-rune first item against each other whole item at noncyclic rune shifts `[-40,+40]`. For a candidate shift, `N` is overlap length and `E` exact runic equalities. Its standardised score is `z=(E-N/29)/sqrt(N*28/841)`. A four-link statistic is the **minimum** of the four independently maximized scores.

| Pair | Selected partner shift | Exact equalities | Full z | Held-out equalities | Held-out z |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 / 2 | −24 | 11/91 | 4.51684 | 6/46 | 3.56658 |
| 1 / 3 | −20 | 11/98 | 4.21891 | 5/49 | 2.59176 |
| 1 / 4 | −34 | 10/96 | 3.74186 | 5/48 | 2.64589 |
| 1 / 5 | −9 | 13/129 | 4.12646 | 5/65 | 1.87523 |

The full-score minimum is **3.7418562366**. Each shift's matched overlap is split in half; three training-best shifts are eligible for selection by the *unfitted* second half. The minimum of four such validation z-scores is **1.8752289238**. These are selected descriptive scores; interpreting an individual z as an unadjusted statistical test would be incorrect.

**Recomputed conditional empirical nulls, all 81 offsets and the same top-three holdout choice re-optimized in every trial:**

| Fixed-anchor control | Trials | Full-minimum exceedances | Full add-one p | Validation-minimum exceedances | Validation add-one p |
| --- | ---: | ---: | ---: | ---: | ---: |
| Four mutually disjoint authentic LP2 rune windows of item-matched lengths, LCG seed 1013539 | 10,000 | 1 | 0.000200 | 5 | 0.000600 |
| Independent within-item exact-histogram rune shuffles, LCG seed 730031 | 10,000 | 0 | 0.000100 | 1 | 0.000200 |

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

Run `node sims/numbered_five_alignment.cjs` for the corrected complete four-link scan, item-boundary assertions, 10,000-trial nulls and forced other-pair checks. Run `node sims/numbered_five_alignment.cjs --packet79` for source-anchored seven-packet capacity tests and `node sims/numbered_five_alignment.cjs --field-share` for the degree-one-to-three exact modular equations, the 4,048-placement degree-one scan, its 500 genuine-window controls and its planted full cubic-share positive. Requires Node.js 22, `resources/liber-primus/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`. Both modes read original committed resources and use fixed LCG seeds.

**Decision:** The corrected five-item source group now also yields a source-defined seven-packet 79-rune interval, numerically invertible on six clean blocks under a transparent assumed order but with near-uniform decoded symbols. It still has a conditional first-item coincidence anomaly. It has no validated five-way common pad or simple 29-field polynomial-share rule. A useful next hypothesis must derive its relative offsets and reversible copying/key state from another source constraint and reconstruct independently held-out original plaintext. Re-optimizing the same four coincidences does not constitute decryption.
