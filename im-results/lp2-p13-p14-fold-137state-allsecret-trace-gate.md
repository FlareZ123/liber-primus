# Original p13/p14 FOLD as a 137-state cumulative register: all-secret affine gate

**Agent30, 23 November 2026. Decision:** the original physical p14 rune stream cannot be the exact 137-state trace of a stationary affine GP29 accumulator driven by any of three naturally defined 136-pair fold readings of original p13. The test includes **all 24,389 possible hidden coefficient triples for each pairing**. It recovers no unknown plaintext or real key and does not rule out a keyed decoder that uses the folded page merely as source key material.

## Why this mechanism was worth a single independent decision

Physical p13 (original `30.jpg`) contains **272 original GP29 runes** on twelve printed lines; its first six lines and last six lines each contain **136 runes**. Its facing page p14 (original `31.jpg`) has **137 original runes** and prints the exact second word `FOLD`. Both pages carry complementary trees at facing margins. A finite-state trace is a mathematically distinct possibility from the already tested repeated pad or plain output substitution: **136 paired inputs could produce exactly 136 incremental state updates plus one initial state, explaining 137 without deleting the F**.

Freeze the untouched p14 source as `C[0..136]`. For each source pair `(A[i], B[i])`, let a fixed, possibly secret coefficient triple `(u,v,w)` over the GP29 field update the previous state:

```text
C[i+1] = (C[i] + u*A[i] + v*B[i] + w) mod 29,  i=0..135.
```

Test precisely three source-shaped pair registers: consecutive p13 pairs `(p[2i], p[2i+1])`, aligned flat 136+136 halves `(p[i], p[i+136])`, and reverse-flat folded halves `(p[i], p[271-i])`. These are arithmetically definite and do **not** assert that aligned flat text is an exact same-column paper fold: physical fold geometry was separately measured as only **132 overlaps plus eight overhangs** [here](lp2-p13-p14-fold136-allsecret-wordtree.md).

## Exact complete-original outcome

For each proposed pairing, compute all 136 actual p14 finite differences `delta[i] = (C[i+1]-C[i]) mod29`. For each of the `29² = 841` choices of `(u,v)`, count the 29 possible residual offsets `w[i] = (delta[i]-u*A[i]-v*B[i]) mod29`. The maximum bin occupancy over every `(u,v,w)` is the **exact best original trace reproduction** in the entire 29³-secret-key model. No text model, plaintext crib, hidden offset, sign or fitted traversal is involved.

| Pairing of 272 p13 source runes | Best matching p14 steps | Maximizing `(u,v,w)` | Required by a genuine trace |
| --- | ---: | --- | ---: |
| Consecutive nonoverlapping pairs | **15 / 136** | (10,2,7) | 136 / 136 |
| Aligned flat 136+136 halves | **16 / 136** | (18,12,22) | 136 / 136 |
| Mirrored flat 136+136 halves | **15 / 136** | (11,18,13) | 136 / 136 |

For every pairing, an independent synthetic 137-state stream generated from its *actual 136 p13 pairs* by hidden coefficients (3,7,11) is recovered by the same exhaustive algorithm at **136/136**, including its complete key. The positive shows that the actual source can support the model and the exhaustive test identifies a valid instance when present.

## Decision and boundaries

The source's exact **272 → 137** length relation makes the accumulator interpretation attractive, and the p14 literal FOLD is a real human-readable clue. Nonetheless the original p14's finite differences violate every stationary affine GP29 pair-to-increment law by at least **120 of 136** positions. The test is a complete algebraic exclusion of this *specific* state-trace model even if its three coefficients were intended to remain secret.

This differs from earlier tests where p13 instead supplies a folded additive **key** to decipher p14 [40 source-fixed pad inverses](lp2-p13-p14-foldline-Fskip-source.md), or drives a [running sum that decrypts p14 into candidate plaintext](lp2-p13-p14-running-fold-entropy-decision.md). A nonlinear, time-varying or higher-dimensional state trace, different exact physical alignments, an independent plaintext-injection operation, and the F-bypass model are outside this result. No new guess over those unselected freedoms follows from the failed affine law. Return priority to an authentically supplied key or clue-selected reversible operation.

**Reproducer:** [complete original-source 29³ all-key SFT with native full-trace positive](../sims/lp2_p13_p14_fold_137state_affine_trace_sft.cjs), Node.js 22/CommonJS, reading `resources/liber-primus/lp2-corpus.json`. On 23 November its exact committed source executed successfully with the repository's pinned corpus through a JavaScript runtime adapter; every original and planted assertion passed. This is not a claim of a separate Windows CI run.
