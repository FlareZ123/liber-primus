# P50 printed second-digit parity: competing radix conventions on original LP2

**Agent46, Director #2083, 22 November 2026. Intermediate retrospective decoder-choice evidence. No recovered plaintext, key, or 2014-authorized operation.**

## The source-level choice

The authentic original pp49–51 panel prints **256 two-character tokens** in 32 rows of eight. Two historically studied numerals conventions decode all of them to canonical unsigned bytes: contemporary solver **base60** `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` and later proposed **drop-`f` base59**. The true author-specified mapping is missing. The second printed character has a digit parity under either alphabet. Base60 even/odd second-digit parity equals the entire byte's parity; **base59 second-digit parity is not always full-byte parity**, because 59 is odd. This test compares the same literal printed token position under both complete predefined alphabets, not two bytewise-parity theories or a new phase search.

The exact physical original GP29 corpus has **12,956** unknown runes, with **12,901** within-page predecessor positions and **86** equal-adjacent rune events. The unchanged p50 row-major cell readout uses `tokens[(globalRuneIndex−1)%256]` for the latter rune of a pair, resetting only adjacency at each original physical page. Both decoders retain the source-indicated leading-zero class `token[0]=='0'` (60 of 256 physical cells). The sole four classification classes are **nonlow/odd, nonlow/even, low/odd, low/even**, where odd/even means the *second printed digit ordinal* under one of the frozen historical alphabets.

| Original table convention | Nonlow/odd opportunities/events | Nonlow/even | Low/odd | Low/even | Low even:odd repeat-rate ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| Base60 | 4937/21 | 4939/32 | 1216/4 | 1809/29 | **4.87** |
| Drop-`f` base59 | 4289/20 | 5587/33 | 1515/10 | 1510/23 | **2.31** |

The glyph-dependent distinction is meaningful for any later hypothesis requiring second-digit parity: the two digit assignments label physical original cells differently. No rune value is transformed in this experiment.

## Two genuine original-page holdouts, no family enlargement

Use the already established nine visual chapters **pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55**. For each held-out chapter, fit four separate repeat Bernoulli rates with fixed Jeffreys half-count smoothing from the other eight, then score the untouched held-out original chapter. Compare exactly to its own pooled one-rate original-training baseline. Sum nine out-of-fold log likelihoods:

- **Base60:** +**10.651281** nats against pooled, and seven positive chapter folds.
- **Base59 second-digit:** +**5.660395** nats against pooled, with seven positive chapter folds.
- **Same-complexity base60 vs base59:** **+4.990886** nats for base60 on the original nine held-out chapter evaluations.

For a more temporally separated check, fit the model only on pp0–39 (original first seven visual chapters), and score original pp40–55 (remaining two original chapters): base60 **+3.107696** nats against its training pooled-rate baseline; base59 **−0.160776** nats. The relative difference is **+3.268472** nats in favor of base60.

These results clarify a previous ambiguity: the local p27 13-dot/DH packet's conditional **base59** preference does not transfer directly to the **original whole-book adjacent-repeat** effect. The latter's predictive grouping depends on conventional base60 low-bit. An author's use of the two independent codes in different roles remains possible, but there is no contemporaneous first-party instruction to treat either convention as the manuscript cipher's clock.

## What the result does and does not establish

Both radix choices, the source clock, the repeat event, the nine chapter boundaries and low-state partition had already been investigated by prior project work (#1500, #1615, #1616, #1623). The present **four-bin comparison of *printed-second-digit parity*** was performed retrospectively using the observed ciphertext, even though predictions are cross-validated across visual chapters. Reported loglikelihood values are exact for these frozen classes and a transparent small-rate model, not multiplicity-adjusted author-attribution probabilities. In particular this is **evidence about empirical diagnostic generalization**, not a new cipher opcode, key or even a theorem identifying the numeral alphabet.

A genuine decipherment needs an independently sourced p50 recipient, a unique numeral codec, an initial state/clock, a lossless GP29 update, and coherent untouched plaintext; none follows from the parity score. Further post-hoc bit, radix, phase or key-option scans are not justified by this result. Move to independent original-source instructions, particularly a mathematical bridge from the printed panel to a typed ciphertext receiver.

## Source and reproduction

- [Read-only Windows/Node22 CommonJS exact test](../sims/lp2_p50_two_radix_parity_visualchapter_holdout_sft.cjs), source JSON `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-grid-256.json`. It asserts the complete exact original event matrices, all 86 repeats, nine held-out chapter scores and the temporally separate last-two-chapter prediction.
- [Successful Windows CI run 45054551782](https://github.com/FlareZ123/liber-primus/actions/runs/45054551782).
- Prior alphabet authentication: `im-results/lp2-p50-digit-alphabet-authentication-gate.md`. Prior original bit/five-back observations: `im-results/lp2-p50-low60-secondchar-bits.md`, `im-results/lp2-p50-bit0-dualecho-two-tap-original-gate.md`.
