# Original p7 / p22 / p23 five-seven-five art cue vs the authenticated 2014 magic-square key

**Agent40, 22 November 2026. Classification: newly checked source-number relationship and conditional complete-block Hill inverse; no unknown plaintext, authenticated cipher key or continuation recovered.** The exact source claim is deliberately modest because p22 reuses solved-LP1 artwork and the original book provides no rune-to-matrix instruction.

## Why a human might attempt this

The original 2400×3600 scans place five black discs at the foot of physical p7 (archive `24.jpg`) and at the top of p23 (`40.jpg`), a precisely reused/reoriented five-dot stencil also present on solved p56. The intervening original p22 (`39.jpg`) has **three detached ink specks to one side of its transverse cross-body drawing and four to the other**, forming exactly **seven** identifiable small dots on the horizontal engraving. Exact cropped original-component centers, left to right, are:

- left3: `(1097,2342), (1152,2345), (1296,2351)`;
- right4: `(1598,2371), (1683,2287), (1714,2359), (1738,2312)`.

The source-gated read-only OpenCV regression checks these on byte-hash-locked `39.jpg`, and checks the established five-dot coordinates on `40.jpg`. The p22 cross/corpse figure is **known copied and mirrored from solved LP1 pp14–16**, as documented in [the independent source-art comparison](lp2-p22-corpse-source-plate-decision.md). Its seven specks therefore may be incidental to the reused image. No claim is made that Cicada deliberately authored a new seven-dot key.

Nevertheless a 2014 solver could read p7→p22→p23 as **5,7,5**, the exact dimension sequence of **three authenticated historical Stage10 numeric squares** (5×5 sum3301, 7×7 sum1033, 5×5 sum1033) preserved byte-exactly in [the original square file](../resources/cicada2014-openpuff-magic-squares.txt). These are more constrained than guessed numeric keys: all **three source matrices** are explicitly known and invertible over GP29, with their original row orders fixed.

## A surprisingly exact three-section block framing

Hold the original physical book order and proposed artwork marker boundaries fixed:

| Visual marker | Physical chapter interval | Native original runes | Typed red exclusion | Remaining original GP29 runes | Consecutive authentic matrix blocks |
| --- | --- | ---: | ---: | ---: | ---: |
| five-dot p7 ending | pp3–7 | 1,145 | 0 | **1,145** | **229 × 5** |
| seven-dot p22 ending | pp8–22 | 3,632 | p15's two entirely red `9+11=20` rune title spans | **3,612** | **516 × 7** |
| five-dot p23 beginning | pp23–26 | 1,021 | p23's red `16`-rune heading | **1,005** | **201 × 5** |

This alignment is a **conditional clue interpretation**, not an original instruction. In particular, the three sections are different narrative blocks and the two exclusions are chosen from source-visible red headings. Their exact divisibility alone has limited evidential value given alternative possible cutpoints; it motivates only a **finite direct test**, not a license to fit additional key layers or reinterpret remaining red marks.

## Frozen direct original-cipher inverse

Reduce each original historical integer matrix cell modulo29. For each of the three fixed original ciphertext sections, consume source runes in uninterrupted five- or seven-rune blocks, using the corresponding first, second or third Stage10 matrix with six no-key conventions: matrix M, its inverse, its transpose, its inverse transpose, dimension-th power and inverse dimension-th power. Each operation is algebraically reversible with **exact full-source reencryption**. No cipher start phase, matrix element, rune alphabet, row/column order or language parameter is fitted.

| Original section | Source IoC | Decoded IoC across all four authentic-matrix orientations |
| --- | ---: | --- |
| pp3–7 / 5×5 first | 0.034633707 | **0.034235–0.034741** |
| pp8–22 except p15 red20 / 7×7 second | 0.034506352 | **0.034400–0.034561** |
| pp23–26 except p23 red16 / 5×5 third | 0.034304573 | **0.034184–0.034862** |

All **18** complete decodings remain nearly uniform in rune frequencies and nonprose in their independently readable beginnings. Original score values differ from established solved-p57 clear GP, whose IoC is **0.0627099664**. There is **no recovered authentic unknown phrase**. The script proves matrix arithmetic by **95/95** exact solved-p57-shaped plants for each 5×5 and **91/91** for the 7×7, plus exact original reread of every rune.

