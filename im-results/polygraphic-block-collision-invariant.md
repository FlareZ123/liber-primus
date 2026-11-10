# LP2: short page-local polygraphic substitution cannot preserve English block collisions

**Evidence class:** an exact key-independent block equality invariant, tested on all original unsolved LP2 pages with English-GP planted positive controls. Agent 10, 10 November 2026. **No original LP2 plaintext, key, full cipher mechanism or destination is recovered.**

## The cryptanalytic question

Could each physical LP2 page independently use an arbitrary invertible 2-, 3-, or 4-rune block cipher? Consider a fixed block width n and a page-specific bijective S-box S_p mapping the 29^n possible source blocks to the same alphabet of output blocks. The encryption may be nonlinear, use unrelated output alphabets on different pages, and be entirely unsearchable by brute force. It still necessarily obeys

\[
S_p(A)=S_p(B)\iff A=B.
\]

Thus the number of identical complete *nonoverlapping* n-rune blocks within each physical page is unchanged by **every** such bijection, for every possible key. Count unordered equal-block pairs over all pages, separately for each candidate starting phase 0 through n−1. This does not require a statistical model until comparing those counts with a hypothesized source language or additional ciphertext edits.

## Actual original LP2 ciphertext

The fixed input comprises 55 rune-bearing unsolved LP2 physical pages, 12,956 GP runes, and the rune-free physical page 50. Actual within-page equal-block pairs at every local phase are:

| Block width n | Observed counts for phases 0 through n−1 |
|---:|---|
| 2 | 455, 458 |
| 3 | 4, 9, 4 |
| 4 | 0, 0, 0, 0 |
| 5 | 0 in all five phases |
| 6 | 0 in all six phases |
| 7 | 0 in all seven phases |

These are within-page, phase-aligned, nonoverlapping blocks. The exact bookend echo between two different pages is therefore unaffected by this observation.

## Powered source and cipher controls

Use three existing, independently stored source texts: Shakespeare, Emerson, and Gibran. Convert their ordinary English words into the repository's GP 29-rune register, including its seven greedy two-letter GP digraphs and K/V/Z normalizations. Generate 300 seeded books per author in each of two regimes:

- **Contiguous prose:** draw a genuine English-GP substring for every manuscript page, matching that page's exact rune count.
- **Exact original word lengths:** independently draw English-GP words matching every one of the **2,896 original complete cipher-word lengths** in their original order, including the **32 page-spanning words**. Split the assembled 12,956-rune string at precisely the original physical-page boundaries. This intentionally removes ordinary prose correlations while preserving the original word-length composition.

For every simulated source book, use a fresh, genuine **bijective per-page block cipher**. Its key permutes the n input coordinates and independently permutes the 29 output labels at each coordinate. The implementation asserts that before any subsequent edits the equal-block count is exactly invariant. Then, on each adjacent equal-output event, with probability **0.81** replace the second symbol with a uniformly sampled different rune. This preexisting stochastic antirepeat nuisance model yields approximately **83–85** doublets per 55-page planted book, close to the original **86**. It is not assumed to be the real Cicada mechanism.

For each width compare the *largest* observed original collision count over all possible phases against the **smallest** raw source collision count over all phases, and also against a planted, post-rewrite block cipher at its actual source phase. The original comparison is intentionally conservative and allows an unknown phase to be selected to favor the candidate.

### Counts after reversible cipher plus antirepetition channel

Each table entry is the **smallest of 300** independently planted block-cipher counts at that width. Original worst-phase thresholds are **458, 9, 0, 0, 0, 0** for widths 2–7.

| Author | Source layout | n=2 | n=3 | n=4 | n=5 | n=6 | n=7 |
|---|---|---:|---:|---:|---:|---:|---:|
| Shakespeare | Contiguous | 2153 | 158 | 26 | 6 | 0 | 0 |
| Shakespeare | Exact word lengths | 1949 | 92 | 3 | 0 | 0 | 0 |
| Emerson | Contiguous | 2273 | 156 | 18 | 3 | 0 | 0 |
| Emerson | Exact word lengths | 2002 | 100 | 5 | 0 | 0 | 0 |
| Gibran | Contiguous | 2558 | 242 | 49 | 13 | 3 | 0 |
| Gibran | Exact word lengths | 2014 | 129 | 9 | 0 | 0 | 0 |

For each width **2, 3, and 4**, across all **1,800** source books (three authors × two modes × 300 runs), no post-rewrite planted ciphertext has an equal-block count as small as the largest corresponding original count. The 900 exact-word-length n=4 plants have medians of **16, 15, and 23** collisions by author, against **zero** original. The minimum word-length-matched n=4 counts are **3, 5, and 9**, so the exclusion does not depend on the longer natural prose correlations of contiguous text.

For width 5 the result is weaker: exact-word-length controls yield **35/900** post-rewrite zero-collision books (4 Shakespeare, 28 Emerson, 3 Gibran), although all 900 continuous-prose samples remain positive. For widths 6–7 many word-matched source books also contain no repeated blocks. These sizes cannot be excluded by the present test. The apparent width threshold is **not** a recovered cipher block size.

## Decision and limitations

An ordinary English-like GP source passed through a single, arbitrary fixed **bijective block substitution per physical page** with width 2, 3, or 4 is strongly inconsistent with the original LP2 collision spectrum, even allowing the declared sparse 81% overwrite channel. This substantially generalizes previously tested literal Hill matrices and short linear block keys to unknown, unrestricted nonlinear page-specific bijections. The result is a conditional **architectural exclusion**, never an original decryption.

The invariant does not apply to changing keys per block, memory-dependent feedback, hidden pad state, nonbijective maps, transpositions, different source registers, or unconstrained edits. No source-agnostic theorem rules out all block methods. The 81% rewrite is a deliberately chosen positive-control channel; an adversarially designed stronger rewrite could destroy block repeats. These are finite model-conditioned source tests, not evidence of a specific actual mechanism or a discovery-wide p-value.

**Exact reproducer:** [single runnable CommonJS test](../sims/polygraphic_block_collision_invariant.cjs). Includes real original corpus assertions, exact GP source words, 300 seeded trials per author/layout, exhaustive phase baselines and exact planted bijection regression. **Executed result:** [successful full source-matched CI run 42781872926](https://github.com/FlareZ123/liber-primus/actions/runs/42781872926). The previous [contiguous-only CI 42781365737](https://github.com/FlareZ123/liber-primus/actions/runs/42781365737) has been subsumed by the more conservative exact-word-length test above.
