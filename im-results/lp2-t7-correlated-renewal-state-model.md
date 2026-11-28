# LP2 T7: a two-input renewal clock explains the residual-repeat ordering

**Agent27, 28 November 2026. Classification: statistical mechanism constraint; no plaintext, key, source-selected cipher, or destination recovered.**

## Decision

The original 12,956-rune p0–55 tape has 86 adjacent equalities and a strong correlation between consecutive equality gaps: T7 = `+0.380019689241`. A flat independent-slip model explains the low count but fails the gap ordering. The most economical model found here is a **positive two-tap moving-average renewal clock**:

`G_n = U_n + theta * U_(n-1)`

where the hidden positive innovations `U_n` are iid gamma variables. Consecutive gaps share exactly one hidden operand; gaps two positions apart share none. That gives the crucial qualitative prediction **lag 1 positive, lag 2 zero**. The original has lag 1 `+0.3800` and lag 2 `+0.0242`.

This is a sharper mechanism constraint than the initial Gaussian-AR(1) correlated-renewal fit: a slowly persistent rate is unnecessary. A one-step overlapping hidden operand suffices. That is also closer to a deliberately designed puzzle operation because it has a literal sliding-two-input interpretation.

It still does **not** identify the intended Liber Primus cipher. The gamma law is a convenient positive innovation family, and no first-party clue currently identifies the hidden `U_n` sequence or says to schedule equality exceptions this way.

## Frozen two-tap model

Three numerical parameters are fixed by the three observed low-order gap moments, before the two reported 1,000-draw gate checks:

- `theta = 0.460664260759037`, the canonical `theta <= 1` solution of `theta/(1+theta^2) = 0.38001968924100965`;
- gamma shape `alpha = 0.6366617848820242`, chosen so the unrounded two-tap process has `CV^2 = 0.892419051024709`;
- gamma scale `beta = 161.83681183502893`, giving mean gap `150.5`.

For iid gamma innovations, before integer rounding/truncation,

- `Corr(G_n,G_(n+1)) = theta/(1+theta^2)`;
- `Corr(G_n,G_(n+k)) = 0` for `k >= 2`;
- `CV^2(G) = (1+theta^2) / (alpha*(1+theta)^2)`.

Each generated positive gap advances an exception cursor. At an exception site, the emitted GP29 rune equals the previous rune. At every other transition, the next rune is chosen uniformly from the other 28 symbols. The generator does not read the LP2 ciphertext, its equality positions, or its gap sequence.

The earlier latent-Gaussian AR(1) renewal clock (`rho=.42`, exponential marginal, mean gap 150.5) also crossed the same battery, but it is retained only as a robustness benchmark. The two-tap model is preferred because it explains the observed ACF cutoff with less persistent hidden state.

## Seven-statistic C5-style gate

The reproducer implements the seven statistics and evidence calculation of the public C5 T7 checker pinned at external repository `Dukotah/cicada3301` commit `b271334d9718bf68187f7a1e6362731159c36a2a` (`challenges/c5_t7_mechanism.py` blob `e51e4aca6c13496a6218f3d474d5f71616cccd1b`; `b3lib.py` blob `6521341a864c1daa19880e19551fdc37f31a277a`). The public finish line is all seven two-sided simulation p-values at least 0.05 plus evidence ratio at least 3 against its flat filter on two 1,000-draw seeds. This repository independently reimplements that battery; these numbers are not an external maintainer acceptance claim.

Canonical source statistics reproduced exactly:

| statistic | observed |
| --- | ---: |
| equality sites | 86 |
| T1 position KS | 0.10924093712529709 |
| T2 gap CV^2 | 0.892419051024709 |
| T3 chi2 position mod29 | 32.69767441860465 |
| T4 chi2 position mod60 | 50.744186046511665 |
| T6 per-page dispersion | 1.090732964363706 |
| T7 lag-1 gap correlation | 0.38001968924100965 |

### Two independent 1,000-draw checks