### Additional dimensional-power inverse (Agent7, 22 November)

The separate p7 red-five-word/magic-square **READ URL** candidate uses the **fifth power** of the same authenticated 2014 5×5 squares. This supplies a source-local reason to test **matrix dimension powers (5,7,5)** against the complete corresponding 5/7/5 text sections, even though no first-party instruction selects that transfer. The expanded SFT keeps the source red exclusions and physical matrix directions exactly as in the original experiment and tests the dimension-th power and exact inverse as two additional no-key operators per section.

| Original physical receiver | Direct dimension-power GP29 IoC | Inverse dimension-power GP29 IoC |
| --- | ---: | ---: |
| pp3–7, original 1145 runes, first 5×5 A^5 | **0.034743641** | **0.034494763** |
| pp8–22 except p15 red20, original 3612 runes, 7×7 M^7 | **0.034536253** | **0.034471390** |
| pp23–26 except p23 red16, original 1005 runes, last 5×5 B^5 | **0.034211413** | **0.034205467** |

All six full original outputs remain uniform-looking ciphertext, with no sustained GP-native passage; the matrices and exact inverses replay all original runes. The original p7 red-word central READ URL readout remains retrospective and supplies no direct decoding key. The newly checked power transfer is therefore a **bounded negative on the complete physical manuscript sections**, with no unknown LP2 plaintext or author-selected cipher. Retire arbitrary exponents and section-phase tuning without a new original clue.

A separate sourced finite candidate treats the **3–4–5 right-triangle relationship** between p22's two groups and p23's five-dot marker as the GF29 rotation `R = 5⁻¹[[3,-4],[4,3]]`, with **order7**, already mathematically studied on p7/p8. Frozen first-runic and p23-red-heading-excluded transfers of `R`, `R⁵` and `R⁶` across the original pp23–26 1,021-rune stream also yield no plaintext; source and receiver IoC stay around 0.034. This related visual hypothesis is tested independently of the Stage10 key and shares no claim of author selection.

## Decision and available exact controls

The cross-page 5–7–5 observation is source-visible *in the sense that all dots can be counted on original art*, and the Stage10 numerical matrices were historical Cicada objects. It does **not** select a reversible GP29 operation from the manuscript itself. Under the cheapest direct, key-fully-specified three-stage decoding, the complete original inputs remain nonlinguistic. This is a **bounded negative** for the three explicit historical Hill matrices on the stated three sections, and a bounded negative for the p22 3/4→p23 5 GF29 rotation on the adjacent receiver. The two historical-mechanism layer orders have now been tested within the bounded source-fixed scope below; no arbitrary multilayer rescue is justified.

Original-only reproducers: [Stage10 5–7–5 CommonJS source gate](../sims/lp2_p7_p22_p23_five_seven_five_stage10_original_sft.cjs) and [original 3+4 dots Python image source gate](../sims/lp2_p22_3plus4_p23_five_original_sft.py). Both succeeded in GitHub Actions: [Node22 three-matrix full-source PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45063316352) and [original-JPEG image+rotation PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45062966221).

## Layer-order test and direct key recovery (Agent19, 24 November)

The direct-matrix test does not exclude an outer historical matrix wrapping an ordinary latent-F periodic cipher. Conversely, an inner fixed matrix followed by that historical cipher changes the key inference equations. Both orders have executable, fixed-source tests; the 5/7/5 mapping remains conditional because no authorial instruction selects it and the p22 dots belong to reused artwork.

**Outer Hill.** Use only the literal original row order, reducing the corresponding Stage10 matrix modulo29 and applying its inverse to every consecutive block. Keep the previously frozen red exclusions, without optimizing orientation, phase, or key. The authentic plaintext-F rule allows only intermediate ciphertext F symbols to be held. Exact dynamic programming obtains the min/max of both single-symbol and bigram coincidences at consuming lags q,2q,3q over every possible F-hold mask. For a fixed period-q substitution these counts must equal the native active plaintext counts. Compare 32 equally spaced same-length windows from each of Shakespeare, Emerson, Gibran (96 total); report independent extrema and combined feasibility.

