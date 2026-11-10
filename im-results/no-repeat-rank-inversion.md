# A reversible 28-symbol no-repeat rank cipher cannot explain English-like LP2

**Classification:** exact keyless inverse and controlled architectural exclusion. No recovered LP2 plaintext or key. Agent 49, 2026-11-10.

## Hypothesis and complete inverse

A candidate way to enforce the manuscript's very low adjacent-doublet rate is to encode plaintext into a 28-symbol intermediate alphabet and, for each new rune, select a cipher rune by its rank among the 28 available runes **excluding the preceding ciphertext rune**. This is an invertible stateful encoding apart from the manuscript's 86 real doublet exceptions. No changing secret key is required. It differs from the previous independently tested arbitrary *29-way bijective* preceding-ciphertext S-box because one output symbol is unavailable for each preceding rune, and the intermediate plaintext alphabet has 28 symbols.

Test both natural conventions, taking `x` for current rune and `p` for immediately previous rune, with GP indices 0–28:

- **Sorted excluded list:** `rank = x − [x > p]`, with 0–27 permitted.
- **Cyclic excluded list:** `rank = (x − p mod 29) − 1`, with 0–27 permitted.

Each has an exact inverse given the previous ciphertext rune and 28-way rank. A third possibility is an *unknown, fixed permutation of the rank alphabet*, including an arbitrary different 28-way permutation on each page. The symbol **index of coincidence** (IoC), calculated over the 28 possible ranks, is invariant to any such permutation. A per-page symbol-collision count is invariant even if the rank permutation changes between pages.

For real LP2, exactly **86 immediate equal ciphertext events** across the 55 unsolved rune-bearing physical pages are treated as unknown erasures. The first rune of every page has no preceding rune and is also excluded from this test. This leaves **12,815** defined 28-code observations from **12,956** originally published unsolved runes.

## Measured inverse and matched controls

| Test | Sorted excluded rank | Cyclic excluded rank |
| --- | ---: | ---: |
| **Actual pooled rank IoC** | **0.03571223** | **0.03575625** |
| **Actual within-page rank IoC** | **0.03567709** | **0.03583746** |
| Null pooled IoC, 500 anti-repeat samples, mean | 0.03576364 | 0.03571364 |
| Null within-page IoC, mean | 0.03577124 | 0.03570799 |
| Nominal pooled upper-tail p | 0.9641 | 0.0339 |
| Nominal within-page upper-tail p | 0.7186 | 0.1776 |
| English-like planted pooled IoC (six source×model families), range across all authors | 0.05844–0.06427 | 0.05793–0.06426 |

The matched null samples preserve **every original doublet-erasure position** on every page and use the actual GP ciphertext symbol frequencies when sampling all other runes, conditional on not repeating their predecessor. Each of 500 seeded samples is decoded with the same inverse and scored. The weak cyclic pooled value (nominal p=0.034) is one of six observed tests (two rank conventions × three statistics), does not survive this family selection and is absent in the within-page collision statistic.

**Independent plaintext controls:** Shakespeare, Gibran's *The Prophet*, and Emerson essays were transliterated to GP indices with the repository's authentic-control converter. To establish a concrete 28-symbol intermediate code, GP `IA` was folded to `I` and `EA` shifted into the available index 27. A 12,956-rune contiguous excerpt was explicitly encrypted into each of the **sorted and cyclic no-repeat ciphers**, then **all 86** actual doublet exceptions were imposed by overwriting at the original positions. The exact same decoder recovered the ranks, with per-page IoC exceeding the LP2 observation in **all 20/20 planted trials for each author and each convention**, **120/120 independent plants total**. Min/max pooled positive IoCs across six groups span 0.05793 to 0.06427, far above the original ~0.0357. Per-page positive IoCs likewise range 0.05898–0.06460.

Adjacent rank equality alone is less discriminating: actual sorted **426/12,676 = 0.03361**, cyclic **432/12,676 = 0.03408**. Shakespeare plants often had fewer identical adjacent rank pairs than the real text, so this statistic **is not** the basis for excluding the model. The symbol-multiset collision invariant provides the decisive signal.

## Conclusion

For the chosen explicit 28-code convention and an English-like GP language register, a keyless exclusion-rank cipher under either natural ordering, even with **arbitrary globally fixed or pagewise fixed renaming of its 28 internal code symbols**, fails a necessary-condition test: its decrypted ranks should have GP-English-like IoC, independently of the unknown permutation. The real rank stream remains as flat as a randomized anti-doublet source.

This does **not** exclude a further running key applied to the 28 ranks, a rank permutation changing within pages (including by word), 29-way escape codes with frequent unmapped states, a flat intermediate plaintext coding, or cipher repair operations that change substantial fractions of output positions. The 86 exceptions alone are too few to reconcile the ~0.0357 real collision ratio with tested ~0.06 English controls, but a more complex hidden layer may do so.

**Reproduce:** [`sims/no_repeat_rank_inverse.cjs`](../sims/no_repeat_rank_inverse.cjs), exact 55 original rune pages from [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json), three tracked authentic literary control sources, deterministic seed `0x49333031`. [Successful on-demand GitHub Actions run **42768297188**](https://github.com/FlareZ123/liber-primus/actions/runs/42768297188) verifies the final script with 500 anti-doublet nulls and all 120 planted encrypted books.

**Relation to prior work:** The existing [previous-cipher S-box invariant](previous-cipher-sbox-invariant.md) already disfavors a broader English-like class of preceding-cipher-history-indexed **bijective** 29-symbol substitutions. This present test supplies an exact reversible inverse and a separate constrained result for the naturally proposed **nonbijective 29→28 no-repeat transducer**.
