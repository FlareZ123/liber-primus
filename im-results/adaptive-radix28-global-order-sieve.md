# Fixed-block radix-28 byte encodings fail under global secret glyph and difference alphabets

**Agent 4, 2026-11-10. Classification:** exact necessary-condition exclusion of a bounded reversible encoding family. No LP2 plaintext or key recovered.

## Cryptanalytic question

[The earlier direct inverse](adaptive-radix28-byte-recovery.md) tested the natural Gematria Primus order for a byte-to-rune codec. It explicitly left **an unknown permutation of the 28 permitted output glyphs** open. A second, algebraically natural model assigns digits through one fixed secret permutation of the 28 **nonzero rune differences modulo 29**. A brute-force search over either 29! global glyph orders or 28! difference alphabets is unnecessary: the numeric capacity of any full byte codeword and the **distinct glyphs in the manuscript's leading packet positions** impose an exact constraint independent of that permutation.

The first tested model is:

1. A fixed but unknown permutation \(\pi\) ranks all 29 rune labels from 0 to 28.
2. For every output glyph \(c_i \ne c_{i-1}\), remove the previous glyph \(c_{i-1}\) from that ordered alphabet. The present glyph's rank among the 28 remaining glyphs is digit \(d_i\in\{0,\ldots,27\}\).
3. Every \(5n\) such digits form a single big-endian unsigned integer representing **exactly \(3n\) arbitrary bytes**, with optional reversal of digit order *within* each block. The necessary numeric condition is \(0\le V<256^{3n}\).
4. The first glyph is a seed rather than a digit. In addition to one globally continuous stream, test a fresh seed at each rune-bearing physical LP2 page. Test every possible fixed block phase.
5. The 86 observed repeated-glyph exceptions may consume a digit position with an arbitrary special value, or be deleted as extra markers. **Any blocked necessary-condition comparison touching such a marker is ignored**, which favors the hypothesis.

No assumption about readable English, compression headers, key entropy, byte distribution, or the actual secret permutation enters either exclusion.

## Exact first-digit bound for long blocks

For block length \(D=5n\), an integer fitting \(3n\) bytes satisfies

\[
d_0\le b_D=
\left\lfloor \frac{256^{3n}-1}{28^{D-1}}\right\rfloor.
\]

Suppose the unknown global rune order ranks glyph \(g\) at position \(r=\pi(g)\). Removing any *other* previous glyph changes its rank by at most one. Thus, when \(g\) heads an unmarked block, its actual adaptive digit is \(r\) or \(r-1\). The bound \(d_0\le b_D\) requires \(r\le b_D+1\). This leaves **at most \(b_D+2\) distinct glyph identities** permitted as first symbols of full valid blocks.

The manuscript has **all 29 glyph identities** at this leader position for every tested fixed phase, segmentation, repeat handling and both block reading directions for each \(D=10,15,20,25,30\). Since their maximum permissible distinct-leader counts are below 29, every model instance is mathematically impossible without searching for \(\pi\).

## The five-digit case

The five-digit to three-byte codec has \(b_5=27\); every rune could in principle lead a block, so the preceding count alone is insufficient. But if the leading glyph is the **highest-ranked** rune \(G=\pi^{-1}(28)\), and the output does not repeat its previous glyph, its adaptive digit must equal 27.

From
\[
V=27\cdot28^4+d_1\cdot28^3+\text{nonnegative tail}<256^3,
\]
we get
\[
d_1\le
\left\lfloor
\frac{256^3-1-27\cdot28^4}{28^3}
\right\rfloor=8.
\]

In forward packet order, the second physical glyph follows the maximum glyph \(G\), which is excluded from the 28-element alphabet. Its adaptive rank is then its original global rank. Consequently **at most nine distinct second glyph identities** can follow \(G\) in complete five-digit codewords.

If the packet's digits are read in reverse, the second digit comes from the physical glyph *immediately before* \(G\); its adaptive rank might be one below its global rank because its own predecessor is removed. The necessary condition now allows **at most ten distinct second-glyph identities**. This lenient upper bound covers all unknown global rune orders.

There are only 29 candidates for \(G\). Directly measuring the distinct nonmarker second glyphs for each of the 29 candidates across all blocks produces a minimum **23** in forward order and **22** in reverse order. Hence **none of the 29 symbols can be the global maximum**, completing an exact contradiction.

## Exhaustive finite segmentation screen on LP2

Input: [canonical numeric LP2 corpus](../resources/liber-primus/lp2-corpus.json). Select the 55 nonempty unsolved pages 0–55, omit the runeless physical page 50 and the already-solved pages 56–57. The input contains exactly **12,956** runes. Its 29-rune alphabet is indexed 0–28. This analysis is based on a derived community transcription, as are related computational studies.

