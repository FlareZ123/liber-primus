# Joint LP2 forward-generator test: global collision state and a six-apart affine repair

**Evidence class:** reproducible *forward-model compatibility* and directional diagnostic. Agent 39, 2026-11-10. **No unknown LP2 plaintext, key or complete cipher architecture recovered.** The lag-six transformation was previously identified and hypothesized as a collision repair; the contribution here is its executable joint test against the manuscript's four primary structural constraints, its directional reverse control, and a testable candidate forward rule.

## Original manuscript constraints

The canonical 55 unsolved rune-bearing pages have **12,956 rune symbols, 2,896 complete rune words, 32 words crossing physical page breaks**, and nine text sections. Numeric-only physical LP2 page 50 is kept outside the rune stream. A single canonical parsing path uses `sims/lp2_word_pages.cjs` and original physical-page JSON, and asserts the source sequences across the two formats. Four primary statistics are fixed:

| Observation | LP2 actual | Denominator |
| --- | ---: | ---: |
| Same adjacent rune, within complete words | **63** | 10,060 |
| Same adjacent rune, across consecutive word boundaries inside sections | **23** | 2,887 |
| Nonadjacent equal rune pairs inside length-4–9 words | **526** | 14,701 |
| Same adjacent rune, within physical pages | **86** | 12,901 |

The selected additional signature, already observed in [the affine echo investigation](lag6-conditioned-echo.md), is

`C[i]=(24−2C[i−6]) mod29` within complete words, with **80/1,290** eligible occurrences. This forward direction occurs far more often than the **reverse relation** `C[i−6]=(24−2C[i]) mod29`, observed **44/1,290**. Exactly **one** of the 80 forward matches is also an immediate adjacent repeat at its destination. The previously selected five-apart `S` to `S` echo occurs **11** times.

## Explicit generative candidates

For each of 500 replicates, draw English GP-encoded Shakespeare words independently, *conditional on each of the 2,896 original complete-word lengths*. Preserve the complete LP2 word lengths, true physical page lengths, and section boundaries, with source control independent of each key realization. Transform source runes by:

1. Plain English GP runes.
2. Independently uniform modulo-29 additive pad.
3. IID pad plus an adjacent-repeat rewrite that replaces an output with a random **different** rune, with probability **0.81** whenever the tentative output equals the preceding published rune, carrying previous-published-rune state across words and physical pages.
4. Same random rewrite but resetting previous-rune state at every word.
5. **Global affine T-rewrite:** identical to (3), but when a collision requiring a rewrite falls at word-local rune index **i≥6**, publish the **deterministic** rune `T(C[i−6])=(24−2C[i−6]) mod29`. Before the seventh rune of a word, use a uniformly sampled different rune as in (3). If no collision or no probabilistic rewrite, publish the ordinary additive-cipher tentative rune. The previous-output state persists across all word and physical-page boundaries.
6. Continuous additive modulo-29 keystream with step six per rune, without repeat rewriting.

The global T-rewrite is an **investigator-selected mechanistic hypothesis**; the prior external lag-six anomaly and the global anti-doublet deficit explicitly motivated its construction. It is not an independently discovered encryption mechanism. The **0.81 probability** was also tuned from the broad observed repeat deficit. This is primarily an architectural compatibility test, with the reverse-direction control providing more discriminating information than a fitted forward 80 count by itself.

## Executed joint comparison

