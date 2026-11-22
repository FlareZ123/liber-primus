# Terminal 256-cell separable additive inverse: original-interior rejection

**Scope:** one original-visible, exactly reversible, source-conditioned candidate. This is a negative original-input result and does not recover unknown LP2 plaintext.

## Authored observation and one frozen decoder

The manuscript prints a 32×8 table of 256 two-character numbers on physical pp49–51. P55 has exactly 76 encrypted GP29 runes; authenticated p56 decrypts to 85 GP29 runes and p57 prints 95 clear runes, giving 76+85+95=256. A 32×8 grid has a 76-cell perimeter and a 30×6=180-cell interior. The clear p57 instruction to **shed our own circumferences** makes a perimeter/interior separation a plausible human-readable clue. Prior work tested direct univariate polynomial encoding on these positions, rather than this row+column additive architecture.

Freeze clockwise upper-left perimeter for the 76 *withheld* p55 positions. Place authenticated p56 plaintext (with its single literal-F prime-key skip at position56) followed by printed p57 clear runes in the 180 interior positions, row-major. Interpret the original p50 two-character tokens in the repository's conventional base60-as-byte reading, then reduce the 256 values modulo29 to the GP29 alphabet.

A minimal reversible row+column GP29 mask would obey

```text
B[r,c] = P[r,c] + A[r] + D[c] (mod 29)
```

for an unknown additive key per row and column. Independently of *all* secret row and column keys, the residual `R=B−P` must satisfy

```text
R[r,c] + R[r+1,c+1] − R[r+1,c] − R[r,c+1] = 0 (mod 29)
```

on every one of the 29×5=145 adjacent interior 2×2 rectangles. This is a stringent original-plaintext requirement that can be checked before examining any of the 76 unknown p55 runes or guessing a key. With a fixed gauge, row and column secrets have 30+6−1=35 independent coordinates; the 180 interior input positions thus impose 145 conditions.

## Exact original test

- **Real p56 prime/F decrypted + clear p57 interior:** **3/145** 2×2 rectangles satisfy the necessary zero-curvature equation; **142 fail**. The unique gauge fit using the first row and first column matches **37/180** interior source values, with 143 mismatches.
- **As-printed p56 ciphertext + clear p57 alternate register:** **9/145** rectangles have zero curvature. This alternate was not used to select the first decoder.
- **Planted source-native positive:** Applying arbitrary deterministic row and column masks to the *same* 180 known GP29 runes makes **145/145** rectangles satisfy curvature and yields **180/180** recoverable source positions under the same inverse. This checks the algebra and coordinate mapping.

The frozen natural separable inverse fails by 142 necessary equations, irrespective of the 35 unknown key values. For comparison, unrestricted random residuals yield about 5 zero rectangles out of 145; the observed three are typical of a nonseparable register.

## Decision and limits

Retire the **base60-byte→mod29, interior row-major, additive row-plus-column mask** as a mechanism for recovering p55 from authenticated p56/p57. Even a unique putative perimeter key is underdetermined by interior row/column sums without a source selector for outside-row keys, but the exact interior contradiction already decides the model. This result leaves other codings of printed p50 numerals, nonlinear stateful transforms, altered assignments of terminal pages to grid cells, and independent key sources open. A variant needs a *new original clue* specifying its altered reading before another test.

Original inputs: [canonical rune corpus](../resources/liber-primus/lp2-corpus.json), [256 source cells / derived base60-byte reading](../resources/liber-primus/lp2-grid-256.json). Reproducer and controlled 180-rune positive: [single-run CommonJS SFT](../sims/lp2_terminal256_separable_interior_sft.cjs). The p56 skip and its plaintext are independently controlled by [the established original p56 inversion](lp2-terminal256-known180-polynomial-root-bound.md).
