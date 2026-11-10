# Red quadratic primitive field and the 840-state no-go for direct GP29

**Classification, 10 November 2026:** source-exact field algebra and a key-independent, original-ciphertext constraint on a narrow but source-motivated entire cipher family. No authentic LP2 plaintext, private key, continuation address or independently established encryption method has been recovered.

## Why this is a plausible, testable operation

The two original length-three marked red spans are physical LP2 p3 local indices 119–121, zero-based GP indices **[13,23,2]**, and p39 local 119–121, **[27,5,15]**. The former, in ascending polynomial-degree order, is

\[
13+23u+2u^2=0,\quad u^2=3u+8\quad\text{in }\mathrm{GF}(29^2).
\]

Its discriminant is the nonsquare 19, so it defines a genuine quadratic extension. Repeated multiplication of its distinguished residue class \(u\) has **exact order 840 = 29²−1**, the entire group of nonzero field elements. The exact reproducible program checks that none of the first 839 powers equals 1.

The latter red polynomial is \(27+5X+15X^2=15(X-24)^2\) modulo 29. The printed 256-byte table, in unmodified row-major order, is divisible **twice** by \(X-24\) when interpreted as a descending-coefficient polynomial over GF(29). Both remainders are zero, leaving 254 coefficients. The oversized p54 Ac rune has GP index 24. These original-source constraints are genuine algebraic coincidences, and the two red triads offer a possible human clue to read the 254 coefficients as 127 elements of the extension field. Whether their authors designed them for this purpose remains unknown.

A simple, economically testable proposed cipher would generate a single hidden state \(s_i=s_0u^i\) in this field and apply **any secret bijection of all 29 GP symbols chosen by that state**. The key may contain 840 unrelated 29! lookup rows, and their contents need never be recovered. Every state repeats by 840, therefore:

\[
C_i=C_j\iff P_i=P_j\qquad
\text{whenever the state/clock positions coincide modulo 840.}
\]

This identity survives arbitrary one-to-one output permutations, unknown initial field state, unobserved starting phase and any generator whose period divides 840. It is a necessary property for a direct GP29 rendering with the specified fixed state and no plaintext/ciphertext feedback. It is *not* a property of general stream ciphers, lossy encodings, hidden-state resets, or arbitrary non-GP plaintext representations.

## Test of the complete unknown manuscript

Input: all **12,956 original unknown LP2 GP rune indices** across 55 rune-bearing pages. For every repeated clock phase, count equal rune pairs divided by all pairs sharing that phase. No secret row, plaintext letters or key are fitted. The two main clocks are continuous book position modulo 840, and local physical-page position modulo 840 with **the same hidden state/permutation reinitialized at every page**. The canonical eight-section clock is also tested separately; its published p32/p33 boundary ambiguity does not affect the book/page results.

| Clock convention | Original equal pairs / possible | Original rate |
|---|---:|---:|
| Continuous book | 3,277 / 93,540 | **0.03503314** |
| Same state reinitialized each physical page | 10,751 / 311,132 | **0.03455447** |
| Independent state permutation per canonical section and phase | 307 / 9,051 | **0.03391890** |

By comparison, the trivial uniform baseline is \(1/29=0.03448276\). Three genuinely external, source-native GP English controls are normalized by the public GP alphabet, including K/C, V/U, QU/CW, Z/S and ING/NG, then evaluated in **300 fixed evenly spaced 12,956-rune windows per text** using the exact same positions. Source-native GP and a secret 840-state affine bijection were planted and inversed exactly, proving the per-phase collision invariant and plaintext recovery mechanically.

| External GP text | 300-window book-rate range | 300-window page-rate range | Windows with rate at/below authentic LP2 |
|---|---:|---:|---:|
| Shakespeare | 0.05755–0.06315 | 0.05711–0.06271 | 0 / 300 |
| Gibran, *The Prophet* | 0.05856–0.06318 | 0.05861–0.06357 | 0 / 300 |
| Emerson, essays | 0.06027–0.06527 | 0.06079–0.06440 | 0 / 300 |

**Decision:** The source's natural primitive \(\mathrm{GF}(29^2)\) clock supplies no direct native-GP29 substitution/permutation explanation of the unknown manuscript under the declared book, section or fixed-page-reset conventions. This excludes every secret periodic permutation within this exact architecture in one computation, without searching its vast key space. The controls are overlapping text windows, so 0/900 is a descriptive source-disjoint comparison rather than a discovery-adjusted universal probability or a proof against every possible language.

The source's field generator remains mathematically real and potentially relevant to **an evolving feedback state, non-GP intermediate representation, transposition or source-specified key schedule**. Those architectures need a separate, original-data forward operation before an inverse would be meaningful.

**Reproducer:** [single runnable CommonJS test](../sims/red_triad_gf841_phase_invariant.cjs). It derives the algebra directly from the committed original corpus, checks both exact grid divisions, computes the collision invariant, evaluates 900 source windows, and exactly decrypts nine native-GP planted ciphertexts, each 12,956 runes long. No unknown LP2 output is silently treated as plaintext.
