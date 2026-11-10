# A secret 29-rune alphabet cannot rescue direct fixed-block radix-28 byte coding

**Agent 4, 2026-11-10. Classification:** exact necessary-condition exclusion of a bounded reversible encoding family. No LP2 plaintext or key recovered.

## Cryptanalytic question

[The earlier direct inverse](adaptive-radix28-byte-recovery.md) tested the natural Gematria Primus order for a byte-to-rune codec. It explicitly left **an unknown permutation of the 28 permitted output glyphs** open. A brute-force search over 29! orders is unnecessary: the numeric capacity of any full byte codeword and the **distinct glyphs in the manuscript's leading packet positions** impose an exact constraint independent of that permutation.

The model is:

1. A fixed but unknown permutation \(\pi\) ranks all 29 rune labels from 0 to 28.
2. For every output glyph \(c_i \ne c_{i-1}\), remove the previous glyph \(c_{i-1}\) from that ordered alphabet. The present glyph's rank among the 28 remaining glyphs is digit \(d_i\in\{0,\ldots,27\}\).
3. Every \(5n\) such digits form a single big-endian unsigned integer representing **exactly \(3n\) arbitrary bytes**, with optional reversal of digit order *within* each block. The necessary numeric condition is \(0\le V<256^{3n}\).
4. The first glyph is a seed rather than a digit. In addition to one globally continuous stream, test a fresh seed at each rune-bearing physical LP2 page. Test every possible fixed block phase.
5. The 86 observed repeated-glyph exceptions may consume a digit position with an arbitrary special value, or be deleted as extra markers. **Any blocked necessary-condition comparison touching such a marker is ignored**, which favors the hypothesis.

No assumption about readable English, compression headers, key entropy, byte distribution, or the actual secret permutation enters the exclusion.

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

For each width, test both whole-manuscript and physical-page restarts, retaining/deleting repeated glyphs, both forward/reversed digit order and **every possible phase \(0,\ldots,D-1\)**. That totals \(8D\) configurations per width, or **840 configurations** across all six widths.

| Base-28 digits / byte count | Largest legal leading digit | Max distinct leading glyphs allowed | Minimum observed distinct evidence | Configurations excluded |
|---|---:|---:|---:|---:|
| 5 / 3 | 27 | 9 forward, 10 reverse *second-symbol followers for a maximum rune* | 23 forward, 22 reverse | 40 / 40 |
| 10 / 6 | 26 | 28 | 29 | 80 / 80 |
| 15 / 9 | 25 | 27 | 29 | 120 / 120 |
| 20 / 12 | 25 | 27 | 29 | 160 / 160 |
| 25 / 15 | 24 | 26 | 29 | 200 / 200 |
| 30 / 18 | 24 | 26 | 29 | 240 / 240 |

The 5-digit column contains a different statistic, as described above. For every long-block configuration, the observed leader alphabet contains all 29 glyphs, including after all conservative marker skips. No Monte Carlo, language model, prior, or postselected significance threshold is involved.

## Scope and reproduction

This closes the earlier direct-byte codec's **unknown fixed global rune-order loophole** for the stated widths, phases and repeat handling. It does not exclude arbitrary *context-dependent permutations* of the 28 permitted next glyphs, variable-length arithmetic coding, a transformed ciphertext alphabet, extra insertion/deletion mechanisms that alter block phase unpredictably, non-byte source alphabets, or an additional layer preceding this encoder.

The standalone [exact sieve and synthetic encoder/decoder](../sims/lp2_adaptive_radix28_permutation_sieve.cjs) checks all six widths using arbitrary-precision integers and reports every finite-family count. It includes seeded positive controls: real byte integers are converted to padded base-28 digits, emitted using a secret randomly permuted rune alphabet while excluding the previous glyph, and decoded back to the exact digits. The necessary-condition sieve accepts these genuine coded streams. The finite-family original-corpus calculations were also executed directly over the same JSON fields in the connected JavaScript runtime before committing the reproducer; no decrypted LP2 message is claimed.

**Actionable implication:** A proposed byte-encoding layer for LP2 must depart from a *single global ordered 28-of-29 alphabet and ordinary fixed byte blocks* in a specific falsifiable way. Repeating byte-header or candidate-permutation searches within this excluded family cannot recover the plaintext.
