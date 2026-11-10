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

## Stronger theorem: every secret 16-row-periodic substitution table fails the same source-register test

The p15 numerical spiral supplies exactly **16** independently printed values. A more permissive architecture than the preceding bilinear Fibonacci pad would reuse a distinct secret alphabet at each of the 16 row phases, and allow the alphabet to differ **for every individual column**. This is an exact unknown-key model, with \`16×81 = 1,296\` completely arbitrary **29!** row-specific permutations on the first square and **1,280** on the second:

\[
C_{r,c}=S_{(r+\phi)\bmod16,\ c}(P_{r,c}),\qquad S_{j,c}\in\operatorname{Sym}(29).
\]

There is no assumption of affine keys, Fibonacci arithmetic, a particular printed value-to-key map, or shared key across columns. Any fixed \(\phi\) merely relabels those secret tables.

**Universal equality invariant.** Since the substitution at \((r,c)\) is the same permutation as at \((r+16,c)\), injectivity forces

\[
[C_{r,c}=C_{r+16,c}]
\quad\Longleftrightarrow\quad
[P_{r,c}=P_{r+16,c}].
\]

The actual *number* of equal symbol pairs separated by 16 square rows is therefore **exactly unchanged** by *all* \((29!)^{16w}\) secret table choices, for any \(w=80,81\). This holds if the square's printed rows or columns supply the logical cipher rows, in either direction. It also holds for rank-one source-derived 16-number row pads, regardless of column keys. A different row schedule, nonbijective error handling, or additional plaintext whitening evades the invariant.

| Source-bound square / logical axis | Original equalities | Pair positions | Minimum from 2,000 Shakespeare windows | Minimum from 2,000 Gibran windows |
| --- | ---: | ---: | ---: | ---: |
| 81×81, ordinary rows | **151** | 5,265 | **265** | **281** |
| 81×81, transpose | **158** | 5,265 | **260** | **272** |
| 80×80−5, ordinary rows | **178** | 5,115 | **267** | **271** |
| 80×80−5, transpose | **177** | 5,115 | **258** | **263** |

These comparisons use real unsolved GP29 values, no fitted key and no assumed plaintext. Source controls are *contiguous literary GP rune windows* with the same exact square geometry and omitted five cells. Each corpus supplies 2,000 partly overlapping windows, tested separately per axis, so the finite minima are descriptive source facts rather than independent probabilities. The original has only ~**2.87–3.48%** matching pairs; genuine literary source windows have substantially more. In all **four** original axes, the count is below the *lowest* of all 2,000 Shakespeare windows and all 2,000 Gibran windows. This excludes the proposed full 16-period column-indexed permutation family for the *declared author-native GP source interpretation*, while leaving many more complex architectures open.

A full secret-table positive generated 1,296 independent uniformly shuffled 29-symbol permutations for the 81×81 control and 1,280 for the terminal square. The known planted inverse recovered **all 12,956 GP plaintext symbols and re-encrypted all 12,956 ciphertext symbols exactly**. Crucially, the per-block equality counts were **exactly preserved**: **298/5,265** for the first genuine-source plant and **307/5,115** for the second. This is a universal-key invariant, so the test does not attempt to recover arbitrary hidden permutations from original ciphertext.

This stronger result supersedes any inference that a different 16-number Fibonacci or prime-derived row *value* could rescue the same 16-period square architecture. Changing the 16 values, the phase, or the secret lookup tables does not change the equality certificate. Recovering actual LP2 text would require a cipher that *does* change its within-column state between row \(r\) and \(r+16\), changes source-register symbol equality before encryption, or uses a different original reading order.

**Independent reproduction:** [all-secret period-16 square collision program](../sims/p15_period16_square_collision.cjs), seeds \`0x16403301\` and \`0x16403302\`, both exact secret-key positive inverses; [passing Windows CI run 42841017053](https://github.com/FlareZ123/liber-primus/actions/runs/42841017053), existing square-source job. The counts and controls use only the original GP corpus, Shakespeare and Gibran resource files already committed. This result is strongest as a **known-source conditional exclusion**, not evidence of a decrypted original passage or the author's intended 16-periodity.

## Scope and next genuinely promising step

This rejects the source-motivated **zero-preserving Fibonacci row-factor family** for a native-GP-English plaintext interpretation in these hypothetical square blocks. It neither validates the retrospective 6,561 split nor excludes a nonlinear evolving state, additional byte-compression layer, a nonzero shifted Fibonacci factor, a different row/column layout, an external-key pad, or another plaintext register. A successor should propose an independently sourced transformation that **removes the mandatory zero rows** and supplies an actual reversible original-cipher plaintext; simply increasing phase fits cannot rescue this family.

**Reproduce:** [exact CommonJS original-source inverse, nontrivial blind-key plants, and source-window controls](../sims/fibonacci_bilinear_square_inverse.cjs), Node.js 22, seeds \`0x40cafe45\` and \`0x40cafe46\`; [successful original CI Windows run 42839845603](https://github.com/FlareZ123/liber-primus/actions/runs/42839845603), job **bookend-81square-source-invariant**. Inputs: [original normalized GP rune pages](../resources/liber-primus/lp2-corpus.json), [Shakespeare source reference](../resources/control/shakespeare_first300k.txt), [Gibran control](../resources/control/gibran_prophet_58585.txt). The independent Gibran numerical comparison was executed directly on the exact shared resources; the CI script currently reproduces the Shakespeare control and original/planted models.
