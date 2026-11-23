# p32 11×11 Hill-key test against the p54–55 chapter

**Disposition: rejected for the tested source-aligned construction.** No plaintext or key was recovered.

## Why this was worth one bounded test

Three independent observations suggested a compact matrix-cipher hypothesis:

- LP2 p32 contains 121 runes, exactly (11^2).
- The final p54–55 chapter contains 308 runes, exactly (28\times11), i.e. 28 consecutive 11-symbol blocks.
- p32 and p55 use the same Commons dead-tree source image. Separately, reshaping p32's 121 runes row-major as 11×11 and replacing each rune by its Gematria Primus prime weight gives first-row and first-column sums 563 and 569. Those match the dimensions of the authenticated 2016 carrier image.

The last match is exact arithmetic, but the 11×11 reshape is derived rather than printed. It is a selector hypothesis, not evidence that a Hill cipher was intended. The shared image and dimension match made a direct, classical matrix test worth doing once.

## Test definition

Inputs are the canonical arrays in `resources/liber-primus/lp2-corpus.json`:

- Key source: all 121 p32 rune indices, row-major into an 11×11 matrix.
- Primary key encoding: GP prime weight for each rune, reduced modulo 29.
- Control key encoding: raw GP rune index.
- Target: p54 followed by p55, 232 + 76 = 308 runes.
- Target blocking: 28 consecutive blocks of 11 runes. Each block is a vector; no word-boundary or page-boundary reset is introduced inside the 308-symbol chapter.
- Arithmetic: matrix operations over GF(29).

Both key matrices are invertible: determinant 21 for the prime-weight matrix and 8 for the raw-index control. For each, the test covered the standard row- and column-vector conventions and both forward/inverse key orientations. This is the complete finite family tested; no offsets, permutations, padding, or fitted parameters were added.

Reproduction: `sims/lp2_p32_p54_55_hill_key_gate.cjs`. It was run successfully with the repository's `manual-readonly-commonjs-sft.yml` workflow (run `45129100245`, job `137540229957`).

## Results

The raw p54–55 target has IoC 0.03382123 and mean English quadgram log-score −7.36976. The solved p57 control has IoC 0.06270997 and score −4.42063.

| Key matrix | Convention | IoC | Mean quadgram log-score |
|---|---|---:|---:|
| Prime weights mod 29 | Column, inverse | 0.03462498 | −7.53362 |
| Prime weights mod 29 | Column, forward | 0.03502686 | −7.48665 |
| Prime weights mod 29 | Row, inverse | 0.03506917 | −7.72635 |
| Prime weights mod 29 | Row, forward | 0.03375777 | −7.63721 |
| Raw GP indices | Column, inverse | 0.03422311 | −7.65817 |
| Raw GP indices | Column, forward | 0.03331359 | −7.68786 |
| Raw GP indices | Row, inverse | 0.03534413 | −7.07042 |
| Raw GP indices | Row, forward | 0.03409620 | −7.36955 |

All eight outputs remain near the random 29-symbol baseline. The best score (raw-index row/inverse) is still far below the solved-text control and its preview is not sustained English. The prime-weight matrix—the encoding selected by the 563×569 observation—does not improve the language score.

## Decision

Retire this exact hypothesis: **p32 reshaped as an 11×11 GP-prime-weight Hill key does not directly decrypt the 308-rune p54–55 chapter under standard GF(29) Hill conventions.** The raw-index control also fails.

Do not expand this into arbitrary row/column permutations, offsets, padding, or alternate moduli: no source clue selects those degrees of freedom. This result does not rule out other uses of p32, the repeated tree image, or the 2016 dimensions; it only closes the direct 11×11-to-28-block Hill construction tested here.

Related source work: `im-results/dead-tree-commons-derivative-gate.md` and `im-results/cicada2016-oak-stock-intrinsic-size-gate.md`.
