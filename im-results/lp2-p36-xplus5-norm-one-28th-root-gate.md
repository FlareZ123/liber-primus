# Original p36 / table x+5: norm-one 28th-root inversion gate

**Agent34, 12 November 2026. Original-input algebraic result, no plaintext.** The original p50 table's repeated factor (X+5)^2, together with its separately established irreducible degree-238 factor Q238, supplies a fixed linear field element L=X+5. Its exact norm in GF(29^238) is Q238(−5)=**2**. Prior work by Agent13 had already independently derived **Norm(p36)=2** for the 238 source GP29 indices read as ascending coefficients of a field element C. This report does not claim to discover the p36 norm or its signed 2013 DH23=2 association: see [prior field source study](p36-grid238-dh11-field-multiplication-gate.md).

This **new equality with the repeated original table factor** means U=C/L has norm exactly one. The norm-one group is the image of the 28th-power map on GF(29^238)×. Consequently, **all 28 field roots** of the finite source-motivated equation exist and can be recovered without fitting any key:

\[
C_{\mathrm{p36}} = (X+5)P^{28} \pmod {Q_{238}}.
\]

A human might be prompted by the p39 red perfect-square quadratic and the p50 repeated factor to consider powers, while the p36 original 238-rune length identifies a full field element. However neither original source commands the **28th power** or selects that field state as the ciphertext; the norm equality may be chance (a particular preselected nonzero norm is one of 28 possibilities). These assumptions remain conditional.

## Complete source-original result

The [read-only CommonJS SFT](../sims/lp2_p36_q238_xplus5_28th_roots_sft.cjs) independently reconstructs Q238, asserts its small factors, divides the original p36 field element by X+5, decomposes the multiplicative group into order-8, order-49 and coprime subgroups, and derives **4×7=28 exact roots**. Every root reconstructs all original **238/238 p36 runes** through the declared power-times-source-factor operation.

| Statistic | Original p36 | Each of 28 roots |
| --- | ---: | ---: |
| GP symbols | 238 | 238 |
| IoC | 0.035989079176 | **0.035811793072** |
| Proportion of top 12 runes | 0.584033613445 | **0.575630252101** |
| Exact field reencryption | Source | **238/238** |

All roots differ by one nonzero GP29 scalar, so all have *identical* frequency distributions and IoC. One begins:

    AE S Y AE H N X C M Y D L OE U B F N OE H R B F C Y EO W G G G B EO T TH EO EA P U IA EA A IA I M Y AE P N O H O D N X C S X F NG AE TH

No recovered root resembles natural GP text. A **positive plant** built from authentic solved p57 GP plaintext, repeated to 238 symbols and encoded under exactly the same exponent/twist, is recovered from the 28 solutions and re-encodes perfectly. Thus the negative reading is an original-input outcome of a working exact inverse, with no arbitrary fallback.

**Decision:** Retire only the literal source-selected 28th-power-times-(X+5) p36 decoder. Preserve the precise source norm match as intermediate evidence, without promoting it to cipher selection or recovered key. The previous [p39 source-square-class gate](lp2-p39-square-p36-q238-legendre-gate.md) excludes all direct base-field-scaled *even powers* without this nonsquare linear twist; the present normalization is a genuinely different finite test. Further twist/power searches need an independent physical instruction.

No unknown LP2 p0–55 plaintext or Cicada destination recovered.
