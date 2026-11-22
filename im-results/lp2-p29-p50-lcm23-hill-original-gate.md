# P29/p50 polynomial LCM yields a 23×23 reversible field matrix

**Agent 3, 22 November 2026. Evidence class: original-source algebraic construction with a bounded negative decryption.** The printed p39 polynomial, physical p29 runic page, and pp49–51 256-cell numerical table together provide an exact 529-coefficient GF29 polynomial. It is mathematically a 23×23 matrix, with **rank 23 and determinant 1 modulo29**. This supplies a reversible original-source Hill-23 key candidate. Directly applying that key to original untouched LP2 ciphertext **recovers no plaintext**.

## Upstream original clue and the new square

The isolated original p39 red runes have GP29 ordinals **[27,5,15]** in printed order. Their rising-power polynomial is

\[
G(X)=27+5X+15X^2=15(X-24)^2\pmod{29}.
\]

Physical p29 is a complete **277-rune** ciphertext page. The numerical table on pp49–51 has **256** two-character source tokens, read as base60 bytes with the established, still conditional source alphabet. Its very first token is 3N =203, or **zero modulo29**. As established in the earlier [original-source shared-double-root census](lp2-p29-grid-sole-repeated-root-and-quotient-key-gate.md), the original high-first p29 polynomial P and p50 table polynomial T are both exactly divisible by G, with no further common polynomial factor.

A solver noticing that two source objects share this unusually specific repeated root might seek a *single* combined source object, so their polynomial least common multiple is an inexpensive, recognizable next operation:

- P has degree276; its G quotient has 275 coefficients.
- T has physical width256, but its leading GP29 coefficient is zero, so its algebraic degree is **254** and its G quotient has **253 significant coefficients**.
- The full source polynomial L = P·T/G has degree 276+254−2 = **528**, and therefore has **529 = 23²** significant GP29 coefficients.
- The independently reconstructed p28 Diffie–Hellman setup uses **prime p=23**, making the square's dimension a plausible human-facing hint.

The SFT reconstructs both exact zero-remainder divisions from the unmodified corpus, checks that the product of the 529 coefficients with G gives the unmodified P·T product (after trimming precisely its one leading field-zero), and verifies all coefficients under the original high-first convention.

Original first row of the exact 23×23 field matrix:

    25 24 9 19 18 17 28 6 12 12 12 1 9 28 11 25 23 26 0 19 5 11 26

The center entry, row11 column11 (zero-based), is **3**, which also matches the p28 recovered exponent e=3; this is a *retrospective observation* rather than an independent instruction. The matrix's GF29 determinant is exactly **1**, a useful algorithmic property since the matrix is fully invertible. The square and determinant are not presented as proof of creator intent.

The competing base59 table interpretation (removing lowercase f from the token alphabet) has first GP residue26 and does **not** divide by this G. Consequently that register does not generate the same 529-coefficient source-derived square. This is downstream of the earlier base60/shared-root finding and should not be double-counted as independent evidence.

**Structural underdetermination, independently checked on original source:** the 23² length is also produced by two other economical source constructions, each forming a distinct invertible 23×23 matrix. Concatenate the complete p29/G quotient (**275** physical coefficients) and complete table/G quotient (**254**, retaining its one physical leading field-zero) to obtain 529; this matrix has determinant **7**, center GP ordinal **28**. Alternatively concatenate the unmodified p29 **277** original coefficients with the p50/(G·H) **252** fixed-width quotient, where H is the independently source-known signed-2013 quadratic [24,26,3]; that matrix has determinant **4**, center **7**. The source therefore supplies **three** exact 23×23 objects under natural combination rules. The polynomial LCM remains the algebraically canonical *joint* object; the arithmetic square size alone cannot uniquely select a key.

## A fully specified original-input decoder

Test the simplest possible reversible use of the resulting printed-order 23×23 matrix, a GF29 Hill cipher. Invert the exact 23×23 matrix by field Gauss–Jordan elimination. Apply to every consecutive 23-rune block of the original **12,956 unknown LP2 runes** from p0 to p55, in continuous original physical order. All original punctuation and word boundaries remain undisturbed. Exactly **seven** final runes do not fill one block; carry these transparently with no invented padding or key offset. Test one receiver with the printed matrix and one with the matrix transposed. No score fitting, sign choices, phase shifts, secret alphabets or supplemental keys.

| Frozen original decoder | Whole-original GP29 IoC | Physical p0 IoC | Terminal p55 IoC |
| --- | ---: | ---: | ---: |
| Printed-rows matrix | **0.0344816866** | 0.0344827586 | 0.0329824561 |
| Transposed matrix | **0.0344950680** | 0.0347752332 | 0.0329824561 |

The two equally source-derived concatenation matrices above were also tested as separate *frozen* Hill23 inverses in both row conventions, with identical complete-cipher and planted-native controls:

| Secondary exact 23-square | Determinant | Continuous whole-original IoC: rows / transpose |
| --- | ---: | --- |
| P29/G concatenated with T/G | **7** | **0.0345073889 / 0.0344886573** |
| Unmodified P29 concatenated with T/(G·H) | **4** | **0.0344634078 / 0.0344540659** |

