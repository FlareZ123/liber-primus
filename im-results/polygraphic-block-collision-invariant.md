# LP2: short polygraphic block collision invariant and page-phase sensitivity

**Evidence class:** an exact key-independent block equality invariant, tested on all original unsolved LP2 pages with English-GP planted positive controls. Agent 10, 10 November 2026. **No original LP2 plaintext, key, full cipher mechanism or destination is recovered.**

## The cryptanalytic question

Could each physical LP2 page independently use an arbitrary invertible 2-, 3-, or 4-rune block cipher? Consider a fixed block width n and a page-specific bijective S-box S_p mapping the 29^n possible source blocks to the same alphabet of output blocks. The encryption may be nonlinear, use unrelated output alphabets on different pages, and be entirely unsearchable by brute force. It still necessarily obeys

\[
S_p(A)=S_p(B)\iff A=B.
\]

Thus the number of identical complete *nonoverlapping* n-rune blocks within each physical page is unchanged by **every** such bijection, for every possible key. Count unordered equal-block pairs over all pages, separately for each candidate starting phase 0 through n−1. The original screen first held this phase constant across all physical pages. A stronger screen below permits an independently chosen phase per page, exposing an important limit at width four. This does not require a statistical model until comparing those counts with a hypothesized source language or additional ciphertext edits.

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

For each width first compare the *largest* observed original collision count over all **globally shared** phases against the **smallest** raw source collision count over those same phases, and against a planted, post-rewrite block cipher at its actual source phase. The subsequent independent-page-phase screen is more permissive and cannot be replaced by this initial shared-phase comparison. The original comparison is intentionally conservative and allows an unknown phase to be selected to favor the candidate.

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

For each width **2, 3, and 4**, across all **1,800** source books (three authors × two modes × 300 runs), no post-rewrite planted ciphertext has an equal-block count as small as the largest corresponding original count **under a single globally shared block phase**. The 900 exact-word-length n=4 plants have medians of **16, 15, and 23** collisions by author, against **zero** original. The minimum word-length-matched n=4 counts are **3, 5, and 9**, so the exclusion does not depend on the longer natural prose correlations of contiguous text.

For width 5 the result is weaker: exact-word-length controls yield **35/900** post-rewrite zero-collision books (4 Shakespeare, 28 Emerson, 3 Gibran), although all 900 continuous-prose samples remain positive. For widths 6–7 many word-matched source books also contain no repeated blocks. These sizes cannot be excluded by the present test. The apparent width threshold is **not** a recovered cipher block size.

## Exact test with a separate phase independently optimized on *every page*

The first screen assumes one block phase shared across all pages, although the cipher's n-block substitution is allowed to differ by page. A much more general page-reset cipher could select its own unknown starting block phase independently on every page. For each original or planted page p and width n, compute all n possible counts R(p,n,h). Compare the **sum of pagewise planted minima** against the **sum of original pagewise maxima**, granting the hypothetical cipher as much adaptive freedom as possible.

| Width | Original sum of pagewise minima | Original sum of pagewise maxima | Smallest planted pagewise-minimum sum of 1,800 controls | Controls at or below original pagewise maximum |
|---:|---:|---:|---:|---:|
| 2 | 369 | 544 | **1,537** | **0/1,800** |
| 3 | 0 | 17 | **21** | **0/1,800** |
| 4 | 0 | 0 | **0** | **263/1,800** |
| 5–7 | 0 | 0 | **0** | Numerous |

The n=4 zero ties occur in **262 of 900 exact-word-length source books** (59 Shakespeare, 173 Emerson and 30 Gibran) and one of the 900 contiguous-prose source books (Emerson). **Width four cannot be excluded** when the cipher may freely choose its block alignment independently for every page. It remains disfavoured only under a single shared block phase. The broad independent-page-phase family still fails for **widths two and three**, with zero successes across all 1,800 source-matched plants *at either width*, and with a pagewise-max original threshold that is deliberately generous to the hypothesis. Width five and higher lack sufficient power.

The free-phase null is a conservative lower bound on control ciphertext repetitions, because it may select an alignment after observing each simulated page. The source and repair models remain assumptions; these results do not identify the actual cipher.

## Decision and limitations

An ordinary English-like GP source passed through a single, arbitrary fixed **bijective block substitution per physical page** with width **two or three** is strongly inconsistent with the original LP2 collision spectrum, even with independently freely chosen page phases and the declared sparse 81% overwrite channel. Width four is inconsistent with **globally shared phase**, but the page-specific free-phase test cannot exclude it. This substantially generalizes previously tested literal Hill matrices and short linear block keys to unknown, unrestricted nonlinear page-specific bijections. The result is a conditional **architectural exclusion**, never an original decryption.

The invariant does not apply to changing keys per block, memory-dependent feedback, hidden pad state, nonbijective maps, transpositions, different source registers, or unconstrained edits. No source-agnostic theorem rules out all block methods. The 81% rewrite is a deliberately chosen positive-control channel; an adversarially designed stronger rewrite could destroy block repeats. These are finite model-conditioned source tests, not evidence of a specific actual mechanism or a discovery-wide p-value.

**Exact reproducer:** [single runnable CommonJS test](../sims/polygraphic_block_collision_invariant.cjs). Includes real original corpus assertions, exact GP source words, 300 seeded trials per author/layout, independent-page-phase and globally shared-phase baselines, and exact planted bijection regression. **Executed corrected result:** [successful free-page-phase CI run 42784145273](https://github.com/FlareZ123/liber-primus/actions/runs/42784145273). Earlier [shared-phase CI 42781872926](https://github.com/FlareZ123/liber-primus/actions/runs/42781872926) remains reproducible with its narrower claim. The previous [contiguous-only CI 42781365737](https://github.com/FlareZ123/liber-primus/actions/runs/42781365737) has been subsumed by the more conservative exact-word-length test above.
