# Full GF(29²) pair multiplier and first-order feedback on the 840 source pairs of pp33–39

**Agent 8, 13 November 2026. Executed original-cipher gate, negative.** This isolates a different use of the *whole two-coordinate field element* as a key on the exact seven-page, 840-pair chapter. No original LP2 plaintext, authenticated key, instruction or destination has been recovered.

## Source premise and exact reversible inverse

Original physical LP2 pp33–39 form one visually defined seven-page chapter of **1,680** GP29 runes, or **840 consecutive pairs**. The p3 red polynomial defines the quadratic extension field with **u²=3u+8**. The source p50 table divided by the red p39 polynomial and then reduced modulo the p3 polynomial yields **g=19+13u**, primitive of order **840**. These source-arithmetic links were previously established in [p50/p39/p3 quotient](p50-p39-p3-field-remainder.md) and [p33–39 period-840 study](lp2-p33-39-gf841-period840-original-gate.md).

Freeze this one human-plausible operation: pair all original consecutive runes into GF(29²) coefficients C_i=a_i+b_i·u. Decrypt pair i=0..839 as **P_i = g^(-i) C_i**; encrypt as **C_i=g^i P_i**. Read out P_i's two native GP29 coefficients in the original order. The source phase is zero. A separate all-phase bound grants every possible constant phase 0..839 to rule out an unknown first field state. Every source rune is consumed, including pairs straddling page boundaries, without skips or arbitrary resynchronization.

This differs from the earlier [direct seven-page field-log](lp2-sevenpage-840-gf841-log-inverse.md), which applies an independent discrete-log map to each pair. It also differs from applying a single-rune projection of the 840-period source clock. **The weakest premise** is that the artist intended two-rune field multiplication; the manuscript does not explicitly prescribe it.

## Exact source result

The source seven page lengths are **[214,261,271,238,228,228,240]**, summing to **1,680**. The GP29 index of coincidence, normalized by multiplying by 29, is:

| Input/output | Normalized GP29 IoC |
| --- | ---: |
| Unmodified original source pp33–39 | **0.9964406251** |
| Source-phase-zero full-field inverse | **1.0070918063** |
| Smallest IoC among **all 840** phases | **0.9909710996** |
| Largest IoC among **all 840** phases | **1.0113687286** |
| Known solved p57 GP plaintext repeated to 1,680-rune control length | **2.0826966165** |

**0/840 phases** exceed even **1.15** normalized IoC; the original remains uniform-like. The first twenty GP symbols in the direct source inverse read **D EO T F NG R NG IA M J TH M B EA AE F L Y H W**, without an authentic phrase. No unknown plaintext is recovered.

An exact phase-algebra reduction makes the negative decisive within this particular model. The source-derived primitive field element obeys **g^30=11 ∈ GF(29)**. A phase change of thirty multiplies both output coefficient streams by a constant nonzero GF29 scalar. Such multiplication merely permutes the **29 global rune labels**, preserving IoC exactly. Thus the **840 phases comprise only 30 inequivalent output frequency profiles**, in orbits of 28. The reproducer asserts each of the 810 corresponding phase-30 equalities. Because none of the thirty representatives has native GP concentration, an unspecified phase or globally fixed substitution alphabet cannot repair this complete direct-pair inverse.

## Positive source-language control and limits

The [standalone CommonJS SFT](../sims/lp2_p33_39_fullfield_pair_multiplier_sft.cjs) asserts the source lengths, the exact order-840 field key and its g^30 scalar relation. It decodes and exactly reencrypts 1,680/1,680 source ciphertext runes. An independent positive control uses the **original solved p57 plaintext GP runes**, repeated to length 1,680, then encrypts with the same full-field operator at initial phase137. The original decoder recovers **all 1,680/1,680 GP plaintext symbols** and exactly reencrypts the ciphertext. The plant is repetitive by construction; its unusually high IoC is a detector control, not a whole-book English baseline.

**Decision:** retire this exact single-cycle, pairwise full GF(29²) multiplicative pad as the complete direct native-GP-English decoding of pp33–39, including all constant field phases and fixed outer alphabet permutations. The source's 840-pair capacity equality is still intriguing but unproven as an authorial hint. A renewed field branch needs independent source evidence for a different reversible operation, packet grammar or keyed state update, plus a prospectively testable original plaintext. No further field multiplication phase search is justified by this negative result.


## Additional independent original inverse: every first-order field-pair feedback coefficient

A human solver who recognizes the same original quadratic field and its primitive element might instead view that field element as a **feedback multiplier**, rather than as a position-driven keystream. The simplest two reversible field-pair ciphers are, with one pair consumed per step, zero initial feedback state and the exact original pp33–39 pair order:

* **Ciphertext feedback:** Cᵢ=Pᵢ+αCᵢ₋₁, so Pᵢ=Cᵢ−αCᵢ₋₁.
* **Plaintext feedback:** Cᵢ=Pᵢ+αPᵢ₋₁, so Pᵢ=Cᵢ−αPᵢ₋₁, decoded recursively.

For a source-selected α the most literal values are **u=(0,1)** and **g=(19,13)**. An all-key bound grants **every one of the 841 α=(a,b) ∈ GF(29²)**, including zero and nonprimitive multipliers, without choosing an initial phase from plaintext. This is different from the preceding **position-keyed** inverse, earlier one-rune GP29 feedback, and earlier **single-rune projections** of GF841 state. Each of the 1,682 tests consumes all 840 original pairs and is exactly reversible for every field symbol because the coefficient of Pᵢ is 1.

| Original whole-chapter inverse, all 841 coefficients | Lowest IoC29 | Highest IoC29 | Best α | Actual source g IoC29 | α values yielding IoC29 ≥1.15 |
| --- | ---: | ---: | --- | ---: | ---: |
| Ciphertext-feedback | **0.9891616325** | **1.0179280467** | **(11,0)** | **1.0009231686** | **0/841** |
| Plaintext-feedback | **0.9887092657** | **1.0213002354** | **(16,26)** | **0.9949807141** | **0/841** |

The largest original value is below **1.022**, still near uniform; even the most favorable choice from **all 841 unselected field multipliers** does not remotely approach the genuine native-GP solved-p57 repeated control (**2.0827**). The ciphertext-feedback maximum happens at α=11, a base-field scalar equal to source g³⁰; its small IoC elevation is *not* an authenticated key or language signal. The plaintext-feedback maximum is similarly ciphertext-like. There is no prospective English reading or key identification.

The [single-file original-cipher SFT](../sims/lp2_p33_39_all841_field_pair_feedback_sft.cjs) performs the complete 841×2 inversion, asserts exact maxima/minima and source g scores, and verifies **both** feedback models with a known original p57 plaintext source plant encrypted under g: **1,680/1,680 planted symbols are recovered**, and the original source **1,680/1,680** roundtrips for both models. The p57 plant is intentionally repeated for a consistent fixed corpus and displays strong plaintext concentration; it is not fit to the unknown source.

**Extended decision:** the entire first-order, zero-initial-state *field-pair feedback* family with **any constant field element α**, and either usual feedback direction, is excluded as a complete direct native-GP chapter decoder under the exact original pair framing. This complements the period-840 full-field multiplier negative above. A changing coefficient, nonlinear feedback, cross-word register, second cipher layer, unknown initial state or a non-native-GP intermediate would require a fresh independent source selector. The exhaustive coefficient search does not justify exploring those further freedoms without a new clue.
