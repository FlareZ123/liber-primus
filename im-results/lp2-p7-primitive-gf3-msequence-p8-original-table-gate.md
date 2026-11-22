# Original p7 five-product coefficients generate a primitive ternary register of precisely p8-sized state space

**Agent4, 22 November 2026. Classification: new exact source-selected algebraic compatibility and two complete original-cipher receiver negatives. No recovered unknown plaintext, genuine cipher key, or author-authenticated LFSR instruction.**

## A specific, human-reconstructible source-to-register candidate

The physical LP2 p7 inscription immediately preceding five dots has five complete red words. Their unchanged Gematria Primus ordinal-index rune products reduced modulo29 are

`[11,26,8,15,2]`.

This vector was previously established independently from the p7 red inscription and linked to a historical Diffie–Hellman state. The next page p8 is physically special: 12 red heading runes, followed by **exactly 243 black ciphertext runes**. Since 243=3⁵, an independently motivated and hand-executable interpretation of the five source numbers is a **five-stage linear feedback shift register over GF(3)**. Reduce the five published values modulo3, in their literal printed order:

`a = [2,2,2,0,2]`.

For five consecutive trits `s=[s0,s1,s2,s3,s4]`, advance with

`s' = [s1,s2,s3,s4,(2*s0+2*s1+2*s2+0*s3+2*s4) mod3]`.

The resulting characteristic polynomial in GF(3) is exactly

`x^5 + x^4 + x^2 + x + 1`.

**Exact finite result:** this polynomial is primitive. From the canonical nonzero seed [1,0,0,0,0], the recurrence takes **242 distinct nonzero five-trit states** before returning to its seed, never visiting [0,0,0,0,0]. Thus its period is exactly `3^5−1=242` and is maximally long. Since the transition is invertible (oldest-state coefficient 2 is nonzero), every nonzero seed traces the same 242-cycle. A standard m-sequence construction inserts **one zero trit after the first cyclic occurrence of four consecutive zero trits**, producing a 243-trit cyclic de Bruijn sequence **B(3,5)** in which **each possible five-trit state appears exactly once**. The original p8 black length is consequently exactly enough to label the entire 243-state register.

This is a specific candidate **state generator** with a source-visible five-tap coefficient vector and natural zero-extension. The original page does **not** say to compute word products, reduce modulo3, splice a zero, address the next ciphertext as a table, or map the states to plaintext runes. The arithmetic compatibility must remain provisional rather than being called Cicada's intended cipher.

## How selective is this observation?

There are exactly **22 primitive five-tap feedback vectors** out of the 3⁵=243 possible GF3 coefficient vectors (22/243 ≈9.05%). Because this exact vector's word-product rule was already favored by independent DH reconstruction and had not been chosen to optimize the GF3 cycle, its full-length order is worth recording.

However, the candidate's **mod3 field and its 243-state interpretation** were themselves chosen after noticing the original 243 body length. That postselection prevents treating the 9.05% figure as a probability that Cicada authored the scheme. As a local sensitivity test, freeze seven ordinary red-word aggregators, first evaluate their GP29 outputs, then reduce each vector to GF3 and inspect the recurrence period:

| Printed p7 five-word aggregator | Recurrence period of [1,0,0,0,0] |
| --- | ---: |
| **GP29 ordinal-index word product** | **242, primitive** |
| GP29 ordinal-index word sum | 20 |
| GP29 prime-weight product | 10 |
| GP29 prime-weight sum | No return within243 steps |
| GP29 first rune index | 78 |
| GP29 last rune index | No return within243 steps |
| Literal word length | 24 |

The product aggregator is the only full-length option among these seven; the seven functions were chosen because they already appeared as ordinary source-readout alternatives in the p7 historical DH research. This is a **local finite discrimination**, never an exhaustive search of ways to interpret the drawing.

The existing [p7-p8 GF29 fifth-order period study](lp2-p7-p8-five-dot-lfsr-skip-cube-original-gate.md) independently found period1876 (28×67) for the same source products under GF29. The **new** test reduces that source-defined vector modulo3 and finds the length242 primitive state orbit. The two period observations use different fields; neither itself specifies an original cipher inverse.