All below are means over **500** synthetic manuscripts. Actual source and complete percentile distributions are preserved by [successful Actions run 42761822710](https://github.com/FlareZ123/liber-primus/actions/runs/42761822710).

| Measured statistic | Real LP2 | Plain GP-English | IID pad | Global random repair | Word-reset repair | **Global affine T-repair** | Additive step 6 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Within-word equal neighbors | **63** | 329.6 | 347.1 | 65.6 | 66.4 | **67.2** | 261.2 |
| Across-word equal neighbors | **23** | 117.5 | 99.8 | 18.7 | 99.5 | **18.5** | 80.7 |
| Nonadjacent equal word pairs | **526** | 706.3 | 505.8 | 510.6 | 511.9 | **512.4** | 558.6 |
| Equal physical-page neighbors | **86** | 445.5 | 445.3 | 84.0 | 165.1 | **85.5** | 340.7 |
| Lag-six forward affine echoes | **80** | 63.2 | 44.1 | 44.6 | 44.0 | **78.7** | 44.2 |
| Lag-six reverse affine echoes | **44** | see artifact | see artifact | **44.4** | see artifact | **44.6** | see artifact |
| Forward echoes also immediate doublets | **1** | see artifact | see artifact | **0.28** | see artifact | **1.54** | see artifact |
| Five-apart same-S echoes | **11** | 16.8 | 2.49 | 2.41 | 2.63 | **2.42** | 3.30 |

The global T-repair source also matches the original unigram flatness: real Pearson 29-rune frequency chi-square **26.36**, its synthetic mean **25.77**; observed page-position equality rate **0.0345545**, synthetic mean **0.0344977**, and the globally repeated 256-phase equality is similarly near the null. On the four primary statistics, the observed standardized maximum deviation under global T-repair is **0.99749**, versus the 500-model replicate distribution, with empirical upper-tail **0.71257**. Global uniform repair has maximum **1.03153**, upper-tail **0.68663**. These tails are descriptive for the *specified, adaptively motivated models* and cannot establish a true cipher.

The **directional asymmetry** is a more specific consequence: the published **80 forward / 44 reverse** echoes compare closely with the T-repair synthetic **78.696 ± 8.250 forward / 44.630 ± 6.382 reverse**. The true single echo-plus-immediate-repeat occurrence compares with modeled **1.54 ± 1.24**. By contrast, global uniformly chosen collision replacements yield symmetrical expected forward and reverse echoes, approximately **44.6 / 44.4**. This gives a forward mechanism that simultaneously accounts for the major doublet suppression, the lag-six directional bias, and same-word equality statistics without fitting a separate probability to the reverse statistic.

Word-local repeat state reset is decisively incompatible with the data under these assumptions: it predicts around **99.5** repeated cross-word boundaries and **165.1** within-physical-page repeats, versus original **23** and **86**. A continuous previous-output state is thus necessary *within this restricted family*. Independent alternative globally constrained systems remain possible.

## An exact conditional mass-transfer law and a no-extra-parameter cross-check

The deterministic rewrite of a collision into `T(C[i−6])` implies a sharper identity than a flexible Monte Carlo fit. At each eligible position, condition on the already-published ciphertext history. Let `A=C[i−1]`, `B=T(C[i−6])`, and tentative cipher output `X` be independent uniform modulo 29. When `X=A`, probabilistically substitute `B` with an arbitrary probability `q`.

- If `A≠B`, `Pr(C[i]=A | past)=(1−q)/29` and `Pr(C[i]=B | past)=(1+q)/29`. The rewrite **transfers probability mass** from adjacent duplicates to the forward affine echo.
- If `A=B`, both indicators coincide, and their conditional expectations are each `1/29`. Rewriting cannot change the published rune at that site.

Either way, the exact model requires

```
E[ 1{C[i]=C[i-1]} + 1{C[i]=T(C[i-6])} | prior ciphertext ] = 2/29.
```

Crucially, this consequence does **not** require choosing the rewrite probability `q` or fitting the source language. The repository's [deterministic census](../sims/lag6_collision_mass_transfer.cjs) obtains across all **1,290** eligible positions:

| Conditional event | LP2 observed | No-repair uniform expectation |
| --- | ---: | ---: |
| Forward T echo `C[i]=T(C[i−6])` | **80** | 44.4828 |
| Immediate adjacent repeat `C[i]=C[i−1]` | **9** | 44.4828 |
| **Sum of both event counts** | **89** | **88.9655** |

The forward excess is **35.5172**, numerically balanced by an adjacent-repeat deficit of **35.4828**. Among those positions, `T(C[i−6])=C[i−1]` holds **33** times, and both event indicators fire jointly exactly **once**. Using only the two 1,290-position margins and the observed 33 target/predecessor equalities, the inferred probability of replacing tentative duplicates is **0.81941** from T echoes and **0.81862** from duplicate suppression. Independently using *all* 10,060 within-complete-word adjacent positions estimates **0.81839** from the original **63** repeats. This three-way agreement at approximately **81.9%** comes from the *same specified model* with different moment constraints; the original simulation used the nearby historical **0.81** rewrite rate.

The conservation also holds in four consecutive word-index quarters. Their observed `T+adjacent` totals **21, 22, 24, 22** versus the model's respective fixed expectations **23.79, 20.69, 21.66, 22.83**. Every quarter had exactly 20 forward-T echoes; that partition was examined after the original anomaly was selected, so the quarter counts are stability diagnostics rather than independent discovery tests.

**Meaning:** this is a particularly tight, mechanistically explained **cross-moment identity** relating two independently countable ciphertext features. Any model with iid-uniform tentative rune outputs and T-target collision rewriting predicts it algebraically. Because the T transform was selected from previous LP2 analyses, the match does not constitute a discovery-wide significance test, and other algorithms could satisfy the same statistics. A true decipherment still requires recovering actual plaintext and a reversible key/state, as detailed below.

Reproduce with `node sims/lag6_collision_mass_transfer.cjs`, validated by [CI run 42762437589](https://github.com/FlareZ123/liber-primus/actions/runs/42762437589). All exact quarter and word-length strata are preserved in that run's artifact.

## Missing inversion and discriminating evidence

The original selected five-apart `S` echo remains unexplained: **11** instances, versus only **2.42 ± 1.54** under the T-repair. An additional specialized repair could overfit; it must arise from an independently motivated mechanism and predict an unfitted interval or glyph property.

Furthermore, an output **overwrite** can erase the tentative symbol. If Cicada used this model, exact plaintext inversion would require identifying overwrite events and reconstructing their original tentative outputs, possibly through key-state constraints, language information or an encoded redundant channel. At a selected forward-T echo, the ciphertext alone does not distinguish a genuine occurrence from an overwrite. A completed cryptanalytic solution still needs an actual keystream or jointly inferred key/state, a reversible decryption yielding readable source plaintext, independent cross-page confirmation, and exact forward re-encryption.

The samples use iid uniformly random keys and source words chosen independently at each exact observed length. They preserve the manuscript's page/word layout and source rune distributions, but **do not** preserve original English word order, a hypothetical secret key generator, external Cicada keys or hidden image payloads. The outputs cannot establish whether LP2 is a deliberately repaired stream, a modified stochastic process or another non-English encoding.

## Reproduce and provenance

- [Executable `sims/lp2_forward_model_challenge.cjs`](../sims/lp2_forward_model_challenge.cjs), Node.js 22, CommonJS. Run with `node sims/lp2_forward_model_challenge.cjs 500`, after `node sims/test_lp2_word_pages.cjs`.
- [Manual workflow `.github/workflows/lp2-forward-model-challenge.yml`](../.github/workflows/lp2-forward-model-challenge.yml). **Final 500-trial experiment with both directions: [42761822710](https://github.com/FlareZ123/liber-primus/actions/runs/42761822710)**. Earlier run 42761346967 covered the primary T model but did not report reverse-direction checks; earlier run 42760430495 tested only uniform repair at 250 replicates. Superseded first run 42760191176 contained a mistaken section-split assertion and was corrected.
- Prior independent 80-count and transform-family significance are in [`im-results/lag6-conditioned-echo.md`](lag6-conditioned-echo.md), with external attribution retained there. The original note already suggested T-based collision rewriting as a possible rule; this work supplies a quantitative, executable test of it across the remaining full-manuscript constraints.

**Highest-value next step:** invert the T-repair as a latent-state cipher layer with source-motivated candidate keys and evaluate actual plaintext and exact heldout re-encryption. Resist promoting this compatible statistical forward model as a solved LP2 passage.
