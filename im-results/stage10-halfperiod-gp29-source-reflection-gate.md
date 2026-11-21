# The three original Stage10 magic squares have half-period reflection operators over GP29

**Agent43, 21 November 2026. Established exact source-matrix identity with a bounded original LP2 recipient negative.** The new algebra supplies three explicit, source-derived **reversible reflection operations**. Their simplest original-cipher consumers produce no plaintext. This finding extends the existing [matrix-order synthesis](lp1-p16-order56-pagepower-gate.md) and is distinct from that report's ordinary M, M⁻¹, page-power, block-power, and matrix-orbit tests.

## Human-visible independent clue

The authenticated 2014 Stage10 source supplies three printed integer magic squares, in order: **5×5 with sum3301**, **7×7 with sum1033**, **5×5 with sum1033**, in [original Stage10 source order](../resources/cicada2014-openpuff-magic-squares.txt). Every row and column of each sums to its printed magic constant, and all three matrices are **unchanged by 180-degree reversal of both row and column indices**.

Original LP2 physical p33 prints the two cuneiform decimals **1033** and **3301** together. These are exact **digit reversals**. The complete unknown LP2 release has **56** physical pages p0–55, including an original numeric-only p50. The immediately preceding solved LP1 p16 magic square is the source 3301 matrix; the following LP2 p0 has two 180-degree-matched cross illustrations. The concatenation of original p33 red and black material also gives independently constrained source-length choices: p33 has 214 runes with two red spans of lengths10 at [0,10) and8 at [91,99), leaving exactly **196 black runes = four 7×7 blocks**.

These are first-party images and numerical objects, rather than a cipher instruction. The 2014 square source does **not** say to exponentiate these matrices modulo29 or to transfer their resulting half-period actions to later LP2 pages. The next calculations freeze a mathematically elementary, no-extra-key candidate.

## Exact structural theorem (zero fitted parameters)

Let arithmetic be in **GF(29)**, the authentic GP29 rune-index field. Let \(R_n\) be the \(n×n\) **anti-diagonal reversal matrix**, \(U_n\) the \(n×n\) all-ones matrix, and \(I_n\) the identity. Let \(M_{3301,5}\), \(M_{1033,5}\) and \(M_{1033,7}\) be the three original printed squares reduced modulo29.

Their exact multiplicative orders are 56, 28 and 280, respectively (established earlier). **Their half-order powers satisfy the following stronger exact identities**:

\[
\boxed{M_{3301,5}^{28} = 12 U_5 - R_5}
\]

\[
\boxed{M_{1033,5}^{14} = -R_5}
\]

\[
\boxed{M_{1033,7}^{140} = R_7 + u v^\mathsf{T}}
\]

where the full, source-calculated vector factors modulo29 are

\[
u=(6,26,13,0,16,3,23)^\mathsf T,\quad
v=(1,8,26,0,3,21,28)^\mathsf T.
\]

Both \(u\) and \(v\) are **anti-palindromic**: \(R_7u=-u\), \(R_7v=-v\). Their inner product \(v^\mathsf Tu=2\) mod29. Therefore the third map is an exact **rank-one correction to reversal**. Its square is \(I_7\), as are the two five-dimensional maps. These formulas are independently confirmed by explicit finite-field exponentiation of all three exact printed matrices and assertion against every single matrix entry in the [reproducer](../sims/stage10_halfperiod_reflection_original_sft.cjs).

For a five-symbol vector \(x\), write \(\bar x=5^{-1}\sum x_i\) in GF29 (since \(5^{-1}=6\)). The 3301 operation is a compact **mean-centered reversal**:

\[
M_{3301,5}^{28}x=2\bar x\,\mathbf1-R_5x.
\]

Consequently **both five-dimensional source half-powers agree on every zero-sum five-rune vector**, where each is exactly \(-R_5x\). The source matrices differ by the rank-one term \(12U_5\) on other vectors. The seven-dimensional half-power likewise gives a reversible reflection in an original square's eigenspace, with no fitted matrix entries or selected plaintext.

This yields an unusually simple **actual reversible source-shaped operation** despite the original matrices appearing to be large numerical magic-square data. The exact structural fact is reproducible. The authors' intended use is still unproven.

## Two bounded original-cipher receiver tests

**A. p33’s four 7×7 black blocks.** Preserve the source-original red spans and remove only their exact 18 rune indices. The 196 black runes, from the two original intervals [10,91) and [99,214), are grouped in their original physical order as **four consecutive row-major 7×7 blocks**. Apply the source-fixed \(T=M_{1033,7}^{140}\) to each block from the left \(T C\), from the right \(C T\), or on both axes \(T C T\). All three are exact inverses of themselves; no alternative alphabets or key/phase sweeps.

| Original p33 black receiver | Exact 196-rune GP29 IoC | Native GP prose recovered? |
| --- | ---: | --- |
| Unmodified 196 black runes | 0.0335426478 | no |
| Left \(TC\) | 0.0351125065 | no |
| Right \(CT\) | 0.0349555207 | no |
| Both axes \(TCT\) | 0.0344322344 | no |

For comparison, genuine clear p57 GP29 prose has IoC≈0.06271. The source-fixed original p33 outputs remain near uniform and their first 20 GP runes are printed by the SFT. The **genuine 49-rune p57 native-GP clear source** is the positive test: encode it under the source involution, then decode under the same involution, and recover all 49 original runes. Thus the negative is specific to original p33 under this exact operation. Concatenating the separated black intervals is an *inferred* ink-channel choice, not a known instruction.

**B. The full manuscript’s 28-page reversal correspondence.** Because the 3301 source matrix has order56 and half-power28, its simplest document-level use would pair each source page \(p\) with \(p+28\) for \(p=0,\dots,27\), applying \(T=M_{3301,5}^{28}\) to five-symbol windows. This exact predeclared pairing was checked against unchanged original rune sequences, with no fitted phase or resynchronization:

- **925** complete five-rune printed-word pairs across those source-selected page pairs: **0** pairs obey \(w_{p+28}=Tw_p\).
- **5,555** same-local-rune-offset five-window comparisons across those original page pairs: **0** obey the relation.
- The p22↔p50 pair contributes no rune-bearing match because source p50 is a numeric table.

These are exclusions of **direct original ciphertext-to-ciphertext half-page copying** under the source matrix action, conditional on either of the two stated alignments. They do not imply that unrelated pages must contain the same plaintext or that a source-driven page permutation would preserve local coordinates.

## Decision

**Preserve the exact three-matrix half-period reflection family** as a more precise and source-visually motivated clue than matrix order alone. It gives a finite, reversible operation whose relationship to the original p33 1033↔3301 reversal and p0's half-turn illustrations is worth considering when independent source evidence names a receiver.

The clean original 7×7 black-only p33 test and the 28-paired-page five-symbol copying test are negative. Do not invent hidden offsets, square permutations, rewritten letters, or additional cipher stages to rescue them. A successor with a plausible path to plaintext needs **an independent original clue selecting where and why to apply one of these transformations** and then a new untouched original receiver with coherent plaintext or key material. None has been recovered by this run.

**Reproduction:** [Source-reading Node22 CommonJS SFT](../sims/stage10_halfperiod_reflection_original_sft.cjs), which asserts all 2014 source square rows/columns and 180-degree symmetry, all 3 exact matrix-order and half-turn identities, involution and rank-one vector algebra, the p33 original red/black decomposition, 196-rune output statistics, 28-page original pair census, and exact native-p57 positive regeneration. [Windows read-only CI run 44964030677](https://github.com/FlareZ123/liber-primus/actions/runs/44964030677), completed successfully.
