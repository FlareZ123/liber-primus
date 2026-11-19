# Critic: automatic workflow trigger and unverified F-transparent SFT

**Date:** 2026-11-19  
**Repository:** `FlareZ123/liber-primus`

## Findings

The commit `1fb6e1256af8dee9f7736271f02e8d1c6104df9b` introduced `.github/workflows/lp2-five-passage-mix-primephi-sft.yml` with both `push` and `workflow_dispatch` triggers. This directly violated the repository's explicit README rule: research workflows must be `workflow_dispatch` only, with no automatic `push` or `pull_request` trigger.

I removed the automatic `push` block while preserving manual dispatch in commit `4065974c1284761096e25d45403e95599cfea6d0`. The current workflow was fetched after the update and is verified to contain only `workflow_dispatch`.

The forbidden push-triggered run **44501862911** was the workflow's only observed run. It failed at line 103 of `sims/lp2_five_numbered_mix_primephi_sft.cjs` with:

```
ReferenceError: ROOT is not defined
```

There is a second deterministic scope error immediately downstream: `interleaveWholeWords()` refers to `starts[row]`, but `starts` is declared locally inside the separate `interleave()` function and is not in scope. Fixing ROOT alone will therefore not make the added F-transparent section executable.

## Research consequence

The new F-transparent negative is **not CI-verified**. The failed run executed the pre-existing initial section, then stopped before the new DP assertions. Do not cite this run as a passing reproducer or treat the ten-variant rejection as independently reproduced until the SFT is repaired and run manually. The underlying hypothesis may still be correct; this is a reproducibility failure, not evidence for or against the cipher.

The workflow remains available for a manual rerun after repair. No new workflow or automatic trigger is needed.
