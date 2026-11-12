# LP2 doublet-gap correlation: source-boundary and word-identity conditioning

**12 November 2026. Original boundary analysis by Agent10; word-identity decomposition by Agent22. Classification: source-exact conditional analysis of event-bearing-word selection; no ciphertext inverse, plaintext, key or historical generator identified.** This investigation advances the independently detected [Round 44 B3/T7 original event-site anomaly](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) by asking whether the manuscript's original visible segmentation alone accounts for its reported gap correlation. It does not repeat the external text-channel score sweep or assume T7 identifies a cipher.

## Causal question

The original 12,956 GP29 runes across LP2 physical pp0–55 (p50 is runeless) contain **86** positions at which the printed rune repeats its immediate predecessor *on the same physical page*. The 85 successive distances between those events have lag-one Pearson correlation **+0.38001968924100954**. The external Round 44 battery independently detected this value against flat-site surrogates, with an independent 20,000-draw gap-permutation tail ~0.00025.

If the apparent effect is merely a consequence of obvious sections being given different fixed doublet rates, its correlation should be typical under a null that **preserves the exact observed number of sites inside each original section** and randomizes their positions within that section. We can test that without fitting a cipher, guessing a key, scoring language or assuming which rune signifies a plaintext character. An exact Section/Page/13-dot null can be tested before treating the anomalous event process as evidence for state carry.

## Source-locked conditioning

Construct eligible event sites as positions 1..L−1 in each of the original rune-bearing physical pages; the first rune in each page has no in-page predecessor. Original event sites are those with `indices[i] === indices[i-1]`. The 9 manuscript chapter intervals are fixed from source page starts:

`0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55`.

Their source segment lengths and original event counts are:

| LP2 pages | Runes | Doublet count | Doublets per 1,000 eligible runes |
| --- | ---: | ---: | ---: |
| 0–2 | 729 | 4 | 5.51 |
| 3–7 | 1,145 | 6 | 5.26 |
| 8–14 | 1,729 | 9 | 5.23 |
| 15–22 | 1,903 | 10 | 5.28 |
| 23–26 | 1,021 | 11 | 10.82 |
| 27–32 | 1,433 | 13 | 9.11 |
| 33–39 | 1,680 | 12 | 7.17 |
| 40–53 | 3,008 | 18 | 6.01 |
| 54–55 | 308 | 3 | 9.80 |

Source original 13-dot punctuation (black and red) supplies **26 distinct intervals** across these pages; the two red/black marks at the same p7 local rune offset are one geometric boundary. Intersecting this source division with the original physical page boundaries gives 72 nonempty eligible strata. The first experiment imposes three alternative null partitions:

1. Preserve the observed count in each of nine original chapters.
2. Preserve the observed count in every one of the 55 rune-bearing physical pages.
3. Preserve the observed count in each of the 72 physical-page × 13-dot-fragment intersections.

For each stratum, use a uniform sample of the fixed number of original-eligible sites without replacement (Floyd sampling); combine and sort all 86 sites, compute the 85 gap sizes, and compute the lag-one Pearson correlation. Each null comprises **20,000** deterministic xorshift32 replications. Because these tests condition on the observed counts, their p-values concern **within-stratum site ordering**, not rate differences among strata.

| Count-preserving original partition | Randomized strata | Null mean of lag-one gap correlation | Null SD | Null outcomes ≥ observed +0.3800 | Add-one upper-tail |
| --- | ---: | ---: | ---: | ---: | ---: |
| Chapters | 9 | −0.0285 | 0.0972 | 0 / 20,000 | **0.000050** |
| Physical pages | 55 | +0.2296 | 0.0599 | 91 / 20,000 | **0.00460** |
| Page × 13-dot | 72 | +0.2194 | 0.0592 | 42 / 20,000 | **0.00215** |

The actual same-page-only adjacent-gap pairs (all three doublet events on one physical page) have descriptive Pearson correlation **−0.049** across 21 pairs; the other 63 pairs, spanning one or more original page boundaries, have **+0.283**. These are small, retrospectively partitioned subsets, not separately calibrated significance claims.

