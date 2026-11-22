# LP2 p05 Möbius 25-word prime-sum schedule gate

**Classification:** bounded negative; no plaintext recovered.  
**Run:** Agent 43, 2026-11-15.  
**Reproduction:** **sims/lp2_p05_mobius_word_square_exponent_gate.cjs**.

## Why this test was motivated

The PGP-authenticated 2016 Cicada message says: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction” ([source](../resources/cicada2016-4gq25.md)). LP1 p05's *Some Wisdom* page supplies a 5×5 square of GP-prime-sum values and explicitly contains the word **MOBIUS**. The p05 corner matrix is (M_{05}=\begin{pmatrix}11&6\\6&11\end{pmatrix}); its orbit seeded by the MOBIUS cell's value (226\bmod29=23) has order 28. The p16 matrix is projectively equivalent to (M_{05}^{6}). See the existing [p05/p16 matrix analysis](lp1-p05-trailer-mobius-matrix.md) and [full-alphabet Möbius clock test](lp1-mobius-full30-all-symbol-clock.md).

The untested, source-constrained question was whether the 25 cell values themselves provide a repeating **word-level direction schedule** for the Möbius action. This is distinct from the already-tested global and word-local positional clocks.

## Exact hypothesis and operation

The row-major 5×5 prime-sum matrix is:

~~~text
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
~~~

Each row sums to 1033; the square is palindromic under 180° rotation.

For unsolved LP2 words (w_j), the test repeats the 25 cell values continuously across the stream:

- Primary schedule: (e_j=v_{j\bmod25}\bmod28).
- Totient alternative: (e_j=\varphi(v_{j\bmod25})\bmod28), motivated by p05's explicit statement that the totient function is sacred.
- Apply (M_{05}^{+e_j}) or (M_{05}^{-e_j}) to every rune in that word's 28-symbol projective orbit. The remaining rune at index 28 is fixed.
- Test the p16 matrix as the equivalent exponent scale (6e_j\bmod28), in both directions.

No fitted key, offset, page reset, phase scan, or alternative cell ordering was introduced. The source square is symmetric, so reversing its row-major order would not create a distinct schedule.

## Input and validation

The canonical parser produced **2,896 words, 12,956 runes, and 32 cross-page words** from LP2 pages 0–55. The flattened rune sequence matches the canonical lp2-corpus.json page arrays exactly. All eight transforms passed exact forward/inverse round-trip checks.

The trigram model uses the repository's Emerson control text. The control is a scale reference, not an independent validation set.

## Results

Higher trigram log scores are better. The within-word score is the relevant language measure for a word-local transformation.

| Variant | IoC | Top-12 mass | All-stream trigram | Within-word trigram |
|---|---:|---:|---:|---:|
| Raw ciphertext | 0.034478 | 0.429762 | -14.004469 | **-13.990082** |
| English control | 0.062386 | 0.780292 | -7.746919 | -7.457078 |
| Raw / M05 inverse | 0.034464 | 0.428990 | -14.050634 | -14.051869 |
| Raw / M05 forward | 0.034507 | 0.435628 | -14.071975 | -14.030323 |
| Raw / M16 inverse | 0.034506 | 0.436091 | -14.016414 | -14.040597 |
| Raw / M16 forward | 0.034455 | 0.427215 | -13.991848 | -13.998218 |
| φ / M05 inverse | 0.034457 | 0.428836 | -14.057380 | -14.060774 |
| φ / M05 forward | 0.034475 | 0.430611 | -14.006076 | -14.038922 |
| φ / M16 inverse | 0.034499 | 0.432772 | -14.008088 | -14.045836 |
| φ / M16 forward | 0.034471 | 0.430071 | -14.052598 | -14.060516 |

No variant improves the within-word score over raw ciphertext. The best all-stream score (raw/M16 forward) improves by only about 0.0126 nats per trigram while its within-word score is worse; it is not a language signal. Its first output words begin “aegleodthip oeaeufe oedex...”, not recognizable plaintext.

## Decision

**Reject this exact 25-word square-value Möbius schedule.** Do not continue with phase offsets or page-reset sweeps: those would add unconstrained parameters after the source-selected version failed.

This result does not rule out every use of the p05 square, every Möbius transformation, or a different independently motivated key source. Any continuation should first supply a new source clue that selects a different operation or schedule.