| seed | minimum p over seven stats | T7 p | evidence ratio vs flat | verdict |
| ---: | ---: | ---: | ---: | --- |
| 3301 | **0.4495504496** | 0.7832167832 | **19.70886486x** | passes |
| 123456789 | **0.4515484515** | 0.8011988012 | **17.68192421x** | passes |

At seed 3301, medians are `n=86`, `T1=.10386`, `T2=.83754`, `T3=27.1081`, `T4=57.9394`, `T6=1.10395`, `T7=.35438`. At seed 123456789, medians are `n=86`, `T1=.10358`, `T2=.82781`, `T3=27.0693`, `T4=58.6065`, `T6=1.09747`, `T7=.36378`. Every individual two-sided p-value is comfortably above 0.44 on both seeds.

The iid flat exception process remains the relevant null. Its equality-site indicators are exactly iid Bernoulli with probability `(1/29)*(86/447)`, because each fresh proposal equals the previous emitted rune with probability `1/29` and is retained independently with probability `86/447`. Therefore site-only flat simulation is distributionally identical for all seven site statistics to the full public flat rune generator.

## Independent gap-shape diagnostics

A separate 10,000-draw post-hoc check uses statistics not all in the seven-stat gate. These are robustness tests, not preregistered discovery claims.

| gap statistic | original | two-tap median | two-tap 95% interval | two-tap p |
| --- | ---: | ---: | ---: | ---: |
| raw Pearson lag 1 | 0.3800196892 | 0.35754 | [0.19640, 0.53092] | 0.7889 two-sided |
| log-gap Pearson lag 1 | 0.2294355176 | 0.37119 | [0.17072, 0.55149] | 0.1578 two-sided |
| rank/Spearman lag 1 | 0.2680509985 | 0.38348 | [0.20363, 0.54516] | 0.1974 two-sided |
| raw Pearson lag 2 | 0.0242189636 | -0.03204 | [-0.23191, 0.22443] | 0.6459 two-sided |
| maximum single gap | 712 | 688 | [455, 1204.025] | 0.4450 upper |
| maximum 3-gap sum | 1649 | 1340 | [923, 2183.05] | 0.1862 upper |

The flat control fails the three lag-1 correlation diagnostics (`p≈.0010` raw, `.0244` log, `.0100` rank) while its lag-2 result is ordinary (`p≈.706`). Thus the signal is specifically a one-step ordering dependency, not merely a long-tailed marginal.

The raw T7 covariance is partially concentrated in a few large-gap runs: removing the largest four gaps reduces raw lag-1 correlation to about `0.106`. This is why the rank/log diagnostics matter; both remain positive, and the two-tap model contains them. Do not treat `+0.380` as a uniform effect of equal strength across all 85 intervals.

## Source-facing tests and exclusions

Two obvious same-round source candidates were checked before promoting a source link:

1. The reconciled 2014 second-onion five-minute delay stream has 112 sourced intervals with lag-one correlation **-0.0386**. It does not supply the T7 state law.
2. The source-authenticated Stage7/Stage10 7x7 magic square has mean cell value `1033/7 = 147.5714`; its natural row-major adjacent-pair average has mean exactly `150.5`. That numerical match is intriguing, but the source-order sequence does **not** predict the original equality-gap order (direct first-49 correlation about `-0.174`, only one exact gap match). The already established historical receiver for those squares is Stage10 form submission. Do not reopen the square as an LP2 clock merely from the mean coincidence.

Known solved GP29 plaintext is also incompatible with the idea that T7 is ordinary Liber Primus language morphology: across the nine pinned solved native-rune records, 2,979 runes have 77 adjacent equalities (`2.586%`, versus `0.667%` in unknown LP2) and equality-gap lag-one correlation about `-0.0672`.

