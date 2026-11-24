# Page-15 square as a direct GP29 Hill key: bounded negative

**Status:** reproducible negative for the direct block-Hill interpretation tested here. No LP2 plaintext, authentic key, or intended mechanism recovered.

## Question and source-fixed hypothesis

The page-15 4×4 Fibonacci/prime square is a natural candidate for a classical 4×4 Hill cipher over the 29-symbol Gematria Primus alphabet. This is a different operation from the already-tested 4D matrix-state recurrence: here each consecutive four-rune ciphertext block is multiplied directly by the square matrix (or its inverse).

The printed row-major matrix, reduced modulo 29, is

[
M=
\begin{pmatrix}
10&3&20&22\\
1&22&21&25\\
11&17&19&7\\
21&17&12&22
\end{pmatrix},
\qquad \det(M)=17\pmod{29}.
]

It is invertible, with

[
M^{-1}=
\begin{pmatrix}
19&1&6&3\\
11&7&8&22\\
2&10&15&28\\
25&4&1&15
\end{pmatrix}
\pmod{29}.
]

The test also covers three source-derived alternative matrix readings:

1. the 16 printed values read clockwise from the red centre and repacked row-major;
2. the underlying Fibonacci-indexed primes (p_{F_n+1}), placed back in the printed grid;
3. their one-based prime ranks (F_n+1), placed back in the printed grid.

The exact square/spiral derivation is already recorded in [the page-15 Fibonacci-prime spiral report](../results/fibonacci-prime-spiral.md).

## Reproducible test

Run from the repository root:

```sh
node sims/p15_hill_block_test.cjs
```

The script uses the original GP29 corpus and the existing source-derived spiral parser. It checks:

- four matrix encodings: printed grid, spiral-repacked, underlying prime values, and Fibonacci-prime ranks;
- both applying the matrix and applying its inverse;
- row-vector and column-vector conventions;
- continuous block clocks at phases 0, 1, 2, and 3;
- physical-page-reset clocks at phase 0;
- both the immediate following section (pp. 16–22) and all subsequent LP2 pages (pp. 16–55).

That is 20 predeclared variants per matrix and scope. No key is fitted to the ciphertext. A positive implementation control encrypts and recovers a four-aligned prefix of authentic, previously solved LP1 GP plaintext under each matrix and vector convention; this validates the algebra, not the historical use of any candidate matrix.

## Results

The uniform 29-symbol index-of-coincidence baseline is

\[
1/29=0.0344827586.
\]

Across all tested variants on pp. 16–55, the IoC ranges are:

| Matrix representation | Minimum IoC | Maximum IoC |
| --- | ---: | ---: |
| Printed grid | 0.03441749 | 0.03454508 |
| Spiral-repacked | 0.03443986 | 0.03455103 |
| Underlying primes | 0.03443553 | 0.03455338 |
| Fibonacci-prime ranks | 0.03443910 | 0.03453101 |

The immediate next section (pp. 16–22) is noisier because it is shorter, but likewise yields no readable candidate; its ranges are 0.03430–0.03487 for the printed grid, 0.03419–0.03484 for the spiral-repacked matrix, 0.03427–0.03461 for underlying primes, and 0.03420–0.03463 for prime ranks.

### Independent source-language controls

The same fixed candidates were scored against two independently trained GP source models, with no key fitting:

- **Native Cicada GP:** 3,248 rune symbols from 796 previously solved Cicada words, with 0.5-smoothed unigram and adjacent-bigram counts.
- **Independent Latin GP:** the separately held-out 2,400-rune Latin Vulgate sequence, scored against the 203,357-rune Latin Vulgate training model.

The controls behave as intended:

| Control sequence | Native Cicada unigram | Native Cicada bigram | Latin unigram | Latin bigram |
| --- | ---: | ---: | ---: | ---: |
| Solved Cicada source (3,248 runes) | **+0.432679** | **+1.316863** | −0.109223 | −0.118858 |
| Latin heldout (2,400 runes) | +0.323262 | +0.745278 | **+0.552691** | **+1.436905** |

For each matrix representation, the table below gives the **best** score among its 20 predeclared variants on pp. 16–55. A larger score is better; the candidate selection does not alter the matrix, source, or scoring model.

| Matrix representation | Best native unigram | Best native bigram | Best Latin unigram | Best Latin bigram |
| --- | ---: | ---: | ---: | ---: |
| Printed grid | −0.893481 | −1.084852 | −1.296636 | −2.848376 |
| Spiral-repacked | −0.895369 | −1.082973 | −1.284602 | −2.837244 |
| Underlying primes | −0.888068 | −1.089330 | −1.299223 | −2.836832 |
| Fibonacci-prime ranks | −0.893935 | −1.085138 | −1.299447 | −2.854754 |

