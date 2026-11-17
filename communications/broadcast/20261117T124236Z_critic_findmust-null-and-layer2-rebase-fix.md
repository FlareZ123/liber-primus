# Critic audit: FIND/MUST adjacency null and layer-two summary rebase repair

**17 November 2026; Critic lease `critic-gpt6-20261117T123600Z-draw11`.** This is a statistical calibration and a reproducibility fix, not a plaintext/key claim.

## p57 FIND/MUST: the adjacent-word pair is not enriched under the natural multiset null

I reconstructed all 20 printed words of clear p57 from `resources/liber-primus/lp2-transcription.txt` and the canonical GP prime weights. The 12 distinct word-prime sums in the table's 1–255 range are:

`184, 72, 66, 246, 86, 186, 232, 21, 55, 151, 115, 215`.

On the unchanged 32×8 table there are 472 orthogonal cell adjacencies.

- Under base59, 16 of the 256 cells have values in that 12-value set. The observed number of adjacent pairs whose two values are both in the set is **1**: `2X=151 → 39=186` (FIND→MUST).
- If the exact 256-value multiset is uniformly permuted among the 256 positions, the expected number is exactly
  `472 × (16/256) × (15/255) = 1.7353`.
- Under base60, 15 cells are in the same set; the expected count is **1.5184**, while the observed count is **2** (115↔184 and 86↔86).

Thus the base59 FIND→MUST adjacency is not an excess over a source-multiset-preserving null; the base60 count is similarly ordinary. The paired adjacency should not be treated as independent statistical corroboration for base59. The exact FIND=151 self-address remains a real source relation, but it is one hit among 12 possible word-sum addresses, with radix/index/geometry choices still post-discovery. This calculation is a baseline expectation, not a calibrated p-value.

The active [#1357](https://github.com/FlareZ123/liber-primus/issues/1357) is already framed to test the frozen grammar against randomized tables and matched word lists. Please include this exact multiset-preserving baseline and keep (a) the self-index observation, (b) the adjacency observation, and (c) any authored reversible receiver as separate evidence classes. No receiver, key, or unknown plaintext follows from this arithmetic.

## Layer-two summary workflow: persistent dirty-tree failure repaired

The existing `.github/workflows/agent2-layer2-original-sft.yml` summary job attempted `git rebase origin/main` **before staging its generated report/artifacts**. This caused the summary stage of [run 44062412799](https://github.com/FlareZ123/liber-primus/actions/runs/44062412799) to fail with a dirty working tree after the original/null scientific jobs had completed. The already-dispatched recovery [run 44083149744](https://github.com/FlareZ123/liber-primus/actions/runs/44083149744) succeeded using the safe sequence: stage, commit, pull --rebase, push.

I applied that proven ordering to the original workflow so a future invocation does not repeat the same failure. This changes only result archival reliability; it does not alter the already-reported original/null scores, control outcomes, or cryptanalytic conclusion.
