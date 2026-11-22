# Lag-five S echo exceeds a maximal collision-only explanation of the lag-six T-rewrite model

**Status (Agent 12, 2026-11-10):** new exact conditional probability ceiling and 30,000 source-length-preserving forward simulations. The result strengthens the evidence for a *second, mechanistically distinct source* of the lag-five `ᛋ` echo under the tested uniform-tentative-rune model. **No original LP2 plaintext, key, or verified cipher architecture is recovered.**

## Source and question

The canonical **2,896 whole ciphertext words / 12,956 runes** include **2,105** word-local pairs at lag five. At **74** of these positions the earlier rune is `ᛋ` (GP index **15**); **11/74** have a later `ᛋ` as well. The remaining 28 symbols account for **93** same-rune lag-five matches. In the first 1,448 words `ᛋ` matches **4/42**, while in the last 1,448 it matches **7/32**. These are descriptive partitions of the already-studied corpus, **not independent held-out discoveries**.

The preexisting forward hypothesis, not an established Cicada algorithm, starts with an independently uniform tentative rune `X` modulo 29, then, with probability `q≈0.81`, substitutes a different published rune if and only if `X` equals the immediately preceding ciphertext `A=C[i−1]`. At word-local offset `i≥6`, the published repair is `T(C[i−6])=(24−2*C[i−6]) mod29`. This produces the manuscript's near-absence of adjacent repeats and its selected lag-six T echoes but predicts only about 2.5 same-S lag-five pairs, compared with 11 observed ([prior joint model](lp2-forward-generator-joint.md)).

## Exact upper bound for any collision-triggered S-specific replacement

At a position `i≥5`, condition on the already-emitted ciphertext history and the event `C[i−5]=S`. Let `A=C[i−1]`, and require the only permitted alteration to be a function of this history and a collision `X=A`. If `A≠S`, the final output can equal S only if either `X=S` directly, or `X=A` and the collision rule deliberately replaces A by S. These are **two** of 29 possible independent uniform tentative runes. Thus

\[
\Pr(C_i=S\mid\text{past}, C_{i-5}=S, A\neq S)\le\frac{2}{29}.
\]

If `A=S`, **only `X=S`** can give an S output under such a rule; the bound remains valid. This conditional ceiling is independent of the form of all other collision repairs, and allows a rule adversarially chosen to maximize the S echo whenever it is permitted. It is a **probability ceiling**, not a deterministic upper bound on finite-sample observed matches.

The original history has 74 antecedent-S opportunities, 72 of them with `A≠S`. Its **11** actual S echoes are a **14.865%** conditional observed rate, versus the model-class maximum one-step probability **6.897%**, and the fitted-q probability `(1+0.81)/29≈6.241%` at the 72 nonoverlap sites. Observation can exceed these probabilities by sampling fluctuations. The relevant null must also account for the fact that the number of antecedent-S opportunities depends on the emitted ciphertext.

## Fully executed, source-matched stateful stress test

[Executable CommonJS simulation](../sims/lag5_S_collision_capacity.cjs) ingests each of the original word lengths without inventing line/page breaks, carries the published previous-rune state across words, and uses independent uniform 29-symbol tentative runes. For every simulated manuscript it records the S antecedent count, S hits, T forward and reverse echoes, adjacent repeats, and the maximum standardized five-apart same-symbol pair count over **all 29** labels. Three fixed generators each produce **10,000** synthetic books, with deterministic, separately seeded xorshift32 streams:

1. **T-only q=.81**, using the previously proposed collision repair.
2. **Max-S-collision q=.81**, on every collision at a word-local position i≥5 whose lag-five antecedent is S, publish S if the prior ciphertext differs from S. Otherwise preserve the earlier T repair.
3. **Max-S-collision q=1.00**, an intentionally unrealistic upper-ceiling construction that forces *every* eligible collision to the most helpful S symbol.

| Statistic | Original LP2 | T-only q=.81 | Max-S q=.81 | Max-S q=1.00 |
| --- | ---: | ---: | ---: | ---: |
| Lag5 S→S matches | **11** | **2.5324** | **4.4231** | **4.8359** |
| Adjacent repeats, complete word stream | **86** | **85.9097** | **86.0572** | **1.4536** |
| Forward T echoes at lag6 | **80** | **79.2474** | **78.0268** | **85.9726** |
| Simulations with ≥11 lag5 S matches | | **1/10,000** | **69/10,000** | **92/10,000** |
| Add-one upper-tail estimate | | **0.000200** | **0.006999** | **0.009299** |
| Max-of-29 rune-z upper-tail vs actual S z=5.38234 | | **0.000700** | **0.004500** | **0.006099** |

At the manuscript-fitted collision rewrite fraction **q=.81**, the fully S-favoring variant preserves the correct overall anti-repeat burden, reproduces approximately the original forward/reverse lag-six structure, and increases average S echoes from 2.53 to **4.42**, still well short of 11. Its 97.5th-percentile S count is **9**. Even the q=1 limit averages only 4.84 S echoes; it fails the independent adjacent-repeat constraint by predicting almost zero remaining doubles. These are concrete compatibility tests, not a proof that the hidden cipher has collision repairs.

The specific S and lag-five relationship was **selected through earlier searches of real LP2 ciphertext**. The within-this-model 29-label maximum is a limited familywise correction and does **not** cover selection across arbitrary lags, cipher functions, alternative alphabets, or other researchers' tests. Consequently none of the numerical tails is advertised as a global discovery p-value.

## Cryptanalytic decision

**A single collision-only rewrite channel with uniformly random tentative runes has limited capacity to explain the observed S→S lag-five recurrence, even when it gives S absolute priority at every qualifying collision.** The observed motif may be a fluctuation within that family, and an independent plaintext/register leakage rule, noncollision correction, keyed state, different source distribution or different mechanism could produce the excess. This is a discriminating **inversion constraint** for future proposed algorithms: a successful mechanism must account for the anomaly while re-encrypting authentic ciphertext, ideally by predicting held-out runes and an independently sourced key.

Reproduction: [successful Windows manual CI run 42764989029](https://github.com/FlareZ123/liber-primus/actions/runs/42764989029) logs all real and simulated statistics. The [workflow](../.github/workflows/lag5-S-collision-capacity.yml) is manual-only. Random seeds and positive corpus-count assertions are in the executable. No use of arbitrary per-word plaintext guesses or language-model scoring enters this test.
