# Two signed-image dimension words as a complete Toeplitz11 key on the tree page

**13 November 2026, Agent29. Classification: original-source-constrained, complete reversible candidate with a negative original-rune result. No previously unknown LP2 plaintext, authenticated cipher, key, next instruction or destination recovered.**

## Source cue and one bounded cipher proposal

The genuine January 2016 signed tree image is **563×569 pixels**. It is visually linked to the dead-tree illustration on original LP2 physical **p32**, which contains **121 runes = 11×11**. The source-known p32 top-row/left-column prime sums independently reproduce the image dimensions; the existing evidence and its selection limitations are in [the p32 image study](lp2-tree121-signed2016-source-gate.md).

Independently, the only complete original printed word with prime sum **563** is **p0 word6**, 11 runes, and the only one with sum **569** is **p1 word33**, 10 runes. Their complete original spellings are \`ᚾᛖᚹᛒᚪᛋᛟᛇᛁᛝᚢ\` and \`ᛄᚠᛁᚾᛡᚳᚣᛠᛁᛡ\`. The earlier [word-sum census](lp2-2016-image-first-two-wordsum-gate.md) established the matches and emphasized their retrospective selection.

This source gives exactly **11+10=21 original rune symbols**, which is the number of independent entries in an **11×11 Toeplitz matrix**, a matrix with each northwest-to-southeast diagonal constant. The simplest candidate inverse is to take the width-associated 11-rune word as its **first row**, the height-associated 10-rune word as its **first column excluding the already defined top-left corner**, and apply this matrix to the 11×11 p32 original rune array in its printed row-major order. This uses neither fitted ciphertext statistics nor language-selected matrix entries. In particular, the ten-rune word fills the ten otherwise unknown first-column cells; the complete resulting column is **not** claimed to have a literal GP-prime sum569, since its upper corner comes from p0.

A publisher can reasonably construct this matrix and decrypt a Hill-style tableau. **Neither the signed 2016 message nor any currently known original 2014 instruction explicitly prescribes Toeplitz matrices, GF29 matrix multiplication, or an 11×11 inverse here.** The hypothesized operation is therefore an independently testable interpretation of a precise 21-symbol source shape, rather than a decoded author command. This test does not reuse the separate prior p32-as-key → p33 Hill inverse: the *key here is made from the two 563/569-identified words*, and the *ciphertext target here is p32 itself*.

## Fully specified original-input inverse

Read GP ordinal indices 0–28 and their ordinary GP prime weights directly from the canonical corpus. Freeze two literal ways to interpret the 21 key runes over GF(29):

- **Ordinal:** each rune's GP index.
- **Prime:** its GP prime weight reduced modulo29, respecting the prime-sum selection that located the words.

For either choice define \`T[i][j]=top[j−i]\` when \`j≥i\`, else \`T[i][j]=left[i−j]\`, indices 0–10; \`top\` is all 11 p0 symbols, and \`left\` is p0's initial symbol followed by the ten p1 symbols. **Both original keys are invertible over GF29**, with determinants **21** and **14**, respectively.

Reflow only the original 121 p32 runes as \`C\`, row-major 11×11. Apply three fixed elementary invertible actions: \`T⁻¹C\` (left), \`C(T⁻¹)ᵀ\` (right), or \`T⁻¹C(T⁻¹)ᵀ\` (two-sided). For completeness test the corresponding *forward* T actions as the opposite possible encryption direction. This is **2 source value systems × 3 multiplication placements × 2 directions = 12 total predeclared complete inverses**. No clock reset, phase, transcription repair, matrix-coordinate search, rune relabeling or English-crib fitting is performed.

| Original field-key choice | Matrix determinant | Left inverse | Right inverse | Two-sided inverse | Best among three forward actions |
| --- | ---: | ---: | ---: | ---: | ---: |
| GP ordinal | 21 | 0.03388430 | 0.03360882 | 0.03526171 | 0.03360882 |
| GP prime mod29 | 14 | 0.03650138 | 0.03360882 | **0.03732782** | 0.03429752 |

Table entries are original-p32 output GP29 indices of coincidence; the original ciphertext IoC is **0.03415978**. The full range over all twelve choices is **0.03002755–0.03732782**. The strongest output (prime coefficients, two-sided inverse) begins in canonical GP-rune transcription:

\`ᚢᚳᚳᛞᛞᚳᚢᛇᛇᚠᚫᛠᚷᛠᛇᚻᛚᛟᚹᛈᚩᛒᚦᛖᛁᛡᚦᛞᛟᛖ\`

It contains no recognizable GP-native plaintext. The authentic p57 clear GP register, repeated only enough to fill a comparable 121-cell positive control, has IoC **0.06528926**.

**Reconstruction controls:** The fixed input includes all **121** original p32 runes, not a fitted partial segment. Each of the twelve outputs **exactly re-enciphers 121/121** original input runes. Each of the twelve independent cipher implants of the corresponding 121 native p57 GP symbols **fully deciphers 121/121** of the original clear source. Every matrix's inverse is separately proven by exact GF29 identity multiplication. All of these assertions passed under Node22 in [manual CI run43475955114](https://github.com/FlareZ123/liber-primus/actions/runs/43475955114), including the separate p32/p33 regressions in the existing workflow. [Source-reading, matrix, twelve original tests and native control single-file reproducer](../sims/lp2_2016_dimension_wordpair_toeplitz11_sft.cjs).

## Research consequence

The 21-source-symbol / 11×11 matrix fit is exact and offers an economical human-testable bridge from the signed 2016 image through original pp0, p1 and p32. **Its direct complete GF29 Toeplitz-Hill interpretation fails to recover linguistic plaintext on the image-selected target.** Matrix inversion and roundtrips alone establish only that the hypothetical mechanism is mathematically well defined. The test does not rule out actual hidden instructions in those source words, encrypted intermediate registers, non-Toeplitz operations or other separately selected reading paths.

Further work on the same three artifacts requires a **new author-attributable rule for reading the two word shapes or traversing the p32 grid**, and a prediction that survives a previously untouched ciphertext segment. Do not optimize secret matrix entries, row/column permutations or GP alphabet labels after the negative original output.

**Location and reproduction:** [SFT](../sims/lp2_2016_dimension_wordpair_toeplitz11_sft.cjs) · [existing reused manual test workflow](../.github/workflows/lp2-p32-p33-11square-hill-manual.yml) · [passing source-original run](https://github.com/FlareZ123/liber-primus/actions/runs/43475955114).
