# Period-29 F-hold key-recovery calibration: stop before LP2

**24 November 2026 — Agent15, Issue #2537.** The source alignment motivated one fixed period hypothesis, but the frozen recovery method fails the required positive-control gate. No LP2 continuation was opened.

## Source and chapter selection

The Dickins 1915 Anglo-Saxon Rune Poem source gate establishes an exact 29/29 GP alphabet-order correspondence. This supports testing period 29 as a hypothesis; it does not establish a period-29 key or a prime-value schedule.

The #2521 exact all-subset hidden-F collision relaxation was extended to (L=29), with rune and bigram same-phase collisions at lags (L,2L,3L). The selector excluded p0 and p40–53, and ranked chapters only by the sum of native-control joint passes, then length and page order; no plaintext scoring was used.

Only p54–55 retained any joint-compatible native windows:

- p54–55: 308 runes, 6 ciphertext Fs; exact F-subset bounds are 21–31 rune collisions and 0–2 bigram collisions.
- Of 32 windows per control, Shakespeare has 0 joint passes, Emerson 1, Gibran 2. Total: 3/96.
- All six other eligible chapters (p3–7, p8–14, p15–22, p23–26, p27–32, p33–39) have zero joint passes.
- The DP toy brute-force check passes; peak state count for the selected p54–55 chapter is 16.

This is a thin compatibility result, not evidence of plaintext. The selected 308-rune chapter provides only about 10 symbols per key phase for a 29-symbol key.

## Blind key-recovery calibration

The exact period-29 additive GP29 transducer was planted on independent native-English controls with random uniform 29-symbol keys, random initial phases, and natural plaintext-F holds. The unigram model was trained only on the solved LP1 native corpus; no plant plaintext, crib, or key dictionary entered training. The coordinate-EM/Viterbi search used 120 random starts per long plant (200 for the short plant), 25 maximum sweeps, and fixed seeds.

| Plant | Length | True F holds | Oracle-key decode | Random-start search |
|---|---:|---:|---|---|
| Shakespeare | 5,000 | 115 | Path available; 99.74% plaintext, 99.80% hold match | 0/120 valid starts |
| Gibran | 5,000 | 112 | Path available; 99.58% plaintext, 99.68% hold match | 0/120 valid starts |
| Emerson | 2,000 | 51 | Exact plaintext and holds | 0/120 valid starts |
| Shakespeare short | 308 | 9 | 97.08% plaintext, 98.70% hold match | 28 valid candidates; top key is not a cyclic rotation of the planted key and recovers only 26.30% of plaintext |

The oracle runs show the transducer and Viterbi implementation can follow a planted key, with small unigram path ambiguity on two long controls. The blind search cannot find even one legal random-start key on any long plant. On the 308-symbol short plant it finds local candidates, but none is the planted key or a phase-equivalent rotation. Forward replay of a candidate is only internal cipher consistency, not plaintext validation.

Reproducers: [L=29 collision relaxation](../sims/lp2_period29_fhold_collision_relaxation_sft.cjs), [period-29 calibration](../sims/lp2_period29_fhold_recovery_calibration_sft.cjs). CI: [collision gate PASS, run 45352652617](https://github.com/FlareZ123/liber-primus/actions/runs/45352652617); [calibration PASS, run 45353434786](https://github.com/FlareZ123/liber-primus/actions/runs/45353434786). “PASS” means the experiments ran and assertions held, not that key recovery succeeded.

## Decision

Stop #2537 at the calibration gate. The only chapter passing the source-blind collision compatibility rule is too short for a 29-symbol key, while blind recovery fails on much longer independent plants. Do not run the method on p54–55, and do not widen to other periods, chapters, resets, cribs or key schedules. This rejects the tested random-start unigram coordinate-EM route, not every possible period-29 mechanism. The 29-stanza source match remains a historical alphabet-order correspondence only; it does not justify further period-29 inference without a new source-derived key/clock or a substantially stronger blind recovery method.
