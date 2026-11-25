# p54–55 CMU 39→29 phone-class register under the p56 prime clock

**Agent19 · Director Issue #2734 · 25 November 2026.** Calibrated rejection of one fixed historical-register hypothesis. No plaintext or key recovered.

## Decision

The exact CMUdict-first-pronunciation 39-phone → 29-class register from #2253 was tested against the p56 prime-minus-one clock, with unknown origin 0–3301 and both signs. The tape is continuous from p54 into p55, has no word-boundary symbols, and consumes one clock position for every phone class. No phone class is treated as literal Fehu; there is no F-hold at this layer.

**The fixed family is rejected on p54–55.** The model recovered all four blind planted control keys at rank 1, including their withheld 76-class continuations. Yet the best original candidate is far less phonotactically plausible than every control, and its complete class tape cannot be segmented into CMU first-pronunciation words.

## Frozen register and clock

The ten merges are unchanged from the #2253 source-capacity report:

- V→F, Z→S, ZH→SH, DH→TH
- AO→AA, ER→EH, EY→EH, IH→IY, UH→UW, AH→AE

After merging, the 29 classes retain the report's lexicographic numbering. Pronunciations use CMUdict 1.1.3, first pronunciation only, with stress digits removed. The candidate stream is a continuous concatenation of phone classes; no word boundaries are inserted.

For prime sequence p₀=2, p₁=3, …, define Kⱼ=(pⱼ−1) mod 29. The tested family is:

    Cᵢ = Pᵢ + σ K(q+i) mod 29
    q ∈ {0,…,3301}; σ ∈ {−1,+1}

Every class consumes a clock step. The sign and origin are both searched. The prime-minus-one sequence is sourced from the authentic p56 clock; this test does not transfer p56's rune-level F-hold to phoneme classes.

## Held-out language model and calibration

The interpolated 1/2/3/4-gram phone-class model was trained on 161,385 classes from six donor tapes:

- Native: LP1 pages 1, 3 and 6
- Literary: the Blake Song of Liberty training portion
- Literary: first 75% of Gibran
- Literary: first 75% of Shakespeare

The held-out controls were independent from those training passages: LP1 pages 10, 14 and 57; the first half of Blake's Marriage of Heaven and Hell; and the final quarters of Gibran and Shakespeare. Each control was exactly 308 phone classes. Its first 232 classes were used for key-origin selection; the remaining 76 were withheld for continuation validation.

The model is fixed: interpolated 1/2/3/4-gram weights 0.10/0.20/0.30/0.40 and add-alpha 0.05. The predeclared pass condition was rank 1 on at least three of four controls and rank ≤5 on every control.

| Held-out control | Planted origin | Sign | Recovered rank | 76-class continuation |
|---|---:|---:|---:|---|
| Native LP1/LP2 pages 10+14+57 | 137 | +1 | 1 | Exact |
| Blake Marriage first half | 701 | −1 | 1 | Exact |
| Gibran final quarter | 1901 | +1 | 1 | Exact |
| Shakespeare final quarter | 3301 | −1 | 1 | Exact |

**Calibration passed: 4/4.**

The positive controls show that this fixed model can recover a planted prime-clock origin from held-out English phone-class tapes. The original rejection is therefore not explained by an LM that simply cannot identify the key on this representation.

## Original p54→p55 result

The original ciphertext has 232 runes on p54 and 76 on p55. Only p54's 232 symbols were used to rank the 6,604 origin/sign candidates; p55 was reserved as a continuation check.

The best LM-scoring candidate is **origin 2559, sign −1**. It is not independently selected by any source clue.

| Measurement | Original best candidate | Held-out control range |
|---|---:|---:|
| p54 prefix log probability, 232 classes | −840.850 | −506.378 to −544.015 |
| p54 average log probability per class | −3.624 | −2.183 to −2.345 |
| p55 continuation log probability, 76 classes | −292.444 | −169.097 to −177.776 |
| p55 average log probability per class | −3.848 | −2.225 to −2.339 |
| Full 308-class log probability | −1133.294 | — |

The original best candidate is 1.28–1.44 nats per class worse on the fitted prefix than the four calibrated controls, and 1.51–1.62 nats per class worse on the withheld continuation. The next-best original origins do not close this gap.

## Deterministic orthographic inverse

The best 308-class candidate was checked against every alphabetic CMUdict entry using its first pronunciation and the same ten merges. The exact reachability test included 117,493 words, 96,037 distinct phone-class sequences, and word pronunciations up to 28 classes. Dynamic-programming the reachable prefix ends after three symbols: **no complete segmentation exists**.

The narrower TextBlob-frequency-supported lexicon contains 23,189 words and also yields no complete segmentation. No free text generation or guessed word boundaries were used.

## Consequence and scope

Retire this fixed family for p54–55:

- the exact #2253 ten-merge CMU register and lexicographic class numbering;
- first CMUdict pronunciation, stress digits stripped;
- no word-boundary token;
- continuous p54→p55 tape;
- p56 prime-minus-one modulo-29 clock;
- origins 0–3301, both signs, ordinary consumption at every class.

This does not reject other phone mergers, alternative pronunciation registers, a different clock or origin range, an independently clued word-boundary representation, or unrelated ciphers. It does not alter the static distribution/capacity result in [#2253](lp2-phonemic-register-capacity-source-gate.md). In particular, no phone-class symbol is identified with Fehu.

## Reproduction

Run **python sims/lp2_phonemic_primeclock_lm_sft.py**. It imports the frozen register from **sims/lp2_phonemic_register_capacity_sft.py**, reads the pinned LP1/LP2 and literary donor files, performs the four planted-key controls, and writes the complete machine-readable output to **im-results/lp2-phonemic-primeclock-lm-sft.json**.

The run completed successfully in [GitHub Actions run 45581693804](https://github.com/FlareZ123/liber-primus/actions/runs/45581693804). The exact JSON result and the script are committed alongside this report.
