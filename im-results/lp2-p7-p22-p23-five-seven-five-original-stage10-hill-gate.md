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

Reduce each original historical integer matrix cell modulo29. For each of the three fixed original ciphertext sections, consume source runes in uninterrupted five- or seven-rune blocks, using the corresponding first, second or third Stage10 matrix with four no-key conventions: matrix M, its inverse, its transpose, and its inverse transpose. Each operation is algebraically reversible with **exact full-source reencryption**. No cipher start phase, matrix element, rune alphabet, row/column order or language parameter is fitted.

| Original section | Source IoC | Decoded IoC across all four authentic-matrix orientations |
| --- | ---: | --- |
| pp3–7 / 5×5 first | 0.034633707 | **0.034235–0.034741** |
| pp8–22 except p15 red20 / 7×7 second | 0.034506352 | **0.034400–0.034561** |
| pp23–26 except p23 red16 / 5×5 third | 0.034304573 | **0.034184–0.034862** |

All **12** complete decodings remain nearly uniform in rune frequencies and nonprose in their independently readable beginnings. Original score values differ from established solved-p57 clear GP, whose IoC is **0.0627099664**. There is **no recovered authentic unknown phrase**. The script proves matrix arithmetic by **95/95** exact solved-p57-shaped plants for each 5×5 and **91/91** for the 7×7, plus exact original reread of every rune.

A separate sourced finite candidate treats the **3–4–5 right-triangle relationship** between p22's two groups and p23's five-dot marker as the GF29 rotation `R = 5⁻¹[[3,-4],[4,3]]`, with **order7**, already mathematically studied on p7/p8. Frozen first-runic and p23-red-heading-excluded transfers of `R`, `R⁵` and `R⁶` across the original pp23–26 1,021-rune stream also yield no plaintext; source and receiver IoC stay around 0.034. This related visual hypothesis is tested independently of the Stage10 key and shares no claim of author selection.

## Decision and available exact controls

The cross-page 5–7–5 observation is source-visible *in the sense that all dots can be counted on original art*, and the Stage10 numerical matrices were historical Cicada objects. It does **not** select a reversible GP29 operation from the manuscript itself. Under the cheapest direct, key-fully-specified three-stage decoding, the complete original inputs remain nonlinguistic. This is a **bounded negative** for the three explicit historical Hill matrices on the stated three sections, and a bounded negative for the p22 3/4→p23 5 GF29 rotation on the adjacent receiver. No multilayer rescue is justified without independent new instructions.

Original-only reproducers: [Stage10 5–7–5 CommonJS source gate](../sims/lp2_p7_p22_p23_five_seven_five_stage10_original_sft.cjs) and [original 3+4 dots Python image source gate](../sims/lp2_p22_3plus4_p23_five_original_sft.py). Both succeeded in GitHub Actions: [Node22 three-matrix full-source PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45063316352) and [original-JPEG image+rotation PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45062966221).
