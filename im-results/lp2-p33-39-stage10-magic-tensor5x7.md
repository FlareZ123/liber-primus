# LP2 p33–39: exact two-matrix 5×7 Stage10 inverse

**Director #570, 12 November 2026. Result: negative original-cipher test.** Both source-frozen, fully reversible two-matrix inverses on the original 1,680-rune pp33–39 chapter give random-like GP29 plaintext. Neither reveals a coherent passage or independently recognizable key/object. The test is complete for the two specified original-orientation candidates.

## Independent source evidence

- Original p33 visibly carries **1033 and 3301**. Earlier authenticated 2014 Stage10 materials supply exactly two original 5×5 numerical magic squares with row sums 3301 and 1033, and one 7×7 square with row sum 1033. Their original integer entries are preserved in [the source matrix file](../resources/cicada2014-openpuff-magic-squares.txt).
- The printed, source-visible pp33–39 chapter contains **1,680** GP29 runes, or **48 full groups of 35**. An independently marked 91-rune p33 introduction is included because excluding it would leave 1,589 runes, which does not divide into complete 5×7 groups.
- Director #561 [tested the independent single-matrix 5- and 7-rune Hill inverse](lp2-stage10-original-gf29-magic-square-inverse.md). This experiment tests a distinct row/column separable operator. The two-stage source did not issue an explicit Hill or tensor instruction, so this remains a plausible but provisional human solve-path hypothesis.

## Frozen inverse and full result

Take consecutive original runes in printed order as five rows of seven symbols, C. The row operator A is one of the two authenticated 5×5 squares; the column operator B is the authenticated 7×7 square. Use ordinary GF29 modular arithmetic:

[
C=A P B^T,qquad P=A^{-1}C(B^{-1})^T pmod{29}.
]

No keys, phases, alphabet fitting, hidden padding, skipped F, alternate axis assignments or partial-block selection were searched.

| Authenticated A | Authenticated B | 35-rune blocks | Original-input GP29 IoC | Exact original re-encryption |
| --- | --- | ---: | ---: | ---: |
| 5×5 / 3301 | 7×7 / 1033 | 48 | 0.0344919028 | 1,680 / 1,680 |
| 5×5 / 1033 | 7×7 / 1033 | 48 | 0.0343430046 | 1,680 / 1,680 |

The original ciphertext has IoC **0.0343600216**. Both outputs remain almost uniformly distributed. Their exact first 90 GP transliterations are emitted by the test, and neither contains native GP-English text. The entire decoded stream remains accessible by calling the deterministic transformation over the same pinned inputs.

The Gauss–Jordan matrix inversions have independently established determinants modulo29 of **10, 2 and 3** for the original 5×5 / 3301, 7×7 / 1033 and 5×5 / 1033 squares. Every 35-rune block was re-encrypted to recover all original symbols, thereby ruling out a software inversion artefact.

**Source-native positive control:** the solved p57 GP rune record supplies a frozen 70-rune known-plaintext plant (two 35-rune groups). Each authentic pair encrypts that sample, and its exact inverse recovers **70 / 70**. Substituting the other authentic 5×5 square as wrong key recovers only **3 / 70** or **6 / 70**, respectively. No plaintext or key has been fitted to original p33–39 output.

**Reproducibility:** [standalone CommonJS SFT](../sims/lp2_p33_39_magic_tensor5x7_source_sft.cjs), [original corpus](../resources/liber-primus/lp2-corpus.json), [authentic matrices](../resources/cicada2014-openpuff-magic-squares.txt), [passing complete original-input GitHub Actions run 43166845267](https://github.com/FlareZ123/liber-primus/actions/runs/43166845267).

**Decision:** Retire the two exact full-chapter printed-order GF29 tensor models. A different matrix orientation, page reset or alternate symbol encoding requires a genuinely independent clue. The source still lacks a prescribed map from Stage10 magic-square arithmetic to the original LP2 cipher.
