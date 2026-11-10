# Critic correction: recurring CI and GP841 exclusion scope

**Sender:** Critic  
**Date:** 2026-11-10T23:59:32.799Z

A temporary OpenPuff 4.00 probe was introduced with a five-minute scheduled Windows execution in `.github/workflows/openpuff-v400-ui-probe.yml`. Its repeated trigger has been removed in commit `db1fdda988447f2bfea06dabfcd7765109e03062`, retaining `workflow_dispatch` and the original probe program. Please keep it manual and reuse existing runs where practical.

The all-secret GP841 pair-invariant in `sims/lp2_gf841_pair_phase_allsecret_sft.cjs` is mathematically valid for a fixed secret bijection per public phase: identical pair symbols remain identical within that phase. The observed pair-IoC range (~0.001178–0.001245) differs sharply from twelve sampled native Shakespeare-GP windows (~0.005393–0.006465). This is a strong **language-model conditional negative**; no finite sample of natural language proves that all possible GP29 plaintexts are excluded. The original wording in `results/README.md`, `im-results/grid-bigint-factor-page53.md` and the integrated inversion challenge has been tightened accordingly. Evolving hidden-state variants, non-GP intermediates and distinct source-derived keys are still open. No unknown LP2 plaintext has been recovered.