A held-out source feature prevents promoting the two-tap clock to a sufficient sender. The p50 table's literal first-digit-zero mask occupies 3,025 of the 12,901 within-page opportunities and contains **33 of the 86** original equality events. In 30,000 frozen two-tap simulations, conditioning on exactly 86 total events leaves 1,062 draws; only **2** contain at least 33 within-page zero-mask events (add-one upper tail **3/1063 = 0.0028222**). Conditioning additionally on no generated page-seam event leaves 750 draws and **0** exceedances (add-one **1/751 = 0.0013316**). The two-tap law therefore explains T7's ordering but misses an independently established source association.

### P50 zero-state association fixes clock orientation and continuity (Agent 1, 28 November 2026)

The p50 held-out association is substantially more specific than its 33/86 count. Keep the source object fixed: the printed 32×8 table in row-major order, the literal character `0` in a two-character cell, and the original p0–55 rune stream. Index each within-page transition by the **left ciphertext rune's global rune offset modulo 256**. At source phase zero the literal first-digit-zero class contains **33/86** equal-adjacent events, and phase zero is the **unique maximum among all 256 circular phases**. A combinatorial comparator that forgets the table arrangement but chooses any 60 of the 256 cell residues has exact upper-tail probability **0.004441863493238786** of covering at least 33 of the observed repeat events; this is a finite layout comparator, not a universal authorship p-value.

The literal zero characters show a graded source-state association. Across the 12,901 within-page transition opportunities, cells with **zero / one / two literal zero characters** contribute **9,725 / 3,076 / 100** opportunities and contain **52 / 29 / 5** repeats, giving observed repeat rates **0.5347% / 0.9428% / 5.0%**. Weighting each repeat by the number of literal zeros in its p50 cell gives source score **39**, again the unique maximum across all 256 circular phases. The `00` stratum is only 100 opportunities, so its 5% rate is a small-sample observation, not evidence for a separate `00` operator.

The association also selects a direction and clock law. Moving the lookup to the **right** rune of the equality gives only 15 first-zero hits at source phase (rank 229/256); full table reversal gives 24 (rank 56/256); horizontal row reflection gives 24 (rank 63/256). Resetting the table phase at every physical page gives 19 hits (rank 168/256), and resetting at the eight authentic `#`-delimited section lengths gives 19 (rank 166/256). The enrichment persists in both temporal halves of the continuous tape (16/43 and 17/43 events under the mask). Thus, if the association is authored, the supported state schedule is **forward row-major, continuous across pages and sections, attached to the left endpoint, phase zero**. This sharply constrains any proposed sender: a page-local/chapter-local reset or a right-endpoint causal convention must explain why it loses the source association.

A direct-key interpretation of the table was then tested through the already calibrated Round48 hidden-output receivers, using the first 1,200 original runes and no phase search. Repeating the row-major p50 byte values as the key gives score **-5.1145 nats/printed rune** in the mod36 seven-silent-state inverse; horizontal reflection gives **-5.1113**. The GP29 strict-repeat-plus-deletion inverse gives **-4.1274** and **-4.1511**, respectively. Its same-beam positive controls score about **-2.80 to -3.10**, while random wrong keys score **-4.07 to -4.19**. These are bounded negatives for the literal periodic-byte key interpretation, not exclusions of p50 as a position-dependent gate/state schedule. A follow-up source-typing gate sharpens that schedule: under both surviving base59 and base60 table grammars, `token[0]=='0'` is exactly the **one-digit/high-digit-zero** state (`value<radix`), so this binary p50 association survives the unresolved codec choice. Conversely, an independent Bernoulli repeat sender given the observed MLE rates for that state and conditioned on exactly 86 events fails held-out T7 (30,000 draws, median -0.01866, 95% [-0.20429,+0.20616], add-one upper tail 0.00049998); even separate fitted rates for 0/1/2-zero cells fail (0.00033332). Therefore p50 and the one-step overlap are complementary constraints requiring a joint stateful law. A further ordered-pair gate gives each `(z_i,z_(i+1))` high-digit state its own fitted repeat rate; despite the literal shared p50 operand, conditioned simulations reach observed T7 only 5/30,000 times (add-one 0.00019999). The missing link must therefore affect interval/update state or another persistent register rather than only an independent local hazard. [Joint gate](lp2-p50-one-digit-t7-joint-gate.md).

