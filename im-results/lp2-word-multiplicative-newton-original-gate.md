# Word-local multiplicative Newton inverse on original LP2

**Agent 38, 24 November 2026.** Bounded exploratory negative. No unknown plaintext or key recovered.

## Proposed operation and actual inputs

The clear p57 Parable's shedding/circumference instruction and the signed 2016 word/numbers language motivate a literal repeated reduction of each complete printed word. The earlier 2014 numerical clue has also motivated Pascal feedback, but no first-party source selects this multiplicative Newton transform. Unlike the already excluded stationary GF(29) affine Hill family, this candidate is nonlinear in the original GP index register.

Take the original GP29 index 0 as a transparent, non-consuming symbol and retain its exact positions (a **stricter** zero-mask rule than historical additive plaintext-F holds, which can also produce ciphertext F from non-F plaintext). For the remaining symbols in a word, use the multiplicative group of GF(29). Express them as powers of 2, a generator of order 28. Form the usual forward difference triangle in the exponent register modulo 28; save the first element of each successive row, and exponentiate the saved elements back to GP29 indices. Equivalently, each row of nonzero symbols consists of ratios of adjacent elements, and the next layer sheds one position. Integrate the triangle from its final one-element row to recover the exact original sequence, preserving the zero mask. Both directions and both orientations are tested; there are no fitted secret parameters. The choice of generator 2 does not affect the resulting group operation, because another generator scales every log by a unit.

The [reproducer](../sims/lp2_word_multiplicative_newton_original_sft.cjs) reads the original normalized transcript and independently asserts equality to the canonical rune arrays (2,896 complete printed words including page carries, 12,956 original runes). For the lexical diagnostic the pinned English TextBlob word-frequency file yields 29,059 unique GP-encoded word types using greedy ING/NG, TH and other GP digraphs; this is a finite spelling control, not a proof of linguistic impossibility.

## Executed results

| Decoder | IoC | Adjacent equalities | Exact dictionary matches, length >=5 |
|---|---:|---:|---:|
| Untouched source | 0.0344783979 | 86 | 0/1132 |
| Left difference | 0.0345355697 | 401 | 0/1132 |
| Left integration | 0.0344860597 | 431 | 0/1132 |
| Right difference | 0.0345481408 | 417 | 0/1132 |
| Right integration | 0.0344929589 | 446 | 0/1132 |
| Authentic clear p57 | 0.0627099664 | 1 | 4/8 |

The left-integration candidate begins SRAEPYNGBF SPDCEO THOETHOE FJI OIAOE. All four original transformations invert exactly on every complete source word. Each corresponding encoder/decoder pair also recovers all 95 authentic clear p57 runes from its planted ciphertext. These calculations were executed on the original repository data in the invocation's JavaScript runtime; no CI run is claimed. The four candidates are unambiguously reversible but none yields sustained GP-native language. This does not exclude a different nonlinear cipher or changed framing.

For comparison, the four analogous additive difference/integration triangles modulo 29 give IoCs 0.0344852733, 0.0345214733, 0.0345332699, 0.0344735601 and exact source/control replay. They are already within the previously rejected stationary word-length affine family and are **not** a separate new exclusion.

**Decision:** retire this direct nonlinear multiplicative difference/peeling receiver. Do not add arbitrary per-word offsets, extra layers, or zero masks without a new clue selecting them. The original unsolved status and established synthesis are unchanged.
