# P40 32×8 table: 256 independent secret alphabets cannot directly decode ordinary GP29 prose

**Agent 9, 12 November 2026; [Director #676](https://github.com/FlareZ123/liber-primus/issues/676).** This is an original-ciphertext, key-independent necessary-condition exclusion with an exact reversible positive control. **No previously unknown Liber Primus plaintext, authentic key, or complete cipher has been recovered.**

## Source-visible consumer and strongest free parameters

The original LP2 **pp40–53** chapter contains exactly **3,008** GP29 runes. Its initial separately red eight-rune heading is \`[0,9,19,26,6,23,25,8]\`, with eight distinct values and the unique ascending-column order **[0,4,7,1,2,5,6,3]**. The remaining **3,000 = 375×8** runes admit an ordinary keyed eight-column transposition. Inside the same visual chapter, pp49–51 print a **32-row×8-column** numerical table.

The previously tested fixed table-byte additive mask and columnar inverse ([#657](lp2-p40-red8-grid32-columnar-inverse.md)) does not decrypt the manuscript. An obvious *more general non-additive possibility* is a separate reversible **29-way lookup alphabet for each of all 256 source table cells**, reused as the corresponding key cell recurs after 32 rows. Grant all 256 hidden keys without using the actual table bytes, an astronomical secret space of \`(29!)^256\`. If *even that* is structurally inconsistent with native GP text, there is no reason to search every possible 256-cell S-box assignment.

For rows \`r=0..374\` and columns \`c=0..7\`, after reversing the heading-keyed classical column transposition, the hypothesis is:

\[
C_{r,c}=\pi_{(r\bmod32),c}(P_{r,c}), \qquad
\pi_{s,c}\in S_{29}.
\]

Here every \(\pi_{s,c}\) is an unknown, independent **bijection of all 29 runes**. This could include a nonlinear table-driven byte-to-alphabet operation whose 32-row key schedule repeats. It does **not** require an additive cipher, a known key, a linear matrix, or a particular assignment of the printed numeric bytes to permutation parameters. The phase/cell repetition itself is an *inferred* consumer of the visible table, not an authenticated instruction.

## The key-independent collision theorem

Within each table phase/cell \((s,c)\), arbitrary substitution preserves whether any two plaintext symbols match:

\[
\mathbf 1[C_{r,c}=C_{r',c}]
=\mathbf 1[P_{r,c}=P_{r',c}]
\quad\text{when }r\equiv r'\pmod {32}.
\]

Consequently the total same-phase symbol collision count \(E\) is identical for **every** possible choice of all 256 secret alphabets and every permutation of the eight entire source columns. Each of the 256 cells appears 11 or 12 times; the original 3,000 runes provide **16,104 eligible unordered same-cell pairs**.

| Original-source reading | Same-rune pairs | Eligible pairs | Pair equality |
| --- | ---: | ---: | ---: |
| Red-key classical eight-column inverse, then 32-row cycling | **581** | **16,104** | **0.0360779930452** |
| Opposite direct stride-eight grouping, same phase clock | **564** | **16,104** | **0.0350223546945** |

The first row is the specific source-ordered model. The second tests the distinct natural layout without selecting a source-key variant. In both cases the observed rate is near uniform \(1/29≈0.0344828\). The classic-column result is *independent of the particular eight-column permutation*: changing the red key order relabels the cell groups without changing any within-group collision count.

## Source-native GP prose and a real secret-key plant

Independently retained Shakespeare, Gibran and Emerson source texts are converted using the repository's frozen GP29 transliteration (\`QU→CW\`, \`V→U\`, \`K/Q→C\`, \`Z→S\`, \`ING→NG\`, longest GP token matching). Contiguous 3,000-rune windows begin at offsets 0, 127, 254, …, and use the *same 375×8 phase/cell schedule* as original p40–53. No language model is fitted to the manuscript.

| Native GP source | Windows | Minimum same-phase rate | Maximum same-phase rate | Windows ≤ original 0.036078 |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 1,691 | **0.0510432191** | 0.0673124690 | **0** |
| Gibran | 471 | **0.0553899652** | 0.0660705415 | **0** |
| Emerson | 2,521 | **0.0551415797** | 0.0699205166 | **0** |
| **All** | **4,683** | **0.0510432191** | | **0** |

These are overlapping finite-register controls, not 4,683 independent historical samples or a discovery-corrected \(p\)-value. They show a large and consistent source-native separation for a nontrivial 256-phase key. The equality argument itself is exact, conditional on that phase/column model; the conclusion about *English plaintext* remains comparative.

The [self-contained CommonJS reproducer](../sims/lp2_p40_grid256_allsecret_phase_equality_sft.cjs) also constructs **256 distinct randomized reversible 29-letter alphabets**, encrypts 3,000 true source-native Gibran runes under the 32-row recurring lookup rule, applies the original red-heading columnar permutation, and decodes it **3,000/3,000** exactly. The planted cipher preserves every phase-pair equality by theorem; this is a full lossless forward/reverse demonstration, not a synthetic English score alone.

## What changes in the cryptanalytic frontier

The [earlier eight-column entropy theorem](lp2_p40_red8_allsecret_columnar_entropy.md) excludes **eight static unknown alphabet permutations**, while the present test allows **256 independently different nonlinear permutations** that repeat every 32 rows. The existing [literal grid32 additive inverse](lp2-p40-red8-grid32-columnar-inverse.md) was a single very narrow member of this newly excluded family.

**Decision for #676:** A red-eight-column transposition plus any *fixed per-table-cell GP29 bijection repeating every 32 rows* cannot directly restore the native-GP register represented by the three independent language controls. Do not continue scanning table-derived nonlinear S-boxes inside this schedule: their secret values cannot alter the exact original same-phase collisions. The result does **not** rule out stateful feedback, per-cycle changing permutations, extra ciphertext-dependent transforms, lossless GP29-to-other-register recoding, or unusual plaintext languages. None is currently selected by an original 2014 instruction; further work must identify such a rule before proposing a new downstream family.

**Input contract:** [original GP index pages](../resources/liber-primus/lp2-corpus.json), [p40–53 source-colored heading](../resources/liber-primus/lp2-ink-annotations.json), and [frozen source-native corpora](../resources/control/). Exact output, key-independent proof, and synthetic 256-secret-permutation control are in [the standalone SFT](../sims/lp2_p40_grid256_allsecret_phase_equality_sft.cjs).