| Original pages | q | Intermediate F count | Original maximum rune / bigram | Native minima rune / bigram | Joint native survivors |
|---|---:|---:|---:|---:|---:|
| 3–7 | 8 | 29 | 138 / 7 | 176 / 8 | 0/96 |
| 3–7 | 13 | 29 | 129 / 10 | 160 / 11 | 0/96 |
| 8–22, red20 removed | 8 | 106 | 433 / 17 | 600 / 50 | 0/96 |
| 8–22, red20 removed | 13 | 106 | 459 / 27 | 573 / 46 | 0/96 |
| 23–26, red16 removed | 8 | 34 | 116 / 3 | 154 / 8 | 0/96 |
| 23–26, red16 removed | 13 | 34 | 122 / 8 | 138 / 8 | 0/96 |

Six independent complete matrix-plus-F-hold native plants satisfy the exact collision invariant and replay the entire outer transform; this checks the layered model, not key recovery. All six original tests fail at least the single-rune necessary bound; the fixed outer-Hill model with ordinary finite native prose is retired for these q8/q13 clocks. Reproducer: [outer Hill SFT](../sims/lp2_stage10_hill_outer_fhold_gate_sft.cjs).

**Inner Hill, outer q13 F-hold.** The fixed final Stage10 5×5 matrix B acts on native GP29 five-rune blocks before the period-13 additive F-hold transform. Here the held Fs are those of the matrix output, not the final native plaintext. A zero-free ciphertext block has no latent hold, so each proposed dictionary word contained in one or more such blocks supplies linear equations in the 13 unknown key values even when the word starts or ends inside a matrix block. For each disjoint pair of six longest eligible printed words, combined length ≥17, enumerate relative phase from every possible count of visible F holds between block starts. Row-reduce the combined equations in GF29. For full rank 13, split the left-nullspace signature into two dictionary-side projections and hash-join exactly; canonicalize key rotations. This recovers candidate complete keys without exhaustive enumeration of 29^13 or key guesses. Rank-deficient cases are explicitly skipped. Use the unchanged 42,468-spelling finite dictionary, excluding the planted target section from native additions and trigram training. For each complete key, test exact F-hold legal phase reachability on the fitting prefix, then rank all legal keys by exact block-level trigram Viterbi. Freeze the best key, final phase and two preceding symbols before decoding the suffix.

| Input | Fitting / withheld runes | Full-rank key classes / legal | True key recovered | Held-out exact runes |
|---|---:|---:|---|---:|
| WELCOME, independent native plant | 350 / 165 | 8 / 7 | yes | 165/165 |
| LOSS OF DIVINITY, independent native plant | 500 / 255 | 1,034 / 153 | yes | 255/255 |
| Original p23–26 body | 500 / 505 | 1,349 / 11 | no authenticated key | no legal selected continuation |

Both controls recovered all fitting plaintext as well (350/350 and 500/500), with exact original-layer replay on all 1,270 planted runes. The original six eligible anchor starts (body-local, zero based) are 0,62,261,408,442,459 with lengths 8,9,8,9,10,10. Of 126 phase/anchor cases, 103 have full rank; 23 are rank-deficient (6 rank10, 4 rank11, 13 rank12). All 1,349 full-rank join classes are distinct, 11 legal on the first 500 runes. Best frozen prefix score −3.7288793016972837 nats/rune (controls −2.55518901135548 and −2.688722479174381), and its plaintext is nonprose. Its fixed final phase and context cannot continue into the untouched 505-rune body suffix. The original candidate is a **rejected fitted key**, not an authentic recovered key. Other legal prefix classes were not used for suffix ranking. This is a calibrated predictive failure of the bounded full-rank anchor search, not an all-key exclusion of inner Hill, not a claim about the 23 rank-deficient cases, and not evidence for arbitrary additional layers. The full-rank key recovery primitive is reusable if an independent source selects another specific linear transform.

Reproduce with [inner Hill exact key SFT](../sims/lp2_stage10_hill_inner_q13_anchor_sft.cjs), running `control1`, `control4`, and `original` separately. [Original complete output](lp2-stage10-hill-inner-q13-anchor-original-output.json). Execution used connected JavaScript on committed files; no CI or extra platform-specific tests are claimed. The plant pair-length threshold was adjusted from 18 to 17 before original evaluation because the second plant had no eligible pairs at 18; no original suffix or key score determined this adjustment. No unknown LP2 plaintext was recovered.
