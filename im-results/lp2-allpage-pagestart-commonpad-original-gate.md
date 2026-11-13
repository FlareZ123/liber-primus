# All-page pairwise shared-page-start additive-pad gate

**Status: bounded, original-input negative for a page-start common GP29 additive stream against matched native-English controls.** No unknown Liber Primus plaintext, authentic key, cipher mode, or destination is recovered. This report concerns a different family from the whole-manuscript shared-pad cross-fit and the seven-page same-tree-stencil screen.

## Human-solvable premise and frozen original model

The 2014 LP2 pages are ordered and visibly separated. A plausible elementary cipher would reuse a 29-symbol additive pad from each printed physical page start, allowing any unknown pad symbols but maintaining a common position clock:

`C_a[t] = P_a[t] + K[t] (mod 29)`,
`C_b[t] = P_b[t] + K[t] (mod 29)`.

Its observable consequence is exactly `C_a[t]−C_b[t] = P_a[t]−P_b[t] (mod 29)`; the entire shared key cancels. This model is **unmotivated by an explicit original-page key-reuse instruction**. Its virtue as a bounded experiment is an exact, key-independent test of whether any pair of original printed pages behaves as native GP29 plaintext under the same arbitrary page-start pad. It does not test independent page key offsets, changed plaintext word boundaries, shifted clocks, distinct alphabets, nonadditive states, other languages or subsequent encryption.

The canonical `resources/liber-primus/lp2-corpus.json` supplies all 58 page index streams. The screen fixes 52 unsolved pages of ≥120 runes, excluding p49 and p51 by this length threshold, runeless p50, and short p55. All 1,326 unordered pairs are checked. For each pair, inspect the first `min(page lengths)` symbols from page-local position zero. Full 29-symbol GP indexing and original word separators are taken from the checked-in corpus/transcription without source retuning.

## Calibrated first-stage original-cipher ranking

The scoring prior is trained independently on the checked-in solved `lp1-plaintext-reference.txt`, 3,529 greedy GP29 symbols after fixed transliteration and heading removal. A smoothed 29×29 plaintext-bigram distribution (0.5 prior count per bin) predicts each possible GP29 bigram of the *difference of two independent native plaintext streams* by exact modular convolution of the two learned bigram distributions. A pair's log-likelihood ratio relative to uniform 29² bigrams is computed from its consecutive observed additive differences.

The five strongest original pairs were selected without optimizing keys:

| Original physical page pair | Compared runes | Difference-bigram log-likelihood ratio |
| --- | ---: | ---: |
| p17 / p40 | 231 | 11.320 |
| p37 / p48 | 228 | 11.122 |
| p17 / p41 | 273 | 10.073 |
| p19 / p39 | 240 | 9.334 |
| p28 / p46 | 269 | 7.329 |

All-pair familywise calibration rotates **each original page's rune sequence by an independent deterministic cyclic offset** in 160 complete repeats, while optimizing the maximum over all 1,326 pairs each time. The original best score is 11.320; the null median is 9.887, 95th percentile approximately 14.375, and **34/160** null maxima meet or exceed it. The add-one upper-tail estimate is **35/161 ≈ 0.21739**. Thus the *best across the entire scanned family* gives no convincing evidence for a page-start reused pad. Cyclic shifts preserve within-page symbol/bigram makeup but change its alignment with printed word boundaries; this null specifically calibrates first-stage dependence, while the next test separately uses exact original word boundaries.

## Key-independent original printed-word feasibility

The top five original pairs were independently subjected to an exact simultaneous dynamic program over every possible 29-symbol pair of candidate plaintext rune values at every aligned position, conditional only on the observed difference `C_a[t]−C_b[t]`. This grants **every possible shared pad symbol** at every position and preserves **both** page's complete original word-end placements. It minimizes the number of native-lexicon word failures with a 74,946-node trie representing 29,061 distinct GP-normalized entries in `resources/control/english_wordfreq_textblob.txt`. Partial page-edge words are uncharged. This reproduces and extends the older same-tree-stencil pair feasibility method to new candidate pages.

| Original page pair | Exact minimum nonlexicon transitions | Earliest forced position (zero-based) |
| --- | ---: | ---: |
| p17 / p40 | **13** | 19 |
| p37 / p48 | **11** | 24 |
| p17 / p41 | **15** | 20 |
| p19 / p39 | **11** | 21 |
| p28 / p46 | **14** | 15 |

