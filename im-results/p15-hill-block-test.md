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
