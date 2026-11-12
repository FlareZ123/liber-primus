# Original p33–39 chapter: one complete twice-840 GF(29²) clock hypothesis

**Classification (12 November 2026, Agent35): original-source arithmetic and one key-independent, bounded native-language test. No unknown LP2 plaintext, selected cipher key, authenticated state clock or destination recovered.** The unusual exact chapter length is a plausible clue for a human solver, but the author did not explicitly instruct treating the 2013 BASE29 example as a cipher recurrence or reducing the 2014 sexagesimal table to GF(29).

## Independently visible ingredients and weakest link

1. The **2013 Cicada-signed TCP challenge** includes the actual worked numerical conversion `BASE29 3301 -> 3QO`, digit indices `[3,26,24]`. The [original-grid algebra audit](2013-base29-gf29-grid-factor.md) establishes that the physical LP2 pp49–51 256-byte table, in original row-major order reduced modulo29, has zero remainder when its coefficients are divided by the ascending-key quadratic `H(X)=3+26X+24X²`.
2. The monic `H/24 = X²+18X+11` defines the quotient field **GF(29²)**: if `u` is the residue class of X, then `u²=11u+18` modulo29. Multiplication by `u` sends `(a,b) → (18b, a+11b)`; starting at `1=(1,0)`, the **first** return to `1` is after **840** steps, so this particular source-derived field element really is primitive, not just an arbitrary element of a field of 840 nonzero elements.
3. The **original-image top-level visual chapter pp33–39** begins with the red opening heading on p33 and ends before the new red p40 heading. The uninterrupted source rune stream comprises exactly **1,680 = 2×840** runes (global zero-based offsets **7,960–9,639**). Its opening includes original p33 cuneiform glyphs forming the separate genuine values 1033 and 3301; the chapter also contains the p39 three-rune red factor and immediately precedes the p50 table.

A contemporary player could plausibly notice these numbers after learning GF29 from the Gematria Primus prime alphabet and the signed BASE29 instruction. **The unsupported edge is that the field generator must be used as a period-840 cipher clock** on the earlier p33–39 chapter. Other factors, cipher registers, field projections, and chapter selections were not independently specified; matching 1,680 after recognizing 840 is a clue hypothesis, not cryptographic proof.

## A key-independent test of a twice-used 840-position encoder

Suppose each of the 840 clock positions applies one **arbitrary secret bijection** of the 29 GP rune symbols, identically on each of the two 840-rune halves. This includes every 840-periodic additive GP29 key, arbitrary static keyed substitution for each position, and the source-root direct `u^i` projection architectures. No candidate key, phase, byte mapping or plaintext crib is needed.

**Invariant:** `C[i] === C[i+840]` if and only if `P[i] === P[i+840]` for all 840 paired positions, regardless of **all 840 unknown 29! substitution alphabets**. In the original pp33–39 runes, exactly **28/840** lagged pairs agree. In the narrower additive-key family, the 840 differences `(C[i+840]-C[i]) mod29` are also key-independent; their 29-bin IoC is **0.03465009365**.

Original-input calibration uses the checked-in independent whole-word GP Latin Vulgate source plus two separately sourced English prose texts normalized to GP29 (TH, NG/ING, EO, OE, AE, IA and EA digraphs, historical C/U/S spelling). Each control window has **1,680 consecutive native GP runes**. The matched lag is always exactly 840; no selection of an offset by the target ciphertext occurs.

| Native GP source | Window stride | Windows | Smallest 840-pair equality count | Windows with ≤ original 28 |
| --- | ---: | ---: | ---: | ---: |
| Latin Vulgate, 204,802 GP symbols | 159 | **1,278** | **42** | **0** |
| Shakespeare, 217,644 GP symbols | 157 | **1,376** | **28** | **2** |
| Gibran, 62,696 GP symbols | 157 | **389** | **29** | **0** |

These are overlapping, non-independent contiguous reference windows, so the counts are **empirical controls, not a discovery-wide significance estimate**. Shakespeare contains two native examples as low as the original. The data strongly disfavor ordinary source-like GP prose under a strictly **reused 840-position bijection**, while logically leaving rarer plaintext, different languages and unconstrained stateful or nonperiodic ciphers possible. In particular, length compatibility is inadequate evidence to select this key.

## Source-root decoder was also applied without fitted parameters

Freeze `s₀=1`, `sᵢ=u^i = aᵢ+bᵢu`, repeat after 840, and use the three algebraic GP29 projections `aᵢ`, `bᵢ`, and `Tr(sᵢ) = 2aᵢ+11bᵢ`, each under both ordinary additive signs. Apply the resulting **six** complete reversible readouts to **all 1,680 original pp33–39 runes**, with no initial-phase fitting, glyph skips or boundary relocation.

| Source GF841 output projection | Original cipher−key IoC | Original cipher+key IoC |
| --- | ---: | ---: |
| `aᵢ` | 0.03454154 | 0.03443234 |
| `bᵢ` | 0.03442171 | 0.03441249 |
| `Tr(aᵢ+bᵢu)` | 0.03418843 | 0.03440469 |

Original GP ciphertext IoC is **0.03436002**. All six decoded sequences remain nonlinguistic and uniformly distributed. The direct source-root interpretation fails its normal native-GP readability gate and yields **no authenticated plaintext**.

Exact native-GP positive controls verify the test has power at its stated target: an independent Latin 1,680-rune plaintext is encrypted with the source-derived periodic trace and recovered **1,680/1,680**, and the same native plaintext encrypted under 840 **independently generated, wholly secret bijections** is also recovered **1,680/1,680**, preserving every lagged symbol-equality relation as the invariant predicts.

## Research decision

This new relation licenses **a one-shot original-cipher test**, and the standard, source-root 840-period and all-secret repeated-alphabet readings are now bounded negatives. **Do not** expand to arbitrary field basis rotations, fitted clock starts, secret 840-symbol keys or additional cipher layers on the sole strength of `1680=2×840`. A future source would need to specify the cryptographic role of the 2013 polynomial or an explicit nonperiodic state/key update. The original p50 polynomial identity, p39 red factor and p33 cuneiform numbers remain genuine input facts without establishing this conjectured cross-chapter key handoff.

[Standalone source-input reproducer](../sims/lp2_p33_39_gf841_period840_sourcegate_sft.cjs) · [Established exact factor arithmetic](2013-base29-gf29-grid-factor.md) · [Original visual-chapter segmentation](lp2-global-original-visual-section-map.md)
