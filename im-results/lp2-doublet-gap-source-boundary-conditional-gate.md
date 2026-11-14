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

### Physical printed-line occupancy (14 November, Agent31)

A later conditional analysis explicitly acknowledges the prior chapter/page/13-dot/word-boundary and word-length nulls above. It adds only two **new source units**: (a) page halves divided by the count of *printed physical lines*, and (b) each printed line itself, retaining printed line wraps and allowing four original doublet sites spanning line breaks. The original `lp2-transcription.txt` is aligned rune for rune with the canonical 12,956-rune corpus. Each repeated-rune event is assigned to the printed line of its first rune; among **594 eligible printed-line strata**, **83 contain one or more** of the 86 event sites.

Using the previously selected T7 statistic `+0.38001968924`, a 40,000-draw uniform conditional null that holds **both upper/lower source page-half event counts** fixed has null mean `+0.311912`, SD `0.038328` and add-one upper-tail `0.03827404`. A more saturated null fixing **every actual printed-line event count** has mean `+0.373012`, SD `0.009439` and **upper-tail `0.23194420`**. The four reproductions of chapter/page and boundary-class effects are prior work, not fresh findings.

**Decision:** the globally anomalous gap correlation is largely a function of **which printed lines carry rare repeat events**. Within those occupied lines, exact site positions are ordinary under the original-source line-conditioned placement null. This is a high-dimensional conditioning (594 strata for 86 events), so the absence of residual is a descriptive *scale localization*, not evidence of an authored per-line state. It neither authenticates a new cipher nor supplies a key. See [focused line-scale report](lp2-doublet-gap-original-source-conditioned.md), [Windows Node22 passed SFT](../sims/lp2_doublet_gap_source_conditional_sft.cjs), [executed run](https://github.com/FlareZ123/liber-primus/actions/runs/43548120071). Do not construct hidden line keys without an independent source-selected low-parameter generator and blind original prediction.

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


## Whole-word event-profile relocation gate against Round44 T7 (Agent 3, 13 November 2026)

The independent [Round44 B3 report](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) called the original +0.3800 adjacent-gap autocorrelation a loud rejection of its **flat-site** null (10,000 draws, p=0.0010). Its separate 20,000-gap permutation comparator gave p≈0.00025. Both nulls omit source word identities, and neither directly predicts a plaintext mapping.

A new *whole-word-profile* permutation null tests the independent intermediate question: **does the spatial arrangement of event-bearing words remain unusual when their exact printed lengths and physical pages are preserved?** Start from all original 2,896 complete printed words and 86 same-page repeat events. Give each word/page segment its complete list of eligible local rune sites and original repeat-site offset pattern; the one doubly event-bearing word keeps both original offsets together. Shuffle *entire observed event patterns* among word/page segments that have the same physical page, **exact complete word length**, and **same number of eligible predecessor sites**. A second test also matches the original 13-dot source fragment. All 86 events remain present, every event offset is valid, source word lengths and pages remain fixed, and the original 2014 runes and punctuation are never edited. These are conditional positional nulls; they deliberately do not try to synthesize legitimate ciphertext satisfying a full cipher.

| Source-locked word-pattern exchangeability | Strata | Movable / pinned events | Null mean ± SD | Draws ≥ observed | One-sided add-one p |
| --- | ---: | ---: | ---: | ---: | ---: |
| Page × exact word length × eligible sites | 598 | 82 / 4 | +0.268519 ± 0.055121 | 428 / 20,000 | **0.021449** |
| Page × 13-dot fragment × exact word length × eligible sites | 647 | 79 / 7 | +0.255734 ± 0.053154 | 163 / 20,000 | **0.008200** |

The original statistic is +0.380019689. Both deterministic source-only samples use xorshift32 seeds `0x33a3f201` / `0x33a3f202`. The [single-file CommonJS SFT](../sims/lp2_round44_t7_word_profile_shuffle_sft.cjs) asserts the exact original corpus/word alignment, 86-event geometry, shuffle accounting, null sample counts and tail counts.

**Interpretation and causal boundary.** The dramatic flat-site p≈0.001 becomes p≈0.021 after locking entire event patterns to page/word-length-compatible source positions; additional large-mark conditioning yields p≈0.008. These materially different tails demonstrate that the precise null matters and there is **no uniquely identified process drift or ciphertext state machine**. The fragment-stratified tail remains modest evidence of patterned *event-bearing word selection* under this exchangeability model; the existing fully fixed-word-ID conditional p=0.259 demonstrates that within those selected words the exact offsets contribute essentially no extra lag-one signal. Neither model reveals *why* the event-bearing words were selected, predicts their identities, licenses an anti-repeat mechanism, or recovers plaintext. A next attack must begin with an independently selected emitter/word-selection rule rather than more fitted gap correlations.

## Source-preserving per-word event-occupancy null (Agent 3, 13 November 2026)

The original unsolved corpus's 86 same-page adjacent-repeat events occur in **85 complete printed words**, with 84 words containing one event and one word containing two. This nearly one-to-one relation could tempt a word-reset or one-repeat-per-word escape model, but a discrete occupancy null is needed before inventing that encoder.

A distinct [original-input 20,000-draw CommonJS SFT](../sims/lp2_doublet_word_occupancy_null_sft.cjs) holds all 2,896 printed-word lengths/IDs and exactly all 12,956 printed rune positions fixed. It reassigns the original 86 repeat-event *sites* uniformly without replacement within either (a) each of the 55 original rune-bearing physical pages with its exact observed repeat count, or (b) each of the 72 source page × original 13-dot sections with its exact observed count. For each trial it counts collisions, i.e. selected repeat-event sites beyond the first in any original word. The observed collision count is **one**.

| Null (fixed original event counts per stratum) | Draws | Expected within-word event collisions ± SD | Draws with ≤1 | Add-one lower tail |
| --- | ---: | ---: | ---: | ---: |
| Physical page (55 strata) | 20,000 | **1.40620 ± 1.14167** | **11,738** | **0.58692** |
| Physical page × 13-dot section (72 strata) | 20,000 | **1.32425 ± 1.12286** | **12,299** | **0.61497** |

Deterministic xorshift32 seeds `0x6711a201` / `0x6711a202`; the runnable SFT asserts source transcription/corpus equality, all 86 original sites, eligible-site count 12,901, the exact selected-word count, and Monte Carlo tail counts. This is a **positional occupancy null**, not a legitimate ciphertext synthesizer, and it does not independently select a cipher. Under both source-preserving nulls the observed single doubly occupied word is entirely ordinary. Hence the 85-of-86 occupancy relation provides no evidence of a one-repeat-per-word emitter or a meaningful 85-symbol secret register. The more specific **which 85 words are selected** question remains unexplained by this collision statistic.

## Cross-page 85-word / p56 alignment gate (Agent31, 12 November 2026)

The 85 event-bearing words have the same count as the **85-rune plaintext of solved page 56**. This is a plausible, finite human-solver hypothesis: take the repeated ciphertext rune from each event-bearing word, in manuscript order, and ask whether the resulting 85-rune stream is p56 plaintext (or its ciphertext) under a simple GP29 alphabet operation. The one word with two events (word ID 1476, length 12) supplies the natural first-event or last-event choice.

The test uses the repository's canonical 2,896-word parser and exact 12,956-rune alignment. For each event-bearing word it extracts the repeated rune at the first event, and separately at the last event. Both streams are compared to the exact p56 plaintext and p56 ciphertext in forward and reverse order, under all 29 Caesar shifts and Atbash-plus-Caesar shifts. **No exact alignment occurs.** The best Caesar alignment gives only 8/85 matches to p56 plaintext and 10/85 to p56 ciphertext; the best Atbash-family alignments give at most 8/85 and 9/85 respectively. These are not plaintext recoveries and do not justify a broader affine/cipher search.

The double-event word contributes repeated symbols **3 (D)** and **18 (S)**; the known literal-F exception at p56 plaintext offset 56 is rune index **0**, so the obvious extra-event-to-F correspondence also fails. The equal 85/85 cardinality is therefore not, by itself, evidence that event-bearing words directly spell or reproduce p56. This closes the direct repeated-rune channel; the unresolved question remains why these particular words carry events.

Reproducer: [`sims/lp2_doublet_gap_word_identity_conditional_sft.cjs`](../sims/lp2_doublet_gap_word_identity_conditional_sft.cjs), which now emits the complete p56 alignment gate alongside the existing word-identity conditional null.

### Additional physical half-page, quarter-page and printed-line occupancy nulls (Agent46, 13 November 2026)

The prior page × source-delimiter/exact-word-length experiment left a one-sided positive site-gap correlation. A distinct follow-up asks which *finer fixed visual location groups* account for this without supplying the identity of an event-bearing printed word. Physical page starts and printed line breaks are observed before cryptanalysis; the page half/quarter partitions are researcher-defined diagnostics, not original instructions. The independent SFT [`lp2_doublet_gap_conditional_null_sft.cjs`](../sims/lp2_doublet_gap_conditional_null_sft.cjs) matches every original physical page rune against the source transcription, asserts **12,956 runes, 12,901 eligible within-page pairs, 86 repeat sites**, and uses 100,000 or 50,000 uniform-without-replacement conditional simulations with fixed per-model xorshift32 seeds. The unchanged target is **r = +0.380019689241**.

| Exact event counts preserved inside each | Strata | Draws | Null mean/SD of r | Draws ≥ observed | One-sided add-one p |
| --- | ---: | ---: | ---: | ---: | ---: |
| Whole book | 1 | 100,000 | −0.01235 / 0.10532 | 37 | 0.00038 |
| Within- vs across-word-boundary | 2 | 100,000 | −0.01267 / 0.10517 | 32 | 0.00033 |
| Nine visual chapters × word boundary | 18 | 100,000 | −0.02949 / 0.09626 | 3 | 0.000040 |
| Each physical page | 55 | 100,000 | +0.23006 / 0.06043 | 509 | 0.00510 |
| Physical page × word boundary | 110 | 100,000 | +0.22984 / 0.06022 | 502 | 0.00503 |
| Physical page × half-page rune-position bin | 110 | 50,000 | +0.30865 / 0.03814 | 1,593 | 0.03188 |
| Physical page × quarter-page rune-position bin | 220 | 50,000 | +0.33918 / 0.02542 | 2,713 | 0.05428 |
| Exact physical page × printed line | 594 | 50,000 | +0.36734 / 0.00953 | 4,649 | 0.09300 |

The global, page and boundary rows independently reproduce the prior source-boundary test at increased Monte Carlo resolution; **only the page-half, quarter and exact printed-line location controls extend its scope**. By fixing event occupancy on the actual printed lines, the target lag-one r ceases to be especially extreme within this conditioned family. This is an accounting identity about **where the 85 event-bearing words fall in the layout**, and agrees with the *stronger and already published* word-identity conditional null above: keeping exactly the event-bearing word identities yields a null r mean **+0.37855**, upper-tail **p=0.25914**. The line-conditioned result is a weaker spatial explanation, useful mainly if a future key hypothesis specifies a source-visible printed-line clock rather than word identities.

These nulls **cannot determine why particular lines or words contain repeat sites**, do not imply a line-reset cipher, and do not revise the prior word-identity model failure. Increased conditioning on observed outcomes predictably erases statistical discrepancy; no source-selected inverse, plaintext, key or hidden route emerged. The external T7 discovery was exploratory and these new strata were selected with knowledge of its value, so conditional tails are diagnostics rather than standalone discovery p-values.

## Reproduction and implication

[Self-contained CommonJS original-source SFT](../sims/lp2_doublet_gap_source_boundary_conditional_sft.cjs) reads the canonical `resources/liber-primus/lp2-corpus.json` and `lp2-ink-annotations.json`, asserts the 12,956/86 census, observed correlation, chapter counts and 13-dot boundary inventory, and runs the three exact count-conditioned surrogates. Seeds: chapter `0x48b3c201`, page `0x48b3c202`, page-fragment `0x3301c1b2`. A planted smoothly changing gap series gives autocorrelation above 0.9 with the same routine. All three source-conditioned numerical findings were independently executed against those two live repository resources. The SFT prints the complete reproducible null summaries.

**Updated decision (Agent22 word-identity decomposition, 12 November 2026):** The exact word-length null (1,508 strata, upper-tail p=0.00770) remains a valid rejection of uniform event-site placement across page × 13-dot fragment × delimiter role × exact word length. But conditioning on the exact event-bearing words and their per-word/per-page event counts, then randomizing only positions within those words, gives a null mean of +0.37855 (SD 0.00227); 5,182/20,000 outcomes are at least the observed +0.38002 (add-one p=0.25914). The 85 event-bearing word indices themselves have gap lag-one correlation +0.38545. Thus the gap statistic is largely inherited from the spacing of the selected words; it does not independently support an intra-word stateful emitter or PRNG. The unresolved process question is **why those words are selected**. The direct 85-event-bearing-word to 85-rune p56 alignment gate is also negative: first/last repeated-rune extraction does not reproduce p56 plaintext or ciphertext under Caesar/Atbash readings. Successor work should target word-level event selection under an independently source-justified model, rather than continue fitting gap-only state models. This conditional test does not explain the selection mechanism, refute the broader p=0.00770 result, or recover plaintext/key.

**Evidence scope:** The per-word null is deliberately conditioned on the identities of the event-bearing words; it cannot test why those words were selected. It only shows that their precise rune offsets within the selected words do not make the lag-one gap statistic exceptional. The p=0.00770 page × fragment × delimiter × word-length result addresses a different, less-conditioned null and remains valid. None of these statistics establishes how ciphertext glyphs map to plaintext. Recovering original plaintext or a source-selected reversible transformation remains essential.

### Literal 85-word event carrier versus the authentic solved 85-rune page

The original adjacent-repeat events occupy **85 printed words** (86 events; only word ID 1476 has two). Solved p56 independently contains **85 GP runes**. This numerical correspondence supplies an economical, *post-discovery* candidate carrier but does not independently prescribe it: read the rune at the **first same-page duplicate event** within each affected word, ignoring the second event in the unique double-hit word. Use the canonical source's actual 2,896 printed words and page boundaries. The resulting **85-rune carrier has IoC 0.03361345**, near a flat GP29 string, rather than the authentic p56 plaintext IoC **0.07002801**.

A stronger exact check excludes **every fixed, secret 29-symbol substitution**, with no permutation brute force or language scoring. A bijective substitution preserves the sorted nonzero symbol-frequency multiset. The carrier's sorted profile begins **[7,6,6,5,4,4,4,4,4,4,…]**, whereas solved-p56 plaintext begins **[16,8,7,7,6,6,…]** and original solved-p56 ciphertext begins **[7,5,5,5,5,5,…]**. All three profiles have 85 total runes, but neither target profile equals the carrier's. Therefore no original-order **one-rune-per-event-word copy of p56**, even under an entirely secret static 29! relabeling, is possible. The direct glyph identities agree with solved p56 in only **2/85 plaintext** and **4/85 ciphertext** positions; with its exact authenticated prime-totient key in **5/85**. The first 85 solved p57 rune identities agree in **1/85**. These small direct-match counts are descriptive, not calibrated significance claims.

The [single-file CommonJS SFT](../sims/lp2_doublet_85_eventword_crib_sft.cjs) reads the unedited original source, asserts every event/word count and original p27 double-hit coordinates, independently reproduces the authenticated p56 totient plaintext with its literal-F skip, and plants an arbitrary hidden rune permutation as a positive control. All source assertions and readout invariants also passed a local V8 execution. The existing [manual-only doublet regression workflow](../.github/workflows/lp2-doublet-word-identity-gate.yml) now includes this gate. **Decision:** retire this *literal 85-symbol p56 crib/key carrier* and its entire secret-static-alphabet family. The 85 count is no evidence for a novel ciphertext decoder; different event-to-data mappings, dynamic alphabets and independently source-selected encodings remain untested.
