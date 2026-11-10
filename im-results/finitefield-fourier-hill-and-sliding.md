# Blind finite-field Fourier search: five-symbol Hill blocks and sliding linear state

**Agent 24, 10 November 2026. Classification:** original-source, keyless spectral attack and synthetic inverse recovery, with a negative original-source result for the specific fixed-linear families. No unknown LP2 plaintext, authentic key or established cipher has been recovered.

## Inversion mechanism and why it matters

A stationary invertible `w × w` Hill cipher over the actual 29-symbol Gematria Primus indexing has ciphertext blocks `C = M P (mod 29)`. Any inverse row `r` gives one source plaintext symbol `rC (mod 29)`, whose marginal is relatively nonuniform if that source is ordinary GP-English. The complete multidimensional Fourier transform of the empirical ciphertext-block histogram permits every candidate inverse direction to be found without knowing the mixing matrix. Scalar multiples share a projective line: normalize the first nonzero coefficient of each candidate to 1. Re-rank the candidate directions by the full 29-bin contrast `D(r) = 29 × sum_x(n_x/N)^2 - 1`, and reserve the second half for frozen heldout evaluation. For iid uniform symbols the expected finite-sample contrast is (28/N).

The width-five search explores the **entire five-dimensional Fourier spectrum with 29^5 cells** (20,511,149 cells), rather than trying 20 million separate inverse keys. For each of five phases in both continuous-book and physical-page reset modes, it enumerates the largest 1,200 frequency magnitudes and tests the corresponding ~600 unique projective directions. The sample sizes are ~2,522–2,591 five-rune blocks per framing. A separate width-four regression makes the inherited near-zero adjacent-ciphertext differences visible; the earlier exhaustive width-four row screen remains in [hill_row_screen.cjs](../sims/hill_row_screen.cjs).

## Original 55-page input and outcomes

The input is [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json), exactly 12,956 runes on 55 unsolved rune-bearing LP2 pages. The 10 original width-five tests output:

| Block clock | Phase | Top train contrast | That same row, heldout contrast | Heldout null mean |
| --- | ---: | ---: | ---: | ---: |
| Book | 0 | .060430 | .023969 | .021605 |
| Book | 1 | .061709 | .023796 | .021605 |
| Book | 2 | .057386 | .019031 | .021622 |
| Book | 3 | .061433 | .022421 | .021622 |
| Book | 4 | .055311 | .019931 | .021622 |
| Physical page | 0 | .059521 | .021843 | .021807 |
| Physical page | 1 | .059569 | .019902 | .021858 |
| Physical page | 2 | .059282 | .022046 | .021978 |
| Physical page | 3 | .066835 | .015547 | .022065 |
| Physical page | 4 | .056377 | .017020 | .022205 |

No top row retains source-language-scale concentration on heldout ciphertext. Each five-row full-rank candidate likewise contains directions with weak heldout contrast. The corresponding width-four regression does show phase-shifting adjacent-difference rows, for example `r=[0,0,1,-1]` with heldout `D=.058781` at book phase zero. This follows the known anti-repeat property, so it is **not** a hidden Hill inverse or plaintext.

A blind **five-consecutive-rune sliding-window** scan searches every 29^5 Fourier coordinate for a linear feedback relation, without assuming disjoint block boundaries. It retains only at least three-nonzero-coefficient rows and ranks the largest 16,000 harmonics, about 7,940 projective rows. There are 12,952 continuous-book and 12,736 within-page windows. The best training row in both modes is **[1,21,21,17,27]**:

| Sliding scope | Train contrast | Heldout contrast | Heldout uniform null mean | Same fixed training-peak value on heldout |
| --- | ---: | ---: | ---: | ---: |
| Book | .0122837 | .0039997 | .0043237 | 3.6905% |
| Within-page | .0124070 | .0041586 | .0043970 | 3.6746% |

The training peaks do not survive on withheld original runes, and these five-position tests reveal no new affine-feedback cipher. The established **word-local lag-six** relation is outside the five-consecutive-position window and remains a separate open clue.

## Positive controls and limits

Two fully random invertible finite-field mixing matrices encrypted independent strongly nonuniform GP-like symbol sources. After **353** and **357** anti-adjacent-repeat rewrites, the blind algorithm recovered exactly **4/4** inverse projective rows for width four and **5/5** for width five. The first selected width-five row had heldout `D=.9685704` and all five genuine rows had heldout `D>.78`. These successful exact-key identifications are synthetic and establish detector power for that source and noise strength only.

For the sliding relation, a separate planted length-12,956 stream applied the four-back recurrence `C_i = 3*C_(i-1) + 5*C_(i-2) + 7*C_(i-3) + 11*C_(i-4) + 13 (mod 29)` at **7% of positions**, sampling the remaining outputs uniformly while avoiding adjacent repeats. The same blind Fourier scan recovered the planted true inverse projective direction `[1,27,11,24,21]`. The planted top row produced a heldout contrast of `.1680178` against the null `.0043237`. Its source and seed are specified in the [program](../sims/sliding_five_linear_recurrence_fft.py). The positive is deliberately stronger than the original manuscript's sparse echoes.

**Conclusions:** The current LP2 source fails this no-key, five-rune stationary-Hill/short linear-recurrence attack under the GP-English nonuniform-symbol assumption, despite powered synthetic recoveries. This does not exclude dynamic or page-varying matrices, unmodeled transpositions, encrypted intermediary codes with flat distributions, alternate symbol alphabets, nonlinear feedback, or the documented six-back and five-back word-local motifs. The search itself is a reusable mechanism-specific inverse and can be rerun for other widths or source-defined segments when justified by a new clue.

## Reproduction

- [Five-rune Hill Fourier attack](../sims/hill_fourier_blind_inverse.py)
- [Five-symbol sliding FFT scan](../sims/sliding_five_linear_recurrence_fft.py)
- [Successful on-demand original-source CI 42796460556](https://github.com/FlareZ123/liber-primus/actions/runs/42796460556), including both original inputs and all positive controls
- Manual-only [Hill runner](../.github/workflows/hill-row-screen.yml), select `fourier5`. NumPy/SciPy installed on GitHub Actions runner; no automatic per-commit CI added.
