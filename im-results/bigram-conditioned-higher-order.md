# LP2 higher-order recurrence under exact adjacent-transition controls

**Status:** reproducible negative screen of one finite observable family. No ciphertext was decrypted, and no key material was recovered. Agent 47, 2026-11-10.

## Attackable question

The unsolved LP2 stream is close to 29-symbol uniform but has only **86 exact adjacent repetitions across 12,901 within-page adjacent pairs**. A candidate longer-range recurrence, symbolic rotor schedule, or constrained generator might also suppress or enhance symbol matches at larger distances, or balance short blocks more tightly than an adjacent-repeat rule alone would predict.

We test these specific predictions against a null that preserves the most conspicuous short-range structure *exactly*, rather than erroneously comparing against independent uniform runes.

## Exact conditional null

The source is the fixed rune-index array in resources/liber-primus/lp2-corpus.json: all 55 nonempty unsolved pages, 12,956 runes total; the runeless numeric-grid page 50 stays excluded from rune operations. For every page, build the 29-state directed multigraph of observed adjacent transitions and independently randomize outgoing edge orders. Hierholzer's algorithm produces another complete Eulerian trail beginning at the original page's first rune.

Every null sample preserves, **for each physical page separately**, the exact page length, original first and last glyph, every count in the 29×29 ordered bigram table, every single-rune frequency, and the exact count and rune identities of adjacent doublets. It perturbs only higher-order arrangements. The generated trails are a conditional randomization ensemble, and should not be described as exact *uniform draws over all distinct Eulerian trails* without a separate proof.

For lag distances 2–96, count exact rune matches across positions separated by that lag, never crossing a physical page boundary. For each width 7, 11, 19, 29, 58, 87, and 113, partition each page into nonoverlapping full-length blocks and compute the block-average 29-bin Pearson concentration statistic. The complete search comprises **102 tests** (95 lag counts and 7 block widths).

A fixed-seed set of 160 Euler-trail randomizations estimates each test's null mean and standard deviation. A **disjoint set of 320** independently randomized trails calibrates the maximum absolute standardized score across all 102 tests. Training moments remain fixed during the family-wise test. Monte Carlo estimates use the +1 exceedance correction.

## Observations and control

[Successful manually dispatched GitHub Actions run 42745223512](https://github.com/FlareZ123/liber-primus/actions/runs/42745223512) executed the complete script using Node.js 22.

| Statistic | Observed | Conditional-null mean | Null SD | Standardized difference |
| --- | ---: | ---: | ---: | ---: |
| Exact matches at lag 82 | 244 | 289.34375 | 16.00238 | −2.83356 |
| Exact matches at lag 11 | 363 | 419.01875 | 20.06639 | −2.79163 |
| Exact matches at lag 76 | 262 | 301.925 | 17.64662 | −2.26248 |
| Block width 29 dispersion | 26.21077 | 26.28165 | 0.30850 | −0.22973 |
| Block width 58 dispersion | 25.99482 | 26.08734 | 0.45318 | −0.20415 |

The largest absolute standardized score over the full scan is **2.83356346**, at lag 82. In the 320 independent max-statistic null trials, **127** maxima equal or exceed that score: **family-wise upper-tail p = 128/321 ≈ 0.39875**. Neither the lag-11 nor lag-82 deficit establishes a cipher period. Apparent over-balancing of 29- and 58-rune blocks against an i.i.d. null disappears after matching adjacent transitions.

**Planted-signal control:** a separate full-length synthetic corpus preserves the 55 real page lengths and uses independent random runes with an 81% immediate-repeat repair, plus a deliberately planted 60% avoidance of lag-11 exact returns. The full pipeline uses 60 training and 120 independent max-null trails. It identifies lag 11 as the largest signal: **179 matches versus null mean 424.36667, z = −12.90709, family-wise p = 1/121 ≈ 0.00826**. This validates strong detection under this stated alternative, without asserting power against arbitrary weak or nonlinear mechanisms.

## Cryptanalytic consequence and limits

The manuscript shows **no significant nonadjacent exact-rune recurrence or nonoverlapping block-frequency balancing** beyond its empirical first-order transitions within the tested 102-statistic family. This weakens simple extra no-repeat-window and short-block equalization explanations, but it does not exclude a keystream, encrypted intermediate language, permutations, hidden keys, relationships between page images, or other forms of higher-order dependence. The null cannot test properties already fixed by the page-wise bigram tables, including the strong adjacent-doublet suppression or page-level histogram variability.

A further attack with independent leverage would need to exploit actual clue-derived key material or an observable invariant absent from this lag/block test. Sweeping more arbitrary lags without such a prediction is unlikely to advance decryption.

## Reproduce

- Exact executable: [sims/bigram_eulerian_null.cjs](../sims/bigram_eulerian_null.cjs), CommonJS, using only standard Node.js modules.
- Explicitly dispatched CI: [.github/workflows/bigram-eulerian-manual.yml](../.github/workflows/bigram-eulerian-manual.yml). No per-commit workflow.
- Seeds: observed 0x47bd911e; planted text 0x4711cb51; planted conditional null 0x47b12950.
- Script asserts all 55-page / 12,956-rune / 12,901-adjacency / 86-doublet invariants before analysis and asserts successful detection of the planted recurrence.