## Original printed word/line delimiter controls

A concrete alternative to regional cipher-state drift is that the encoder treats **word starts, line wraps, or visually adjacent glyphs** differently. The published normalized GP29 corpus strips these separators, so this test also reads the independent full 55-rune-bearing-page transcription `resources/lp2-transcription.txt`, confirming **every original rune index** page by page. As already established in the repo's separate original doublet-boundary audit, the 86 original repeated-rune sites classify as **60** same-word/same-line, **22** between two printed words on one line, **3** same-word/cross-line, and **1** cross-word/cross-line. Their respective eligible source positions across all pages are **9,640, 2,722, 388, 151**.

For a stronger exact conditional null, preserve the number of doublet sites inside *each* of four separator classes, or within their physical-page intersections, or within intersections with both physical pages **and** large original 13-dot spans. Resample only from eligible positions of precisely the same class, hence never exchange a word-internal position for a word-boundary position. The original log-gap Pearson remains +0.380019689.

| Preserved observable event counts | Strata | Null mean / SD | ≥ actual among 20,000 | Add-one upper-tail |
| --- | ---: | ---: | ---: | ---: |
| Four original word/line classes | 4 | −0.0114 / 0.1052 | 7 | **0.000400** |
| Physical page × word/line class | 218 | +0.2317 / 0.0609 | 115 | **0.00580** |
| Physical page × 13-dot fragment × word/line class | 262 | +0.2216 / 0.0592 | 58 | **0.00295** |

Each source event classification was established prior to simulation, and the same one-sided +0.380 target was frozen from external Round44. Deterministic 20,000-draw xorshift32 seeds are `0x3301b003`, `0x3301b001`, and `0x3301b002`, respectively. The existing [single-file SFT](../sims/lp2_doublet_gap_source_boundary_conditional_sft.cjs) now includes all three original word/line–aware nulls, their exact counts, and assertive seed regressions.

**Intermediate decision before word-identity conditioning:** The chapter/page/13-dot/word-line partitions alone leave positive gap correlation, and the exact word-length null below remains unusual at p=0.00770. Neither result identifies a generator or proves state carry. The next discrimination is whether the gap statistic survives conditioning on the identities of the original printed words that contain the events.

### Word-length confounding and stronger original-input conditioning

A genuine word-position effect may depend on the **exact printed word length**, which was not fixed by the preceding four separator classes. The same full source transcript identifies every rune's containing word, retaining words that wrap lines or physical pages. A further original-source null preserves the exact 86 event counts in every intersection of **physical page × 13-dot fragment × word/line separator class × source word length**. This is considerably stricter conditioning, with 1,508 eligible groups, and fewer alternative positions for any given event. It also tests an a priori coarse four-bin length split (2–3, 4–6, 7–9, 10+ rune words).

| Stronger source-conditioned null | Strata | Original lag-one correlation | Null mean / SD | ≥ observed / 20,000 | Upper-tail |
| --- | ---: | ---: | ---: | ---: | ---: |
| Page × 13-dot × delimiter × length four-bin | 762 | +0.3800 | +0.2327 / 0.0592 | 95 | **0.00480** |
| Page × 13-dot × delimiter × exact word length | 1,508 | +0.3800 | +0.2489 / 0.0561 | 153 | **0.00770** |

The exact length-conditioned null *reduces* the residual statistical signal compared with the simpler page+delimiter controls. It leaves an unexpectedly positive original correlation at the exploratory 1% one-sided threshold; its strict conditioning is a sensitive source-visible check, with a correspondingly smaller set of allowed event relocations. This result **does not prove** that the generator has a memory state or that gap positions encode a hidden message. Independent tests of a fully specified historical emitter and direct ciphertext inversion remain necessary. Fixed seeds `0x3301c7a3` and `0x3301c7a4` with 20,000 uniform-within-stratum samples are asserted in the consolidated SFT.

## A lossless anti-doublet emitter with a frozen site-level prediction (Agent12, Director #589)

