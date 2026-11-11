# Source factor GF(29^238): p36 field operations and DH3301 exponent-11 stream tests

**Status:** three explicit, reversible, source-constrained GP29 field transformations tested on untouched original LP2 ciphertext with native solved-page plants. **No unknown plaintext, key or destination recovered.** These are proposed uses of genuine source arithmetic. Treating p36 as a field key, lifting the historical DH exponent into this field, or reusing it as a state-update exponent is not an original instruction.

## Why these are plausible finite operations

The original 32×8 LP2 base60 table, as the degree-254 polynomial of GP29 residues, factors over F29 into explicit small factors times a **unique monic irreducible degree-238 polynomial R238**. Physical LP2 p36 has **exactly 238 GP runes**. Other agents have already rejected interpreting p36 as a direct LFSR output/keystream under R238, and exponent inverses 1033/3301 on p36 itself.

A different fully specified field mechanism is multiplication in the 238-dimensional extension GF(29^238). Set `K` to the p36 source rune indices read as ascending field coefficients modulo R238. Multiplication by K is reversible because K is nonzero in this field. If K were a provided key, the literal cipher `C=K·P mod R238` would produce random-looking 238-rune ciphertext blocks from recognizable plaintext. The same p36/2013 source chain includes a separately reconstructed DH3301 client exponent class `e≡11 mod550`. The smallest positive representative `11` is coprime to 29^238−1, permitting the literal test `P=C^(11⁻¹ mod (29^238−1))`.

The two operations test different cipher ideas. A p36 key page and exponent lifting are **hypotheses**; authorial selection is not established.

## Test on exact original inputs

The [single-file reproducer](../sims/p36_grid238_dh11_field_multiplication_sft.cjs) regenerates R238 coefficient-for-coefficient by dividing the original table polynomial by the exact irreducible small factors with degrees 1,1,2,3,9. It uses Node.js BigInt for the exponent and exact polynomial arithmetic mod29. The p36 seed and original 12,956-runic stream come directly from the pinned corpus.

**Multiplication inverse:** Test K and its reversed coefficient orientation. Divide each complete original 238-rune ciphertext block by K in GF(29^238), using either original or reversed input-block coefficient order. The book clock begins at physical p0; a second physically motivated clock begins immediately *after* the 238 p36 key runes, so the key page is never credited as its own plaintext. This yields 54 book-clock blocks or 16 post-p36 blocks per orientation pair, all tested without fitted phase.

| Key/source orientation | Book-clock mean IoC (54 blocks) | Largest book-clock block IoC |
| --- | ---: | ---: |
| K printed; C printed | 0.0346023 | 0.0381520 |
| K printed; C reversed | 0.0346181 | 0.0377265 |
| K reversed; C printed | 0.0344086 | 0.0364500 |
| K reversed; C reversed | 0.0345091 | 0.0373365 |

All post-p36 blocks are likewise below IoC **0.045**; the mean is approximately **0.0343–0.0349**. The original complete ciphertext IoC is **0.0344784**, whereas the planted native-GP paragraph IoC is **0.0675460**. No field-divided original block approaches source GP prose.

**DH exponent 11:** Read p36 as one field element in printed or reversed coefficient order. Invert the fixed exponent 11 and reapply exponent 11 to the output.

| p36 field coefficient order | Decoded IoC | Decoded first 25 GP tokens |
| --- | ---: | --- |
| Printed | **0.0345353** | R D E D IA S B X TH OE L A W U T L M O P H IA R NG M M |
| Reversed | **0.0338262** | F F N F AE A C IA H R U X A I I G G M L P TH L R N P |

Both outputs are nonlinguistic by the same predeclared GP coincidence threshold. For all transformations the original input is reproduced exactly when reencryption is applied. A 238-rune plaintext plant made by repeating the source-solved p57 text is encrypted then recovered **238/238** under every tested inverse. This validates implementation and detection capacity; it does not constitute evidence of an unknown-page decryption.

## Power-11 state recurrence and relative-trace output (Agent 30, 11 November 2026)

**Human-solve-path hypothesis.** The p36 page has exactly 238 runes, matching the degree of the unique monic irreducible factor R238 of the original table polynomial. The authenticated 2013 DH3301 participant exponent has smallest positive representative 11. A compact nonlinear stream hypothesis is therefore to treat p36's printed rune indices as one element S0 of GF(29^238), update `S[n+1] = S[n]^11`, and emit the canonical relative trace `Tr_GF(29^238)/GF(29)(S[n])` as a GP29 key symbol. The 2013 source authenticates the exponent in a DH example, not its reuse as a PRNG; that link remains conjectural.

The power map is reversible because 11 is coprime to `N = 29^238 − 1`. The source-fixed clock excludes p36 itself: use the inverse power map to extend **8,706** key symbols backward from the first post-p36 position, then emit **4,012** symbols forward from S0. No fitted phase, reset, coefficient orientation or output projection is used. The Newton-sum trace coefficients are independently checked against the direct Frobenius trace for both S0 and the backward-anchored state; the two implementations agree around the seed boundary.

| Candidate | GP29 trigram score (nats/rune) | IoC |
|---|---:|---:|
| Raw non-p36 ciphertext (12,718 runes) | **−4.146319** | **0.03447201** |
| `P_i = C_i − Tr(S_i)` | −4.156198 | 0.03448689 |
| `P_i = C_i + Tr(S_i)` | −4.178054 | 0.03447899 |
| Held-out native-GP Shakespeare reference | **−2.462215** | **0.05880750** |

The 12,718-symbol key is nearly uniform (IoC **0.03450489**; bin counts 396–501). Both decryptions score below the raw stream and remain ciphertext-like. A 12,718-rune native-GP plant is recovered exactly. The raw key-stream SHA256 is `f1ee9989af5ee270ba3730eac4aac6540cabb1b3d52a7120d35c75911f172e4d`; the monic R238 lower-coefficient array SHA256 is `65cb6ea001c65a85b38d24bca37049c806e52efd24b334fb3ad0d0087213184c`, and the printed p36 seed array SHA256 is `a53ded5a907795ae4c57a2a75bd3fba5a5c7093ac092d40fb7f7f8a7eda91491`.

**Decision:** retire this specific p36-seeded power-11 / relative-trace additive stream. It does not disprove every nonlinear state update or field output, but do not repeat this exponent/trace model or tune its phase. Reproduction: [C++ key generator](../sims/p36_dh11_power_trace_stream_sft.cpp) and [Node scorer](../sims/p36_dh11_power_trace_score_sft.cjs).

## Decision and next useful question

Retire the direct reusable-p36 field multiplier, literal DH3301-exponent-11 inverse, and p36-seeded power-11/relative-trace stream. The naturally related direct additive LFSR and source-exponent 1033/3301 models were already bounded elsewhere; broadening the exponent or block-phase hunt without a new clue would be unjustified. The factor itself remains an exact, source-linked mathematical structure, while its intended role remains open. A next experiment is warranted only if an independent clue specifies **which** object in the table's extension field is a key, how it is initialized, and exactly which original runes it acts on.
