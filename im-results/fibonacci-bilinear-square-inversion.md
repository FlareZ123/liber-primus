# Fibonacci row-zero obstruction and an exact bilinear square decoder

**Status, 10 November 2026 (Agent 40):** A new **source-clue-driven cipher model was inverted completely on both blind natural-language controls**, then rejected as an explanation of original LP2 under the stated native-GP plaintext register. **No original unknown LP2 plaintext, authentic key, historical cipher mechanism, or hidden destination was recovered.** All original inference is conditional on the 81² and 80²−5 source geometries and using GP-English plaintext before encryption.

## Why this model is worth testing

The published second-release p15 (source scan 32.jpg) contains a 4×4 numerical spiral exactly generated from primes whose indices are Fibonacci numbers plus one. The authentic unresolved rune string has **12,956** glyphs; the repeated six-rune bookend ends at **6,561 = 81²** and again at the final rune, leaving **6,395 = 80²−5**. Both observations were selected after seeing the ciphertext and do **not** authenticate two matrix cipher blocks. They make a finite-field Fibonacci square a concrete, source-motivated candidate.

A direct nonperiodic rank-one field-key proposal is:

\[
C_{r,c}=P_{r,c}+F_{r+\phi}V_c\pmod{29},
\]

where \(\phi\) is an **unknown phase**, each column's \(V_c\) is a completely unrestricted and unknown field element, and the 81²/80² blocks may use independent keys and phases. Allow either original square axis to supply rows, and either direction along the rows. This is a broader secret-key family than any fixed periodic 16-rune Vigenère: **81+80 arbitrary field elements** are permitted as true unknown keys. The terminal square's five nonexistent cells are treated as missing, never supplied with guessed runes.

## Key-independent Fibonacci theorem

The exact Fibonacci recurrence gives \(F_{14}=377\equiv0\pmod{29}\) and \(F_{15}=610\equiv1\pmod{29}\). The Fibonacci addition identity therefore gives

\[
F_{n+14}=F_{15}F_n+F_{14}F_{n-1}\equiv F_n\pmod{29}.
\]

Consequently **Fibonacci modulo 29 has period 14**. For *every* phase, at least **five of the 81 (or 80) square rows** have \(F_{r+\phi}=0\). On those rows,

\[
C_{r,c}=P_{r,c}\quad\text{for every unknown }V_c.
\]

Thus any such bilinear field cipher must leave roughly **400–486 authentic GP rune positions untouched**. This necessary condition extends without modification to any reversible nonlinear mask satisfying \(E(P,0,V)=P\), even if its nonzero-row behavior is arbitrary. It applies to the given square geometry and independently native-GP plaintext; it does not extend to a separately whitened or transposed plaintext, nonzero-valued tweaked Fibonacci sequences, or arbitrary key schedules.

Take a GP-English reference distribution fitted **only** to the first 100,000 GP-encoded Shakespeare symbols (Laplace +1). For each of **all 14 unknown phases and both original square axes**, sum the natural-log GP likelihood on mandatory zero rows. The best result is chosen *in favor of the hypothesis*; serpentine traversal, reversing a row, and dihedral rotations leave the zero-row **unigram** diagnostic unchanged. The original's strongest possible zero-row GP scores are:

| Original block | Original zero-row best (nats/rune) | Zero-row symbols | Best axis, phase |
| --- | ---: | ---: | --- |
| 81×81; 6,561 runes | **−4.143428** | 486 | row, phase 6 |
| Terminal 80×80−5; 6,395 runes | **−4.134240** | 480 | column, phase 13 |

As a source-only comparison, the same *full best-axis, best-phase selection* was applied to **1,024 overlapping 6,561-rune windows** of previously unused Shakespeare GP source, starting from symbol offset 100,000 and separated by 100 symbols. Their selected zero-row scores range **−2.968644 to −2.860431**, with median **−2.919708**. **Zero of 1,024** source windows scores as poorly as even the more generous original best (−4.134240). An additional independent Gibran control of **1,886** overlapping 6,561-rune windows has range **−2.972308 to −2.849802**, median **−2.913547**, using the unchanged Shakespeare-trained GP likelihood. These are finite-source comparisons with overlapping windows, **not** a discovery-wide significance test or a mathematical impossibility for all imaginable English passages.

The score deficit is enormous across hundreds of mandatory unchanged symbols. It cannot be repaired by selecting different column keys, bilinear phases, or any of the four standard square orientations. This is the strongest source-model contradiction, independent of key search.

## Complete original-cipher inversion rather than header matching

The exact finite decoder also genuinely searches each complete original square. In any specified orientation and phase, every column key is conditionally independent, and its best native-GP value is recovered by enumerating all **29** values. Exhaustively enumerate **2 square axes × 2 row directions × 14 phases = 56** complete original model configurations. Select *solely by the first two-thirds of square rows*, freeze the keys and evaluate the untouched remaining rows with their original keystream coordinates.

| Metric | Original 81² | Original 80²−5 | Native-GP planted 81² | Native-GP planted 80²−5 |
| --- | ---: | ---: | ---: | ---: |
| Training log likelihood / rune | **−3.752501** | **−3.750519** | **−2.958262** | **−2.962995** |
| **Frozen heldout log likelihood / rune** | **−4.200206** | **−4.254958** | **−2.936928** | **−2.981324** |
| Heldout original-length rune positions | 2,187 | 2,155 | 2,187 | 2,155 |
| Correct independently hidden column keys | No authentic key found | No authentic key found | **81/81** | **80/80** |
| Exact plaintext + ciphertext re-encryption in positive | No plausible plaintext | No plausible plaintext | **6,561/6,561** | **6,395/6,395** |

The controls encrypt *unseen genuine Shakespeare GP prose* with two different, independently hidden Fibonacci phases **7 and 9** and arbitrary seeded 81- and 80-element column keys. Without being told either true phase or any key, the same decoder recovers every source symbol and re-encrypts the entire 12,956-rune test manuscript. In original LP2, the selected phases (7 and 8) and secret column keys are only **training maximizers**. Although their candidate plaintext necessarily re-encrypts original glyphs, it has no credible language content and fails the independent heldout source test. The exact re-encryption identity is an implementation check, never a historical plaintext claim.

## Scope and next genuinely promising step

This rejects the source-motivated **zero-preserving Fibonacci row-factor family** for a native-GP-English plaintext interpretation in these hypothetical square blocks. It neither validates the retrospective 6,561 split nor excludes a nonlinear evolving state, additional byte-compression layer, a nonzero shifted Fibonacci factor, a different row/column layout, an external-key pad, or another plaintext register. A successor should propose an independently sourced transformation that **removes the mandatory zero rows** and supplies an actual reversible original-cipher plaintext; simply increasing phase fits cannot rescue this family.

**Reproduce:** [exact CommonJS original-source inverse, nontrivial blind-key plants, and source-window controls](../sims/fibonacci_bilinear_square_inverse.cjs), Node.js 22, seeds \`0x40cafe45\` and \`0x40cafe46\`; [successful original CI Windows run 42839845603](https://github.com/FlareZ123/liber-primus/actions/runs/42839845603), job **bookend-81square-source-invariant**. Inputs: [original normalized GP rune pages](../resources/liber-primus/lp2-corpus.json), [Shakespeare source reference](../resources/control/shakespeare_first300k.txt), [Gibran control](../resources/control/gibran_prophet_58585.txt). The independent Gibran numerical comparison was executed directly on the exact shared resources; the CI script currently reproduces the Shakespeare control and original/planted models.
