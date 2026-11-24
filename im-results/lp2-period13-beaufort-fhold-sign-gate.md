# Period-13 standard Beaufort versus additive under plaintext-F holds

**Decision:** standard Beaufort and ordinary additive period-13 F-hold receivers are independently calibrated on native controls and are mutually discriminating, but neither has a legal word-CSP key on the collision-compatible p54–55 original unit (205/103 split). No original plaintext or key recovered.

## Frozen model and source rationale

Use one 13-symbol GP29 key, phase zero at the start of the connected unit, and the authentic plaintext-F transparent/no-advance rule. The affine notation is C=aP+K mod29:

- a=1: additive Vigenere, C=P+K.
- a=28 (−1 mod29): standard Beaufort, C=K−P.

For P=F, emit ciphertext F and do not advance. For P≠F, consume the next key symbol. A ciphertext F is therefore ambiguous: it may be a transparent plaintext F or a non-F plaintext encrypted to F. The sign is fixed; no other slope, period, phase, reset, or key clock is searched.

Period 13 is historically motivated by solved LP1 key material. The source does not specify whether LP2 should use additive or Beaufort. Both are simple, recognizable classical operations; this task isolates that sign choice rather than performing an unconstrained Beaufort wordlist sweep.

## Prior scope and overlap audit

- Issue [#1895](https://github.com/FlareZ123/liber-primus/issues/1895) tested direct additive/Beaufort perimeter keys on a marker-bracketed 43-byte p55 interval. That was a static key alignment, not a period-13 key with latent plaintext-F holds.
- The calibrated word-relation CSP in [lp2_fhold_word_relation_csp.cjs](../sims/lp2_fhold_word_relation_csp.cjs) supports a fixed affine multiplier. This sign-specific run uses that constructive solver at only a=1 and a=28, with identical dictionaries, splits, and per-slope node limits.
- The companion [#2554 all-slope report](lp2-period13-affine-fhold-all-slopes.md) tests all 28 invertible multipliers on the same p54–55 205/103 split. It finds zero keys for every slope and a pairwise relaxed OOV lower bound of at least five words. This report adds independent Beaufort controls and the direct a=1 versus a=28 comparison; it does not duplicate the all-slope relaxation.

## Blind native controls

The donor is solved native GP29 section 0_koan_1 (780 runes, 208 words, 13 singleton words). Each plant has an independently generated hidden 13-rune key. The first 155 runes (46 complete words) are the fit; the remaining 625 runes are untouched. The lexicon excludes the donor section. Both candidate signs are tested against the exact same ciphertext, dictionary, word split, and 3,000-node limit.

| True model | Seed | Hidden key (GP29 indices) | Transparent F holds | Non-F plaintext → ciphertext F | Correct-sign result | Wrong-sign result |
| --- | ---: | --- | ---: | ---: | --- | --- |
| Beaufort (a=28) | 626065409 | [22,17,13,25,11,19,21,7,26,23,0,24,6] | 13 | 16 | Unique exact key; 155/155 prefix, 625/625 holdout; replay exact | Additive: 0 candidates |
| Beaufort (a=28) | 626065413 | [18,20,9,23,4,4,24,19,17,10,28,15,12] | 13 | 35 | Unique exact key; 155/155 prefix, 625/625 holdout; replay exact | Additive: 0 candidates |
| Additive (a=1) | 626065411 | [28,5,12,2,11,28,2,11,14,27,8,12,22] | 13 | 23 | Unique exact key; 155/155 prefix, 625/625 holdout; replay exact | Beaufort: 0 candidates |
| Additive (a=1) | 626065414 | [28,0,25,4,23,11,19,8,12,5,2,2,15] | 13 | 19 | Unique exact key; 155/155 prefix, 625/625 holdout; replay exact | Beaufort: 0 candidates |

All four true-sign searches return one key, one latent path, and end phase 11. The wrong sign returns zero candidates in every plant. Each plant contains both transparent plaintext-F events and genuine encrypted-F ambiguities; the solver does not treat every ciphertext F as a plaintext F. The 625-rune continuation is decoded only after the prefix key is fixed, then re-encrypted exactly.

A first exploratory 0_loss_of_divinity plant with only a 155-rune fit failed under both signs because the finite lexicon excluded its true text early (word 8/10). It is not treated as cipher evidence. The final calibration uses four independent keys on the KOAN donor, whose dictionary support is sufficient to test the sign distinction cleanly. The exploratory run is preserved at [workflow 45365338504](https://github.com/FlareZ123/liber-primus/actions/runs/45365338504).

## Original p54–55 comparison

The target is the previously selected collision-compatible p54–55 unit: 308 runes, 66 words. Freeze the first 205 runes (45 words) for training and the remaining 103 for continuation. Both signs use the same 42,468-spelling dictionary and the same 3,000-node limit.

| Model | Candidate keys | Exhausted? | Nodes / passes | First exact contradiction |
| --- | ---: | --- | ---: | --- |
| Additive, a=1 | **0** | no | 1 / 1 | word 4, no relation |
| Beaufort, a=28 | **0** | no | 1 / 1 | word 20, no relation |

Neither sign produces a candidate key, latent continuation state, or holdout plaintext. The untouched 103 runes are not used to select or rescue either model. The companion #2554 test rejects all 28 nonzero slopes on the same original split; its relaxed pair-conflict analysis still requires at least five OOV words for every slope.

## Reproduction and decision

- [Source-native sign-comparison SFT](../sims/lp2_beaufort_fhold_sign_controls_sft.cjs)
- [Node 22 workflow run](https://github.com/FlareZ123/liber-primus/actions/runs/45365616324)
- [All-slope original report](lp2-period13-affine-fhold-all-slopes.md)

Retire the fixed period-13 additive and standard-Beaufort word-boundary receivers on p54–55. The positive controls show the solver distinguishes the two signs and recovers each planted key under ambiguous ciphertext F; the original fails both signs before the holdout. This does not exclude other original units, non-word-based plaintext, different registers, or non-affine key clocks. No unknown LP2 plaintext, key, or intended continuation was recovered.