Reproduce the clock/layout and bounded receiver checks with `sims/lp2_p50_zero_state_repeat_receiver_sft.cjs`. The GP29 deletion receiver accepts a source-independent `decodeInput` path so exact known-key candidates can be tested without modifying its generative benchmark.

### Full 256-residue conditional hazard gate (Agent 6, 28 November 2026)

Agent 11 first held T7 out from the exact literal-zero dose profile: preserving the observed repeat counts **52 / 29 / 5** in the zero/one/two-zero strata while randomizing the eligible sites still leaves the original T7 extreme. The stronger gate here removes the remaining one-cell p50 freedom entirely.

For each of the 256 source phases, let `e_r` be the observed number of equal-adjacent events among that residue's actual within-page opportunities. The complete event-count histogram is **190 residues with 0 events, 52 with 1, 9 with 2, 4 with 3, and 1 with 4**, totaling 86. Conditional on this entire 256-vector, the test independently chooses exactly `e_r` occurrences from each residue's real opportunity list and recomputes T7. This preserves every one-cell feature of the printed p50 schedule automatically: the 33/86 first-zero enrichment, the literal-zero dose, token identity, row, column, base59/base60 value, and any other deterministic function of one table cell.

This conditional test is parameter-free for the whole model class in which each eligible site fires independently with an arbitrary stationary probability `p_r` determined only by its p50 residue. Given `e_r`, all subsets of size `e_r` within residue `r` are equiprobable, so the nuisance probabilities cancel. The original **T7 = 0.38001968924100965** remains far in the upper tail:

| seed | conditional draws | draws >= original T7 | add-one upper tail | median T7 | 99th percentile |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 3301 | 50,000 | 27 | **0.0005599888** | -0.0182541 | 0.2554669 |
| 123456789 | 50,000 | 15 | **0.0003199936** | -0.0179095 | 0.2510986 |

Thus **no independent stationary one-cell p50 hazard can explain both the source-selected p50 phase profile and the observed one-step ordering**, even after granting a separately fitted probability to every table cell. A p50-based sender that explains T7 must introduce cross-event/history state, cycle-dependent state, or a genuinely multi-cell operation. This is stronger than the earlier mask-only rejection and does not depend on a language model, guessed plaintext, or fitted key.

Three source-native direct scheduling probes also fail descriptively and are not promoted as mechanisms: the current p50 cell's full base60 value equals the next equality gap only **1/85** times; its low sexagesimal digit equals the gap modulo 60 only **2/85** times; and its high digit equals the number of 256-cell wraps to the next equality only **22/85** times. Do not repeat those literal encodings without an additional authored selector.

Reproduce the full conditional gate with `sims/lp2_p50_residue_hazard_t7_holdout_sft.cjs`; the zero-dose predecessor is `sims/lp2_p50_zero_dose_t7_holdout_sft.cjs`.

### The p50 state is diagonal-only; T7 memory is concentrated in long table-pass gaps (Agent 6, 28 November 2026)

The source-phase p50 zero state has a useful held-out prediction. If it selected a broad substitution state, the **ordinary nonrepeat transitions** should also change when the state bit changes. They do not. After removing all 86 diagonal events, compare the next-rune distribution between first-digit-zero and nonzero positions separately within each of the 29 current-rune rows. The aggregated likelihood-ratio statistic is **G² = 820.9612 on 783 df** (asymptotic chi-square upper tail **0.1683**). The source mask is only rank **193/256** among circular phases by this off-diagonal statistic, and **749/1000** random 60-of-256 residue masks produce at least as much off-diagonal separation. The same fixed state simultaneously changes the diagonal repeat rate from **53/9,876 = 0.5367%** to **33/3,025 = 1.0909%**. Thus the frozen p50 association is specifically compatible with an **exception/repeat gate**; there is no evidence here that it selects a different ordinary 29×29 substitution table.

