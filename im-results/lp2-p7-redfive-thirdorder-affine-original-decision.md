# P7 five red products as a full third-order affine stream cipher: source-driven original inversion fails

**Agent24, 22 November 2026; bounded original-input negative for [Director #2083](https://github.com/FlareZ123/liber-primus/issues/2083).** No unknown LP2 plaintext, key, mechanism or destination recovered.

## Original source and human solve path

The physical original p7 contains five complete red words followed by five black dots. The original GP29 ordinal-index word products reduced modulo29 in printed order are **[11,26,8,15,2]**. See the [independent p7 source inspection](lp2-p7-primitive-gf3-msequence-p8-original-table-gate.md). The next original physical p8 begins with twelve red runes, then **243 black runes** in a tree chapter through p14. The separate [original-word all-secret starting-state bound](lp2-allsecret-minimum-finitestate-wordcollision-original-gate.md) finds that a globally shared one- or two-cipher-predecessor plus five-phase deterministic word cipher contradicts almost every English source calibration, while **three ciphertext predecessors** are often compatible. The five printed values therefore motivate one simple, fully reversible **third-order cipher recurrence**, with three feedback coefficients, a plaintext coefficient and one constant, all in printed order.

This is a concrete operation selected by source operands and a predeclared architectural finding, although **no original first-party text specifies this affine equation or says that p7 supplies the following p8 key**.

## Fixed cipher and complete inverse

```text
Ci = 11*C(i-1)+26*C(i-2)+8*C(i-3)+15*Pi+2 (mod29)
Pi = 2*(Ci-11*C(i-1)-26*C(i-2)-8*C(i-3)-2) (mod29)
```

The original coefficient15 is invertible in GF29 because 15×2=30≡1 modulo29. There is no unknown secret to fit. The initialization is frozen as either [0,0,0] or the **actual three ciphertext runes physically preceding the selected first rune**, and the full original chapter is decoded without manual retuning. The five source numbers, coefficient order and native29-rune alphabet are unchanged.

## Complete original results

| Source interval and initialized predecessor state | Original runes | Original ciphertext IoC | Recovered text IoC |
| --- | ---: | ---: | ---: |
| p8–p14 including original red twelve, zero predecessor | **1,729** | 0.0344604835 | **0.0343808239** |
| p8–p14 including original red twelve, true preceding last-three p7 runes [6,28,19] | **1,729** | 0.0344604835 | **0.0343781462** |
| p8 black through p14, skip original red twelve, zero predecessor | **1,717** | 0.0344321762 | **0.0344206366** |
| p8 black through p14, true preceding three p8 red runes | **1,717** | 0.0344321762 | **0.0343989150** |
| p9–p14 only, zero predecessor | **1,474** | 0.0344408305 | **0.0343570059** |
| Independent untouched p15–p21, zero predecessor | **1,772** | 0.0345387756 | **0.0345419621** |

Every result remains near the uniform GP29 IoC1/29≈0.03448, has no coherent original-GP English passage, and reencrypts **every original ciphertext rune exactly**. The original p8 all-red-and-black decoded beginning reads: A IA R Y Y H H R EO D AE I H AE I E IA O NG B F O H N IA A R H I EA D C ... . The p9-only output begins: M E M EO J EO G J X IA AE T S Y C EO O A C L O U TH N D NG EO OE ... . These are not authentic recovered prose.

The authentic previously **solved original p57** supplies a native GP29 **95-rune cleartext positive control**: forward enciphering its actual95 symbols under both original-tested initializers, then applying the *same* inverse, recovers all95 runes identically. Thus the reversible cipher is implemented correctly for genuine source-native prose, and failure on original unknown material is substantive.

## Decision

This exact five-source-product third-order affine decoder is **excluded as a direct p8–p14 plaintext recovery** and has no predictive success on the disjoint p15–p21 chapter. The source-derived products could have another role, but relabeling the coefficient order, assigning arbitrary secret constants or adding a second cipher layer after observing failed original plaintext would lose the original clue constraint. The source evidence does not identify a third-order operator or a real key; no other model is selected by this negative.

[Complete read-only original-input CommonJS SFT](../sims/lp2_p7_redfive_thirdorder_affine_original_sft.cjs) includes both original source initializers, original full chapter and independent holdout, solved-p57 positive plants and exact original reencryption for each branch. The candidate original outputs were executed independently in a JS runtime; [Windows Node22 original-input PASS, run45013156258](https://github.com/FlareZ123/liber-primus/actions/runs/45013156258) validates all original receiver branches and 95-rune source-native positives.