A mechanically explicit alternative to the previously fitted *event-rate* models treats repeated ciphertext runes as the codeword for one infrequent **plaintext GP29 symbol**. For a fixed marker `R` and previous ciphertext rune `v`, the page-local transform copies the first rune and thereafter maps `P=R` to `C=v`; for `P≠R`, remove `R` from the ordered input alphabet (rank `r=P−[P>R]`) and insert the previous cipher rune into the ordered output alphabet (`C=r+[r≥v]`). Decode with the exact reverse rank. This is a **29-to-29 bijection at every position**, preserves all 29 symbols, needs no escape side channel, and resets only at the original physical page start. A repeated original ciphertext rune at an eligible position implies exactly `P=R`, **independent of the other plaintext characters**.

To make that operation predictive rather than fit every event, hold fixed the source-original printed word lengths, within-word rune positions, and the independent combined Shakespeare/Gibran/Emerson GP-normalized word pools already pinned in `resources/control/`. At every eligible site, estimate the probability of symbol `R` using only the source word-length/position conditional lexical counts, with a frozen half-count for all 29 GP rune classes. Fit **only one** of the 29 possible marker values by maximizing site Bernoulli log-likelihood on original physical **pp0–39**; the winner is GP **G (index6)**. The test code keeps pp40–55 site outcomes out of this selection. This is a learned marker, **not an original-source-authenticated key**. The manuscript's 2014 page boundaries and word positions are known to the reader; its unknown plaintext words are never supplied to the decoder.

| Site sample | Eligible within-page sites | Observed equal runes | Expected under selected GP G lexical marker | Log likelihood under marker | Constant event rate fitted on pp0–39 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Training pp0–39 | 9,600 | 65 | 123.27149 | **−444.98645** | **−389.46297** |
| Held-out pp40–55 | 3,301 | 21 | 41.94316 | **−156.97642** | **−127.18161** |

The best training marker already trails a simple source-blind rate baseline by **55.52 log-likelihood units**; frozen heldout predictive log likelihood is worse by **29.80**. To distinguish wrong overall rate from wrong **site order**, an independent **20,000**-draw null holds the *exact original event total of every withheld physical page* and randomly reallocates its sites within that page (without changing original printed word metadata). Its selected-marker heldout log-likelihood mean is **−153.11491** (SD **7.82997**); **6,126/20,000** null drawings perform no better than the true location pattern (lower-tail add-one **0.30633**). Thus this trained, compact, lossless English-marker emitter fails both rate calibration and a page-conditioned placement discriminator; it does not predict the previously observed gap ordering. Neither this null nor the fitted model establishes a blanket impossibility of other stateful mechanisms.

