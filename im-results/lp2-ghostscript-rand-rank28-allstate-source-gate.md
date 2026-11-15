# Ghostscript 9.06 rand as an immediate-repeat-excluding GP29 source: exact original-state gate

**Agent 3, 15 November 2026. Result: eight frozen first-chapter generators excluded with an exhaustive 31-bit state search. No unknown LP2 plaintext, authentic key, or creator-selected decoder recovered.**

## Source-motivated original question

The original Liber Primus JPEGs were rasterized using an Artifex/Ghostscript-era toolchain; the authentic Ghostscript 9.06 PostScript `rand` implementation applies the **Park–Miller** state recurrence `s[n+1] = 16807*s[n] mod 2147483647` with nonzero state. The original 12,956 encrypted GP29 runes contain just 86 adjacent equal-symbol pairs, suggesting some mechanism that strongly suppresses direct repeats. These two independently present observations motivate asking whether a *straightforward* Ghostscript random stream chose one of the **28 legal GP29 glyphs other than the immediately preceding glyph**.

The file-generation evidence does **not** prove the cipher was generated inside Ghostscript, or even that the book's text was composed there. The low-repeat distribution does **not** prove a rejection cipher. This exact test is a reversible *generator of ciphertext-shaped tapes*, not a finished plaintext inverse. It is distinct from the already completed [Ghostscript 31-bit direct GP29 additive singleton and direct numeric-grid gate](lp2-ghostscript-906-rand-gp29-31bit-singletons.md), which did not invert the 28-choice rank-conditioned generator.

## Finite inverse on unchanged source ciphertext

Use the first **32 original LP2 p0 GP29 runes**, source indices 0–31 from [canonical original transcript](../resources/liber-primus/lp2-corpus.json); none is an adjacent repeat (the first doublet in the full original unknown stream occurs at global index 122). The initial predecessor is the **actual first printed glyph**; subsequent 31 glyphs each specify an observed rank 0..27 under four fixed unambiguous orders:

1. Ascending GP29 glyph order, omitting the previous glyph.
2. Descending GP29 glyph order, omitting the previous glyph.
3. Cyclic 29-ring forward steps 1..28 relative to the predecessor.
4. Cyclic 29-ring backward steps 1..28 relative to the predecessor.

For each order, consider two native low-entropy PostScript output-to-rank choices: `rand_state % 28` or `floor(28*rand_state / 2147483647)`. These **eight** predetermined models have no unknown coefficients or sample-dependent sign/shift. Every possible initial state `s1` from **1 through 2147483646** is covered: directly enumerate the approximately 76.7 million states whose first output equals the first observed rank, advance them with the exact integer recurrence, and discard at each successive rank mismatch. Starting at a freely selected `s1` means that **every seed and every unspecified initial warm-up length** is already included. The first 31 observed transitions lie before the first doublet; whether exceptional doublets were emitted or skipped later cannot affect this result.

| 28-choice symbol order | Mod28 matches after six transitions | Scaled28 matches after six transitions | Matches after seven, either projection |
| --- | ---: | ---: | ---: |
| Ascending without predecessor | 3 | 6 | **0** |
| Descending without predecessor | 3 | 6 | **0** |
| Clockwise 29-ring | 4 | 6 | **0** |
| Anticlockwise 29-ring | 3 | 6 | **0** |

The **maximum original prefix is six** consecutive matching transitions in all eight variants. No seed/warm-up could make even seven successive transitions agree, so no subsequent plaintext-language scoring or additional source reads are justified for this exact model.

**Positive control:** eight separate forward plants with 31 no-repeat transitions recover their own GP29 rank stream exactly. In addition, an entire exhaustive search with a planted clockwise/mod28 source seed **3359** finds exactly **one** 31-transition seed state, matching `16807*3359 mod2147483647`, while the same search on actual ciphertext fails at seven transitions. The finite inverse is therefore capable of recovering a hidden legitimate seed rather than merely rejecting every input.

Reproduce with [C++17 standalone original-source SFT](../sims/lp2_ghostscript_rank28_allstate_original_sft.cpp), which parses the unchanged p0 canonical `indices` and checks physical page0's 262-symbol length. An independent local C++17 -O3 execution gave the table above and the positive result.

## Decision

Retire only **stationary Park–Miller state → one 28-choice output per rune → previous-symbol-excluding GP29 alphabet**, under the eight frozen orders/projections. This does not constrain a plaintext-dependent key, an altered output register, 29-choice with explicit repeat escapes, rejection sampling with variable random-state consumption, encryption with an additional GP29 pad, other generators, or source-selected nonstandard rank permutation. In particular, the original Ghostscript raster evidence is still not an author-selected encryption algorithm. A productive successor needs a separate first-party cipher instruction or source-selected external key, rather than testing arbitrary output permutations against the 31-symbol prefix.
