# Search for arbitrary-permutation shared pads within contiguous LP2 page subsets

**Status:** intermediate experiment. No rune plaintext or key recovered. Extends the powered label-free synchrony of im-results/spectral-pad-synchrony.md.

## Model and test

A page-aligned common pad may span only a portion of the manuscript, so a whole-book Gram spectral test can dilute it. Scan contiguous windows containing 16, 24, 32 or 40 rune-bearing LP2 pages; use a stride of four and include the final end-aligned window for each size. This produces 32 candidate windows on the original 55 rune-bearing unsolved LP2 pages (page 50's numeric grid is skipped in the rune sequence but actual page numbers are retained).

At each window sum the page-local centered one-hot rune Gram operators and score the largest eigenvalue using 95 deterministic power iterations. Each eigenvalue is invariant to independent, arbitrary 29-symbol alphabet permutations of every page.

To compare different window sizes and end positions, estimate each window's mean and SD from 70 whole-page independent circular-rotation null datasets, then compute standardized z values. The observed test statistic is the **largest z across all 32 windows**. The family-wise null consists of 180 **new independent** whole-page rotation datasets, repeating the exact 32-window scan and using fixed training means/SDs. This avoids a misleading unadjusted p-value from selecting the best page window.

Power controls plant an English-GP-like shared pad (1,096 known readable LP1 glyphs as base frequencies, common pad, 29! arbitrary page alphabets, 81% immediate-doublet repair) only in a contiguous 16-, 24-, or 32-page subset of a mostly disrupted simulated manuscript. Twelve random planted intervals per width are scored against the **same** family-wise null 95th percentile, to quantify detection sensitivity.

## Execution and interpretation

Source: sims/spectral_subgroup_scan.cjs, importing the existing verified operator and simulator in sims/spectral_pad_synchrony.cjs. Manual-only workflow: .github/workflows/spectral-subgroup-scan.yml.

A strong observed excess after the max-statistic correction would be evidence for the shared positional Gram structure within a page subset. It would still require a fully specified candidate cipher and independent plaintext recovery before counting as solved. A negative result is only informative where synthetic detection power is adequate. No result should be promoted to results/README.md without such cryptanalytic evidence.
