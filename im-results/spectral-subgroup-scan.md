# Search for arbitrary-permutation shared pads within contiguous LP2 page subsets

**Status:** intermediate experiment. No rune plaintext or key recovered. Extends the powered label-free synchrony of im-results/spectral-pad-synchrony.md.

## Model and test

A page-aligned common pad may span only a portion of the manuscript, so a whole-book Gram spectral test can dilute it. Scan contiguous windows containing 16, 24, 32 or 40 rune-bearing LP2 pages; use a stride of four and include the final end-aligned window for each size. This produces 32 candidate windows on the original 55 rune-bearing unsolved LP2 pages (page 50's numeric grid is skipped in the rune sequence but actual page numbers are retained).

At each window sum the page-local centered one-hot rune Gram operators and score the largest eigenvalue using 95 deterministic power iterations. Each eigenvalue is invariant to independent, arbitrary 29-symbol alphabet permutations of every page.

To compare different window sizes and end positions, estimate each window's mean and SD from 70 whole-page independent circular-rotation null datasets, then compute standardized z values. The observed test statistic is the **largest z across all 32 windows**. The family-wise null consists of 180 **new independent** whole-page rotation datasets, repeating the exact 32-window scan and using fixed training means/SDs. This avoids a misleading unadjusted p-value from selecting the best page window.

Power controls plant an English-GP-like shared pad (1,096 known readable LP1 glyphs as base frequencies, common pad, 29! arbitrary page alphabets, 81% immediate-doublet repair) only in a contiguous 16-, 24-, or 32-page subset of a mostly disrupted simulated manuscript. Twelve random planted intervals per width are scored against the **same** family-wise null 95th percentile, to quantify detection sensitivity.

## Executed results

The [successful on-demand CI run 42743825135](https://github.com/FlareZ123/liber-primus/actions/runs/42743825135) completed the 32-window (not 31) scan, 70 training rotations per window, 180 independent max-statistic null rotations, and 36 partial-pad planted controls.

| Quantity | Measurement |
| --- | ---: |
| Candidate page windows | 32 |
| Top window | LP2 pages **4–19**, 16 rune-bearing pages |
| Top window eigenvalue | **45.05485** |
| Top window standardized excess | **z=1.31487** |
| 180 matched max-null mean / SD | **2.04133 / 0.74909** |
| Max-null 95th percentile | **3.46099** |
| Family-wise empirical upper p, add-one | **0.85083** |
| 12 planted 16-page subsets exceeding max-null 95th percentile | **6/12** |
| 12 planted 24-page subsets exceeding same threshold | **11/12** |
| 12 planted 32-page subsets exceeding same threshold | **12/12** |

The manuscript's best subset score is actually *below the mean of the selection-corrected null maxima*. There is no detectable local label-invariant shared pad in the 32 contiguous windows scanned. The positive controls show good detection for shared keys spanning 24–32 neighboring rune pages, but only moderate sensitivity for 16-page groups. Hence these findings speak most strongly against reuse of a common, correctly aligned pad across long neighboring blocks under the simulated English-GP register.

## Execution and interpretation

Source: sims/spectral_subgroup_scan.cjs, importing the existing invariant operator and positive simulator in sims/spectral_pad_synchrony.cjs. Manual-only workflow: .github/workflows/spectral-subgroup-scan.yml.

This excludes none of the untested families involving noncontiguous shared pages, page-specific key phase drift, uniform intermediate codes, or unknown second encryption layers. The test produces no recovered key or plaintext and does not justify promotion to results/README.md.
