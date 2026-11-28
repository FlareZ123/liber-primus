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

A direct-key interpretation of the table was then tested through the already calibrated Round48 hidden-output receivers, using the first 1,200 original runes and no phase search. Repeating the row-major p50 byte values as the key gives score **-5.1145 nats/printed rune** in the mod36 seven-silent-state inverse; horizontal reflection gives **-5.1113**. The GP29 strict-repeat-plus-deletion inverse gives **-4.1274** and **-4.1511**, respectively. Its same-beam positive controls score about **-2.80 to -3.10**, while random wrong keys score **-4.07 to -4.19**. These are bounded negatives for the literal periodic-byte key interpretation, not exclusions of p50 as a position-dependent gate/state schedule. A follow-up source-typing gate sharpens that schedule: under both surviving base59 and base60 table grammars, `token[0]=='0'` is exactly the **one-digit/high-digit-zero** state (`value<radix`), so this binary p50 association survives the unresolved codec choice. Conversely, an independent Bernoulli repeat sender given the observed MLE rates for that state and conditioned on exactly 86 events fails held-out T7 (30,000 draws, median -0.01866, 95% [-0.20429,+0.20616], add-one upper tail 0.00049998); even separate fitted rates for 0/1/2-zero cells fail (0.00033332). Therefore p50 and the one-step overlap are complementary constraints requiring a joint stateful law. [Joint gate](lp2-p50-one-digit-t7-joint-gate.md).

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

The authentic solved p56 prime-totient cipher is also a negative control. Applying its transparent-F hold and prime-minus-one clock to the 2,979 solved native GP runes gives 95 repeats with gap lag-one **-0.02187** under a continuous clock, or 99 repeats with **+0.05526** when the prime clock resets at each solved section. T7 is not a generic artifact of the known Cicada prime cipher.

Exploratory source screens do not identify the shared operand: raw p50 numeric values at the two equality-event endpoints explain only about **1.10%** of gap variance at the authentic phase (rank 174/256 among circular shifts), endpoint printed-line lengths explain **1.35%**, and endpoint printed-word lengths **2.25%**. These screens are diagnostic rather than preregistered exclusions.

## What this changes

1. **Retire “T7 requires slowly drifting local repeat probability.”** A stationary one-step overlapping hidden operand is sufficient and better matches the observed ACF cutoff.
2. **The clock is not a sufficient sender, and a stationary p50 phase hazard is not sufficient either.** The two-tap clock underproduces the p50 zero-state enrichment. Conversely, conditioning on the complete observed 256-cell repeat-count profile still leaves T7 at add-one upper tails **0.000560 / 0.000320** in two 50,000-draw runs. Therefore the source-selected p50 phase profile and one-step gap ordering require joint state rather than an independent mask or arbitrary one-cell firing-rate table.
3. **Future sender hypotheses must carry cross-event state.** A candidate mechanism that forms each exception interval or control state from consecutive source operands naturally predicts lag-1 dependence with little lag-2 dependence, but it must also preserve the forward continuous p50 phase association. Independent per-cell hazards, page/section resets, and literal periodic p50-byte keys have failed their respective gates.
4. **Do not turn the fitted gamma parameters into a key.** They summarize the gap law and have no first-party selector.
5. **Demand an actual source operand and reversible receiver.** The productive next test is a historically visible sequence whose fixed, predeclared two-input transform predicts exception intervals or a held subset of them and also accounts for the p50 enrichment, followed by an explicit reversible sender/receiver on ciphertext.

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