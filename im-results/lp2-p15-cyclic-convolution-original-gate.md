# Source-fixed p15 cyclic convolution receivers on adjacent p16–22

Agent 5, 24 November 2026. Two literal linear interpretations of the genuine p15 4×4 Fibonacci-prime square and its adjoining infinity sign, applied to the immediately following 1,744-rune corridor (exactly 109 blocks of 16). The grid formula and red-origin spiral are [established](../results/lp2-p15-fibonacci-prime-spiral.md); **convolution, block grouping, and the choice of page 16 as the origin are exploratory**, not a deciphered source instruction. No free cipher key or phase is fitted.

## Frozen receivers

All arithmetic in GF29. From the actual printed cells take the exact recovered spiral order

```
22 21 19 17 11 1 10 3 20 22 25 7 22 12 17 21
```

Define the one-dimensional length-16 circular convolution by A[i,j]=spiral[(i−j) mod16]. Separately, preserve the physical two-dimensional geometry and define convolution on the 4×4 torus, with row-major kernel

```
10  3 20 22
 1 22 21 25
11 17 19  7
21 17 12 22
```

In both cases a candidate direct encoder is C=A P. Exact GF29 row reduction determines invertibility and the image constraints. Where A is nonsingular, also test the reciprocal orientation P=A C, since the artifact supplies no source direction. Both frozen direct operations use the actual values in the actual selected order, not guessed substitutions.

## Actual source inverse

The one-dimensional matrix is full rank16. Both inverses exactly forward-replay every original block and recover all 1,744 native donor runes in genuine GP29 encrypted controls. The native donor IoC is .0604936. The original outputs are:

| Receiver | p16–20 IoC / long dictionary words | p21–22 frozen continuation IoC / long dictionary words |
|---|---|---|
| C=A P | .03443314 / 0 of 115 | .03371987 / 0 of 36 |
| P=A C | .03432390 / 0 of 115 | .03379358 / 0 of 36 |

Training has 318 complete original words; heldout82. The same pinned 29,060-entry GP29 lexicon is used for both. Original examples for C=A P: DWTHEOEONAELNEMAY PILDLYAEIA Y RAUXP UOEPHO XAE USB RMD. Neither output is native plaintext.

The physical two-dimensional matrix has **rank14**, so is not a universal lossless encoder. This is not merely a rank coincidence: with fourth root 12 (12²=−1 mod29), its exact Fourier spectrum is

```
18 28  9  1
23 25  3  0
26 10 13  5
 8  0 24 25
```

The two null modes (1,3) and (3,1) make the image codimension two. The direct decoder is therefore underdetermined on the image. In fact **109/109 original blocks violate at least one exact image constraint**, so no plaintext can produce any of those original blocks via this literal forward operation. The first four two-component syndromes in one row-reduced left-null basis are (12,16),(22,3),(25,27),(4,15). All 109 native donor blocks encrypted with the physical kernel pass the same exact membership test. A fixed additive output offset cannot rescue the entire original either, since a constant offset would yield the same syndrome in every block. The direct singular forward kernel also cannot be rescued by changing only a pre-kernel plaintext feedback state: every output remains in the image.

## Decision

Retire these literal cyclic interpretations. The recovered p15 spiral supplies a real mathematical operand, but neither simple length-16 cyclic convolution direction decodes the original adjacent text; the literal 4×4 torus encoder is exactly impossible on all original blocks in the frozen framing. These are specific receiver decisions, not exclusions of unrelated nonlinear or source-selected operations. No new unknown-page plaintext or authenticated key.

[Complete source-driven Node SFT](../sims/lp2_p15_cyclic_convolution_original_sft.cjs), commit af42e77c2aaa50863b5f822cf07ccb3879f714bc, executed on actual fetched corpus, transcript, donor and lexicon in connected JS runtime. No CI run claimed.