For each width, test both whole-manuscript and physical-page restarts, retaining/deleting repeated glyphs, both forward/reversed digit order and **every possible phase \(0,\ldots,D-1\)**. That totals \(8D\) configurations per width **per alphabet model**, or **1,680 configurations** across six widths and two models.

| Base-28 digits / byte count | Largest legal leading digit | Max distinct leading glyphs allowed | Minimum observed distinct evidence | Configurations excluded |
|---|---:|---:|---:|---:|
| 5 / 3 | 27 | 9 forward, 10 reverse *second-symbol followers for a maximum rune* | 23 forward, 22 reverse | 40 / 40 |
| 10 / 6 | 26 | 28 | 29 | 80 / 80 |
| 15 / 9 | 25 | 27 | 29 | 120 / 120 |
| 20 / 12 | 25 | 27 | 29 | 160 / 160 |
| 25 / 15 | 24 | 26 | 29 | 200 / 200 |
| 30 / 18 | 24 | 26 | 29 | 240 / 240 |

The 5-digit column contains a different statistic, as described above. For every long-block configuration, the observed leader alphabet contains all 29 glyphs, including after all conservative marker skips. No Monte Carlo, language model, prior, or postselected significance threshold is involved.

## Second mechanism: an unknown ordering of modular differences

A 29-rune no-repeat stream can alternatively assign the 28 base-28 digits to the 28 **nonzero residues** in \(\mathbb Z/29\mathbb Z\). With

\[
\delta_i=(c_i-c_{i-1})\bmod29\in\{1,\ldots,28\},\qquad d_i=\phi(\delta_i),
\]

\(\phi\) is an arbitrary fixed bijection from nonzero differences to the 28 digit values. Encoding is reversible by adding the chosen nonzero difference modulo 29. The simplest cyclic codec is one member of this 28! family.

For \(D\ge10\), the first-digit capacity bound \(d_0\le b_D\) allows only \(b_D+1\) distinct leading *difference labels*. **All 28** nonzero differences occur at a codeword-leading transition in every tested case. For widths 10–30, only 27, 26, 26, 25 and 25 leading labels respectively can be legal. Every case is impossible.

For \(D=5\), whichever difference label has digit 27 may lead a packet only if its next digit is at most 8. At most **nine distinct second differences** are then legal, in either packet direction. Each of the 28 potential maximum labels has **at least 23 distinct nonmarker followers** in every original case. There is no possible assignment of all 28 nonzero differences to the base-28 digits.

| Digits / bytes | Allowed distinct leading differences | Minimum observed distinct evidence | Exact exclusions |
|---|---:|---:|---:|
| 5 / 3 | 9 second differences after the maximal difference | 23 | 40 / 40 |
| 10 / 6 | 27 | 28 | 80 / 80 |
| 15 / 9 | 26 | 28 | 120 / 120 |
| 20 / 12 | 26 | 28 | 160 / 160 |
| 25 / 15 | 25 | 28 | 200 / 200 |
| 30 / 18 | 25 | 28 | 240 / 240 |

This tests a mathematically different encoder from the glyph-order model: the digit is an arbitrary fixed function of the change in rune index, independent of which actual glyph preceded the change.

## Scope and reproduction

This closes the earlier direct-byte codec's **unknown fixed global rune-order loophole**, alongside the fixed unknown **mod-29 difference-order variant**, for the stated widths, phases and repeat handling. It does not exclude arbitrary *context-dependent permutations* of the 28 permitted next glyphs, variable-length arithmetic coding, a transformed ciphertext alphabet, extra insertion/deletion mechanisms that alter block phase unpredictably, non-byte source alphabets, or an additional layer preceding this encoder.

The standalone [exact sieve and synthetic encoder/decoder](../sims/lp2_adaptive_radix28_permutation_sieve.cjs) checks all six widths using arbitrary-precision integers and reports every finite-family count. It includes separate seeded positive controls for both mechanisms: real byte integers are converted to padded base-28 digits, emitted using a secret randomly permuted global alphabet or a secret permutation of nonzero differences, and decoded back to the exact digits. The necessary-condition sieve accepts these genuine coded streams. The finite-family original-corpus calculations were also executed directly over the same JSON fields in the connected JavaScript runtime before committing the reproducer; no decrypted LP2 message is claimed.

**Actionable implication:** A proposed byte-encoding layer for LP2 must depart from **both fixed global rune and fixed modular-difference byte-code alphabets** in a specific falsifiable way. Repeating byte-header or candidate-permutation searches within this excluded family cannot recover the plaintext.

The existing [manual-only Node.js 22 workflow](../.github/workflows/lp2-adaptive-base28-manual.yml) now includes this sieve as a second step for independent whole-program execution.
