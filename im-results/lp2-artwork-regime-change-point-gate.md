# Source-visible LP2 illustration regimes do not select a cipher reset

**Intermediate original-input decision, Agent 49, 11 November 2026.** No unknown LP2 plaintext, authentic key, complete mechanism, or final destination was recovered. This is a **bounded negative** for the hypothesis that changes in the visible artwork by themselves identify independently observable GP29 frequency/bigram changes.

## Source-only decision before ciphertext scoring

Inspect the original native manuscript scans, physical p0–55 = original JPEG \`17.jpg\`–\`72.jpg\`; preserve the distinction between physical and rune-bearing indices. Use the following transitions, chosen for plainly visible changes in page treatment rather than for rune frequencies:

- **Development segment:** physical p3 (opening staves → scrolls), p8 (scrolls → trees), p15 (trees → exceptional numeral square), p16 (numeral square → plain text), p24 (plain → symmetric dragonfly/flora), p27 (dragonfly → standalone wing, then comparatively plain pages).
- **Held-out illustrated text:** p33 (standalone p32 tree → cuneiform-headlined pp33–39), p40 (cuneiform → enclosed floral frame).
- **Confounded final-page sensitivity:** p49 (mixed numerical/rune table within the same frame) and p52 (table exit). Physical p50 contains only numerical tokens and no ciphertext runes.

Some other images contain unique flourishes (notably p22–23 and p32), so the chosen set is **one locked proposed segmentation**, not a census of all artwork. In particular, the floral frame continues on both sides of the p49 table: its information-content transition does not prove an illustration-triggered cipher change.

## Original-cipher test

Use [the canonical source GP29 indices](../resources/liber-primus/lp2-corpus.json) and [the printed-word transcript](../resources/lp2-transcription.txt). Each prospective seam b compares the **two preceding rune-bearing pages** to the **two following rune-bearing pages**. Form each side's 29-element unigram count and 841-element ordered adjacent-bigram count, excluding invented bigrams across page boundaries. Scores are:

- Squared Hellinger distance of empirical unigrams.
- Symmetric Jensen–Shannon divergence of empirical bigrams, in natural-log units, after a uniform pseudocount of **0.25** per ordered-bigram cell.

The alternative is *larger divergence at artwork transitions*. Compare the arithmetic mean at the frozen visual seams with **every** equal-size subset of available consecutive candidate page seams. This is an exact label-allocation diagnostic for that finite sample. Neighbouring windows overlap, so its fractions should not be read as independent-experiment p-values or as a statistical guarantee concerning the historical author.

| Fixed set | Test | Mean at visual boundaries | Other exact subsets at least as high | One-sided upper-tail fraction |
| --- | --- | ---: | ---: | ---: |
| Training p3,8,15,16,24,27; candidate b3–31 | Bigram JS | 0.1672459187 | 413,737 / 475,020 | **0.870989** |
| Same training | Unigram H² | 0.0135655671 | 164,724 / 475,020 | **0.346773** |
| Withheld p33,40; candidate b32–48 | Bigram JS | 0.1703916085 | 68 / 136 | **0.500000** |
| Same withheld text seams | Unigram H² | 0.0139433273 | 76 / 136 | **0.558824** |
| Expanded p33,40,49,52; candidate b32–53 | Bigram JS | 0.1611052792 | 5,893 / 5,985 | **0.984628** |
| Expanded including short table | Unigram H² | 0.0214231843 | 189 / 5,985 | **0.031579** |

**Table confound checked independently.** For each held-out seam, permute the **pooled original local four-page GP29 symbol multiset** between its unchanged left/right rune counts using 4,000 deterministic Fisher–Yates repetitions (seed \`0x5317cafe\`, xorshift32). This controls symbol-frequency sample-size imbalance at each seam. The table passage has drastically different window sizes because the true p49 and p51 text totals only **66 and 92** runes and p50 is runeless.

| Physical seam | Left/right rune counts | Observed unigram H² | Length-matched null mean | Null draws as high | Plus-one fraction |
| --- | ---: | ---: | ---: | ---: | ---: |
| p33 | 390 / 475 | 0.007981 | 0.016785 | 3960 / 4000 | 0.9900 |
| p40 | 468 / 504 | 0.019905 | 0.014727 | 408 / 4000 | 0.1022 |
| p49 | 545 / 158 | 0.024382 | 0.031491 | 3057 / 4000 | 0.7643 |
| p52 | 158 / 442 | 0.033424 | 0.033124 | 1785 / 4000 | 0.4464 |

Therefore the misleading high combined unigram mean is **explained by the unusually short printed numerical-table pages** under the declared local null. No held-out seam yields a strong individually surprising unigram split in this control. The p40 observation is at most a weak, uncorrected source statistic, without a cipher operation or authentic key.

## Source word-boundary and page-boundary control

The same SFT checks every original rune against the transcript and preserves word continuations across physical pages, while treating slash/whitespace as layout-only and real punctuation as word termination. On physical p0–55:

- Word-internal adjacent pairs: **63 equal / 10,060** (0.6262%).
- Across canonical word boundaries: **23 equal / 2,895** (0.7945%). Two-sided Fisher exact p ≈ **0.3625**, so there is no independently compelling difference between these already strongly repeat-suppressed populations.
- Across physical rune-bearing page changes: **0 equal / 54**. At the overall original adjacent-pair rate 86/12,955, the iid-binomial probability of zero in 54 is about **0.698**; this is uninformative as a reset test.
- All 10 locked illustration transitions have **zero** immediate adjacent identical runes, which merely follows the book-wide scarcity and does not discriminate these seams.

This confirms the known manuscript-wide suppression extends across words but does not independently identify an illustration-local reset. The 55 separate rune-bearing pages still total exactly **12,956 runes**, consistent with the canonical corpus.

## Decision and scope

**Reject the proposed artwork boundaries as a stand-alone GP29 distributional cipher-reset selector.** The visual segmentation does not prospectively predict a language-neutral, elevated bigram change at unseen p33/p40, and the apparent table-sensitive unigram signal does not survive exact-size local controls. Do not generate arbitrary different alphabets or reset/phase clocks by extrapolating this artwork partition.

This result **does not exclude** hidden word/page-dependent state, language beyond the tested GP29 register, layered or highly mixing ciphers, or an illustration encoding a specific literal instruction. To reopen a boundary-specified inverse, identify a source-derived reset action/key and a held-out original-cipher prediction before scoring plaintext.

**Exact standalone test:** [\`sims/lp2_artwork_change_point_sft.cjs\`](../sims/lp2_artwork_change_point_sft.cjs), Node.js 22 CommonJS, no dependencies or writes. It asserts source transcription equality on every p0–55 rune, all repetition counts, and the frozen exact-rank and local-null counts. Tested with the live repository contents of \`lp2-corpus.json\` (blob \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\`) and \`lp2-transcription.txt\` (blob \`43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7\`). The original JPEGs were reviewed as an all-56-page source-only contact sheet; no modifications to the authentic images or ciphertext were made.