The T7 ordering can be decomposed using the table's independently visible width 256. For successive equality sites with residues `r_n`, write each gap as `G_n = 256 W_n + D_n`, where `D_n = (r_(n+1)-r_n) mod 256` is the forward within-table displacement and `W_n` is the number of complete table passes skipped. On the 85 observed gaps, `W` has counts **71×0, 10×1, 4×2**. The two components behave very differently:

- within-table displacement lag-1 correlation: **+0.04923**, full-residue conditional upper tail **0.2573**;
- complete-pass count lag-1 correlation: **+0.36774**, full-residue conditional upper tail **0.00138**;
- cross-correlations between a wrap count and the neighboring displacement are ordinary (upper tails about **0.41** and **0.16**).

A direct ablation supports the same localization. Keep the observed wrap-count order and shuffle the within-table displacements: across 100,000 shuffles the reconstructed T7 has median **+0.2881**, and the original +0.3800 has upper tail **0.05549**. Keep the observed displacements but shuffle the wrap order: the reconstructed T7 has median **-0.0052** and original upper tail **0.000560**. Most of the one-step covariance is therefore carried by the ordering of the rare long skips, not by a walk through p50 cell geometry.

The binary source-width version is also explicit: **14/85** gaps cross at least one complete 256-cell pass. There are **6 LL, 8 LS, 8 SL, 62 SS** successive long/short transitions, so `P(next long | long)=6/14=0.4286` versus `P(next long | short)=8/70=0.1143`. Fixed-count permutation gives upper tail **0.00343** for the binary lag correlation. Both temporal halves retain three LL transitions, although the continuous T7 is stronger in the first half (+0.5084 versus +0.1650).

This does **not** establish that 256 is an encoded numeric threshold. Scanning integer thresholds 29..512 puts 256 only rank **177/484** by quotient lag correlation; nearby thresholds share plateaus and 363..382 are numerically higher. The role of 256 is source-selected only because the original p50 object has exactly 256 cells. The robust conclusion is that the T7 anomaly is dominated by clustered **large-gap / whole-pass-scale** events.

The ordered p50 equality-cell path itself has no comparable geometry. Against the full-residue conditional null, same-row, same-column, rook adjacency, Manhattan distance, exact residue displacement and exact row/column vector statistics are ordinary. The state memory is temporal rather than a visible row/column walk.

### Natural cumulative p50 state schedules fail the joint held-outs (Agent 6, 28 November 2026)

Because the full-residue gate requires history, the simplest source-native escape is a continuous accumulator over the printed p50 values. Nine fixed schedules were tested without a key search: running base60 and base59 sums modulo 29, separate high- and low-digit sums modulo 29, base60 sum modulo 60, base59 sum modulo 59, base60-byte sum modulo 256, base60-byte XOR, and the joint pair `(sum high mod29, sum low mod29)` with 841 possible states.

For each schedule, event counts were conditioned **exactly by the derived state**, then event sites were randomized only among opportunities carrying that same state. On 20,000 fixed-seed draws per schedule, the held-out T7 upper tails range only **0.00025–0.00075**. The held-out source-phase first-zero count ≥33 has upper tails **0.00105–0.01855**. **No draw in any schedule satisfies both held-outs simultaneously** (per-schedule add-one joint upper bound 1/20,001). Even the 841-state two-digit accumulator leaves T7 at **0.00035** while granting 78 occupied event states.

These are bounded negatives for the obvious cumulative schedules, not a theorem against arbitrary state machines. Together with the diagonal-only off-transition result, they redirect the p50 branch away from stationary local hazards, simple running sums/XOR, and literal grid walks. A surviving mechanism needs a more specific source-selected history/update rule that acts on the rare exception timing and ultimately yields a reversible ciphertext receiver.

Reproduce these diagnostics with `sims/lp2_p50_dynamic_state_wrap_localization_sft.cjs`.

### The two printed digits have complementary roles in the exception process (Agent 6, 28 November 2026)

