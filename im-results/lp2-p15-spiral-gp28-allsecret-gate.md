# LP2 p15 spiral: an exact 16-phase GP28 exponent-chain inverse gate

**Finding (Agent 4, 13 November 2026): a direct full-chapter cipher candidate fails, and the entire chapter-continuous family of arbitrary 16-phase predecessor-step substitutions is excluded for source-native GP-English plaintext.** No previously unknown LP2 plaintext, authentic key or author-selected exponent cipher is recovered.

## Independently visible clue and frozen operation

The original physical p15 contains the 4×4 number square whose clockwise spiral starts with the red 3299. The exact 16 values are

`3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516`.

Subtracting the first 14 from 3301 and adding the last two to 3301 gives the known Fibonacci-indexed primes

`[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]`.

This is an independently printed 16-value source list, rather than an optimized or guessed key. The adjacent original image chapter pp15–22 contains **1,903 consecutive GP29 ciphertext runes**. The following is a *hypothesis*, as no surviving Cicada instruction specifies modular exponentiation on LP2 differences:

1. Preserve the first p15 GP rune (actual index 0) as the chapter IV. At each later rune compute the exact nonnegative `D_i = (C_i-C_(i-1)) mod29`.
2. GP29's multiplicative group has exactly 28 nonzero values, with generator 2. For `D_i != 0`, compute `e_i = log_2(D_i) mod28`. On an uninterrupted 16-phase clock, invert the literal p15 key with `P_i = (e_i-primeKey[phase mod16]) mod28`, advancing `phase`. This maps to the 28 plaintext rune indices 0..27.
3. For `D_i = 0`, emit reserved plaintext EA (GP index28) and **hold** the phase. A full inverse maps each phase symbol into `2^e mod29`, adds the resulting nonzero difference to the preceding ciphertext index, and reproduces all repeated symbols. This makes the model lossless after its explicit chapter-initial IV.

The independent generator and reserve semantics are plausible finite-field interpretations of the 29-rune/prime source and solved-Cicada interrupters. Neither is authenticated as a historical LP2 operation. The choice of a *continuously repeated* 16-symbol key, as opposed to evolving state or a page reset, is likewise a tested premise.

## Exact original-cipher result

The original 1,903-rune chapter produces exactly **1,902 transitions**, of which **10 are zero**. The frozen exponent/key inverse gives GP29 symbol IoC **0.03538565955**, visually nonlinguistic output. The unaltered source ciphertext IoC is **0.03450194585**. This does not approach conventional GP-English's character concentration and yields no original plaintext.

The stronger result requires **no value of the 16 key symbols, no fixed generator, and no recovered permutation**. Grant each of 16 phase positions an *arbitrary independent 28-symbol bijection* mapping the observed nonzero transition to an unknown plaintext symbol, and preserve the same step-hold rule for all 10 zeros. For each of 16 observed phase groups, equality of nonzero input steps must imply equality of output plaintext symbols under every such bijection. Summing over all phases:

| Original or source-native heldout statistic | Exact original p15–22 | 170 nonoverlapping Emerson GP-literary control windows |
| --- | ---: | ---: |
| Nonzero-step positions | 1,892 | about 1,875–1,892 after removing rare EA |
| Equal ordered symbol pairs at matching phases / all matching-phase ordered pairs | **8,056 / 221,840** | each window has substantially more phase-matched equalities |
| Matching-phase symbol coincidence rate | **0.03631446087** | minimum **0.05830248183** |
| **Upper bound** on copies of *any single plaintext rune* after any 16 secret phase bijections | **150** | not a required quantity for controls |
| Actual most-common GP rune count in each native control passage | cannot exceed **150** under proposed cipher | minimum **187**, median **234**, maximum **283** |
| Sum of per-phase maximum counts (same measure on each stream) | **150** | minimum **225** |

The all-secret 150 bound is exact: in any phase, one output rune can occupy no more sites than the most frequent observed input step in that phase. The 16 per-phase maxima sum to 150. The ten zero steps can only emit the reserved EA symbol, so its count is exactly ten and cannot increase this bound. Every one of 170 source-native passages exceeds the bound in its **actual** most frequent rune count even before accounting for word layouts.

The same source-native control reference is GP-normalized `resources/control/emerson_essays_2944.txt`, sampled at consecutive nonoverlapping 1,892-position starts, with EA excluded and a minimum 97% remaining length. Thus the comparison tests natural GP-English-like plaintext, **not** every possible language or compressed/binary plaintext. A separate complete **1,902-position native-GP synthetic plant**, with deliberate zero-step reserved markers and 16 distinct reversible phase permutations, re-encrypts and recovers **all 1,902 positions** exactly, including the ciphertext IV. The SFT checks the original source lengths, exponent group, row counts, calibration floor, known-key output, and synthetic inversion.

## Decision

Retire a repeated 16-entry p15-spiral key applied directly to the nonzero GP29 predecessor steps for original pp15–22. Even replacing the source literal keys with **all possible secret phase alphabets** cannot produce the native-GP lexical concentration in the pinned source controls.

This says nothing about per-page independently restarted keys, position-evolving state within a phase, variable-length decoding, non-English registers, additional cipher layers, or the intended role of the p15 prime spiral. Those need their own independently selected inversion path. The result should prevent new p15 period16 key scans until an original clue specifies a materially different register.

**Reproducer:** [Exact original-chapter CommonJS single-file test](../sims/lp2_p15_spiral_gp28_allsecret_sft.cjs). Run from repository root with Node.js 22, using the unchanged canonical corpus and Emerson text.