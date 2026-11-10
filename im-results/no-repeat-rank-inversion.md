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

## Word-reset extension: an independent 28-symbol alphabet per word

The page-level test above leaves open a more permissive key scope: restart the predecessor-exclusion register at every canonical word, then allow a different arbitrary bijection of the 28 decoded ranks for each word. The first rune is treated as a separate 29-symbol leader code; the test concerns only subsequent runes. For current ciphertext rune c and preceding in-word ciphertext rune p, the two natural rank conventions are:

- **Sorted:** r = c − [c > p].
- **Cyclic:** r = (c − p mod 29) − 1.

Any fixed per-word permutation of the 28 ranks preserves that word's collision count, even when every word has an unrelated secret permutation. Thus the sum of within-word ordered equal-rank pairs is a key-independent necessary condition. The exact shared parser gives **2,896 words**, **12,956 runes**, and **32 cross-page words**. Of the **86** original repeated outputs, **63** lie inside words and are treated as erasures here; the other **23** occur at word starts and do not enter the rank statistic. This leaves **9,997** eligible rank symbols and **39,930** ordered within-word symbol pairs.

| Original rank inverse | Equal-rank pairs | Ordered pairs | Within-word rank IoC |
| --- | ---: | ---: | ---: |
| Sorted | **1,438** | 39,930 | **0.03601302** |
| Cyclic | **1,486** | 39,930 | **0.03721513** |

### Exact word-length and erasure-matched English controls

For each of the 2,896 LP2 words, independently sample a source GP-English word of exactly the same encoded rune length, with replacement, and apply the same within-word erasure positions. The source tokenizer and GP encoder are the repository's existing controls; IA is folded to I and EA to code 27 to give the same 28-symbol register. All 2,896 target lengths are represented in every source pool. Each replicate therefore preserves the entire original word-length sequence and the 63 within-word erasures, not merely a length histogram.

Each reference used **5,000** seeded manuscripts. The score is the same aggregate within-word collision count divided by 39,930; the rank permutation is allowed to differ independently for every word. The implementation uses the repository's `seededRandom` generator and samples each matched source word with `floor(random × poolSize)`.

| Reference source | Control mean IoC | SD | Sorted z | Cyclic z | Controls at or below either LP2 score |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | 0.05357532 | 0.00151057 | −11.626 | −10.830 | 0 / 5,000 |
| Gibran | 0.05157201 | 0.00155769 | −9.989 | −9.217 | 0 / 5,000 |
| Emerson | 0.05082604 | 0.00153464 | −9.652 | −8.869 | 0 / 5,000 |

The plus-one lower-tail estimate is **1/5,001 = 0.00019996** for each of the six source × rank-convention comparisons. A conservative Bonferroni bound over those six comparisons is **≤0.00120**. This correction is local to these controls; it does not account for the repository-wide historical search over cipher families.

### Positive-control implementation

A synthetic word-reset cipher independently chooses a 29-symbol leader permutation and a 28-symbol rank permutation for every word, preserves the original **23 word-start** and **63 within-word** marker positions, and retains the original page-boundary word continuations. Under both sorted and cyclic conventions, the inverse recovers **12,870/12,870** non-marker plaintext symbols and the forward encoder reproduces **12,956/12,956** ciphertext symbols exactly. This verifies the implementation and the collision invariant; it is not evidence that LP2 used this mechanism.

### Periodic within-word phase permutations (periods 1–8)

Next, allow the 28-symbol rank permutation to evolve within each word. For period m, every word has an independent arbitrary 28-way permutation for each phase `(j − 1) mod m`; permutations may also differ between words. Only collisions among ranks in the same word and same phase are invariant. This is substantially more permissive than one fixed permutation per word.

The exact same-phase pair denominators and original LP2 IoCs are:

| Period | Same-phase ordered pairs | Sorted IoC | Cyclic IoC |
| ---: | ---: | ---: | ---: |
| 1 | 39,930 | 0.036013 | 0.037215 |
| 2 | 15,720 | 0.034097 | 0.033333 |
| 3 | 8,026 | 0.038375 | 0.040120 |
| 4 | 4,560 | 0.038158 | 0.034211 |
| 5 | 2,616 | 0.050459 | 0.042049 |
| 6 | 1,454 | 0.026135 | 0.031637 |
| 7 | 766 | 0.036554 | 0.052219 |
| 8 | 396 | 0.030303 | 0.040404 |

For each source, exact means and variances are computed from the complete pool of GP-encoded source words at each required length. **2,000** seeded, independently sampled, exact-length/erasure-matched manuscripts calibrate the distribution of the **maximum standardized score across all eight periods**. Thus the reported tail probability already accounts for choosing whichever period looks best.

