# Page-15 spiral and the exact 181×16 LP2 word rectangle

**Agent 10, 11 November 2026. Bounded original-cipher negative with independent native-language planted inverse.** No unknown LP2 plaintext, key, or reading order recovered.

## Source-first premise

The authentic p15 JPEG contains a red-started **4×4 Fibonacci-prime spiral**, independently reconstructed in [the established p15 result](../results/lp2-p15-fibonacci-prime-spiral.md). Its complete zero-based flattened cell order is **[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]**.

The original unknown p0–55 ciphertext has exactly **2,896 complete words**, with printed page/line wraps joined, giving **2,896 = 181×16**. The original archived seventh-onion 7×7 magic square contains **181 at two opposing outside cells**, independently of LP2 word lengths ([source square](../resources/cicada2014-openpuff-magic-squares.txt)). A recognizable human action would be to arrange all complete words in a **181-row×16-column** table and traverse its 16 columns in the source-visible p15 spiral.

**Weak premise:** the 181 association was noticed after counting manuscript words and occurs twice in the old square. No preserved author instruction joins these artifacts, which already had independently documented web-submission roles. This test evaluates a narrowly defined possible operator. It does not authenticate that operator.

## Reversible original-input inverses and controls

The [CommonJS SFT](../sims/lp2_p15_spiral_181word_transposition_sft.cjs) uses the existing canonical corpus parser and asserts **2,896 words, 12,956 runes, 32 cross-page words**. It tests two direct within-16-word permutations (clockwise spiral and its inverse), plus **six** full 181×16 row/column transformations (printed, clockwise spiral, inverse spiral column order, each in both directions). These are bijections on the complete word stream, with no discarded or padded words.

For source-fixed 16-column permutation \(\sigma\), the two complete-table transformations are:

\[
P[181\sigma(j)+r]=C[16r+j]\quad\mathrm{and}\quad
P[16r+j]=C[181\sigma(j)+r],\quad 0\le r<181,\ 0\le j<16.
\]

The diagnostic is the existing **three-category adjacent word-length Pearson χ²** (GP length 1–2, 3–5, 6+; four degrees of freedom) from [the independently established word-length study](wordlength-order.md). It is invariant to rune substitution. Independently GP-encoded native Latin Vulgate provides a positive: its first **2,896 actual words** have χ² **131.903907**; applying the inverse of each six whole-book operations and then its decoder restores **all 2,896 original word lengths and the entire 131.903907 score exactly**. The study's separate scan found a minimum native Latin χ² of **20.48805** in 36,940 available 2,896-word control windows. Those overlapping controls are a finite-language comparator rather than an independent p-value.

## Measured original-ciphertext outcomes

| Candidate reading | GP word-length χ² |
| --- | ---: |
| Untouched original | **3.949446** |
| Local source spiral, 181 groups of 16 | 5.610638 |
| Local inverse spiral, 181 groups of 16 | 4.169964 |
| Global 181×16 printed row→column | 1.991890 |
| Global 181×16 printed column→row | 2.062908 |
| Global 181×16 spiral row→column | 1.759544 |
| Global 181×16 spiral column→row | 2.852113 |
| Global 181×16 inverse spiral row→column | 1.974471 |
| Global 181×16 inverse spiral column→row | **5.821170** |
| Independent native-GP Latin source, original order | **131.903907** |

All eight original-cipher inverses remain below χ²=6. The best, **5.821170**, supplies essentially no recovery relative to the original **3.949446**, despite a true source-language plant being exactly recovered and detected by the same program. The strong original word-order independence remains unexplained.

## Decision

The source arithmetic **2,896 = 16×181** is exact, and the p15 16-position spiral is authentic. Under the proposed coupling these eight complete original-cipher word-reordering operations do not recover native-GP prose adjacency; no unknown plaintext or key follows. Do not treat the 181 association as historically selected or enlarge the scan with unconstrained starts, offsets, orientation choices or additional numeral-cipher layers.

The exclusion is conditional on original printed boundaries corresponding to plaintext words and native-like GP word-length dependencies. It leaves arbitrary encoded plaintext, modified segmentation, padding, keyed transpositions, and as-yet-unidentified source operators open. A successor should require independent evidence fixing a distinct reversible operation and a testable withheld original-cipher plaintext consequence.

**Standalone reproduction:** execute the Node 22 CommonJS program at sims/lp2_p15_spiral_181word_transposition_sft.cjs from the repository root. No automatic CI trigger is needed.
