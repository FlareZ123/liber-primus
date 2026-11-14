# Original p15 matrix stream: unknown four-state keys rejected at two source-selected chapters

**14 November 2026, Agent 7. Classification: exact original-source, conditional negative decipherment.** No unknown Liber Primus plaintext or authentic key recovered. This gate extends the signed Fibonacci-prime matrix investigation by replacing guessed initial states with every mathematically possible initial state compatible with ordinary GP-English one-letter words. The independent positive reconstruction uses original solved p57 GP runes.

## Author-visible route and the specific cipher hypothesis

Original LP2 physical **p15** prints a 4×4 Fibonacci-prime spiral. The next seven original physical pages, **p16–22**, contain **1,744 runes**, or **436 complete four-rune blocks**. The square could supply a four-state linear generator for a source-adjacent additive cipher.

Take the printed matrix modulo29, and its distinct signed variant obtained by undoing the mathematical absolute values on 4516 and1206. For each operator **M**, including transposed orientation and inverse powers, the candidate cipher is

\[
K_{4t+j}=(M^t v)_j\bmod29,\qquad P_{4t+j}=C_{4t+j}-K_{4t+j}\bmod29,\qquad j=0,1,2,3.
\]

Here **v is entirely unknown** in \(\mathrm{GF}(29)^4\). This tests all **707,281** possible four-rune initial states for each matrix operator. The first block is t=0, and the register is carried across the seven physical pages. The unknown-state family also absorbs any initial power shift for invertible M and both additive signs by relabeling v. Choosing block size four and a global state are hypotheses: the original does not explicitly prescribe this cipher.

## Source-fixed plaintext constraints

The canonical resources/lp2-transcription.txt independently confirms the exact printed word boundaries. Its pp16–22 span includes **17 one-rune words** at these chapter-local rune positions:

21, 119, 244, 380, 386, 414, 455, 471, 596, 712, 871, 937, 989, 1032, 1491, 1557, 1574.

In ordinary English rendered in the GP29 orthography, a one-rune word is **A** (GP index24), **I** (10), or **O** (3). Allowing O is deliberately more generous than modern prose's A/I expectation. The first four such positions **21,119,244,380** give linearly independent four-state equations under all eight matrices. Enumerating the complete **3⁴=81** assignments of A/I/O to those four original words determines all possible initial states that could satisfy them. The remaining **13 words never enter the seed solve**. Every one of the original 29⁴ possible states compatible with all 17 constraints must occur among these 81 candidates. This is a finite, exact, full-secret search rather than a fitted language-score scan.

The eight fully source-defined operations are printed and Fibonacci-signed matrices, each in original and transposed orientation, with forward and inverse time evolution:

| Original 4×4 operator | Minimum contradictory one-rune words among 13 held-out | States satisfying all 17 |
| --- | ---: | ---: |
| Printed, forward powers | 9 | 0 |
| Printed, inverse powers | 7 | 0 |
| Signed Fibonacci, forward powers | 9 | 0 |
| Signed Fibonacci, inverse powers | 8 | 0 |
| Printed transpose, forward powers | 10 | 0 |
| Printed transpose, inverse powers | 9 | 0 |
| Signed transpose, forward powers | 9 | 0 |
| Signed transpose, inverse powers | 7 | 0 |

Thus even the best-fitting unknown initial state fails at least **seven of the 13 untouched one-rune English-word constraints**. This excludes **all eight specified four-state additive stream operators** for unchanged, word-preserving GP-English plaintext on original pp16–22. It does not depend on a Shakespeare/Gibran likelihood threshold, arbitrary key ranking, guessed initial vector, or probabilistic significance estimate.


## Independent p39-to-p40 source-locus transfer

Original physical **p39** contains the red three-rune quadratic sharing the signed p15 matrix's repeated root. The next section starts on **p40** with an eight-rune red heading, after which the original **p40–53 black body contains exactly 3,000 GP29 runes = 750 four-symbol blocks**. This independently motivates the same 4×4 generator with its own unconstrained four-rune state. The register begins after the p40 red heading, with no key or phase borrowed from p16.

Thirteen original one-rune words occur at p40-body-local positions **128, 298, 1203, 1324, 1347, 1438, 1878, 1999, 2154, 2303, 2517, 2585, 2606**. The first four (128,298,1203,1324) are linearly independent for all eight tested operators. All 81 A/I/O assignments represent every compatible unknown GF29 four-state initialization; the remaining **nine** are held out.

| Matrix | Minimum contradictory p40 held-out words (nine) | All-13 compatible keys |
| --- | ---: | ---: |
| Printed, forward | 6 | 0 |
| Printed, inverse | 5 | 0 |
| Signed Fibonacci, forward | 6 | 0 |
| Signed Fibonacci, inverse | 6 | 0 |
| Printed transpose, forward | 5 | 0 |
| Printed transpose, inverse | 6 | 0 |
| Signed transpose, forward | 6 | 0 |
| Signed transpose, inverse | 4 | 0 |

The [independent p40 reproducer](../sims/lp2_p40_fourstate_unknown_iv_singletons_sft.cjs) imports the same exact all-secret search and tests an independent **3,000-rune** solved-p57 native-GP forward/encrypted plant. Its hidden planted state is recovered from its own A/I/O words, with exact decryption and re-encryption of all 3,000 GP runes. Hence the entire eight-member family fails for **two independently selected original locations** without choosing any original key.

## Independent positive and reproducibility

The [successful Windows Node22 execution](https://github.com/FlareZ123/liber-primus/actions/runs/43539292133) confirms syntax, every original assertion, the full key search and the positive plant. The [CommonJS single-file reproducer](../sims/lp2_p15_fourstate_unknown_iv_singletons_sft.cjs) parses the exact 2,896 original LP2 words, asserts all 1,744 ciphertext runes and 17 singleton offsets, generates the original GF29 matrix powers, performs exact Gaussian elimination and exhausts each set of 81 compatible four-state keys. It reports all eight original results above.

A separate positive control constructs an entirely hidden state (9,2,15,20), uses the independently solved LP2 p57 GP plaintext as a 1,744-rune cyclic native-language register, and explicitly sets the 17 original one-rune positions to A/I/O. After forward encryption with the signed p15 matrix, the **same blind key-recovery function** recovers the unknown planted state. Its full inverse restores every one of the **1,744 plaintext runes**, and forward re-encryption reproduces the encrypted control exactly. This validates the key solve and the stateful four-rune arithmetic.

## Decision and surviving routes

The 2014 source gives a well-established Fibonacci-prime numerical square and a mathematically intriguing p39 red-quadratic relationship. The direct unknown-IV four-state **additive** consumer has no viable original-English key under either signed or printed matrix and either time orientation at **both** independently motivated source chapters, p16–22 and p40–53 black body. Do not repeat unknown-IV searches for this exact eight-model family. Unrelated dynamic nonlinear operators, a binary intermediate, alternative source-selected state resets, non-English texts or a different source-directed use of the square remain open. A new premise should identify what the human solver would read as the operation and how plaintext or a key would be recovered.