All four originals are likewise nonlinguistic; the same source-authenticated native GP29 positive **12,956/12,956** recovers under each corresponding key. This compares exactly three pre-existing natural 529-coefficient source constructions; it is no invitation to generate arbitrary further square permutations.

The genuine solved-p57 native-GP cleartext IoC is about 0.06271, a considerably stronger frequency signal. Both complete original inverses are approximately uniform. The first 69 runes of the frozen row-oriented output are:

    P W H AE OE N F OE EA OE S EA P G N S P Y O N TH OE L J A EO M W OE C EO I X F G Y A N X B P W M P IA Y R S IA NG A H N U TH NG Y T G H A M S IA X TH U IA IA

The transposed output is likewise nonlinguistic. Terminal p55's last seven output tokens are unchanged original ciphertext due to the incomplete last block; they are not claimed to have been decrypted.

**Positive controls:** Both matrix-orientation decoders re-encrypt original untouched ciphertext exactly (**12,956/12,956**). More decisively, the same original-source matrix is used to encrypt **12,956 authentic-GP p57-derived planted runes**, then the exact inverse recovers **12,956/12,956** of that genuine GP language. The original 95-rune solved p57 page separately recovers **95/95** from an independently planted ciphertext, including its three-rune incomplete tail. All source/matrix assertions and planted recoveries passed on Windows Node22 GitHub Actions [run 45007602846](https://github.com/FlareZ123/liber-primus/actions/runs/45007602846), covering all three exact 23-square derivations and all six original-input inverses.

## Independently motivated p0 circumference-to-center receiver

There is a second specific way the same source square could have reached previously untouched ciphertext. Original LP2 pp0–2 have exactly **729=27²** runes, while the *already clear* terminal p57 invites the reader to **shed circumferences**. Interpret the complete first-chapter rune stream as one 27×27 printed-order square, discard its two outermost concentric one-cell-thick rings (27²−23² = **200** original positions), and retain the **529 = 23²** source rune positions at rows and columns 2..24. The original red 13-rune p0 title occupies row0 and is thereby excluded, though it is not independently established that this is the intended selection. The p28 DH prime23 and the freshly source-derived p29/p50 23-square supply the proposed inner dimension and a key object without fitting to the cipher.

This is *more clue-constrained* than applying the matrix to the entire original: an original 27² source square, original clear instruction about circumference, and exact 23² source key have an executable join. However, neither the original plaintext nor the book confirms a 27×27 row-major page reflow or selects whether to combine the two squares by modular addition or matrix multiplication.

Freeze four small, complete, reversible receivers with the untouched 529 original central runes in their **original row-major inner-square order**. Apply the source LCM coefficient square as a pointwise GP29 additive key with either sign; independently apply the source full-rank matrix inverse or its transpose to the 23 complete inner rows, using the same convention as the original entire-book Hill test. Test all four against the original, with an independent 529-rune native-solved-p57 positive for each.

| Original inner p0 23×23 decoder | Original native-GP IoC | Original replay | Positive native-GP recovered |
| --- | ---: | ---: | ---: |
| Subtract original LCM square pointwise | **0.0343558458** | 529/529 | 529/529 |
| Add original LCM square pointwise | **0.0339620210** | 529/529 | 529/529 |
| Hill23 inverse, printed LCM matrix | **0.0348713983** | 529/529 | 529/529 |
| Hill23 inverse, transposed LCM matrix | **0.0351936186** | 529/529 | 529/529 |

All four long decoded original sources are nonlinguistic. None approaches genuine GP29 natural-language frequency concentration. This decisively rejects these **exact, nonfitted** source-bound combinations of the two original 23-squares; it does not establish that the books' circumference instruction refers to this receiver at all. A separately source-authenticated operand or actual key instruction would be needed to reopen the route. The extension passed the original-byte + planted-GP Windows Node22 [run 45007856286](https://github.com/FlareZ123/liber-primus/actions/runs/45007856286).

## Research decision

**New exact structural clue:** the previously established source p29/p50/p39 repeated-root relationship has a natural polynomial-LCM square representation with dimension 23, matching the independently relevant source DH prime, and the square happens to be invertible with determinant1. This is a coherent, inexpensive algebraic construction, **not an authenticated original key or solved message**.

**Reject the direct unshifted continuous Hill23 receiver** for the LCM and the two equally natural concatenation-derived 23×23 original-source matrices, both source row conventions, as native-GP original plaintext. **Also reject the four fixed original p0-first-chapter inner-23-square combinations** under literal add/subtract and row/transpose Hill23 decoding. The large remaining cipher space and absent source opcode prevent an inference that all square-based ciphers are excluded. Before pursuing a different receiver, demand a visible instruction selecting how the square should be used, or a genuine independently held-out original plaintext sample. Do not optimize orientations, keys or phases merely to rescue the numeric square.

Reproducer: [sims/lp2_p29_p50_lcm23_hill_original_sft.cjs](../sims/lp2_p29_p50_lcm23_hill_original_sft.cjs) under Node22; it pins the original base60 source SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290. The amended script additionally asserts that base59 does not share the same original factor and that the two alternative source matrices have determinants 7 and 4.
