# The marked 83/167 exponent continuation of the order-840 terminal matrix

**Agent 18, 11 November 2026. Source-constrained finite original-cipher negative; no recovered unknown LP2 plaintext/key.** This report adds **two original-source exponent readings** to the already documented fixed order-840 third-row matrix. The construction itself and the field quotient \(19+13u\) were discovered by other agents and are independently recorded, not newly claimed here.

## Exact starting state and missing historical instruction

The original p3 and p39 red triads both begin at local rune offset119, fixing GF29 rows \([13,23,2]\) and \([27,5,15]\). A separate *provisional* source-word/fold navigation reads the original p50 token \`1p\` as 111 in base60, and two GP prime sums79 and511, yielding a third row \([24,21,18]\). This selects the hypothesized terminal matrix

\[
M=\begin{bmatrix}13&23&2\\27&5&15\\24&21&18\end{bmatrix}\pmod{29}.
\]

Its determinant is one and its order is **840**. Its two nontrivial eigenvalues are \(u^{83}\) and \(u^{727}\) in the p3-defined GF(29²), as [the exact source-triad study](lp2-three-source-triad-gf841-bridge.md) shows. The separate p50 polynomial quotient \(P_{50}/F_{39}\pmod{F_3}=19+13u\) also has order840; that field primitive is [an existing exact result](p50-p39-p3-field-remainder.md).

There are two original-source candidates for an exponent more specific than an arbitrary key search:

- **83**, the zero-based global cell offset of the printed token \`3D\` in the complete p50 table (physical page50's fourth cell). The same integer occurs as the p3-field eigenvalue exponent in the provisional matrix. Source mechanism: page50 table order; interpretation: repeat that cell offset as a matrix power, which is **not** stated in the original.
- **167**, selected by the proposed terminal grid fold's unique p53 word26 GP-prime sum **105**, followed by the *historically documented* 2013 \`NUMBER\` rule **105→501=3×167**; 167 is prime #39, which can address the marked p39 triad. The fold/word/field reuse remains a *hypothesis*, not an authenticated instruction to exponentiate a matrix.

For scale, a uniformly sampled nonzero GF841 element is primitive with frequency \(\varphi(840)/840=192/840=0.2285714\). Mere primitiveness of \(19+13u\) provides modest independent evidence; exact source coefficients and the p39 double-factor condition are separately recorded and should not be mistaken for an independent multiplicative-order surprise.

## Exact original-cipher inverse, no fitting

The authentic terminal source offers two natural, page-marked three-rune streams: **p53 last51 red runes** (17 triples) and **p55 last75 runes** after its leading word-continuation rune (25 triples), in that order. Concatenate these untouched 126 indices and apply **one fixed matrix power** \(M^e\pmod{29}\) to each consecutive triple, no cross-block feedback, padding, phase search, word-boundary normalization, or cipher-text-conditioned key. Test the original-source directions \(e=\pm83,\pm167\), all four invertible by \(M^{-e}\) modulo order840.

| Source-selected field exponent e | Original runes | Decoded GP29 IoC | First decoded runes |
| --- | ---: | ---: | --- |
| +83 | 126 | **0.03492063492063492** | S EA L L E M AE H X H R T |
| −83 | 126 | **0.03606349206349206** | U H P R NG J NG D EO AE J TH |
| +167 | 126 | **0.035682539682539684** | EO L IA A M Y L X T EO C H |
| −167 | 126 | **0.035555555555555556** | Y W I H OE I A TH W O L C |

The raw 126 GP indices have IoC **0.03492063492063492**; solved native p57 has **0.06270996640537514**. All four original transforms remain uniform-looking and linguistically unreadable. Each transforms back to the exact original 126/126 ciphertext runes via its inverse. Every variant additionally transforms and recovers **75/75** *original solved p57* runes as an implementation positive control. The fixed \(M^{840}=I\) and nonidentity tests at the prime factors of 840 certify the group order without relying on output text.

[Source-native single-file executable](../sims/p50_p39_p3_marked_exponent_hill3_sft.cjs) reads the exact p3/p39/p53/p55 GP29 indices, ink annotations and original table tokens, asserts their source positions and exponent selectors, and checks the inverse and original IoCs. The earlier report already tested the fixed \(M^{-1}\) and one cumulative signed-word evolving-state model; the \(\pm83/\pm167\) cases were distinct.

## Decision

**Close these two historically numerically motivated fixed-exponent Hill3 interpretations.** Neither new source exponent unlocks the original terminal runes. The prompt still supplies no surviving original player instruction to make the quotient field, choose a particular projection/basis, group ciphertext into triples, or apply a matrix power to those terminal pages. The many algebraic coincidences form a plausible mathematical *candidate* only. Their existence alone does not recover plaintext.

One future independent signed/source-visible instruction that specifies a GF841 mixing operator and a key/clock would make the exact 840-generator genuinely actionable. Existing screens already cover direct additive/multiplicative field streams, discrete logs, low-parameter Q238 recurrences, fixed Hill3, one cumulative 42-word matrix state, and the two marked exponents here. Avoid adding a parameter search without that new source selection.
