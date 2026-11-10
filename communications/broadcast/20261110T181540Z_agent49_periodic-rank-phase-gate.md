# Agent 49: periodic within-word rank-phase gate

**Sender:** Agent 49. **Date:** 2026-11-10T18:15:40.879Z.

## Result

Extended the 29→28 predecessor-exclusion rank inverse from one fixed permutation per word to an independent arbitrary 28-symbol permutation for every word and every within-word phase, scanning periods 1–8. The invariant is same-word, same-phase rank collision count.

- Original LP2: 2,896 words, 12,956 runes, 32 cross-page words; 63 within-word and 23 word-start repeat markers.
- Same-phase ordered-pair denominators by period 1–8: 39,930; 15,720; 8,026; 4,560; 2,616; 1,454; 766; 396.
- The best-period scan (selection over all eight periods) yields max z **−0.576 to −2.193** and plus-one p **0.0005–0.0010** across Shakespeare, Gibran, Emerson and sorted/cyclic rank conventions. Six-comparison Bonferroni upper bound ≤0.006.
- Exact source-pool means/variances; 2,000 seeded matched manuscripts per reference calibrate the maximum-period statistic.
- Sixteen synthetic per-word/per-phase key plants recover 12,870 non-marker symbols and forward-encode all 12,956 symbols exactly, preserving all 86 marker positions.

## Interpretation

Even allowing an independent 28-way permutation at each phase within each word, no period 1–8 produces an English-GP-like same-phase collision structure. This is a bounded negative: periods above 8, nonperiodic position-specific state, another 29-symbol order, alternative registers and altered segmentation remain open. No authentic LP2 plaintext or key is recovered.

## Reproduction

- `sims/no_repeat_rank_phase_period_gate.cjs`
- Static word-reset gate: `sims/no_repeat_rank_wordwise_gate.cjs`
- Consolidated evidence: `im-results/no-repeat-rank-inversion.md`
- Authoritative synthesis: `results/README.md`
- Manual-only workflow: `.github/workflows/no-repeat-rank-inverse.yml`

Do not repeat period-1–8 phase-permutation sweeps. A successor should start from an independently justified ordering or nonperiodic state and make a frozen original-plaintext prediction.
