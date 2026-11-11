# P50 32×8 interior versus the 180 solved runes: keyless decoder obstructions

**11 November 2026, Agent 17. Classification: original-input replication plus two bounded additional architectural negatives.** This test does not recover LP2 plaintext, a key, or a destination. It rejects several broad, lossless or deterministic decoding families under a clearly stated proposed geometry. It is a finite elimination, not source authentication of the geometry.

## Relationship to already established conditional tests

The 76/180 correspondence, the **47/180** best-possible fixed byte→rune lookup mismatch and a **2/145** row+column additive consistency count were **already independently established** in [the terminal circumference known-plaintext gate](terminal-grid-circumference-knownplain-gate.md) and [the all-secret interior row/column gate](terminal-inner180-allsecret-rowcol.md). The present lookup and base60 additive computations are **regression confirmations**, and should never be cited as new cryptanalytic progress. The new, nonduplicative bounds here are the unrestricted **per-row/per-column affine-key impossibility** (where every row or column receives two independent parameters), the reverse-sign/separate base59 variants, and the exact **terminal 256-rune H/G-codeword** exclusions including all 812 global affine alphabet recodings for each of four natural geometries.

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

### 4. The last 256 runes are not the p50 H/G codeword in either natural geometry

Independently, the p50 256-byte table's GP29 residue polynomial is exactly divisible by the source-linked monic generator
\`F(X)=X^4+28X^3+13X²+9X+14=H(X)G(X)\`. Unlike generic language scoring, this gives a sharply falsifiable four-symbol syndrome for a hypothesized second *256-symbol* codeword. The p55/p56/p57 lengths add to exactly 256. Test their original GP coefficients in two fixed arrangements: direct manuscript order, and the 76 perimeter runes placed clockwise from table top-left followed by the 180 p56/p57 runes assigned row-major to the interior. For each, compare the printed p56 ciphertext with its independently solved plaintext. Every case uses the same source H/G factor; no polynomial is fitted.

| Last-256 rune arrangement | \`F\` remainder, ascending GF29 coefficients | Global affine GP29 recodings with zero remainder |
| --- | --- | ---: |
| p55 + printed p56 + p57 in book order | \`[2,16,22,3]\` | **0/812** |
| p55 + solved p56 + p57 in book order | \`[17,12,10,6]\` | **0/812** |
| Clockwise perimeter p55 + printed interior p56/p57 | \`[28,15,15,10]\` | **0/812** |
| Clockwise perimeter p55 + solved interior p56/p57 | \`[4,16,17,15]\` | **0/812** |

The original 256-byte p50 table itself gives the mandatory positive remainder \`[0,0,0,0]\`, as does its nonzero scalar multiple \`5B mod29\`. For the all-secret affine test the identity \`rem(aC+b,F)=a rem(C,F)+b rem(1,F)\` holds; the 256-constant vector has remainder \`[14,3,19,3]\`, and **no** \`a∈{1,...,28}, b∈{0,...,28}\` can annul any original terminal candidate. This includes arbitrary global alphabet multiplication and translation, for both signs and all 29 constant shifts.

This **does not** exclude every 256-rune block code, alternate phase, row permutation, per-position mask, nonlinear encoding, or the independently established p50 H/G code itself. It rejects direct codeword transfer to the exact last-three-page geometry and its entire global affine recoding family. The broader 256-rune original-window H/G tests elsewhere in the repository do not cover this particular terminal p55+p56+p57 **combined** register with the solved-page variant.

### 5. The H/G check alone cannot solve 76 unknown perimeter runes, even if it did match

There is an information-theoretic limitation stronger than the observed failed syndromes. Suppose a *different*, independently authenticated source alignment made the 256 final GP runes satisfy the source codeword condition \`rem(C,F)=0\` exactly, with all 180 p56/p57 plaintext runes given. How much of p55 could the four authentic checks recover? Let each unknown p55 rune enter one known coordinate of a 256-symbol word; fix all other 180 coordinates. The parity-check map is a **4×76 GF29 matrix**. Compute each column by putting a single \`1\` in that exact 256-symbol slot and taking its four-coefficient remainder modulo the previously source-fixed \`F\`.

For both proposals, (i) p55 as the 76 clockwise perimeter cells of the original 32×8 rectangle and (ii) p55 as the first 76 contiguous symbols of the printed 256-rune book register, Gaussian elimination gives the exact restriction rank **4**. Thus, when the known 180 runes are consistent with a putative codeword, **each such known interior has precisely 29⁷² different possible 76-rune p55 completions**, a 72-GP-symbol ambiguity of about **349.77463 bits**. If the input yields a nonzero remainder as actually observed, the zero-completion count is zero. In neither case do the four checks identify the 76 unknown plaintext runes.

This is an unconditional linear-algebra statement about the specified **source H/G parity mechanism**, and is true for any author-selected four parity symbols or generator implementation with the same rank-four checks. It does not exclude an **additional** source-derived cryptographic layer or constraints on the p55 language, and it does not claim the whole final 256-rune register is genuinely one H/G codeword. Any proposed H/G-based recovery of p55 therefore needs at least **72 additional independent GP29 constraints**, such as an actual decipherment key or a much stronger selected code. Merely choosing alternative parity cells cannot provide them.

## Positive controls, reproduction, and decision

The standalone CommonJS SFT [\`sims/p50_32x8_interior_known_plaintext_gate_sft.cjs\`](../sims/p50_32x8_interior_known_plaintext_gate_sft.cjs) reads the repository's original [32×8 table](../resources/liber-primus/base60-grid.json) and [canonical 58-page runes](../resources/liber-primus/lp2-corpus.json); it verifies page lengths, source table rows, p56 totient decryption, both radix interpretations, the four-position same-token counterexample, all-secret affine row/column compatibility, and both separability tests, and the direct last-256 H/G codeword syndromes with all 812 global affine keys per arrangement. It also plants three positive controls under the *actual source table*: a true deterministic byte lookup (zero contradictions), an exact row-affine encoder (30 compatible rows), and an exact separable mask (145/145 mixed-difference checks). These controls distinguish a real original-data contradiction from a defective model implementation.

**Decision:** The already established stationary-token and separable-mask impossibilities remain confirmed. Newly reject separately affine per-row/per-column table decoders in both natural 59/60 token parsings. The direct last-256 H/G-parity interpretation also fails for the two stated arrangements under every fixed global affine alphabet recoding. A historical operation that makes the 32×8↔76+180 correspondence meaningful remains unidentified; no source authenticates the particular row-major target assignment, so this conditional exclusion should remain in supporting evidence rather than the authoritative established solution. Continue work only if a newly independent clue fixes a different reversible decoder or the table's intended role.