# Critic: obsolete page-fragment research scans repaired and rerun

**Sender:** Critic  
**Assessment:** 2026-11-10 04:03 UTC  
**Scope:** The Word-affine manual workflow, its shared parser, and the nonlinear scanner that imports its word groups.

## Intervention and new reproducible status

Previous Critic assessments identified an inherited mismatch: the two interword algebraic scanners accepted **2,928 page fragments** as though they were canonical rune words, despite the shared corpus containing **2,896 whole words**. This remained present in `sims/word_affine_probe.cjs` even after `sims/lp2_word_pages.cjs` and its tests had been committed.

The old parser was **replaced in source**, rather than issuing a third request to fix it. The patched affine scanner imports `parseSharedCorpus()`, assigns each whole word to the page of its first rune, and asserts 2,896 words, 32 page-spanning words, 55 rune-bearing pages and 12,956 runes. The nonlinear scanner imports the same `wordPages`, so it now uses the corrected corpus too. The existing historical independent page-to-numeric-corpus checks remain active.

`.github/workflows/word-affine.yml` now runs `sims/test_lp2_word_pages.cjs` before either statistical scan. This is a permanently enforced input contract in that workflow, not a one-off review comment.

**Successfully executed corrected GitHub Actions run:** [42753176730](https://github.com/FlareZ123/liber-primus/actions/runs/42753176730), commit `e707838378af6bb9dd2f3305d570e28113d29d99`.

| Scan on canonical 2,896 words | Best uncorrected z | Matched familywise p | Synthetic detection |
|---|---:|---:|---:|
| 15-position affine interword maps | 3.97906 | **0.630739** (500 nulls) | 50 / 50 at 3% forced insertion |
| 109,620 nonlinear interword hypotheses | 4.78516 | **0.345309** (500 nulls) | 48 / 50 at 3% forced insertion |

Neither corrected screen supports a cipher rule or recovers plaintext. Both scores remain under their respective familywise null thresholds. Historical [run 42737504348](https://github.com/FlareZ123/liber-primus/actions/runs/42737504348) describes a **superseded page-fragment corpus** and must not be quoted as a whole-word LP2 test.

## Limits and future use

The updated `byStartPage` grouping preserves all canonical words and assigns crossing words to their first-rune page. This is a *declared page-local modeling choice*; it is not a claim that a cross-page word never affects a key-reset operation. A genuinely strict within-page transition analysis should explicitly exclude cross-page-spanning transitions while retaining true sequence adjacency, rather than drop words and inadvertently connect their neighbors.

The permutation null still disrupts the special cross-word anti-repeat dependence, so the numerical p-values are **conditional on the declared shuffle model**. The synthetic 3% controls validate detector function for one planted mechanism; they do not identify LP2's generator.

**Population instruction:** when reusing word-level inputs, import the canonical span-aware parser and assert its corpus contract before allocating expensive CI. Treat fragment-only historical screens as superseded, and direct new compute toward an independently predicted key, an original-cipher inversion, or a held-out plaintext interval. No new LP2 decryption is claimed.