## A source-selected 243-cell lookup with unchanged 1,474-rune consumer

Use the 242-cycle and insert its unique omitted zero state as described above. Iterate with two original-visible nonzero starts: (1) the five p7 red-word products modulo3, **22202**, and (2) p8's first five red rune indices modulo3, **21211**. For each, the augmented register gives a fixed list of all243 numerical five-trit states (0–242), and assigns the *unchanged* 243 p8 black rune values to a keyed 243-entry lookup `T[state]`.

Read a five-trit state from the previous five visible GP ciphertext symbols using either published **GP index mod3** or published **GP prime mod3**. Decode the **full, untouched p9–p14 original chapter remainder, 1,474 runes**, via

`P_i = (C_i ± T[state(previous five C or P)]) mod29`.

This is an online, reversible stream decoder: for a plaintext-driven state, decoded P is available before advancing, and for a ciphertext-driven state, original C is available. Both begin from the actual last five p8 glyphs and do not fit an IV, hidden table, key phase or English word. The finite family has exactly **2 source seeds ×2 address maps ×2 signs ×2 prior-stream types =16** complete original consumers.

| Frozen original table/consumer comparison | Result |
| --- | --- |
| Raw p9–p14 original 1,474-rune GP29 IoC | **0.03444083** |
| All 16 original p9–p14 decoded IoCs | **0.03420594 to 0.03503313** |
| Independently solved original p57 95-rune GP29 IoC | **above 0.06** |
| Complete exact original rune reencryption | **1,474/1,474**, every candidate |
| Synthetic encrypted-source positives (original solved p57 GP runes) | **95/95 recovered**, every candidate |

All 16 original candidates remain ciphertext-like and have nonlinguistic rune prefixes. The positive plants verify that the declared operation decrypts source-native material when its source table and state rule actually produce it; the roundtrips alone do not establish original plaintext.

## Direct state-to-key GP29 consumer on p8 itself

A still smaller reversible alternative uses each of the 243 de Bruijn five-trit numerical state addresses as the key, interpreting it as **index modulo29** or the **published GP prime of that index modulo29**. From either source-specified seed, subtract or add that key from the 243 original p8 black runes, while separately applying the same frozen key to the first 243 p9 runes.

These **eight** directly defined inverses return original p8 IoCs of **approximately 0.0329–0.0355** and p9 IoCs **approximately 0.0333–0.0355**, with no recovered GP plaintext. All source runes reencrypt exactly under the inverse sign. Neither the 243-entry table nor the simple state-derived additive pad is an authentic decipherment.

## Decision for further work

This discovery gives a **complete, source-constrained candidate ternary state traversal** without searching five-tap coefficients or using a secret address permutation. It may be useful if a new original instruction or readable title establishes that p8's 243 runes are a lookup or assigns the observed coefficient sequence to a concrete cipher opcode. A human could write down all243 states and locate any state by its five trits.

Neither direct consumer succeeds on original p8 or independent p9–p14. An arbitrary nonlinear output function would need **243 unprovided key values**, which the original p8 body could supply only under a specific, still-unproven table interpretation. More source-free register/output sweeps are not justified by this length coincidence alone.

**Reproducer:** [read-only original-source Node22 CommonJS SFT](../sims/lp2_p7_primitive_gf3_p8_debruijn_lookup_sft.cjs), using only the existing `lp2-corpus.json`, with exhaustive 243-polynomial period census, seven source-aggregator controls, complete de Bruijn 243-state assertions, original 1,474-rune table decodes, independent 243-rune direct pad decodes and solved-page plants. **Windows Node22 PASS:** [GitHub Actions run 45003902299](https://github.com/FlareZ123/liber-primus/actions/runs/45003902299). Existing exact static rune-to-trit impossibility [here](lp2-p7-p8-243-trit-nonlinear-original-consumer.md) remains valid: the present *source-indexed evolving register* is a distinct proposition. No change to the authoritative established results is claimed.
