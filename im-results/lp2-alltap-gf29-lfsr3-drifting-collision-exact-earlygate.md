# All third-order GP29 recurrences with an exact drifting key clock

**21 November 2026, Agent40. Status: exhaustive, model-conditional original-ciphertext exclusion. No recovered unknown LP2 plaintext, author key, or destination.**

## Causal hypothesis and scope

The unsolved Liber Primus second release has **12,956 ciphertext runes**. Source evidence includes the GP29 29-symbol alphabet and an anomalously low adjacent-rune equality rate. Earlier all-tap, all-seed original-source work excludes an **in-step** additive GP29 third-order recurrence under first thirteen original A/I/O singleton constraints; it does *not* cover a key that advances an extra position when a repeated glyph is rejected. This test closes that drift mechanism across *every* third-order GP29 recurrence.

The exact candidate family is:

```text
K[t+3] = a*K[t+2] + b*K[t+1] + c*K[t] (mod 29)
C[i]   = P[i] + K[t] (mod 29)
```

where **(a,b,c)** ranges over *all* `29³=24,389` triples and the three initial key glyphs are completely unknown with a uniform prior over 24,389 states. The model advances K for every tentative output. When a tentative output is equal to the previous emitted rune, the cipher **rejects the tentative output with probability 0.81**, advances K once more, and retries the same P[i] until accepted. The punctuation and original rune order are unchanged; the cipher clock is uninterrupted from p0 through p55.

There is **no first-party clue explicitly selecting GF29 LFSRs or the 0.81 probabilistic collision rule**. This is an exhaustive cryptanalytic test of a mathematically precise previously open family, rather than a claim about Cicada's historical algorithm. English-like GP29 runes are modeled by the smoothed unigram distribution fitted to the independent Shakespeare reference; unknown LP2 ciphertext was never used for training.

## Exact inverse and predeclared decision

The forward algorithm integrates *all* unknown initial states and arbitrary local key-draw rejections without beam pruning or an artificial maximum drift. A key triple `(k_t,k_(t+1),k_(t+2))` is one of 24,389 states. For every source glyph, transitions sum the accepted output probability for each feasible consumed-key length. Any run of equal key values is at most three for a nonconstant recurrence state. Fixed-point states are covered by the infinite geometric rejection sum, so the finite hidden-state transition is **exact**.

Compare the model's marginal probability to the flat-29-rune **anti-repeat-matched null**, with the same 0.81 collision rejection. The anytime, frozen log-likelihood bounds are:

- **EXCLUDED:** log likelihood ratio ≤ −10.
- **FIRES:** log likelihood ratio ≥ +30.
- **UNRESOLVED:** neither bound reached by 12,956 runes.

Because the candidate likelihood is a probability distribution over every unknown seed, the likelihood-ratio martingale gives a model-conditional false-exclusion probability at most `exp(−10)=4.54e−5` for each true model, and under the flat null the union bound over 24,389 recurrences for a false positive is `24,389*exp(−30)=2.28e−9`. These bounds refer to the fixed model and reference unigram; they do not justify rejecting arbitrary English dialects, transformed plaintext, extra encryption layers, or altered collision rules.

The exact `(a,b,c)=(23,5,6)` candidate with both signs was already run across all 12,956 original LP2 runes in [the earlier complete-state test](lp2-dh23-gf29-order3-exact-skipping-forward-gate.md). The new runner asserts an exact all-rune recurrence regression against the earlier result **−7,819.210377697418** before screening the whole family.

## Reproduced original-source results

All eight independent Windows Node.js 22 workflow partitions completed **successfully**. Each exercised one hidden-seed positive GP-English plant with collision-induced key skips and one anti-repeat-flat negative. Every positive fired at +30 and every flat control was excluded at −10.

| Search partition | Complete tap triples | Original FIRES | Original UNRESOLVED | Original EXCLUDED | Latest rejection point (runes) | Windows CI run |
|---|---:|---:|---:|---:|---:|---|
| 0 | 3,048 | 0 | 0 | 3,048 | 118 | [44929133844](https://github.com/FlareZ123/liber-primus/actions/runs/44929133844) |
| 1 | 3,049 | 0 | 0 | 3,049 | 123 | [44929222367](https://github.com/FlareZ123/liber-primus/actions/runs/44929222367) |
| 2 | 3,048 | 0 | 0 | 3,048 | 119 | [44929226175](https://github.com/FlareZ123/liber-primus/actions/runs/44929226175) |
| 3 | 3,049 | 0 | 0 | 3,049 | 107 | [44929230146](https://github.com/FlareZ123/liber-primus/actions/runs/44929230146) |
| 4 | 3,049 | 0 | 0 | 3,049 | 111 | [44929234149](https://github.com/FlareZ123/liber-primus/actions/runs/44929234149) |
| 5 | 3,048 | 0 | 0 | 3,048 | 128 | [44929238525](https://github.com/FlareZ123/liber-primus/actions/runs/44929238525) |
| 6 | 3,049 | 0 | 0 | 3,049 | 109 | [44929242624](https://github.com/FlareZ123/liber-primus/actions/runs/44929242624) |
| 7 | 3,049 | 0 | 0 | 3,049 | 116 | [44929246778](https://github.com/FlareZ123/liber-primus/actions/runs/44929246778) |
| **Total** | **24,389** | **0** | **0** | **24,389** | **128** | Eight successful |

The exact source evaluation work was **1,518,604 rune positions**, averaging **62.26594 original runes per candidate** until exclusion. No recurrence survived to a point at which an original full-page plaintext proposal could be tested. Part0's built-in full-cipher original regression confirms that the early-exit engine uses the same likelihood as the separately validated full 12,956-rune HMM.

Example planted controls: part1 selected taps `[3,18,3]`, actually rejected 54 extra key draws during generation, and crossed +30 after 100 runes; part5 selected taps `[18,3,18]`, rejected 63 draws, and crossed +30 after 98 runes. These tests ensure the new rule has sufficient power even when unknown clock drift is real rather than guessed. A positive plant with all-zero taps is also covered and expected to hit the bound quickly when the key becomes a constant zero stream.

## Source, methods, and decision

Reproducible shared code: [exact all-tap GF29 key-skip engine](../sims/lp2_lfsr3_skip_alltap_core.cjs) and eight [partition wrappers](../sims/lp2_lfsr3_skip_part0_sft.cjs), each a self-contained CI entry point. Original data from `resources/liber-primus/lp2-corpus.json` and independently trained `resources/control/shakespeare_first300k.txt`. The candidate family, likelihood model, thresholds, controls and partitioning were committed before the complete original scan. An initial result-counter mutability error was repaired without changing the model, thresholds or source inputs, then all eight partitions passed.

**Decision:** retire the *entire* third-order linear **GP29** key generator family under this continuous, collision-driven rejection-and-consumption rule with stationary GP-English unigram emissions. This genuinely extends the earlier zero-drift 13-singleton exclusion and avoids repeating its incomplete clock assumption.

This is an intermediate negative, so it belongs in `im-results/`, not the authoritative `results/README.md`. Still open: a creator-provided high-entropy key, independently keyed replacement for would-be doublets (rather than consuming more LFSR symbols), alternate alphabets, plaintext transformations, nonlinear recurrence, language models with non-English first hundred runes, resetting clocks, and historical clue-selected external source material. The next productive branch should specify an authentic key, an executable decipherment operation and a source-visible reason to attempt it, rather than tuning another unmotivated recurrence after observing this rejection.
