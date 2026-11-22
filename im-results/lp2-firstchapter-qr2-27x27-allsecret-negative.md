# Original LP2 729-rune opening: QR version-2 all-binary-key gate

**Agent7, 22 November 2026. Classification:** independent, original-cipher negative for the fully specified direct QR code interpretation of the p0–p2 first-chapter square. No plaintext, key or original QR payload recovered. This covers a different historical barcode family from the earlier compact Aztec 27×27 finder exclusion.

## Why this is a clue-constrained experiment

Original LP2 physical pages p0, p1 and p2 contain **262+266+201 = 729** ciphertext runes, exactly a **27×27** square in source reading order. Earlier Cicada 2012 rounds used QR codes, so a binary 2D code is historically plausible. **QR version 2** has a **25×25** module matrix; placing it in a 27×27 rune square would allow a one-module margin on each side. The actual QR standard uses a larger quiet zone, and no Cicada-authored clue says to interpret these 729 runes as QR bits. Accordingly this is a bounded probe, not an inferred intended operation.

The version-2 *mandatory* module template is independently fixed by the pre-existing open-source [ZXing encoder MatrixUtil.java](https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/MatrixUtil.java), whose copyright begins in 2008. It contains exactly:

| Module class | Known bit positions |
| --- | ---: |
| Three 7×7 finder squares | 147 |
| Three L-shaped white finder separators | 45 |
| Timing row and column | 18 |
| Bottom-right 5×5 alignment pattern | 25 |
| Fixed dark bit at version-2 coordinate (17,8) | 1 |
| **Total compulsory image bits** | **236** |

The *variable* format information, QR error-correction level, payload/data-masking pattern, data symbols, and white quiet zone are **not** required by this test. Omitting all those checks deliberately grants the proposed decoding more latitude.

## Exact original test and outcome

Input: the unchanged first 729 original GP29 rune indices from source pp0–2, in canonical order. Arrange in a 27×27 square; try every one of the nine 25×25 crops with top-left source coordinate in {0,1,2}². For every crop try all eight rotations/reflections of a 25×25 image, **72 configurations total**.

Allow *any static binary mapping* of all 29 original rune values to black or white, i.e., all possible **2²⁹** choices, without enumeration. Every original rune symbol occurring at required QR cells imposes black and/or white demands. Its irreducible error count is the smaller of those two counts; summing over symbols gives the **exact global optimum** for the entire 2²⁹ key family.

- Best of72: top-left crop **(row0,column1)**, reflected, rotated180°, **79 contradictions across 236 compulsory pixels**, involving28 original rune values that require both colors.
- Next best: (0,1), unreflected rotation270°, 80 compulsory contradictions.
- Worst of72: **95 compulsory contradictions**.
- No configuration has zero errors. Even the best has **79/236** module errors before testing any of the variable QR-code content.

The detector is capable of recognizing a genuine static rune-to-binary encoding when its required modules are present. In an exact positive control, implant the whole QR-v2 fixed template into a 27×27 rune tape using two different GP symbols for dark/light. The same test returns **0 compulsory errors**. Flip one dark finder rune to the light symbol and the result becomes **exactly1**. These controls do not use language scoring or arbitrary plaintext.

**Reproducer:** [original source read-only Windows Node22 SFT](../sims/lp2_firstchapter_qrv2_27square_allsecret_original_sft.cjs). [Successful Windows execution](https://github.com/FlareZ123/liber-primus/actions/runs/44980471791). The code asserts unchanged source page counts, all 236 compulsory QR2 template bits, 72 configurations, the optimum79 and both planted controls.

## Decision and limits

A **direct QR version-2 code in the p0–p2 27² runes, under any single static rune→bit alphabet**, is impossible under all nine natural 25×25 crops and eight symmetries. A visually recognizable direct QR destination cannot be hidden by simply choosing a clever GP29 parity, character property or secret black/white subset: these are all included in the exhaustive minimum-error bound.

The result does **not** rule out a position-dependent cipher, bitstream encryption, arbitrary 729-cell permutation, nonstandard QR code, another barcode type, different page grouping, or use of multiple bits per rune. Such extensions need their own independent original clue because they dispense with QR's source-frozen visible finder test. The [previous four-layer compact Aztec fixed-finder exclusion](lp2-firstchapter-aztec27-fixedfinder-gate.md) remains independent; there is no reason to repeat either family with new unconstrained rune-bit alphabets.

**Research consequence:** no first-chapter QR plaintext or authentic key; retire fixed-alphabet direct QR2 27-square hypothesis. Prefer experiments whose original clue selects an actual decoder/key and that can recover a complete unknown page without fitting the original text.
