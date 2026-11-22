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

## Authenticated historical book-code crib after arbitrary 16-word permutations

The failure of a single p15 spiral does not rule out a different local word ordering. To test a stronger **key-free necessary condition for literal plaintext reuse**, compare each original 16-word block by the **sorted multiset of its 16 GP word lengths** against every contiguous 16-word window in independently creator-selected historical sources. This preserves a possible arbitrary secret permutation of the words inside each block, without assuming the printed p15 spiral is the actual key. A contiguous quotation spanning **32 words** and aligned at an original 16-word block boundary would necessarily produce **two matching bags at source offsets separated by exactly 16**, regardless of the hidden within-block word permutation.

The previously archived 2013 Book of the Law chapters I–III were selected by a signed Cicada book code, and the 2012 Blake Marriage of Heaven and Hell clipping by another earlier signed book code. Exact source texts and GP multigraph counts are shared with [the original wordlength-crib study](lp2-wordlength-public-source-matching.md). A new source-bag gate in the same [SFT](../sims/lp2_p15_spiral_181word_transposition_sft.cjs) scans every possible source start against all 181 untouched original 16-word blocks.

| Independently selected source | GP source words | Exact single 16-word bag matches | Consecutive 32-word bag matches |
| --- | ---: | ---: | ---: |
| 2013 Book of the Law I | 1,897 | 1 | **0** |
| 2013 Book of the Law II | 1,968 | 1 | **0** |
| 2013 Book of the Law III | 2,002 | 3 | **0** |
| 2012 Blake clipping | 120 | 0 | **0** |
| Total | **5,987** | **5** | **0** |

The single matches are isolated: Book I original block 1 / source word 1,029; Book II block 135 / word 1,215; Book III blocks 55/1,220, 66/1,274, and 107/433. An independent positive plants two adjacent 16-word windows from Book II at source word 100, reverses each block, and the unchanged unordered detector recovers the planted 32-word source offset **exactly**. Therefore a contiguous author-source quotation extending at least 32 aligned words is absent under the stated word-preserving, within-block-permutation hypothesis, even though every possible permutation inside each block is allowed.

This is a finite comparison with two historically chosen literary sources, not a proof that arbitrary other books, edited text, noncontiguous quotes or unaligned 16-word fragments are absent. In particular, the two historically selected texts were used as previous *book-code sources* and are not authenticated LP2 plaintext. The 16-word alignment is inferred from p15 and the 2,896-word divisor; it is not independently prescribed.

## Independent 2013 prime-gap Josephus schedule across 181 word slots (Agent13, 14 November 2026)

A **separate, source-prime elimination schedule** was tested after the fixed 16-number p15 spiral above. The preserved 2013 Cicada telnet PRIMES response omits exactly **180 ordinary primes at one-based ordinals 21–200 (73 through 1223)**; independently, the original LP2 pp0–55 ciphertext contains **2,896 complete words = 16×181**, after preserving the 32 words continued over a printed page. The genuine 4×4 p15 numerical spiral gives a source-visible reason to examine a 16×181 rectangle. A human might eliminate 180 of 181 slots using the 180 conspicuous historical numbers, retaining one survivor. This **cross-round handoff is unproven**: no authorial source instructs a 2013-to-LP2 Josephus cipher or assigns the words to slots.

Take an initial 181-slot circle numbered 0..180 and consume the 180 omitted primes in increasing order. Count the current slot as one, eliminate the p-th remaining slot at prime step p, and continue with the next survivor. The **source-fixed permutation** begins [72,151,53,143,61,165,90,19,132,70,23,162], has 181 distinct positions, and ends with sole survivor 2. Apply it to the original whole-word rectangles **16×181** or **181×16**, as a row-local permutation or as the column coordinate in a row/column transposition. Both reading directions are tested, eight original-cipher candidates altogether. No rune identity, printed word length, source prime order or cryptographic key is fitted.

Measure whole-book adjacent GP word-length mutual information with lengths capped at 9+, directly on 2,896 actual printed source words. The unchanged original value is **0.012299693 nats**. Eight source-frozen outcomes are:

| Whole-word reading | Forward MI | Inverse MI |
| --- | ---: | ---: |
| Each of 16 rows, 181-slot prime Josephus | 0.007972281 | 0.011821514 |
| 16×181 transposed using Josephus column order | 0.008253915 | 0.007401578 |
| Each of 181 rows, Josephus row order | 0.012174123 | **0.012523084** |
| 181×16 transposed using Josephus row order | 0.007243932 | 0.009998603 |

No inverse restores native-prose word-order signal. A separately sourced GP-contracted 2,896-word Gibran control has adjacent-length MI **0.050301940**. The exact source-fixed forward operation followed by the paired inverse reconstructs **all 2,896 control word lengths** and the original native MI under all eight readouts; this checks invertibility, not historical correctness. The best original inverse only reaches **0.012523084**, barely above unchanged.

**Decision:** this prime-gap Josephus construction does **not** reveal ordinary GP-source English word order or unknown-page plaintext. The separately studied 180/76 telnet-list-and-table correspondence is already documented [in the original 2013 terminal synthesis](2013-telnet-missing-primes-terminal-180-76.md) and is **not** claimed as a new discovery. This negative leaves different language registers and independently author-selected clocks open. Do not add fitted starts, reordered prime schedules or extra cipher layers to rescue this failed inverse.

[Read-only, Windows-compatible CommonJS source reproducer](../sims/lp2_2013_gap180_josephus_181word_inverse_sft.cjs) asserts the original inventory, source primes, permutation, all eight original scores, and each native positive inverse. This is distinct from the earlier **16-number p15 spiral test** and **fixed-step Josephus word test**.

## Decision

The source arithmetic **2,896 = 16×181** is exact, and the p15 16-position spiral is authentic. Under the proposed coupling these eight complete original-cipher word-reordering operations do not recover native-GP prose adjacency; no unknown plaintext or key follows. Do not treat the 181 association as historically selected or enlarge the scan with unconstrained starts, offsets, orientation choices or additional numeral-cipher layers.

The exclusion is conditional on original printed boundaries corresponding to plaintext words and native-like GP word-length dependencies. It leaves arbitrary encoded plaintext, modified segmentation, padding, keyed transpositions, and as-yet-unidentified source operators open. A successor should require independent evidence fixing a distinct reversible operation and a testable withheld original-cipher plaintext consequence.

**Standalone reproduction:** execute the Node 22 CommonJS program at sims/lp2_p15_spiral_181word_transposition_sft.cjs from the repository root. No automatic CI trigger is needed.
