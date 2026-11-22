# LP2 illustrated-chapter reset: blind original-event prediction

**15 November 2026; Agent3; Director Issue [#1121](https://github.com/FlareZ123/liber-primus/issues/1121). Classification: bounded original-cipher, source-layout-conditioned predictive negative. No newly recovered plaintext, key, original emission opcode, cipher inverse or destination.**

## The causal decision

Source-visible illustrated chapter boundaries occur after physical LP2 pages **2, 7, 14, 22, 26, 32, 39, 53, 55**, with original runic cumulative endpoints `[729,1874,3603,5506,6527,7960,9640,12648,12956]`. The printed manuscript contains **86** adjacent-identical GP29 rune pairs, and the 85 gaps between such events have lag-one correlation **+0.380019689**. Earlier [original line-stratum evidence](lp2-doublet-gap-original-source-conditioned.md) found that conditioning on the exact 594 original printed lines made that global T7 gap correlation ordinary (one-sided p≈0.232), whereas conditioning only by pages preserved a residual. These findings motivated a *new predictive* question: does a hypothetical emission filter restart at the nine visibly authored chapter divisions and predict the sites of future doublets better than a stationary process?

**Alternative:** a low-dimensional continuous drift or ordinary manuscript composition with page/word/line geometry nuisance. A source-visible chapter boundary is an independently recognizable reset candidate, though no original Cicada instruction says to restart a 29-rune cipher there. Neither rival provides a cryptographic decoder by itself.

## Frozen original input, exact split and model

The [single-file original-source test](../sims/lp2_doublet_visible_chapter_restart_holdout_sft.cjs) reads both the authoritative 29-rune `resources/liber-primus/lp2-corpus.json` and the independent `lp2-transcription.txt` and checks exact rune identity on every source physical page. It preserves the original printed line-wrap `/`, genuine word separators, runeless p50, and the 32 words carried between physical pages. The first rune of each physical page is ineligible for a same-page equal-adjacency event. Original observation: **12,956 runes, 12,901 eligible pairs, 86 repeats**, with 65 of 9,600 eligible pairs in training **p0–39** and 21 of 3,301 in untouched **p40–55**.

All models use a Bernoulli site-likelihood for observing exactly the original repeated pair. Common covariates are printed word separation, a source printed line wrap, and the preceding glyph's normalized position on its original printed line. Page starts are handled as ineligible, so no artificial pair spans a physical-page carry. A fixed ridge penalty (slope coefficients 1.0, intercept 0.001) stabilizes rare-event logistic fitting. One additional slope distinguishes each candidate:

- **Flat:** a constant event rate after the identical source geometry covariates.
- **Continuous:** a linear rate slope by global rune ordinal / 12,956, with no reset.
- **Chapter reset:** a linear rate slope by local ordinal divided by that *visible chapter's known source rune length*, restarting at each illustrated boundary.

No page-specific free rates, after-the-fact changepoint optimization, generic gap permutations, Cox AR(1), or other already completed T7 sweeps are run. Only p0–39 is used to fit the slope and nuisance coefficients. Scores on p40–55 are sums of **proper Bernoulli log probabilities at exact original source positions**; a higher score is better. There is no reference to held-out event counts in fitting.

| One fixed fitted model | Train log likelihood | Untouched holdout log likelihood | Holdout predicted repeats / observed 21 |
| --- | ---: | ---: | ---: |
| Source-geometry flat | −388.368696 | **−128.013430** | 22.352 |
| Smooth continuous clock | −387.803640 | −129.014152 | 28.194 |
| Visible-chapter restart | **−385.780209** | −128.058212 | 22.353 |

On the trained seven chapters, restart slope **−0.842599** improves apparent fit by 2.588487 nats against a stationary baseline; a conventional extra-parameter BIC penalty would exceed this gain. On the genuinely held-out final two chapters, the advantage **vanishes: restart-minus-flat = −0.044782 nats**, and smooth-drift-minus-flat = **−1.000722 nats**. The longest held-out chapter p40–53 has 18 original events among 2,995 eligible pairs, against model predictions 20.282 (reset), 20.284 (flat) and 25.440 (smooth drift). The final p54–55 chapter has only three events in 306 eligible pairs; it cannot strongly discriminate small rate differences.

The test is limited to the specified one-slope source-visible reset architecture. A cipher with unobserved state, a different non-linear restart law, missing external key material, or dynamically varying within-line probabilities is not excluded.

## Historical and synthetic controls

Authentic source-side controls are counted without moving punctuation or inventing page joins:

| Native control | Eligible pairs | Equal-adjacent runes |
| --- | ---: | ---: |
| Six originally clear LP1 GP29 sections | 991 | 28 |
| Nine known encrypted LP1 source sections | 1,785 | 44 |
| Authentically solved LP2 p56 (cipher rune side) | 84 | 2 |
| Clear GP29 LP2 p57 | 94 | 1 |

The different native rates show why no universal doublet probability should be imposed on either source plaintext or historic encryption. They do **not** establish that any of these historical ciphers uses chapter resets.

Synthetic plants retain **the exact 29-rune alphabet and every original physical page and printed line site**. At each source-eligible site the generator either repeats the preceding rune or chooses one of the other 28; both outcomes are verified. A fixed Xorshift32 seed `0x33011221` supplies all synthetic randomness. Each plant gets its own fresh training fit; no planted key or true rate parameters are passed to the candidate fit. In 32 planted source-shaped replicates of each family:

| Known synthetic generating process | Correct model top-scored on held-out | Reset beat stationary |
| --- | ---: | ---: |
| Flat, no slope | 8/32 | 16/32 |
| Continuous slope +2 | 32/32 | 14/32 |
| Visible-chapter reset slope −2 | **29/32** | **29/32** |
| Weaker reset slope −0.8426 (training-scale) | Not separately ranked | **20/32** |

Strong synthetic state-reset effects are frequently detectable under exactly these source layouts, whereas the training-scale slope has low statistical power for two held-out chapters. **The original near-tie is not a universal proof against resets.** It is sufficient to decline promoting this particular chapter-normalized stationary-rate interpretation to an intended cipher architecture.

## Required decoding ingredient and Director decision

An emission *rate* is not an invertible GP29 ciphertext map. To convert the source-visible chapter boundary into a usable human solve path, new first-party evidence would need to supply **(1)** a concrete rule assigning plaintext and key/state to all **29** ciphertext rune outputs, including which same-rune events arise as exceptions; **(2)** a way to obtain the initial key/seed and unobserved exception state; **(3)** a source-selected clock across true printed words, line wraps and physical page carries; and **(4)** a decoder/encoder recovering at least 100 continuous original unknown runes, with independently sourced plaintext evidence. The synthetic repeat-vs-other-28 generator deliberately specifies no such historical bijection.

**Decision:** do not add illustrated-chapter clock resets as an assumed primitive to the shared finite-state attack in [Director #1101](https://github.com/FlareZ123/liber-primus/issues/1101). They show no predictive held-out advantage in this low-parameter source-constrained test; the best-supported near-term decoder route remains obtaining an independently selected original key/operator or an actual unknown-page plaintext witness. Do not retest this same chapter-phase hazard under arbitrary slopes or future unconstrained changepoints without a novel original instruction.

## Reproduction

- [Windows-compatible CommonJS single file](../sims/lp2_doublet_visible_chapter_restart_holdout_sft.cjs), including all original-rune, original-page and original event-count assertions and seeded synthetic controls.
- [Successful original Windows Node22 run 43720200810](https://github.com/FlareZ123/liber-primus/actions/runs/43720200810), complete JSON output for all three source models and 128 native-shaped synthetic plants.
- The [manual-only GitHub Actions workflow](../.github/workflows/agent3-visible-chapter-doublet-holdout-manual.yml) triggers only under `workflow_dispatch`. It makes no repository mutation.

This is a narrow, genuinely held-out model-selection result and should remain **supporting evidence** in `im-results/`, without raising a claim of original unknown-page decipherment in `results/`.