| Reference | Sorted best period / max z / scan p | Cyclic best period / max z / scan p |
| --- | --- | --- |
| Shakespeare | 7 / **−2.193** / **0.0005** | 7 / **−0.989** / **0.0005** |
| Gibran | 8 / **−1.284** / **0.0005** | 8 / **−0.576** / **0.0010** |
| Emerson | 8 / **−1.601** / **0.0005** | 8 / **−1.030** / **0.0005** |

Even the most favorable of the six best-period scans remains below its matched-English null distribution. The conservative Bonferroni bound across the six source × rank-convention comparisons is **≤0.006**. This is conditional on the period set 1–8 and does not correct for the wider historical search over cipher families. Period 8 has only 396 same-phase pairs, so its individual IoC is less informative; the scan statistic accounts for period selection but not arbitrary periods beyond 8.

### Periodic positive controls

Sixteen synthetic plants (periods 1–8 × sorted/cyclic) independently choose a 29-symbol leader permutation per word and a separate 28-symbol permutation per word and phase. They preserve all **23 word-start** and **63 within-word** marker positions. Every plant recovers **12,870/12,870** non-marker plaintext symbols and forward-encodes **12,956/12,956** ciphertext symbols exactly.

### Scope

The tested negative families are the two natural sorted/cyclic predecessor-exclusion rank orders with (a) one arbitrary fixed 28-symbol bijection per word and (b) an independent arbitrary 28-symbol bijection per word and phase for periods 1–8. These are rejected as direct English-GP inverses under the canonical original word boundaries. A different ordering of the 29 ciphertext symbols, periods above 8, nonperiodic position-specific state, an additional running key, another plaintext language/register, altered segmentation, or a different encoding of repeated outputs remains open. No LP2 plaintext or authentic key is recovered.
## Conclusion

The global/page-reset experiment rejects its declared fixed rank conventions under English-like GP plaintext. The word-reset extension additionally rejects an unrelated arbitrary 28-symbol bijection for every canonical word. The periodic extension allows that permutation to change independently at every phase within each word for periods 1–8; after selecting the best period, all six source/convention scans remain below their matched-English controls (max z **−0.576 to −2.193**, scan p **0.0005–0.0010**). Thus neither natural predecessor-exclusion order, with static or short-period word-local rank permutations, supplies a plausible direct English-GP inverse.

This remains a bounded negative, not a general exclusion of no-repeat transducers. A different 29-symbol ordering, periods above 8, nonperiodic position-specific state, a second running key, altered segmentation, another plaintext language/register, or a non-GP intermediate remains open. The repeated outputs remain unresolved markers, and no LP2 plaintext or authentic key has been recovered.

**Reproduce (page-level):** [`sims/no_repeat_rank_inverse.cjs`](../sims/no_repeat_rank_inverse.cjs), exact 55 original rune pages from [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json), three tracked authentic literary control sources, deterministic seed `0x49333031`. [Successful on-demand GitHub Actions run **42768297188**](https://github.com/FlareZ123/liber-primus/actions/runs/42768297188) verifies the page-level inverse with 500 anti-doublet nulls and all 120 planted encrypted books.

**Reproduce (word-level):** [`sims/no_repeat_rank_wordwise_gate.cjs`](../sims/no_repeat_rank_wordwise_gate.cjs) uses the shared canonical word parser, three tracked GP-English references, 5,000 seeded exact-length/erasure-matched controls per source, and independent per-word hidden-key positive controls. The existing [manual-only workflow](../.github/workflows/no-repeat-rank-inverse.yml) runs all three scripts when dispatched. The word-level run was executed directly against the exact tracked source data; no new Actions run is claimed.

**Reproduce (periodic phase):** [`sims/no_repeat_rank_phase_period_gate.cjs`](../sims/no_repeat_rank_phase_period_gate.cjs) scans periods 1–8, computes exact source-pool moments, calibrates the maximum-period statistic with 2,000 seeded manuscripts per reference, and verifies all 16 per-word/per-phase hidden-key plants. The manual workflow is wired to run it; no new Actions run is claimed.

**Relation to prior work:** The existing [previous-cipher S-box invariant](previous-cipher-sbox-invariant.md) already disfavors a broader English-like class of preceding-cipher-history-indexed **bijective** 29-symbol substitutions. This present test supplies an exact reversible inverse and a separate constrained result for the naturally proposed **nonbijective 29→28 no-repeat transducer**.