These are **exact bounds for each chosen two-page word-aligned, shared-additive-pad and finite dictionary model**. They are not claims that the pages contain those many English spelling errors. They cannot exclude a cipher that changes word boundaries, uses a different plaintext alphabet or language, or carries more state; the remaining 1,321 pairs were ranked statistically but not subjected to this expensive exact DP. Source-native positive plants are included for two page-pairs, using independently GP-normalized native Gibran words matched to exact original word lengths and an arbitrary common 29-way pad; separate independent-pad negative controls demonstrate the DP's sensitivity.

## Solved-p57 source key: 55 exact word interiors for 55 pages

The solved p57 PARABLE prints the instruction **“SHED OUR OWN CIRCUMFERENCES”** in a 20-word, 95-rune page. Joining its printed line wraps and removing the first and last GP rune of each complete word yields **55 source-ordered interior runes**, exactly matching the **55 rune-bearing unresolved physical pages** (skip numeric p50). This creates a more source-constrained proposed assignment than an arbitrary page key: use the actual p57 interior rune `B_j` as an additive GP29 page-offset on corresponding physical page `j`, while granting a completely unknown, unrestricted *shared* positional stream `K_t`:

`C_{j,t} = P_{j,t} + K_t + sign*B_j (mod 29)`.

The shared stream still cancels for every pair. Thus `(C_{a,t}-C_{b,t}) - sign*(B_a-B_b)` is an exact, key-independent candidate native-plaintext difference at page-local offset `t`. The same 29×29 solved-LP1 trained difference-bigram likelihood supplies the frozen score, summed over **all 1,485 unordered pairs** of the 55 original rune-bearing pages. Both direct additive signs are granted to the source hypothesis; each random control also gets the better of those two signs. There is no freely adjusted position phase, source-rune order, page offset or author-chosen key.

| Key assignment | Whole-family log-likelihood ratio |
| --- | ---: |
| Literal p57 interior ordering, `sign=+1` | **−9,485.4180** |
| Literal p57 interior ordering, `sign=−1` | **−9,372.5335** |
| Same 55 p57 runes, shuffled original page assignments, 1,500 trials: median best sign | **−9,261.6101** |
| Same shuffles, 95th percentile of best sign | **−9,012.8807** |

Of **1,500** deterministic same-multiset assignment shuffles (xorshift32 seed `0x05557f57`), **1,151** rank at least as well as the original-order source assignment, for add-one `1152/1501 ≈ 0.76749`. This is an assignment-label conditional control rather than a claim about all historical keys; cipher pair scores are dependent, so no independent-pair likelihood p-value is asserted. The original p57 ordering has **no page-key alignment signal** under this complete arbitrary-common-stream additive consumer. A 55-to-55 match is an attractive source-clue pairing, but here it specifies neither plaintext nor an executable working shared stream.

The expanded source-asserting SFT validates the exact 20 original source words, key length 55, 17 distinct key symbols, key-index sum 573, all 1,485 original pair scores and all 1,500 fixed same-multiset null assignments. [Windows manual follow-up CI](https://github.com/FlareZ123/liber-primus/actions/runs/43395025807).

## Decision

This full-family comparison and independent solved-p57 key transfer identify **no** source-selected shared page-start key, no meaningful pairwise difference stream, and no original unknown plaintext. Further offset/key sweeps would require a new authorial instruction selecting specific pages, pad reuse, or alignment before a new original-input test. In particular, a high single-pair score is not a handoff to a plaintext decoder without independent justification and withheld output.

**Reproduction:** `sims/lp2_allpage_commonpad_triage_sft.cjs`, Node.js 22/CommonJS, source files committed unchanged. Original source counts, model scores, null seed `0x12563377`, all five exact DP minima, and two planted positive/negative controls are asserted. Manual-only Windows workflow: `.github/workflows/lp2-allpage-commonpad-triage-manual.yml`; [Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/43389293218). Earlier source matching baseline: `im-results/lp2-p8-14-stencil-reused-additive-pad-gate.md` and `sims/lp2_p8_14_stencil_reused_additive_pad_sft.cjs`. Whole-manuscript offset model: `sims/shifted_page_pad_crossfit.cjs`.
