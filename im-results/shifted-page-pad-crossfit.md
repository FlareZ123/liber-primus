# Unknown page-clock slips in a shared mod-29 keystream

**Agent 15, 2026-11-10. Executed original-ciphertext negative with strong planted positives.** No recovered LP2 key or plaintext.

## New constructive cryptanalytic attack

Prior page-key analyses fixed the start of the shared pad on each page or used the prescribed continuous global period. This search admits **an unknown, small per-page key-pointer slip** and a separate unknown Caesar alphabet offset:

\[
C_{j,t}=P_{j,t}+K_{t-s_j}+b_j\pmod{29}.
\]

The keystream \(K\) is arbitrary and nonperiodic, not chosen from a candidate seed. The allowed **relative** shift is \(s_j-s_0\in\{-2,-1,0,1,2\}\); the offset \(b_j\) ranges over all 29 values. Use 46 original unsolved LP2 pages with at least 200 runes. Maximize aligned rune-collision pairs \(\sum_{t,r}\binom{n_{t,r}}2\), enumerating all 5×29 page-local assignments in 15 seeded coordinate starts, up to six rounds, while the first page anchors gauge freedoms.

All model fitting uses **90 key positions 2–91**. A single best training solution is frozen and scored on **90 distinct positions 107–196**. Each permitted original page offset indexes a real rune, and the two sets are disjoint within every page.

Independently rotate each original whole physical page and rerun the complete fit in each null trial, preserving its length, rune counts and internal structure. The 60 null trials use \`0x21950f17\`. Positive controls use fresh random common pads, independent page shifts in \([-1,+1]\), unknown Caesar offsets, Shakespeare-trained GP-English symbol frequencies (IoC **0.05996323078**), and an optional **81% overwrite rate** for a tentative adjacent repeated rune.

## Executed results

[Successful full experiment, corrected phase gauge, Actions 42788555692](https://github.com/FlareZ123/liber-primus/actions/runs/42788555692):

| Outcome | Measured |
| --- | ---: |
| Original training collision pairs (selected) | **4,762** |
| **Original untouched heldout collision pairs** | **3,205** |
| 60 fully refitted page-rotation nulls, mean | **3,205.5** |
| Null min / max | **3,085 / 3,344** |
| Empirical add-one upper-tail p | **0.5409836** |
| Uniform independent heldout baseline | **3,212.06897** |
| 8 no-overwrite positive plants, heldout mean | **5,284.375** |
| 8 no-overwrite plants, range / detections | **5,038–5,410; 8/8** |
| 8 with 81% doublet-repair plants, mean | **5,146.375** |
| 8 doublet-repair plants, range / detections | **4,703–5,351; 8/8** |

The planted positive tests recover a largest congruent phase group containing **44–46 of 46 pages** (correctly allowing a globally unconstrained key-pointer origin). The largest recovered Caesar congruence groups contain **33–45 pages**. The earlier [run 42788143187](https://github.com/FlareZ123/liber-primus/actions/runs/42788143187) had a displayed shift-recovery metric that incorrectly required matching the initial anchor; this affects only diagnostic display, not original scoring or recovery.

**Conclusion:** On the original LP2, fitting phase slips and page offsets gives no independently predictive common-pad signal; the fully reoptimized original rotations are indistinguishable. The same fitter reliably detects the planted cipher family, including aggressive collision rewriting. This bounds a particular GP-English-like, small-relative-slip, shared-additive-pad model. It does not address different plaintext registers, larger/data-dependent clock skips, multipliers, arbitrary glyph relabelings, word-based transformations or nonlinear ciphers. No key/plaintext recovered. Widening shifts blindly would add free parameters without an independent key-pointer clue.

## Reproduction

[Source script](../sims/shifted_page_pad_crossfit.cjs) and [manual-only workflow](../.github/workflows/shifted-page-pad-crossfit.yml). Run \`node sims/shifted_page_pad_crossfit.cjs 60 8\` on Node.js 22 with the committed LP2 corpus and Shakespeare reference. The code prints all model parameters, seeds and complete per-plant statistics.
