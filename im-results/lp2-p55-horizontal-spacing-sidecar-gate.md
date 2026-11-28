# LP2 p55 horizontal-spacing sidecar gate

**Agent12, 28 November 2026. Classification: original-image bounded side-channel exclusion; no plaintext or key recovered.**

## Decision

The original p55 image does **not** expose a second coarse horizontal-spacing alphabet beyond its ordinary proportional rune layout and printed word separators.

Using the pre-existing, original-image-derived 76-glyph coordinate register in
`resources/liber-primus/lp2-p55-source-glyph-coordinates.json`, every one of the 72 within-line rune transitions is explained by the simple source-side layout model

```text
next_x - current_x
  = advance[current GP29 rune]
  + 16 * [black interword dot is present]
  + raster residual
```

with a single fitted advance per current rune and:

```text
52 / 72 transitions exact
residual -1 px: 11
residual  0 px: 52
residual +1 px: 8
residual +2 px: 1
maximum |residual|: 2 px
SSE: 23 px^2
total absolute residual: 21 px
```

The 15 within-line black separator dots are also exactly the 15 large horizontal gaps:

```text
no-dot gap widths: 1..8 px
dot gap widths:   19..23 px
```

The two bands are perfectly disjoint. The sixteenth black separator dot is after the final rune of its line and therefore has no following within-line transition.

This makes a hidden **coarse kerning / word-gap state register** on p55 a poor explanation for the missing reversible side information sought by the constrained-code route. The observed horizontal geometry is overwhelmingly ordinary typesetting structure.

This result is deliberately narrow. It does not exclude a per-pixel/JPEG channel, antialiasing-level manipulation, vertical microgeometry, external key material, other punctuation classes, or a source-restricted plaintext code requiring much less side information.

## Pinned original source

The coordinate resource identifies the untouched p55 scan as:

```text
resources/liber-primus/72.jpg
SHA-256 a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba
2400 x 3600
```

The reproducer re-hashes the JPEG itself and refuses to continue if the source hash differs.

The p55 text contains exactly **76 black rune glyphs** in four lines:

```text
24, 22, 22, 8
```

The same source register contains 16 black interword-dot rectangles and the separate terminal red 13-square ornament. The red ornament is not counted as a rune.

## Exact horizontal gap census

For each adjacent rune pair on the same line, define the ink gap as

```text
next.x_min - current.x_max - 1
```

and mark the transition as dotted only when an original black interword-dot rectangle lies strictly between those two glyphs.

There are 72 within-line transitions:

```text
57 ordinary no-dot transitions
15 dotted transitions
```

Their exact gap histograms are:

```text
no dot
  1 px : 1
  2 px : 8
  3 px : 5
  4 px : 5
  5 px : 17
  6 px : 12
  7 px : 6
  8 px : 3

black separator dot
 19 px : 1
 20 px : 4
 21 px : 7
 22 px : 2
 23 px : 1
```

Thus the original page supplies no ambiguous intermediate gap class: every within-line gap of 19 pixels or more is a printed separator-dot transition, and every non-separator transition is 8 pixels or less.

## Rune-advance model

The source uses a proportional rune font, so raw start-to-start distance is not expected to be constant. To distinguish font advance from an independent spacing state, charge one base advance `A[r]` for each observed current GP29 rune `r` and one global separator increment `c`:

```text
delta_x = A[r] + c * separator + residual
```

No plaintext is involved.

The reproducer exhausts every integer `c=0..30`. For each `c`, it chooses each rune's median adjusted advance and then lexicographically minimizes:

1. maximum absolute residual;
2. residual sum of squares;
3. total absolute residual.

The unique best integer separator increment is:

```text
c = 16 px
```

with the residual distribution quoted above. In particular, the 15–17 px extra start-to-start distances observed when the same rune appears both with and without a following separator collapse to the same 16 px layout insertion plus at most one pixel of normal raster rounding.

The four line starts are independently nearly identical:

```text
x = 601, 601, 601, 600
```

and the per-line glyph top origins differ from the line minimum only by 0 or 1 pixel.

## Deliberately overcharged information ceiling

The residuals are best interpreted as raster/layout rounding. To avoid understating a hidden-channel possibility, grant the theory much more freedom: pretend every one of the 72 within-line transitions could independently choose any of five residual states

```text
{-2, -1, 0, +1, +2}
```

even though only four residual values occur and the observed distribution is heavily concentrated at zero.

That artificial channel has at most:

```text
72 * log2(5) = 167.17882283189007 bits
```

If the four line starts are also granted five independent states each, the ceiling becomes:

```text
76 * log2(5) = 176.46653521143952 bits
```

This is **not** claimed as the actual entropy of p55 spacing; it is an intentionally generous upper bound on this narrowly defined microspacing alphabet.

For comparison only, the existing fixed-repeat constrained-code analysis derives a **conditional** 328-bit universal side-state quotient for an unrestricted GP29 source conditioned on the observed whole-book equality count. The p55 horizontal microspacing register alone cannot supply that particular global universal sidecar even under the five-state overcharge. The 328-bit figure is not a universal requirement for every LP2 cipher or for every source-restricted plaintext model.

## Consequence for the solve path

The useful conclusion is structural rather than linguistic:

- p55's visible horizontal spacing is almost completely predicted by **rune identity + ordinary word separator**;
- there is no source-visible second coarse gap class to serve as an exception clock, missing-repeat register, or binary key tape;
- the remaining ±1/2-pixel residuals should not be promoted to cryptographic state without an independent source clue selecting pixel-level geometry.

Accordingly, future reversible p55 work should seek a materially different source of side information: an authored state/clock instruction, a separate punctuation or image channel with independent evidence, or external key material. Re-scoring the same horizontal gaps as bits would be tuning layout noise.

## Reproduction

Run:

```text
node sims/lp2_p55_horizontal_spacing_sidecar_sft.cjs
```

The SFT verifies the original JPEG SHA-256, reconstructs all 72 transitions from the source-coordinate register, checks both exact gap histograms, exhausts the separator increment, freezes the residual distribution, and prints the deliberately overcharged capacity bounds.
