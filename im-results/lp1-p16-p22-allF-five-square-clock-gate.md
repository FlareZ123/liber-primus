# Conditional p22 literal-F clock: 125 of 131 runes across five LP1 p16 squares

**Status:** exact numerical clock within a conditional p16-source hypothesis and finite original-cipher negative. The two-art parent sets actually intersect at {15,16}; p16 is not uniquely source-selected. No unknown Liber Primus plaintext, recovered key or destination.

Original LP2 p22 (archive 39.jpg) carries the horizontal mirror of the reclining illustration appearing on solved LP1 pp14–16. An independently copied LP2 p2 insect occurs on solved LP1 pp1,9,13,15,16, including 90-degree turns on pp1 and 15. Its parent-set intersection with the reclining figure is **{15,16}**, leaving the 5×5/3301 square on p16 as an unselected *candidate* source. Reproduction and source caveats: [original JPEG census](lp1-lp2-crossrelease-artwork-raster-copies.md). A conditional p16-based operation would be a page-local 25-key additive GP29 pad from this 25-cell square. A **new exact length condition** makes a literal-F clock particularly affordable:

- LP2 p22 has **131 original runes**, including **six F (GP29 index0)** at exact zero-based original offsets **13, 51, 55, 119, 124, 128**.
- The authenticated solved-p56 cipher permits a literal F that leaves its prime/totient key clock stationary. Under the deliberately stronger, explicit hypothesis that **all six p22 ciphertext Fs** are such literal/unkeyed characters, p22 consumes **131−6=125=5×25** symbols: **five complete passes** through the original LP1 p16 source square.
- This particular skip mask is completely fixed by the original runes. Whether all six Fs were intended as nonconsuming literals, and whether the page-end art selects a key for p22, remain hypotheses. The arithmetic equality alone is insufficient evidence of a true shared encryption method.

## Fixed direct original inverse

The 25 source p16 cells are the published numeric square:

```text
434  1311  312  278  966
204   812  934  280 1071
626   620  809  620  626
1071  280  934  812  204
966   278  312 1311  434
```

Two non-fitted numerical key representations are `cell mod29` and `Euler phi(cell) mod29` (LP1 p05 explicitly names totient), both read **row-major** from the original square. Decode each non-F ciphertext position as `P=C±K[j mod25] mod29`, incrementing `j` only on non-F ciphertext; print every F literally as F. No key phase, start offset, F-mask choice or alphabet permutation is optimized. Both signs are tested. Each source-cipher candidate has an exact original forward reconstruction using the *source-ciphertext F mask*. A planted native-GP text positive control respects that mask, avoids accidental ciphertext F at consuming positions and recovers all 125 payload runes.

| Original p22 131-rune stream | GP29 index of coincidence | Source-original decipherment outcome |
| --- | ---: | --- |
| Unaltered ciphertext | **0.03581914** | encrypted rune stream |
| Raw 25-cell row-major, `C−K` | **0.03863770** | nonlinguistic opening `OEPBETHCCYEOLXFFFLBPHEOUPTHBSCC` |
| Raw row-major, `C+K` | **0.03640634** | nonlinguistic opening `LAEODLWCNNGTMOEDFPOENBAUSLOEUB` |
| Phi(cell) row-major, `C−K` | **0.03617146** | nonlinguistic opening `SIUPHFBUOEOENOUFDEOSETPHHEOEA` |
| Phi(cell) row-major, `C+K` | **0.03746330** | nonlinguistic opening `IAEAMEAXEOOECJXAMOEFIIAWWLELX` |

The 131-run outputs remain close to the near-uniform 1/29 cipher expectation, with no credible plaintext words across the complete printed p22 ciphertext. Short length alone does not rule out other registers. The exact positive controls show the failure is not simply a missing six-F clock implementation.

**Reproducer:** [source-locked single-file CommonJS test](../sims/lp1_p16_p22_allF_5x5_key_sft.cjs). Its complete original data, exact source F offsets, source square, both pad interpretations, both signs and planted positive controls are asserted. [GitHub Actions run 43142153445](https://github.com/FlareZ123/liber-primus/actions/runs/43142153445) **completed successfully** on Node22, including this exact SFT and the companion two-art and 2×2 corner-Hill regressions. The first CI attempt exposed an incorrect reverse-test assumption: candidate plaintext may itself contain F at a consuming position. The corrected implementation preserves the mask from the **original ciphertext**, as required by the mechanism. The cipher conclusion does not depend on that implementation correction.

**Decision:** preserve the first source-fixed 125-of-131 clock as a specific *potential* intended route, but retire the four direct row-major GP29 inverse settings as plaintext candidates. The authentic solver first needs a source cue selecting p16 over p15 and then an independently selected use of the 25 numbers or a different cipher layer before claiming the p16 artifact unlocks p22.
