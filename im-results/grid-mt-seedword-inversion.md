# LP2 section keys from the 256-byte grid: PHP MT seedword assignment attack

**Status:** failed ciphertext recovery with a calibrated, source-derived inverse. Agent 39, 2026-11-10. A complete synthetic plant recovers the true keys, while LP2 scores no better than randomized table controls. No plaintext or original key recovered.

## Source-constrained candidate generator

The LP2 numerical table has **eight vertical 32-byte columns**. For each column, interpret any one of its eight aligned groups of four successive bytes as a **32-bit unsigned seed** for legacy PHP Mersenne Twister; keep the **same row group across all eight columns**, with either little- or big-endian packing. The resulting eight deterministic pseudorandom sequences are candidate one-per-section additive GP keystreams. The eight substantial LP2 sections have lengths **[729,1145,1729,1903,1021,1524,1589,3316]** after joining the two-word bridge to its neighbor, as in the existing grid-section experiments.

The exact tested model has **8 aligned row groups × 2 byte-endiannesses × 5 `mt_rand`→mod29 reduction rules × 2 additive signs = 160 key-family settings**, with each setting's eight candidate source keys assigned bijectively to the eight manuscript sections by an **exact 8! dynamic-programming assignment**. Ciphertext is allowed an entirely unknown but *single fixed* permutation of the 29 output symbols. Such a permutation preserves equality and cancels from the trained 2–16-lag rune coincidence score. No key-skips or insertions are allowed in this model.

Select the best setting and assignment on exactly the **first 500 runes per section** (4,000 total). Freeze it, then score the **8,956 remaining runes** without refitting. This is a direct key-inversion candidate ranking, unlike an unconstrained search for interesting coincidentally matching words.

## Reproducible result

Successful [manual run 42761057063](https://github.com/FlareZ123/liber-primus/actions/runs/42761057063) used the untouched canonical grid, 50 seed-fixed shuffles of its bytes *inside each column* (preserving the column byte histogram and the complete search size), and a planted genuine Shakespeare GP source.

The selected real-LP2 configuration is **row group 3, big-endian, remainder-29 reduction, additive sign +1**, source-column-to-section assignment `[3,4,5,0,1,2,7,6]`. Its training composite log score is **−8,779.9214**, across **58,920** lagged comparisons; independent section-tail score is **−20,008.2467**, across **133,260** comparisons. There is no recognizable plaintext supplied or recovered by the equality-only sieve.

Of 50 matched shuffled-grid nulls whose full 160-settings/8!-assignment search was rerun, **32** produced a training maximum at least as good as the real grid, and **37** produced a selected heldout score at least as good. Respective add-one upper-tail fractions are **33/51 = 0.64706** and **38/51 = 0.74510**. Neither training nor untouched tails favor the real grid.

**Planted inversion control:** encrypt an actual held-out English GP plaintext using **row group 3, little-endian, remainder 29, sign +1**, secret section-to-key assignment `[6,2,4,0,1,7,5,3]`, a shuffled hidden outer 29-rune alphabet, and **366** artificial adjacent-doublet rewrites at the declared 0.81 collision-repair probability. Under the same fitting process, the exact planted **key-family parameters and all eight assignments** are recovered. The plant confirms power under this specific mechanism; it does not establish that this is Cicada's mechanism.

## Interpretation and next use

This finite eight-section **grid-32bit-seeds→PHP MT→GP add/subtract→common unknown outer alphabet** construction gives no evidence of LP2 decryption in either fitted or heldout material. It is not an exclusion of all table-derived seeds, unknown page/section offsets, skip-aware generators, nonlinear key KDFs, section-specific outer alphabets, or a non-English plaintext register. The eight source columns may still have a different relation to ciphertext or a separate payload role.

Executable: `sims/grid_mt_seedword_inversion.cjs`. On-demand workflow: `.github/workflows/grid-mt-seedword.yml`. Canonical grid SHA-256 is asserted in code. The earlier pilot 42759752700 was a failed *script* positive control masked by an unguarded `tee`; the control was strengthened from 300 to 500 training runes, the workflow now propagates script failures, and both [corrected pilot 42760604429](https://github.com/FlareZ123/liber-primus/actions/runs/42760604429) and final 50-null run pass. Do not cite the earlier CI job's superficial status as evidence of a successful key inversion.
