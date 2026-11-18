# Zero-F moving-exception specificity controls

**Director task:** #1524  
**Classification:** structural specificity result, not a plaintext recovery.

The exact frozen transform from #1422 was applied unchanged to four predeclared control classes using only the same outputs already used by that branch: page-local adjacent-equal count/rate, within-word lag-five return count/rate, and transform edit count/rate. No language score entered this decision.

## Fixed target

On all 12,956 unknown LP2 p0-p55 runes the frozen inverse changes **549** runes (**0.0423742**) and moves:

- adjacent equals: **86 / 12,901 = 0.00666615** → **478 / 12,901 = 0.03705139**, delta **+392 / +0.03038524**;
- within-word lag-five returns: **104 / 2,105 = 0.04940618** → **99 / 2,105 = 0.04703088**, delta **-5 / -0.00237530**.

This reproduces #1422 exactly.

## Source-shaped iid GP29 controls

**512** deterministic iid GP29 streams were generated at the exact p0-p55 length with the exact original 55 nonempty page lengths and 2,896 printed word lengths. Under the same transform:

| output | control range | control median | LP2 target |
|---|---:|---:|---:|
| adjacent-count delta | **-87…+78** | -1 | **+392** |
| adjacent-rate delta | **-0.006744…+0.006046** | -0.0000775 | **+0.0303852** |
| lag5-count delta | -13…+12 | 0 | -5 |
| edit count | **785…966** | 864 | **549** |
| edit rate | **0.060590…0.074560** | 0.066687 | **0.042374** |

Zero of 512 controls reached the target adjacent-count increase, and zero reached the predeclared joint condition of at least the target adjacent increase while also moving lag5 at least as far in the target's negative direction. The lag5 change alone is ordinary: 73/512 controls were at or below -5. The specificity is therefore carried by the very large repeat restoration occurring with unusually few edits.

## Authentic solved Cicada ciphertext controls

The same global zero-F rule was applied from phase zero to original solved LP1 ciphertext, preserving source page and word boundaries.

### LP1 p1, authentic Atbash ciphertext

184 runes:

- adjacent: **5/183 → 6/183**; known plaintext is **5/183**;
- lag5: **2/18 → 2/18**; known plaintext is **2/18**;
- edits: **10/184 = 0.054348**.

This does not normalize the solved cipher toward its known plaintext.

### LP1 p3-p4, authentic period-8 Vigenere ciphertext

515 runes:

- adjacent: **16/513 = 0.0311891 → 29/513 = 0.0565302**; known plaintext is **20/513 = 0.0389864**;
- lag5: **3/66 = 0.0454545 → 4/66 = 0.0606061**; known plaintext is **6/66 = 0.0909091**;
- edits: **41/515 = 0.079612**.

Lag5 moves somewhat toward the known plaintext, while adjacency overshoots substantially away from it. This is not a joint normalization and its edit rate is nearly twice the LP2 target's.

## Planted surface-wrapper positive

A deterministic native-GP Shakespeare stream was sampled with the **exact LP2 word-length and page-length layout**, encrypted by the frozen zero-F wrapper, then inverted.

- native adjacent: **423/12,901 = 0.0327882**;
- wrapped adjacent: **167/12,901 = 0.0129447**;
- exact unwrapped adjacent: **423/12,901**;
- native lag5: **127/2,105 = 0.0603325**;
- wrapped lag5: **123/2,105 = 0.0584323**;
- exact unwrapped lag5: **127/2,105**;
- wrapper edits: **582**;
- exact rune recovery: **12,956/12,956**.

The harness therefore has power to recognize a genuine instance of the proposed surface wrapper.

## Decision

**PASS the #1524 specificity gate.** The p0-p55 adjacent-repeat restoration is not a routine effect of applying the transform to matched random GP29 text, and the transform does not jointly normalize the tested authentic solved LP1 ciphertexts toward their known plaintext structures. The target is additionally unusual in producing its much larger adjacent restoration with fewer edits than every random control.

This keeps the frozen zero-F moving-exception mechanism alive as a **structural** hypothesis. The obvious independently keyed refinement allowed by #1524 has now been tested: after the frozen zero-F inverse, the authenticated LP1 period-8 `DIVINITY` key at global phase0 scores **−4.09904 nats/rune** when every rune consumes key and **−4.11492** under generalized literal-F handling, versus **−4.09941** for zero-F alone, **−4.09120** for untouched ciphertext, and **−2.44811** for clear solved p57 under the same source-native GP trigram model. A composed 95-rune p57 plant round-trips exactly. This historical inner key therefore fails to convert the structural effect into language, and further inner-layer stacking now requires new independent source evidence. #1422's direct inverse remains nonlinguistic, its lag5 movement is not itself exceptional, and the same global rule conflicts with solved p56. No unknown plaintext or authentic key is recovered here. [Inner-key gate](lp2-zeroF-divinity-innerkey-gate.md) · [SFT](../sims/lp2_zeroF_divinity_innerkey_sft.cjs).

## Reproduction

- SFT: `sims/lp2_zeroF_specificity_controls_sft.cjs`
- Manual workflow: `.github/workflows/agent5-zeroF-specificity-manual.yml`
- Successful run: https://github.com/FlareZ123/liber-primus/actions/runs/44391387157

The two earlier workflow attempts failed before producing scientific output, first on a harness string-escaping syntax error and then on wrapped-word newline preservation; both defects were corrected without altering the frozen transform or decision outputs.
