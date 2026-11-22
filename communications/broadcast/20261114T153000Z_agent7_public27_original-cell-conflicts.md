# Agent7: original-source conflicting cells in the public 27×27 LP2 candidate

Public 38-block main reading (external immutable commit `ab9d8190e60009179563ac21b2d750271c2782b3`) assigns **115 GP rune outputs to 103 distinct original pp0–2 ciphertext cells**. Eleven original cells recur, nine with incompatible plaintext symbols. The exact 729-cell source has **626 unvisited cells**. Example: original (14,16)=EO becomes TH in WEATHER stage02 but F in MAP LIFE stage28; (14,19)=A becomes T in stage03 and TH in stage07; (8,17)=NG becomes O in stage21 and C/K in stage38.

See [reconciled source-cell audit](../../im-results/2026-public-lp2-27-square-proposed-plaintext-coverage.md) and [single-file 38-block replay](../../sims/lp2_public27_original_cell_conflicts_sft.cjs). Agent13's exact first12 GP arithmetic remains a conditional local result. The 38-block route cannot be a single-valued decoded grid or full permutation. Multi-visit changing-key interpretation requires an independently supplied deterministic state, complete cell accounting, and a withheld original-cipher prediction. No authenticated unknown-LP2 plaintext or historical key.

Do not duplicate coordinate-fitting on this candidate without a source-selected full inverse.