The remaining source-native state is not a static p50 cell value. It appears at the **event update** itself. Let the 86 equality sites be E0...E85, let G_n = E_(n+1)-E_n, and for each middle event E_(n+1) read the two printed p50 characters at the already frozen left-endpoint residue E_(n+1) mod 256. Define the gap innovation dG_n = G_(n+1)-G_n.

The **low printed digit** is associated with the direction of this update. Its raw 0..59 value has Pearson correlation **-0.32074195** with dG (Spearman **-0.28846**); the full base60 value is only -0.05247 and the high digit is +0.02454. More importantly, the source-visible half-radix predicate is discrete and codec-stable: the same printed symbols satisfy low digit <30 under both surviving base60 and base59 readings. Among the 84 middle events the two halves occur **42/42**. Their mean innovations are **+51.9286** and **-50.7381** respectively. Excluding the one zero innovation, the source rule

- low digit <30 -> next equality gap increases;
- low digit >=30 -> next equality gap decreases

is correct at **58/83 = 69.8795%** of the event updates.

The source's printed row-major phase is not an arbitrary fitted cipher offset, although the two field predicates were discovered retrospectively from this same book. Across all 256 circular table phases, source phase zero is the **unique maximum** for correct update direction (58/83). Independently, the already established high-digit-zero repeat gate is also uniquely maximal there (33/86). No other phase reaches both source counts, and phase zero is the sole Pareto point in the pair (high-zero repeat hits, low-half correct updates). The two statistics have only **+0.1432** correlation across phases, so the joint maximum is not a trivial duplicate score.

The result survives two controls that preserve different nuisance structure. First, condition on the complete observed 256-residue event-count vector and randomize only which cycle occurrence of each residue fires. Across 50,000 draws, only **17** reach 58/83 directional accuracy (add-one upper tail **0.00035999**); only **13** simultaneously reach the observed mean half-split innovation difference and the accuracy (add-one **0.00027999**). Second, randomly permute the **whole original two-character tokens** among the 256 table cells, preserving every token and therefore the joint high/low digit distribution. In 50,000 fixed-seed permutations, 218 match the 33 high-zero hits, 2 match the 58 correct directions, and **0 match both** (add-one joint upper bound **0.0000200**).

The source orientation is also selected. Forward row-major gives (33 high-zero hits, 58 correct updates). Full reversal gives (24,40), horizontal reflection (24,37), and vertical reflection (26,39). Among the 32 whole-row rotations and eight within-row column rotations, the unshifted original is again uniquely best in correct direction and jointly dominates the alternatives. The direction rule independently reproduces in both temporal halves (**29/41=70.73%**, **28/40=70.0%**) and across the three physically printed table panels (**17/24=70.83%**, **21/31=67.74%**, **20/28=71.43%**).

The two printed p50 characters show **distinct statistical associations**, not an authenticated cipher key or deterministic sender rule:

- the **high digit** marks a position-dependent diagonal/repeat-enriched class: high=0 has 33/3,025 repeats versus 53/9,876 outside, while the ordinary off-diagonal substitution channel is unchanged;
- the **low digit half** is associated with the next exception-gap direction: it has essentially no local repeat-hazard enrichment itself (42/6,807 versus 44/6,094), yet predicts whether the next exception interval expands or contracts.

A literal magnitude recurrence is **not** established. No equality of the form dG = +/-low works, the low digit has only chance-level exact modular matches under 29/59/60/256, and an unconstrained linear fit gives slope about -2.66 rather than a source-selected coefficient. Thus this finding does not yet define a reversible sender. It materially narrows the missing operation: a viable p50-linked mechanism should use the high field to control exception eligibility and the low field to control the **sign/direction of the next interval update**, with an independently source-selected magnitude/state law still required.

A direct count/cycle reading of the two digits fails: only 9 of 66 active residues have high digit = observed event multiplicity, and only four cells' low digits equal any observed event cycle. Likewise the low-digit successor-graph state f^cycle(r) fails both T7 and the high-zero held-out count under exact state conditioning. Do not rescue the dual-field result by treating either printed digit as a literal event count, cycle number, or additive gap value.

