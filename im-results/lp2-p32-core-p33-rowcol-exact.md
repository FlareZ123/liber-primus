# LP2 p32 peeled core to p33 first body — exact arbitrary row/column permutation key gate (Agent 6, 27 Nov 2026)

**Decision:** no original plaintext. Both literal GP ordinal and GP prime-mod29 forms of the p32 9×9 inner matrix require at least **9/21 original printed words** to fall outside the frozen GP lexicon under every independent row and column permutation, transpose, and additive sign. This is a finite lexicon/segmentation exclusion, not a proof that every possible plaintext must be English or preserve words.

## Source and hypothesis

The signed 2016 image's 563×569 dimensions equal the p32 11×11 GP-prime top and left axis sums. The newly reopened [common-stock selector](lp2-tree-common-stock-source-reopening.md) provides additional context. Solved p57's literal shedding-circumference language motivates removing one complete outer ring, giving 81 inner cells. Independently, the first p33 heading has ten runes and its marked black body has 81 (page offsets [10,91), whole unknown tape [7970,8051)). Prior direct row-major transfer, spiral, and Hill consumers were negative. This test grants unknown arbitrary row and column permutations, strictly subsuming the direct ordinal additive case without assuming a particular traversal.

For every permutation R,Q of 0..8, sign s=±1 and transpose t∈{0,1}, decode P[r,c]=C[r,c]-s*K[R[r],Q[c]] mod29 (exchange indices for t=1). Test K as raw GP indices and GP prime values mod29. 4*(9!)²=526,727,577,600 parameter tuples per literal value basis, 1,053,455,155,200 across both. These counts are parameter tuples, not claims of distinct output strings. The 21 printed word lengths are [2,9,6,3,3,5,3,2,7,3,3,6,5,8,2,3,2,2,2,3,2]. No F-skip, unknown alphabet, arbitrary cell permutation, word permutation, or H-decoy segmentation is granted.

## Exact algorithm

Enumerate all 1,451,520 (column,sign,transpose) settings per basis. For every output row and possible source row, decode the nine cells; compute unary costs for fully internal printed words. For each row seam at most one printed word crosses because maximum length is nine. Calculate binary seam cost for every pair of distinct source rows. Sum of row unary minima is a lower bound; the suffix-chain DP further relaxes the all-different constraint to adjacent inequality only. Where this bound allows the OOV budget, DFS all distinct row assignments, pruning with exact accumulated cost plus the relaxed suffix bound. All omitted branches have a rigorous lower bound exceeding the budget. Every reported candidate is re-encoded to the original ciphertext. This is exact enumeration with pruning, not a sampling/beam method.

Use the repository TextBlob dictionary with standard greedy GP normalization (29,060 types, sorted LF-joined FNV1a32 5eef1519) and all exact source-native solved words (29,081 total types, c3a881db). Local package-derived TextBlob membership and native compact fixtures were checked against those repository fingerprints. Native donor words remain in the dictionary: controls test blind permutation recovery, not lexicon generalization.

## Executed original result

| Basis | Full column tuples | Pass unary (budget 10) | Pass relaxed chain | Valid keys <=10 misses | Exactly 9 | Exactly 10 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Ordinal | 1451520 | 1426850 | 1091 | 943 | 10 | 933 |
| Prime mod29 | 1451520 | 1418406 | 676 | 1004 | 47 | 957 |

Both complete histograms have zero entries at budgets 0..8. Thus minimum is exactly nine for each, not merely failure at an arbitrary OOV cutoff. At ordinal budget3 only 16 tuples pass unary and zero pass relaxed chain; budget6 gives 85,468 unary and zero relaxed; budget8 gives 838,781 unary and zero relaxed. No credible plaintext.

## Blind native controls (budget3)

Three native 81-rune consecutive, complete-word excerpts from solved WARNING (word23 zero-based), KOAN1 (word116), LOSS OF DIVINITY (word98), each planted with independently seeded row/column permutations (Python Random(3301)), signs +,-,+ and transposes 0,0,1. The solver knows only the dictionary, source K, ciphertext, and printed lengths.

| Basis | WARNING valid/zero miss | KOAN valid/zero miss | LOSS valid/zero miss |
| --- | --- | --- | --- |
| Ordinal | 3/1 | 4/1 | 2/1 |
| Prime mod29 | 3/1 | 5/1 | 1/1 |

All six planted keys and 81/81 runes recovered, uniquely at zero misses. At relaxed budget3 alternative keys can survive, as shown. Original text is not a matched repeat-profile plant and does not establish universal OOV assumptions.

## Reproduction

- [C++ solver](../sims/lp2_p32_core_p33_rowcol_exact.cpp)
- [Repository-input generator](../sims/lp2_p32_core_p33_rowcol_input.py)
- [Raw counters](lp2-p32-core-p33-rowcol-exact-output.txt)

Compile C++17 optimized; generate input with Python. For controls/default budget3 run generator with no flags (or --prime), redirect to solver stdin. For original exact minimum run generator --original-only (or --prime --original-only), pass argument 10 to solver. The local C++ algorithm was compiled and executed with fixed budget3/6/8/10 variants, and both bases' controls/original fixtures. Published driver regenerates the same native windows and keys from repository sources and checks the membership fingerprint; dynamic-budget wrapper was adapted after local execution, not separately executed from a fresh checkout. No new established plaintext, key, or navigation destination.

## Next decision

Retire this specific transfer family under ordinary printed-word GP prose. A new approach must either independently justify breaking segmentation or introduce a source-selected nonlinear operation. Do not enumerate arbitrary orderings again under identical assumptions. The common artwork relationship and exact axis sums survive this negative.
