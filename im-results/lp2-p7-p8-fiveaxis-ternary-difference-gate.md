# P7 five-word packet to p8 black 3^5: reversible five-axis difference gate

**Agent7, 21 November 2026. Classification: bounded original-cipher negative with exact 243-rune positive controls.** All 56 unknown LP2 pages remain undeciphered; this test recovers no unknown plaintext, historical key, or complete decoder.

## Source-selected opportunity and competing explanation

On original physical p7 (24.jpg), five red words immediately precede a five-dot ornament. Their printed lengths are **2|4|3|2|3**, and their literal GP29 products are **[11,26,8,15,2]**. The already-established GF29 circulant inversion of this vector gives the first inverse row **[23,2,5,2,19]**, containing the independently recognized DH23 state. These are source arithmetic facts, although interpreting the row as a cryptographic key remains conjectural ([p7 original-source report](lp2-p7-red-circulant-dh-original-inverse.md)).

The next original page p8 (25.jpg) has **255 runes**, of which exactly **12 are red heading runes**. Its contiguous 243-rune black body has cardinality **\(3^5\)**, allowing one exact five-dimensional ternary reflow. The source also contains repeated instructions about shedding circumferences, making a finite-difference inverse along the five dimensions worth one bounded attempt.

A competing explanation is ordinary page composition, with the five p7 marks being mnemonic/navigation material and the p8 243 count incidental. **No first-party text prescribes a five-dimensional difference operator, axis orientation, or use of the p7 numbers as coefficients.** This is an exploratory, original-cipher test of one motivated architecture, rather than an established intended solve path.

## Exact reversible receiver and frozen family

Use *only* p8's **243 black runes**, in original order. Index them by five base-three coordinates \(d_a=\lfloor i/3^a\rfloor\bmod3\), \(a=0,\ldots,4\). For each axis, independently apply the modular triangular operation

\[
D_{a,w,s}^{+}(x)_i =
\begin{cases}
x_i+s\,w_a x_{i-3^a}\pmod{29},&d_a>0,\\
x_i,&d_a=0,
\end{cases}
\]

with the analogous **backward** neighbor \(i+3^a\) when \(d_a<2\). Apply all five axes in order 0 through 4; the inputs to each axis are the outputs of the previous axis. Reverse the axis order and solve each triangular recurrence to recover the input. This is a **value-changing, exactly reversible GP29 operation**. It is distinct from a Gray-code reordering or ordinary transposition, which would preserve the original rune frequencies.

Freeze three directly available coefficient vectors: unit weights **[1,1,1,1,1]** (unkeyed difference), p7 red-word products **[11,26,8,15,2]**, and the previously documented p7 inverse first row **[23,2,5,2,19]**. For each, consider the two natural global neighbor directions and difference/sum signs. This yields **12** total variants, with **no fitted coefficient, axis order, start, phase, word break, or hidden offset**. Every variant round-trips all 243 positions; every independently planted source-native 243-symbol plaintext control also decrypts exactly.

## Original p8 results

The fixed native-GP trigram model uses only the repository's solved LP1/p56/p57 reference, with paragraph boundaries retained and additive smoothing 0.1. All 12 p8 outputs remain visibly nonlinguistic. The three best source-family candidates are:

| Frozen coefficient family | Best direction/sign | IoC | Mean GP29 trigram log score |
|---|---|---:|---:|
| All-one weights | forward / subtraction | 0.03499643 | **-10.67440529** |
| Original p7 word products | forward / subtraction | 0.03475836 | **-10.70936418** |
| Original p7 inverse row | backward / addition | 0.03428222 | **-10.73792098** |

The untouched p8 black-body IoC is **0.03404415**, with trigram score **-10.77785568**. Across all 12 decoded candidates, IoC spans **0.03258 to 0.03649**. The independently clear p57 has IoC **0.06270997** and trigram score **-7.55821**.

As an intentionally permissive native-language diagnostic, the worst of **1,752** contiguous **76-rune** windows from the solved reference scores **-8.06134395**. Every transformed p8 output of length 243 scores **below** even that shorter-reference-window minimum; the best candidate is **-10.67440529**. These are conditional language diagnostics, not a calibrated discovery probability. The complete 12-output record and the bidirectional positive-plant checks are emitted by the reproducer.

## Decision

**Reject the exact p7-to-p8 five-axis triangular-difference architecture under its frozen source coefficient choices.** The 243=3^5 black-body alignment is an interesting original-source shape but supplies no reversible *intended* operation on its own; this bounded value-changing extension produces no plaintext. Do not rescue it by trying arbitrary GF29 axis matrices, mixed directions, offsets, higher-order neighbors, or post-output key shifts without an additional independent manuscript instruction.

A genuine successor would need an original clue that uniquely specifies a different five-dimensional transformation and selects an untouched GP29 receiver with a clear language or authenticated-crib success criterion.

**Reproducer:** [read-only Node 22/CommonJS SFT](../sims/lp2_p7_p8_ternary_axis_difference_gate_sft.cjs), reading the canonical original-derived GP29 corpus, physically checked ink annotations, and solved-source control text. The original p7 and p8 JPEGs remain the primary image evidence ([archive numbering](../resources/liber-primus/README.md)).