Reproduce the dual-field gate with `sims/lp2_p50_dual_digit_feedback_sft.cjs`.


**Original-table two-field phase stability with non-crossing chronological halves (Agent26, 28 November 2026).** The earlier full-book source-alignment evidence is now constrained by a reproducible **two-half, all-256-phase** original-cipher test. Split the **86 equal-adjacent runic events** into first43 and last43 in global original rune order, and omit the *two* gap-innovation targets that straddle that split. Thus the halves use **41** and **40** nonzero gap updates respectively; no update target has an endpoint in the opposite half. At each circular source-table offset q, count a printed one-digit/high-zero cell at an equality event and count a predicted direction when its middle event's low digit is <30 for a following *increased* gap (otherwise for a *decreased* gap). Add these two **integer counts at equal weight**, with no model fitting or literary scores. The source's printed row-major zero offset is the **unique maximum among all 256 offsets in each half**:

| original-cipher half | high=0 equality hits | low-half direction correct | raw joint score | second-best of 256 offsets |
|---|---:|---:|---:|---:|
| first 43 events | **18/43** | **29/41** | **47** | 45 |
| last 43 events | **15/43** | **28/40** | **43** | 41 |

These are **retrospective split-stability tests**, not prospectively independent discoveries: the two predicates were initially noticed using the whole manuscript. The source p50 table remains the same physical 256 cells in both halves; each half touches 36/38 distinct residues, with **eight cells common to both**. Excluding any source residue present in the opposite half leaves 33/33 events and 31/31 gap updates, and the source phase ranks **6/256 and 1/256** by the standardized joint score. The strong full-half alignment therefore cannot be claimed as statistically independent evidence from disjoint table bytes.

The result is not created by choosing half-radix 30 as a finely tuned threshold. The **threshold-free Mann–Whitney ordinal low-digit discriminator** (smaller printed low digits predicting positive gap innovation) gives original phase0 AUC **0.678744** for the first half and **0.760870** for the last. After combining each AUC and high-zero event hit count by their actual across-256-phase standard deviations, the original phase is again the **unique maximum of 256 in each half** (separate AUC-only phase ranks 7 and 2). Conversely, an explicit cutpoint sensitivity scan shows **28 of 59** possible integer thresholds (1…59) make source phase best or tied best in *both* halves for the equal-weight raw score, including **10 thresholds** with a unique joint best. Therefore no manuscript evidence selects the *exact* cutoff 30 as a cipher instruction; it is a human-readable half-radix summary of an ordered low-digit association. A five-category high-digit sensitivity screen makes high=0 the only simple fixed high-digit class yielding a unique zero-phase raw-score maximum in both halves.

Independent source-registration positives rotate the original table by **1,73,151,255 cells** and recover the exact compensating phase in both halves (**4/4 pass**). An additional frozen-seed 10,000-draw whole-token shuffle preserves the 256 original two-character tokens **as paired units**, their high/low dependence and their marginal frequencies; it finds **0/10,000** that match or exceed the original source-phase standardized scores in both halves, and also **0/10,000** matching both unstandardized integer tallies (each add-one upper ~**0.000100** for this *conditional, post-discovery* null). Only **41/10,000** shuffled tables have the *same* maximizer in both temporal halves at any circular phase; none has it specifically at the original zero phase. These values are evidence of a specific original-layout association conditional on the chosen rule, **not** a multiplicity-corrected proof of author intent after many broader research attempts.

**Cryptanalytic consequence.** The source-fixed table phase constrains plausible future **exception-state** mechanisms: both the one-digit/high-zero class and the *ordinal* low-digit relation participate in the observational fingerprint. But the printed low field does **not** deterministically specify the next gap's sign (25/83 predictions fail), much less its magnitude, nor does the panel supply a source-authenticated GP29 substitution/feedback opcode or complete reversible plaintext receiver. In particular, neither the source integer score nor the phase-shuffle p-value is a decryption. Search for a **human-visible missing update law and key** that predicts these observations without fitting arbitrary site-specific decisions; do not promote a favorite threshold or model to plaintext.

