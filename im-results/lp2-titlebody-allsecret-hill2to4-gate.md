# All-secret GP29 affine Hill blocks of length 2, 3 or 4 on original LP2 title bodies

**Agent39, 13 November 2026. Status: new key-independent exclusion for eight substantial source-titled bodies.** An exhaustive finite-field scan of every possible affine Hill inverse row of block width 2, 3 or 4, at every block-start phase, finds no GP29 output with English-like character concentration in any of the eight long source-titled bodies. The 81-rune p33 interlude is too short to support this inference. This is a bounded cryptographic architecture result. **No new LP2 plaintext, source-authenticated key, decryption operation or destination has been recovered.**

Reproducer: [read-only Node22 all-secret SFT](../sims/lp2_titlebody_allsecret_hill2to4_sft.cjs). Original-JPEG-derived inputs: [canonical runes](../resources/liber-primus/lp2-corpus.json), [red title annotation](../resources/liber-primus/lp2-ink-annotations.json). Both the present test and the separate red51 coefficient trial passed on **Windows / Node22** in [manual CI run 43427193184](https://github.com/FlareZ123/liber-primus/actions/runs/43427193184).

## Causal hypothesis and why the inverse is testable without knowing its key

The manuscript uses 29 GP runes, and prior signed Cicada stages explicitly demonstrated base29 modular arithmetic. The original red titles partition the unknown manuscript into nine titled textual bodies. A standard small-block Hill cipher over the prime field GF(29), with one unknown invertible matrix and one unknown affine shift per body, could produce nearly uniform individual ciphertext rune distributions from natural-language text while leaving the original printed punctuation and word lengths unchanged. Blocks of two, three or four runes are small enough that an all-secret exclusion is affordable. This is an independently explored classical-cipher family; the manuscript supplies no authenticated Hill instruction, and any positive statistical fit would still require a full original-cipher inverse.

For each encrypted block, suppose C = MP + b over GF(29), where M is *any* unknown invertible m-by-m matrix for m in {2,3,4}, and b is *any* fixed secret affine offset vector for that body. Each plaintext coordinate is therefore P_j = v_j·C + d_j, where v_j is a nonzero inverse-matrix row. A fixed nonzero scaling and additive offset only permute the 29 possible rune values, so both leave the within-coordinate rune index of coincidence invariant.

Consequently a **necessary condition**, independent of all secret matrix coefficients, is that at least m independent linear forms of the original ciphertext blocks have the symbol-frequency concentration found in the corresponding plaintext character positions. We test the weaker requirement that *at least one* nonzero linear form have a concentration comparable to real GP-encoded English. If even that weaker requirement fails, no complete invertible affine Hill matrix can give ordinary native GP-English under this architecture.

Normalize each nonzero row vector by multiplying until its first nonzero coefficient is 1. This exhausts all GP29 frequency-equivalent directions, with exactly **30** at width2, **871** at width3, and **25,260** at width4. For each width, test every phase 0..m−1 at the printed red title body boundary. All original ciphertext rune values are taken as-is; punctuation, spaces and headings do not secretly contribute missing GP-runic values. The nine original body counts are exactly [716,1129,1726,1883,1005,1414,81,1581,3308], totaling 12,843; the source titles contain the remaining 113 runes, totaling 12,956 unknown GP runes.

## Original complete-key scan

The following table gives **the largest** GP29 IoC among *every* eligible secret inverse row and every block phase for each titled body. Larger values mean a less uniform rune-frequency distribution. The fixed diagnostic threshold 0.05 is weaker than every matched-position English control below. There is no fitted secret, key seed, punctuation reset, unknown plaintext or chosen first-key phase.

| Source-titled body and length | Maximum, width2 | Maximum, width3 | Maximum, width4 |
| --- | ---: | ---: | ---: |
| p0 opening, 716 | 0.036086 | 0.038967 | 0.042786 |
| p3 opening, 1129 | 0.036103 | 0.037986 | 0.039726 |
| p8 opening through p15 first nine runes, 1726 | 0.036467 | 0.037334 | 0.037868 |
| p15 after second title through p22, 1883 | 0.035548 | 0.036249 | 0.038035 |
| p23 opening, 1005 | 0.036127 | 0.038055 | 0.041594 |
| p27 opening, 1414 | 0.035353 | 0.037191 | 0.039193 |
| p33 first 81-rune interlude | 0.047436 | **0.101538** | **0.152047** |
| p33 second title through p39, 1581 | 0.035453 | 0.036748 | 0.038207 |
| p40 final title through p55, 3308 | 0.035521 | 0.035864 | 0.036320 |

The **eight long bodies** produce **zero** GP29 linear projections with IoC ≥ 0.05, regardless of key matrix, affine offset or block clock phase, across all three block widths. Their largest observed value is only 0.0427855. The tiny 81-rune interlude is different: with 19–40 blocks and thousands of trial directions, incidental high-IoC forms are abundant. This gate makes no exclusion for that body.

## Original-source controls and positive inversion

Three separate source passages from the repository's Shakespeare, Gibran and Emerson control texts were normalized under the same documented GP29 conventions, with exact body-length matched cuts and all corresponding modulo-m plaintext coordinates retained. The ordinary Latin-to-GP conversion uses the historical TH/NG/EO/OE/AE/IA/EA combinations and conventional K/Q/V/Z spelling reductions. The native samples supply independently meaningful plain-English controls, rather than noise injected into an adversarially selected row.

For **every** one of the eight long body lengths, at all individual modulo-m coordinate classes, the GP-native source IoC stays above **0.05** for each of the three independent text controls and all three block widths. This is the control needed for the necessary-condition comparison, not a claim about every possible English document. The shortest p33 body is deliberately omitted from this length-calibrated exclusion.

As a genuine encrypted positive control, the SFT applies an **unknown-to-the-search, dense invertible Hill transform** C=(I+J)P to the independent GP-native source for each m=2,3,4, with J the all-ones matrix. Its explicit inverse P=(I−J/(m+1))C recovers every planted original native-GP symbol exactly. The same all-secret linear-projection search detects an English-like row in each planted cipher with IoC above 0.05. Thus the absence of a concentration outlier in the actual original is meaningful under the specified cipher family. Successful CI run 43427193184 includes the full original scan and these controls.

## What is decided

The direct **fixed-per-red-title-body affine GP29 Hill2, Hill3 and Hill4** model is strongly incompatible with native GP-English plaintext that has ordinary source-like per-position rune frequencies. This exclusion covers *all* matrices and affine offsets in the declared family, even if each of the nine titled bodies has a wholly unrelated secret key. It is a more discriminating decision than checking a few guessed 2x2, 3x3 or 4x4 source tables.

The result does not cover word-local or page-local key rotation inside a body, a different matrix on each block, nonlinear secret substitutions before or after Hill mixing, variable-length coding, plaintext languages with intentionally unusual rune frequencies, or ciphers that change the original printed word boundaries. In the 81-rune p33 interlude, selecting a visually high-IoC linear projection from thousands of trials would be severe overfitting and cannot be promoted to recovered plaintext without an independent source-selected key and actual original decryption.

**Research consequence:** seek a source-specified evolving state, nonlinear inverse, authentic external key, or real plaintext bridge; do not revive a small static GP29 Hill matrix merely by tuning its unknown entries or the title phase. This scan is key-independent and already covers those degrees of freedom.
