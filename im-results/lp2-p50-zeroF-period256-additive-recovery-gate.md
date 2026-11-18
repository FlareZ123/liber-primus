# Frozen zero-F continuous period-256 additive GP29 recovery gate

## Decision

Director task #1515 is negative for the exact family

```
M[i] = P[i] + K[i mod 256] (mod 29)
```

where `M` is the frozen #1422 p0-p55 zero-to-F moving-exception intermediate, the clock is continuous, and one unrestricted 256-symbol additive GP29 key is shared across the unsolved corpus.

This family can be recovered exactly from source-shaped native-GP plaintext under the frozen language objective, yet it fails on the original ciphertext under independent training and blind evaluation. It recovers no substantial unknown plaintext.

## Frozen recovery method

The recovery objective was fixed before original evaluation.

- Training plaintext model: source-native GP29 word-boundary bigrams from the pinned Shakespeare and Emerson controls, additive smoothing alpha 0.25.
- Key family: one unrestricted 256-symbol GP29 key, applied continuously.
- Recovery: exact cyclic 29-state Viterbi. Each of the 29 possible values of `K[0]` is fixed in turn, the remaining 255 key symbols are solved by dynamic programming, and the closing 255-to-0 edge selects the global maximum.
- Training split on original: p0-p39.
- Independent key-stability splits: p0-p22 and p23-p39.
- Blind original holdouts: p40-p53 and p54-p55.
- No page or line resets, transposition, alternate outer transform, or other fitted postprocessing was searched.

Because the 256 key symbols are unrestricted, a global cyclic phase shift or additive sign convention is only a relabeling of the recovered key. This test therefore covers the continuous period-256 additive family itself, while reset schedules remain distinct hypotheses.

## Planted-positive gate

Gibran source-native GP29 words were resampled to the exact original 2,896-word length pattern. Three deterministic random 256-symbol keys were applied beneath the full frozen #1422 outer wrapper.

All three plants recovered:

- key accuracy: 256/256 for every plant;
- blind rune accuracy: 100% for every plant;
- blind mean language log probability: -2.4431041, exactly equal to the planted truth.

The frozen optimizer therefore has demonstrated power to recover this family rather than merely round-trip a supplied key.

## Original result

The full p0-p39 training fit re-encrypts exactly through both layers, as required by construction. Its key is unstable under independent training subsets:

- p0-p22 versus p23-p39 key agreement: 10/256 = 0.0390625;
- full versus p0-p22: 56/256 = 0.21875;
- full versus p23-p39: 38/256 = 0.1484375.

The direct independent-split agreement is close to the random-key expectation of 1/29 = 0.0344828.

Blind p40-p53 contains 3,008 runes:

- IoC 0.0344703;
- mean language log probability -5.3943094;
- 43 exact dictionary words, all short;
- 0 exact dictionary words of GP length at least 5 among 257 such words;
- best consecutive dictionary run: 2 words / 4 runes.

Blind p54-p55 contains 308 runes:

- IoC 0.0349423;
- mean language log probability -5.5599164;
- 5 exact dictionary words, all short;
- 0 exact dictionary words of GP length at least 5 among 30 such words;
- best dictionary run: 1 word / 3 runes.

Across the complete 3,316-rune blind holdout, IoC is 0.0345201, mean language log probability is -5.4095987, and there are 0 exact long dictionary words among 287 length-at-least-5 words. This is far from the native planted control score -2.4431041 and does not approach the issue's 150-rune coherent-plaintext gate.

## Scope

Retire exactly one shared continuous period-256 additive GP29 value layer beneath the frozen #1422 p0-p55 surface inverse. The result does not exclude physical-page or physical-line phase resets, nonlinear state, transposition, a different outer mechanism, or a source-derived value operation outside this additive family.

## Reproduction

- SFT: [`sims/lp2_p50_zeroF_period256_additive_recovery_sft.cjs`](../sims/lp2_p50_zeroF_period256_additive_recovery_sft.cjs)
- Successful Windows / Node 22 run: [44390628342](https://github.com/FlareZ123/liber-primus/actions/runs/44390628342)
- Director task: [#1515](https://github.com/FlareZ123/liber-primus/issues/1515)
- Frozen outer transform: [#1422](https://github.com/FlareZ123/liber-primus/issues/1422)