The exact original-cipher inverse/forward reconstruction passes at **all 12,956 original runes**, which is mandatory but cannot authenticate a chosen bijective key. Independent normal-English GP plaintext held out from the model fitting is encrypted and recovered **3,316/3,316** with page resets; the test also checks forward reconstruction. Direct original GP marker-G inversion remains flat (IoC **0.03524175** on pp0–39, **0.03538018** on pp40–55), with no readable passage. The [CommonJS single-file source and plant test](../sims/lp2_rare_marker_predecessor_holdout_sft.cjs) ran successfully in [manual-only GitHub Actions run 43258202522](https://github.com/FlareZ123/liber-primus/actions/runs/43258202522).

**Decision for #589:** retire *this* deterministic source-printed-word-aware sentinel/predecessor-exclusion emitter as a route to English plaintext; the missing site-level prediction cannot be rescued by tuning a second marker to pp40–55. Other variable-length, keyed evolving-state or alternate-language coders remain open and would each need a separately specified invertible mechanism and original-source selector. This test says nothing affirmative about the external paper's proposed stochastic soft rejection filter, which has an unresolved lossless inverse/side-information question.

### Event-bearing-word identity decomposition (Agent22, 12 November 2026)

The canonical word stream is taken from `resources/transcriptions/liber_primus_master.txt` using the repository's existing `words()` parser in `sims/cross_word_repeat_invariant.cjs` and sections 7–15. Its flattened rune sequence matches `resources/liber-primus/lp2-corpus.json` pages 0–55 exactly: **12,956 runes in 2,896 printed words**. This avoids the one-word discrepancy in the earlier exploratory page-split parser.

The **86** same-page adjacent-repeat events occupy **85** words: 84 words contain one event and one word (word ID 1476, length 12) contains two. The lag-one correlation of the 85 successive event-bearing word-index gaps is **+0.38545**, almost the same as the rune-position gap correlation **+0.38002**.

A conditional Monte Carlo test fixes the exact event-bearing word IDs and their event counts on each physical page, then samples the same number of event positions uniformly without replacement from eligible in-page predecessor positions within each word/page group. This preserves which words carry events and their per-word/per-page counts; it tests only whether the precise rune offsets within those words add unusual gap correlation. With 20,000 xorshift32 draws (seed `0x3301c7a5`):

| Statistic | Result |
|---|---:|
| Observed rune-gap lag-one correlation | +0.38001969 |
| Conditional-null mean | +0.37855294 |
| Conditional-null standard deviation | 0.00227200 |
| Draws at least as large as observed | 5,182 / 20,000 |
| Add-one upper-tail probability | 0.259137 |
| Event-bearing word-index gap correlation | +0.38545050 |

The observed within-word position categories are 23 word-initial, 19 word-final, and 44 interior events; their conditional-null means are 18.55, 18.78, and 48.67 respectively. No large offset effect is apparent.

**Interpretation:** once the event-bearing words are fixed, the observed gap correlation is ordinary. The correlation is therefore mostly inherited from the spacing of the selected words, not from an additional within-word placement state. This does **not** explain the selection of those words, and the p=0.00770 result under the broader page/fragment/role/length null remains a separate finding. The T7 gap statistic should no longer be used as independent evidence for a stateful cross-page generator. A meaningful successor must explain or predict the event-bearing-word selection itself using an independently justified source mechanism.

Reproduction: [`sims/lp2_doublet_gap_word_identity_conditional_sft.cjs`](../sims/lp2_doublet_gap_word_identity_conditional_sft.cjs).

## Reproduction and implication

[Self-contained CommonJS original-source SFT](../sims/lp2_doublet_gap_source_boundary_conditional_sft.cjs) reads the canonical `resources/liber-primus/lp2-corpus.json` and `lp2-ink-annotations.json`, asserts the 12,956/86 census, observed correlation, chapter counts and 13-dot boundary inventory, and runs the three exact count-conditioned surrogates. Seeds: chapter `0x48b3c201`, page `0x48b3c202`, page-fragment `0x3301c1b2`. A planted smoothly changing gap series gives autocorrelation above 0.9 with the same routine. All three source-conditioned numerical findings were independently executed against those two live repository resources. The SFT prints the complete reproducible null summaries.

**Updated decision (Agent22 word-identity decomposition, 12 November 2026):** The exact word-length null (1,508 strata, upper-tail p=0.00770) remains a valid rejection of uniform event-site placement across page × 13-dot fragment × delimiter role × exact word length. But conditioning on the exact event-bearing words and their per-word/per-page event counts, then randomizing only positions within those words, gives a null mean of +0.37855 (SD 0.00227); 5,182/20,000 outcomes are at least the observed +0.38002 (add-one p=0.25914). The 85 event-bearing word indices themselves have gap lag-one correlation +0.38545. Thus the gap statistic is largely inherited from the spacing of the selected words; it does not independently support an intra-word stateful emitter or PRNG. The unresolved process question is **why those words are selected**. Successor work should target word-level event selection under an independently source-justified model, rather than continue fitting gap-only state models. This conditional test does not explain the selection mechanism, refute the broader p=0.00770 result, or recover plaintext/key.

**Evidence scope:** The per-word null is deliberately conditioned on the identities of the event-bearing words; it cannot test why those words were selected. It only shows that their precise rune offsets within the selected words do not make the lag-one gap statistic exceptional. The p=0.00770 page × fragment × delimiter × word-length result addresses a different, less-conditioned null and remains valid. None of these statistics establishes how ciphertext glyphs map to plaintext. Recovering original plaintext or a source-selected reversible transformation remains essential.
