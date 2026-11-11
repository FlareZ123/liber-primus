# P50 32×8 interior versus the 180 solved runes: keyless decoder obstructions

**11 November 2026, Agent 17. Classification: bounded, exact original-input negative.** This test does not recover LP2 plaintext, a key, or a destination. It rejects several broad, lossless or deterministic decoding families under a clearly stated proposed geometry. It is a finite elimination, not source authentication of the geometry.

## Source clue and proposed human operation

The original physical p50 table, spread across archive scans 66–68, visibly contains **32 rows × 8 columns = 256 two-character numerical tokens**. Its one-cell perimeter has **76** positions, and removing that perimeter leaves **30 × 6 = 180** interior positions. The adjacent original physical p55 has exactly **76 ciphertext runes**, and the independently solved p56/p57 have **85 + 95 = 180** runes. Solved p57's instruction to shed circumferences offers a recognizable, though unproven, motivation to compare the 76-ring and 180-interior split with the last three rune-bearing pages.

This proposed correspondence has been noticed in earlier work, including [the p54 nine-rune valid-convolution gate](lp2-p54-nine-rune-valid-convolution-gate.md). That earlier work tested a 3×3 convolution, including every unknown linear convolution kernel. **The present test makes a different prediction**: if the 180 interior table cells directly encode the 180 *known* p56/p57 GP plaintext runes, then any fixed token-to-rune decoder must assign the same output whenever the same printed token occurs. A row/column arithmetic decoder has separate testable identities. This is a known-plaintext test using solved pages; the 76 unknown border runes are not fitted.

The fixed reading is the natural printed **row-major order of the 30×6 interior**, paired with the established p56 plaintext followed by directly readable p57. No start-offset, rotation, row permutation, column permutation, crib fitting, or alternative geometric traversal is searched. The source does **not** independently instruct a player to associate p50 with p55–p57 this way; these are conditional tests of a plausible but unselected route.

## Authentic plaintext control and tokenization ambiguity

The known target is the independently established p56 GP-orthography sentence:

> AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE

This is **85 GP runes** under the authentic 29-symbol transliteration. The SFT redecodes the unmodified p56 ciphertext with its established minus-\u03c6(prime), zero-based prime clock and single literal-F escape at original p56 rune position 56; the output must match all 85 known GP runes. The next 95 target runes are the original, already-plaintext p57. The complete target is exactly 180 runes, with no text generated or guessed for the unsolved pages.

Both conventional base60 parsing and the separately documented f-omitting base59 parsing are tested. They give different integer values for some tokens but neither can rescue a *same-printed-token maps to one rune* requirement.

## Exact all-secret contradictions

### 1. No arbitrary fixed token/byte lookup

**Four independent original positions print exactly the same token \`0s\`:**

| P50 table row, column (1-based) | Interior index (0-based) | Known target |
| --- | ---: | --- |
| 5, 5 | 21 | **R** (p56:21) |
| 15, 5 | 81 | **P** (p56:81) |
| 16, 4 | 86 | **A** (p57:1) |
| 22, 4 | 122 | **W** (p57:37) |

Any deterministic stationary function f(token) would have to satisfy f(0s)=R=P=A=W, an exact contradiction. This witness survives either radix.

Across the entire 180-position known plaintext alignment, the 180 cells contain **127 distinct table values**. Among those values, **35** occur with contradictory known outputs. Even granting one independent unrestricted GP rune to each distinct table value, the most favorable assignment necessarily disagrees at **at least 47 of 180 positions**, for both radix interpretations. This excludes *all* stationary token-to-GP decoders under the fixed alignment, including nonlinear, arbitrary-secret, and homophonic token tables whose output is a deterministic single rune. It does not exclude position-dependent masks or multi-symbol coding.

### 2. No unknown per-row or per-column affine map

For each interior row r, allow **any** \`a_r,b_r ∈ GF(29)\` and test all six known GP outputs against

\`P[r,c] ≡ a_r B[r,c] + b_r (mod 29)\`.

No one of the **30** interior rows admits even one affine-key pair, under either base60 or base59. Granting independently arbitrary parameters per column similarly leaves **0/6** compatible columns. The original printed p56 ciphertext followed by p57, instead of p56 plaintext followed by p57, likewise leaves **0/30** rows and **0/6** columns for the base60 interpretation.

This is an exact all-secret local obstruction, not a sampled key search or a negative language score. The sign of a nonzero affine multiplier is already included in all 29 candidate slopes.

### 3. No unrestricted additive row+column masks

A different proposed cipher is a separable additive pad with freely chosen 30 row keys and six column keys:

\`P[r,c] ≡ ±B[r,c] + rowKey[r] + columnKey[c] (mod 29)\`.

Let \`D[r,c]=P[r,c] ∓B[r,c]\`. Every 2×2 mixed difference anchored at the first interior row/column must be zero:

\`D[r,c] − D[r,0] − D[0,c] + D[0,0] ≡ 0 (mod 29)\`, for 1≤r<30 and 1≤c<6.

There are **145 necessary equalities**. With known solved plaintext, base60 yields only **2/145** for the plus-table direction, **5/145** for the minus-table direction. Base59 yields **8/145** and **3/145**, respectively. Therefore *no* choice of unrestricted row and column keys can satisfy the full known source, even without constraining their values to historical key material. Using p56 printed ciphertext instead gives **9/145** in both directions for base60.

These contradiction counts reject only this fixed geometry and encoding class. Row-specific nonlinear lookup, externally supplied stream state, alternative inner-cell traversal, a different target or a different purpose for the p50 table require separate source instructions before investing further.

## Positive controls, reproduction, and decision

The standalone CommonJS SFT [\`sims/p50_32x8_interior_known_plaintext_gate_sft.cjs\`](../sims/p50_32x8_interior_known_plaintext_gate_sft.cjs) reads the repository's original [32×8 table](../resources/liber-primus/base60-grid.json) and [canonical 58-page runes](../resources/liber-primus/lp2-corpus.json); it verifies page lengths, source table rows, p56 totient decryption, both radix interpretations, the four-position same-token counterexample, all-secret affine row/column compatibility, and both separability tests. It also plants three positive controls under the *actual source table*: a true deterministic byte lookup (zero contradictions), an exact row-affine encoder (30 compatible rows), and an exact separable mask (145/145 mixed-difference checks). These controls distinguish a real original-data contradiction from a defective model implementation.

**Decision:** A literal p50 interior→p56/p57 decoder cannot be a stationary token lookup, a separately affine decoder on every row or column, or a linear combination of original table bytes with unrestricted row+column offsets, in either natural 59/60 token parsing. A historical operation that makes the 32×8↔76+180 correspondence meaningful remains unidentified; no source authenticates the particular row-major target assignment, so this conditional exclusion should remain in supporting evidence rather than the authoritative established solution. Continue work only if a newly independent clue fixes a different reversible decoder or the table's intended role.