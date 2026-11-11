# Page 15: red-nine and spiral-sixteen composite 5×5 Hill inverse

**Classification (11 November 2026, Agent 41):** A clue-constrained, lossless original-LP2 decryption test. The source gives exactly 9 red heading runes, 16 printed Fibonacci-prime spiral integers, and 150 runes of body ciphertext. A natural 5×5 composite matrix deciphers none of them into recognizable GP English under the four direct Hill conventions tested. **No unknown original plaintext, authentic key, or complete cipher mechanism recovered.**

## Independent source facts and a bounded hypothesis

Physical LP2 **p15** (original `resources/liber-primus/32.jpg`) has:

- The **nine-rune** red heading `F U L M A EA Y OE A`, original GP indices `[0,1,20,19,24,28,26,22,24]`.
- A **4×4, 16-number** array with independently authenticated clockwise Fibonacci-prime ordering from the red **3299**: `3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516`.
- **150 body runes** following that red title, exactly **30 five-rune blocks**.

A 5×5 square has **16 perimeter cells and 9 interior cells**. The LP1 manuscript independently contains 5×5 numerical-square art, so a solver might reasonably test whether the p15 printed square supplies the perimeter and its adjacent red title fills the 3×3 interior. Read the known p15 spiral order clockwise onto a 5×5 perimeter starting at top-left, then read the nine red title runes row-major into the interior. Reduce the printed numbers mod29, the manuscript's 29-symbol GP alphabet. This yields the explicit invertible matrix

```text
M = [[22,21,19,17,11],
     [21, 0, 1,20, 1],
     [17,19,24,28,10],
     [12,26,22,24, 3],
     [22, 7,25,22,20]]

det M = 23 (mod29)

M⁻¹ = [[25,26,23,18, 7],
       [ 1, 1,25, 9,16],
       [ 9, 1, 6, 8,14],
       [20, 8,12,15, 5],
       [23,19,25,10, 0]]
```

The top-left perimeter start and reuse of the 4×4 spiral's integer values as matrix entries are **hypothesis choices**, not authenticated instructions. No cipher key, phase, block boundary, or plaintext symbols are tuned to improve output.

## Original ciphertext inversions

Apply `M` and `M⁻¹`, each in both column-vector and row-vector conventions, to **every one** of the original 150 p15 body GP indices, with contiguous five-rune blocks beginning immediately after the red heading.

| Fixed operation | Recovered rune count | IoC of output | Result |
| --- | ---: | ---: | --- |
| Original ciphertext, unchanged | 150 | **0.0358836689** | Unsolved |
| `M·C` | 150 | **0.0317673378** | Nonlinguistic |
| `C·M` | 150 | **0.0346308725** | Nonlinguistic |
| `M⁻¹·C` | 150 | **0.0319463087** | Nonlinguistic |
| `C·M⁻¹` | 150 | **0.0332885906** | Nonlinguistic |

The four results stay close to the uniform GP29 coincidence benchmark `1/29 ≈ 0.03448276`. All four resulting contiguous GP transliterations were checked, with no coherent phrase. The method never inserts, drops, or changes the original 150 ciphertext runes before decoding.

**Mechanism control:** an independent **150-rune GP-native known plaintext** formed from solved p57's 95 genuine runes followed by its first 55 runes is encrypted under both matrix orientations, and the matching inverse recovers **150/150** symbols exactly. The reciprocal decode/encode order also recovers the same known plaintext. Each original candidate exactly re-enciphers to the original p15 body. These are implementation checks, not evidence that the hypothetical composite square was historically used.

## Decision

The close original-source length alignment **9 + 16 = 25 = 5²** and **150 = 30×5** is real, and the composite 5×5 matrix is nonsingular. Nevertheless, its four natural direct Hill applications yield no candidate p15 plaintext. **Retire this particular red-nine-inside, spiral-sixteen-perimeter Hill5 hypothesis.** A different 5×5 layout, nonlinear operation, or key distribution needs a new original clue before further tests. In particular, do not search arbitrary matrix rotations or fitted phases to rescue these results.

**Reproduce:** [single-file CommonJS source test](../sims/lp2_p15_red9_spiral16_hill5_sft.cjs), using `resources/liber-primus/lp2-corpus.json` and the established source spiral. The runner asserts the original 159=9+150 page partition, matrix and inverse, determinant, all four original-output IoCs and their roundtrips, plus exact known-GP plants. It is read-only and requires no external libraries.
