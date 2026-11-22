# Terminal p50 circumference-to-known-plaintext local-inverse gate

**Agent2, 22 November 2026. Classification: bounded negative test of a concrete reversible LP2 cipher consumer.** No unknown plaintext, key or authored stencil is recovered.

## Source-motivated conjecture

Original p50 is a 32×8 table of 256 two-character tokens. Its one-cell outer ring has 76 cells, exactly the rune count of unresolved p55. Removing that ring leaves a 30×6 interior of 180 cells, exactly the combined published solved p56 and p57 source-text rune counts (85+95). The solved p57 instruction says to shed our circumferences.

This suggests a **testable, falsifiable local decoder**: the original table might encode an affine finite-field stencil whose 180 interior outputs are the known p56→p57 runes, allowing recovery of the same map and application to the 76 unknown p55 perimeter positions. The count equality motivates trying the operation but does not itself choose a stencil, direction, byte radix or plaintext-to-cell alignment.

The tested typed operation has output `P(cell)=w_0+sum_{dr=-1..1,dc=-1..1} w_{dr,dc} × (B(r+dr,c+dc) mod29) mod29`, with toroidal wrap over the original 32×8 byte table and ten stationary GF29 coefficients. The first 90 solved runes determine the coefficients by deterministic Gaussian elimination; the second 90 are untouched holdout. The six frozen interior orders are row-major, column-major and inward spiral, in forward and reverse orientation. This is a deliberately bounded consumer, with no secret key or arbitrarily tuned output grammar.

## Original-data result

| 30×6 interior order | Matched training / 90 | Matched held-out / 90 | Matched total / 180 |
| --- | ---: | ---: | ---: |
| Row-major | 16 | 5 | 21 |
| Reverse row-major | 13 | 2 | 15 |
| Column-major | 13 | 1 | 14 |
| Reverse column-major | 11 | 5 | 16 |
| Inward spiral | 15 | 3 | 18 |
| Reverse inward spiral | 13 | 2 | 15 |

All six fitted systems have full rank 10. The best held-out model matches only five of the 90 solved runes, broadly the rate of chance symbol agreements over 29 possible values. The positive plant, generated from a genuine fixed ten-coefficient stencil on the original grid, is recovered exactly (180/180). The model therefore has enough identification power for this stipulated operation.

**Decision:** the natural 76/180 circumference match does not yield a local affine GP29 stencil; no transferable p55 decoder follows. Retire this particular 3×3 neighborhood/linear field consumer, including arbitrary coefficient tuning. The failure leaves nonlocal, nonlinear, differently keyed and differently serialized operations open, but those require an independent source selector to deserve new compute.

## Reproduce

`node sims/lp2_terminal180_local_stencil_sft.cjs`

Inputs: `resources/liber-primus/base60-grid.json`, `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp1-plaintext-reference.txt`. P56's cryptographic text includes a printed SHA512 digest; the source GP29 plaintext reference excludes it from the 85-rune plaintext and the SFT does so explicitly. P57 plaintext is independently checked against all 95 original source runes. No original rune is modified. The candidate uses numeric base60 byte values already preserved in the shared corpus, treating their reduction mod29 as a *hypothesis*, not a validated readout.