Even the best candidate under every matrix is negative under both language models, whereas the native Cicada and Latin controls score positively under their corresponding models. The immediate next section (pp. 16–22) is also negative under every model: best native unigram scores range from −0.872869 to −0.825645, best native bigram from −1.057900 to −1.034764, best Latin unigram from −1.248923 to −1.204834, and best Latin bigram from −2.766648 to −2.721173. Example decoded samples remain non-language GP-symbol strings.

## Interpretation and boundary

The obvious direct 4×4 Hill-key reading of the p15 square is a negative under the tested GP29 representations, block directions, vector conventions, alignments, and page clocks. The result does **not** exclude a different independently specified nonlinear operation, a non-GP intermediate alphabet, or a distinct source-selected state architecture. The latter must not be confused with this block-Hill test; the exhaustive 29⁴ matrix-state result is documented separately in [the source-matrix full-key report](source-4d-fourier-fullkey-inversion.md).

The p15 table's exact Fibonacci-indexed-prime construction is established, but its printed appearance does not itself specify a Hill operation, a block clock, or an alternative register. Do not continue expanding arbitrary matrix orientations or re-fitting the same square. The remaining high-value question is an independent historical or visual instruction that selects an operation and its exact clock before the original ciphertext is scored.

## Fixed printed-grid layered inverse (Agent19, 24 November)

The exact printed p15 4×4 matrix is a materially stronger source-local operand than the conditional historical 5/7/5 transfer. Reuse the calibrated [complete affine key inverse](lp2-p7-p22-p23-five-seven-five-original-stage10-hill-gate.md#complete-reverse-order-anchor-gate-agent19-follow-through) on the existing immediate p16–22 receiver of 1,744 runes. Use the literal row-major GF29 matrix, continuous four-rune blocks, no fitted phase/orientation or alternate representation. Test the two historically authenticated periodic F-hold key lengths 8 and 13 in both layer orders; no historical instruction explicitly selects this composition.

**Outer printed-grid Hill:** after the exact inverse, there are 61 intermediate ciphertext Fs. The complete all-subset DP over possible F holds gives the following necessary collision bounds. All 96 same-length native controls (32 equally spaced windows each of Shakespeare, Emerson, Gibran) fail the rune-collision bound alone, and both complete native matrix-plus-periodic plants satisfy the invariant and exact matrix replay.

| q | Maximum rune / bigram collisions | Native minima rune / bigram | Joint survivors |
|---:|---:|---:|---:|
| 8 | 213 / 9 | 282 / 15 | 0/96 |
| 13 | 218 / 11 | 258 / 21 | 0/96 |

**Inner printed-grid Hill:** encrypt native plaintext in four-rune blocks, then apply latent-F additive outer key to the matrix output. Freeze first 500 runes for training, leaving 1,244. Select the six longest eligible disjoint zero-free enclosing-block words, body-local starts [0,128,136,182,280,334], lengths [13,8,8,12,8,8]. Enumerate all relative phases allowed by the visible F positions between each pair, join exact left-nullspace dictionary signatures, enumerate every affine solution including every deficient rank, canonicalize rotations, and propagate exact F-hold phase support. No cap is reached. The q8 run has 86 rank8 pair cases and zero pairs; the q13 run has 102 cases (rank8:1, rank9:2, rank10:7, rank11:11, rank12:11, rank13:70), 23,331 lexical joins including 346 deficient ones, yielding 49,259 distinct complete rotation classes. Of 75 prefix-legal keys, none admits any full-section legal path. Exact max-anchor DP on the fit prefix permits at most two anchors for q13. The best prefix (−3.692952044222758 nats/rune) is nonprose and cannot continue under its frozen phase/context. Therefore **at least five of the six selected long words must be outside the frozen 42,468-spelling dictionary under either reverse-order model**, conditional on intact printed groups. This is an exact finite lexical obstruction, not exclusion of every plaintext.

Calibration uses two distinct planted keys on target-excluded LOSS OF DIVINITY, truncated to 752 block-aligned native runes. Both q8 and q13 controls recover their exact hidden keys, all 500 fit and 252 withheld runes each. For q13, the algorithm joins 40,528 word pairs (745 deficient), enumerates 110,108 affine completions, and ranks 17,248 prefix-legal keys among 110,097 rotation classes; the top key still recovers the full native text. The same native passage is reused under two separate plants; 504/504 is a per-trial sum. There is no LP2 key or unknown plaintext. Retire this fixed printed-grid composition at q8/q13 for the tested registers; no arbitrary new matrix or period sweep follows from it.

[Outer-layer SFT](../sims/lp2_p15_grid_outer_fhold_gate_sft.cjs) · [Complete inner-layer SFT](../sims/lp2_p15_grid_inner_periodic_complete_anchor_sft.cjs) · [Original inner output](lp2-p15-grid-inner-periodic-original-output.json). Actual connected JavaScript executions on repository inputs; no CI execution claimed.
