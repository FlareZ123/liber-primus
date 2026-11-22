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

## A fully specified original-input decoder

Test the simplest possible reversible use of the resulting printed-order 23×23 matrix, a GF29 Hill cipher. Invert the exact 23×23 matrix by field Gauss–Jordan elimination. Apply to every consecutive 23-rune block of the original **12,956 unknown LP2 runes** from p0 to p55, in continuous original physical order. All original punctuation and word boundaries remain undisturbed. Exactly **seven** final runes do not fill one block; carry these transparently with no invented padding or key offset. Test one receiver with the printed matrix and one with the matrix transposed. No score fitting, sign choices, phase shifts, secret alphabets or supplemental keys.

| Frozen original decoder | Whole-original GP29 IoC | Physical p0 IoC | Terminal p55 IoC |
| --- | ---: | ---: | ---: |
| Printed-rows matrix | **0.0344816866** | 0.0344827586 | 0.0329824561 |
| Transposed matrix | **0.0344950680** | 0.0347752332 | 0.0329824561 |

The genuine solved-p57 native-GP cleartext IoC is about 0.06271, a considerably stronger frequency signal. Both complete original inverses are approximately uniform. The first 69 runes of the frozen row-oriented output are:

    P W H AE OE N F OE EA OE S EA P G N S P Y O N TH OE L J A EO M W OE C EO I X F G Y A N X B P W M P IA Y R S IA NG A H N U TH NG Y T G H A M S IA X TH U IA IA

The transposed output is likewise nonlinguistic. Terminal p55's last seven output tokens are unchanged original ciphertext due to the incomplete last block; they are not claimed to have been decrypted.

**Positive controls:** Both matrix-orientation decoders re-encrypt original untouched ciphertext exactly (**12,956/12,956**). More decisively, the same original-source matrix is used to encrypt **12,956 authentic-GP p57-derived planted runes**, then the exact inverse recovers **12,956/12,956** of that genuine GP language. The original 95-rune solved p57 page separately recovers **95/95** from an independently planted ciphertext, including its three-rune incomplete tail. All source/matrix assertions and plant recoveries passed on Windows Node22 GitHub Actions [run 45007179222](https://github.com/FlareZ123/liber-primus/actions/runs/45007179222).

## Research decision

**New exact structural clue:** the previously established source p29/p50/p39 repeated-root relationship has a natural polynomial-LCM square representation with dimension 23, matching the independently relevant source DH prime, and the square happens to be invertible with determinant1. This is a coherent, inexpensive algebraic construction, **not an authenticated original key or solved message**.

**Reject the direct unshifted continuous Hill23 receiver**, both source row conventions, as native-GP original plaintext. The large remaining cipher space and absent source opcode prevent an inference that all square-based ciphers are excluded. Before pursuing a different receiver, demand a visible instruction selecting how the square should be used, or a genuine independently held-out original plaintext sample. Do not optimize orientations, keys or phases merely to rescue the numeric square.

Reproducer: [sims/lp2_p29_p50_lcm23_hill_original_sft.cjs](../sims/lp2_p29_p50_lcm23_hill_original_sft.cjs) under Node22; it pins the original base60 source SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290. The follow-up amended script also asserts that base59 does not share the same original factor.
