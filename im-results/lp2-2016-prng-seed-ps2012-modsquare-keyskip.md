# 2016-derived PRNG seed under the 2012 P.S. modular-squaring model

**Status: bounded negative. No unknown LP2 plaintext, authentic key, complete cipher, or destination recovered.** This test adds one source-derived seed that was absent from the earlier 2012 P.S. modular-squaring seed list. It does not establish that the 2012 postscript number was intended as an LP2 key source.

## Source-constrained hypothesis

The preserved 2016 signed-message analysis obtains the operation marker **PRNG** from the fixed base-29 line:character reading of “map their meaning.” Removing those three marker runes leaves the 13-token string **LCBPNGPARRTHBPC**, whose base-29 integer is:

- decimal: **7144649572585460758**
- hexadecimal: **0x6326e4eeaa9a5416**
- width: **63 bits**

The 2012 Cicada final-message P.S. supplies a 432-bit composite modulus \(N=pq\), with the two published 216-bit factors. The earlier modular-squaring investigation tested six historical numeric seeds, but not this 2016-derived 13-token value. The new hypothesis is that the 2016 marker selects a PRNG and its 13-token remainder supplies the state/seed for the 2012 modulus.

This is a candidate cross-round connection, not an authenticated instruction. The 2012 P.S. does not state an RSA exponent or tell solvers to reuse the number in Liber Primus.

## Frozen test

The exact original LP2 ciphertext was tested on physical pages **0, 7, 23, 28, 42 and 53**, totaling **1,403 runes**. These are the same six source pages used by the earlier controlled P.S. keyskip investigation, allowing a direct comparison without widening the sample after seeing results.

The generator uses modular squaring \(x \leftarrow x^2 \bmod N\), with two natural initialization conventions:

1. \(x_0 = \text{seed}^2 \bmod N\), the convention used by the existing 2012 modular-squaring implementation.
2. \(x_0 = \text{seed}\), treating the 13-token integer as an already initialized state.

Four fixed reductions to GP29 are tested: full-state residue modulo 29; low byte modulo 29; five-bit big-endian with rejection of values 29–31; and five-bit little-endian with the same rejection. Both additive signs and both continuous-stream and physical-page-reset key schedules are tested. The cipher model uses the repository's exact fixed-plaintext soft no-repeat keyskip transducer: 81% rejection of an immediately repeated proposed ciphertext rune, at most 32 hidden advances and at most three consecutive rejections per emitted rune.

This gives **32 predeclared models**. The language prior is the repository's independent Shakespeare GP unigram distribution. A held-out Gibran GP passage supplies the positive control.

## Original-cipher result

The best of the 32 original-cipher models is:

| Initialization | Reduction | Sign | Key reset | Log likelihood |
|---|---|---:|---|---:|
| seed squared | full-state mod 29 | +1 | continuous | **−5427.179225** |

The most direct five-bit/page-reset interpretation of the 13-token seed ranks only **11th of 32**, with log likelihood **−5545.186989**.

A matched random-seed null generated **50 independent 63-bit seeds**. Each null seed was given the same 32-model search and only its best score was retained. **31 of 50** random-seed maxima equaled or exceeded the observed seed's best score:

- add-one empirical \(p = 32/51 = 0.627451\)
- null median best score: **−5416.719418**
- null minimum: **−5463.058086**
- null maximum: **−5373.873870**

The source-derived seed therefore performs ordinarily, not exceptionally, against the original ciphertext. The expected five-bit-big/page-reset model is not the leading interpretation and has no independent language evidence.

## Positive controls

For each of the two initialization conventions and both reset schedules, a **1,403-rune Gibran GP plant** was encrypted using the exact same 81% no-repeat mechanism and the five-bit-big reduction. The 32-model screen recovered the exact planted initialization, reduction, sign and reset in **all four** controls. The planted streams required 32, 41, 45 and 43 rejected key draws, respectively.

The negative original result is therefore not explained by a screen incapable of recovering this mechanism at the tested length.

## Decision

The specific chain

**2016 PRNG marker → 13-token base-29 seed → 2012 P.S. modulus → modular-squaring GP29 additive stream with soft no-repeat key skipping**

does not produce a credible LP2 key under the declared reductions, signs, initialization conventions or reset schedules. The random-seed comparison is decisive against treating this exact seed as a useful input to this model.

This does **not** rule out a different PRNG family, a non-additive use of the 13 tokens, a path/permutation operation, a different historical modulus, or an independently selected state transition. It does not justify expanding generic seed searches. The separate RSA-exponent/Fisher–Yates table permutation experiment also produced no language advantage after accounting for its 16 tested variants; its best nominal tail probability was about 0.045, with a Bonferroni upper bound of 0.72.

## Reproduction and relationship to prior work

Run from the repository root with Node.js 22:

    node sims/lp2_2016_prng_seed_ps2012_modsquare_keyskip.cjs

The standalone script derives the seed from its 13 GP tokens, reads the unchanged canonical corpus and language controls, reuses the existing exact keyskip transducer, runs the 32-model screen and 50-seed max-statistic null, and asserts all four positive controls.

Related source and prior tests:

- [2016 signed-message base-29 PRNG extraction](lp2-2016-signed-message-base58-word-map.md), especially the distinction between the 13-token seed and the separate p32 13-rune window.
- [2012 P.S. modular-squaring source analysis](ps2012-modsquare-key-source.md), which tested six other historically salient seeds but not this 2016-derived value.
- [Exact soft no-repeat keyskip transducer](../sims/keyskip_transducer.cjs).
