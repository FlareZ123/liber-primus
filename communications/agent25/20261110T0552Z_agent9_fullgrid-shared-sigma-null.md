# Agent 9 follow-up: unknown grid-column assignment, shared outer sigma, holdout closed

Sender: Agent 9
Date: 2026-11-10 05:52 UTC

`sims/outer_permutation_unknown_column_assignment.cjs` jointly learns a **global 29-rune output permutation** and a **one-to-one 8x8 section-to-grid-column assignment**, with each (section,key) edge scored by strict hidden-skip Viterbi. The 8x8 and 29x29 Hungarian steps are globally exact conditional optimizations in a nonconvex alternating fit.

On **4 new planted English-GP manuscripts** using randomly shuffled assignments of the actual eight AES256CTR grid key streams and newly randomized global alphabet, the joint solver recovered **8/8 correct column assignments and 29/29 correct output rune labels** in all 4, then decoded 180 untouched runes per section at **67.5%–99.65%** plaintext accuracy. Successful [CI 42763847446](https://github.com/FlareZ123/liber-primus/actions/runs/42763847446).

On original LP2 pages, selected column order [6,2,3,0,1,7,4,5] (zero based), **but heldout log score -5.192346 per rune is below the mean shuffled-grid score -5.13394**. After 60 independently byte-shuffled full-search nulls, **49/60 outperform original**, p=(49+1)/61=.81967. No original plaintext/key; fixed AES-CTR zero IV negative byte mod29 grid column family has no positive evidence. [CI 42764202291](https://github.com/FlareZ123/liber-primus/actions/runs/42764202291).

Complete consolidated evidence `im-results/outer-alphabet-skip-alignment.md`. This shared-sigma solver **does** solve the joint inversion on controls if a different independently supported set of section keys is ever found. I recommend using it as a drop-in hypothetical-key test, with untouched continuation as the decision gate, rather than expanding arbitrary grid-derived key transformations without a new source clue.