Reproduce from the two original published datasets with [the locked source test](../sims/lp2_p50_dualdigit_twohalf_phase_sft.cjs) and [successful corrected GitHub Actions run 46128114618](https://github.com/FlareZ123/liber-primus/actions/runs/46128114618). Node 22, no third-party packages, 10,000 token shuffles fixed seed 330126.

The authentic solved p56 prime-totient cipher is also a negative control. Applying its transparent-F hold and prime-minus-one clock to the 2,979 solved native GP runes gives 95 repeats with gap lag-one **-0.02187** under a continuous clock, or 99 repeats with **+0.05526** when the prime clock resets at each solved section. T7 is not a generic artifact of the known Cicada prime cipher.

Exploratory source screens do not identify the shared operand: raw p50 numeric values at the two equality-event endpoints explain only about **1.10%** of gap variance at the authentic phase (rank 174/256 among circular shifts), endpoint printed-line lengths explain **1.35%**, and endpoint printed-word lengths **2.25%**. These screens are diagnostic rather than preregistered exclusions.

## What this changes

1. **Retire “T7 requires slowly drifting local repeat probability.”** A stationary one-step overlapping hidden operand is sufficient and better matches the observed ACF cutoff.
2. **The clock is not a sufficient sender, and a stationary p50 phase hazard is not sufficient either.** The two-tap clock underproduces the p50 zero-state enrichment. Conversely, conditioning on the complete observed 256-cell repeat-count profile still leaves T7 at add-one upper tails **0.000560 / 0.000320** in two 50,000-draw runs. Therefore the source-selected p50 phase profile and one-step gap ordering require joint state rather than an independent mask or arbitrary one-cell firing-rate table.
3. **A joint source-gated clock now crosses both constraints.** Keep the frozen-shape two-tap exception clock, add an ordinary `1/29` GP29 collision branch only at the five codec-invariant p50 `0D` residues, and renormalize only the renewal mean to leave room for the fixed `251/29` gate expectation. On two 20,000-draw seeds, all seven T1/T2/T3/T4/T6/T7 battery p-values are ≥0.2989, `P(0D hits>=10)` is 0.565/0.555, and the broader 60-cell leading-zero parent is ordinary (`P>=33`≈0.142/0.143). This resolves the prior statistical incompatibility without a fitted 256-cell hazard table, but it remains a generation model: the reversible rune transform and source meaning of the two-tap exception state are unknown. [Joint union model](lp2-p50-t7-joint-union-model.md).
4. **Do not turn the fitted gamma parameters into a key.** They summarize the gap law and have no first-party selector.
5. **Demand an actual source operand and reversible receiver.** The post-discovery original-phase split and token-shuffle controls above strengthen the association with printed p50 order but do not fix the low-digit threshold or produce a key; do not turn them into a standalone decryption claim. The productive next test is a historically visible sequence whose fixed, predeclared two-input transform predicts exception intervals or a held subset of them and also accounts for the p50 enrichment, followed by an explicit reversible sender/receiver on ciphertext.

This is a material narrowing of the generation-process frontier, not a solution of LP2.

## Reproduction

From repository root:

```text
python sims/lp2_t7_correlated_renewal_sft.py
node sims/lp2_t7_source_holdout_sft.cjs
node sims/lp2_p50_zero_state_repeat_receiver_sft.cjs
node sims/lp2_p50_zero_dose_t7_holdout_sft.cjs
node sims/lp2_p50_residue_hazard_t7_holdout_sft.cjs
```

The Python SFT reads only the canonical source corpus, re-derives the seven observed statistics, generates the frozen two-tap renewal model and flat control on both fixed seeds, and asserts the crossing conditions. The CJS source-state SFTs reproduce the p50-mask failure, continuous phase/orientation result, direct periodic-key negatives, literal-zero dose holdout, and the full 256-residue conditional T7 gate.