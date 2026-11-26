# Shared width-four positional permutation before a fixed GP29 phase map

Agent50 (ordinary consuming clock) and Agent5 (plaintext-F hold), 26 November 2026 — Director #2881. **Exact finite-control exclusions for five pinned literary windows under the stated width-four register; not a proof against arbitrary English or a recovered original plaintext.**

## Model and independently fixed register

Motivation: the genuine p15 four-by-four object supplies a tentative width-four cue (not an authenticated position-order instruction). Extend the existing all-secret fixed-phase obstruction to every common permutation of four consecutive input positions. This differs from the earlier shared four-rune *value* bijection. A single permutation p of {0,1,2,3} moves rune at input index 4b+r to output index 4b+p(r); the subsequent deterministic GP29 map can be entirely private at each phase. Ordinary rune-consuming clock only. No word boundaries or guessed plaintext words are required. Use the physical p0–55 rune stream, N=12,956, p50 empty, with either a single global packet origin and clock or the existing nine authentic illustration-chapter starts as packet and clock origins. The final incomplete packet at each chapter end stays in place. No page-based packet reordering or dropping p54/p55 carry.

The two tested clock regimes are global q=1..3301 and nine chapter-local q=1..1033, with common position order but independent phase maps in each chapter. Five frozen controls exactly match Agent22's prior all-secret gate: Crowley windows at 0, 4327, 8655; Blake windows at 0, 5675, each 12,956 runes, using the same GP tokenization. These are overlapping windows from two writers, not independent samples from all English.

## Exact lag constraint

Let X be a candidate plaintext after the shared positional permutation. If i and j have the same phase, X_i=X_j implies C_i=C_j for any deterministic phase map, and is equivalent for a bijection. Thus the count M_C(q) must be at least M_X(q). To avoid searching value keys, compute once the histogram H[a,b,d] of every equal-rune input pair, where a,b are within-packet offsets and d is the difference in packet index. Use a separate offset type for unchanged incomplete fringes. Under p the corresponding output lag is |4d+p(b)-p(a)| (fringe offsets map to themselves). Sum the remapped histogram over positive multiples of q. It counts exactly every equal-rune pair sharing a phase. For chapter resets, accumulate histograms only for pairs within the same chapter. The implementation uses all 24 permutations, no score-selected order. Direct bucket counts independently agree at q=1,7,840 and the regime endpoint for every donor/order combination. Original q840 anchor counts 3277 global and 267 chapter reproduce the previous result.

## Original result

| Clock | Orders × donors × periods | Cases satisfying necessary inequality | Minimum donor-minus-original gap | Closest case |
|---|---:|---:|---:|---|
| Global q1–3301 | 396120 | 0 | 359 | q3151, Crowley-8655, p=[2,1,0,3], original 772 vs donor 1131 |
| Nine chapter q1–1033 | 123960 | 0 | 71 | q1009, Crowley-8655, p=[0,2,1,3], original 232 vs donor 303 |

All 520080 comparisons violate the necessary inequality. A common width-four pre-permutation cannot repair the all-secret phase-count discrepancy for these exact native-language controls. This also covers non-injective deterministic maps, though their lossless inversion would require additional information.

## Planted constructive inverse

Use 729 genuine GP29 donor runes as known plaintext, encrypt with unknown width-four order and unknown additive q≤20 phase key, search the 24 orders and infer the key algebraically from aligned differences. No language optimization. Only p=[2,0,3,1] is consistent, at q7 and its alias q14; select primitive period 7. Recovered key [1,12,7,19,4,25,11]. Freeze both parameters, then apply the inverse to an independent 1145-rune donor window encrypted under the same chapter reset and order. Exact 1145/1145 recovery and replay. Incorrect orders fail the register constraint on the training plant. This is a *known-plaintext* calibration, not a blind ciphertext-only solve; it does not establish the authentic historical operator. The first implementation asserted a unique raw period and correctly failed on q14's alias; the final implementation selects the unique minimal period rather than suppressing equivalent solutions.

## Authentic plaintext-F-hold extension (Agent5, 26 November 2026)

### Model and exact necessary conditions

Retain the same common permutation of four consecutive plaintext positions, applied before the GP29 value cipher. The native plaintext-F rule is literal: plaintext F (GP29 index 0) emits F and does not consume a key symbol; every other rune consumes one symbol of the fixed-period phase map. No printed word boundaries or language score are used.

For each candidate donor and each of the 24 common position orders, first apply the permutation with packet origin zero independently at the start of the global tape or each of the nine authentic chapter segments. A candidate is impossible if any permuted plaintext-F position is not an F in the original ciphertext. This condition is independent of key, period, and whether the phase map is injective.

If the F-position condition holds, delete those held positions from both sequences. For every consuming period q, let M(q) count equal-rune pairs whose compacted positions differ by a multiple of q. Any deterministic phase map requires M_cipher(q) >= M_plain(q): equal plaintext symbols at the same consuming phase cannot produce different ciphertext symbols. The implementation computes this exact lag condition for every q in the frozen global/chapter ranges; it does not score language.

### Original result

The source is the canonical 12,956-rune physical p0-p55 tape, with 458 ciphertext F runes. The five fixed, full-length historical windows contain 376, 388, 381, 334, and 309 plaintext F runes respectively (Crowley starts 0/4327/8655; Blake starts 0/5675).

**No one of the 24 orders is F-compatible for any of the five windows**, in either register. The minimum number of plaintext-F positions that fail the required ciphertext-F condition, after minimizing over all 24 orders, is:

| Fixed donor window | Global packet origin | Nine chapter-reset packet origins |
| --- | ---: | ---: |
| Crowley, start 0 | 358 | 357 |
| Crowley, start 4327 | 368 | 367 |
| Crowley, start 8655 | 367 | 360 |
| Blake, start 0 | 315 | 312 |
| Blake, start 5675 | 294 | 294 |

Thus all 240 donor/order/register combinations fail before period or key constraints are considered. Since no order passes the exact F-position condition, the subsequent collision-lag inequality is not invoked on these original comparisons. This is a stronger positional rejection of these five fixed plaintext windows, not a universal statement about English or arbitrary plaintext.

### Positive and wrong-register calibration

Three deterministic known-plaintext plants used hidden common orders and periods q=7, 8, and 13. Each used 728 training runes and an independent 1,144-rune held-out window. Exhaustive recovery over all 24 orders and periods 1-20 recovered each exact order and key; all 1,144 held-out runes were predicted exactly. For each plant, testing packet origins 1, 2, and 3 produced zero training solutions. These are synthetic calibration controls, not original-cipher evidence or blind ciphertext-only key recovery.

Reproducer: [sims/lp2_common_width4_position_fhold_gate_sft.cjs](../sims/lp2_common_width4_position_fhold_gate_sft.cjs). [Windows Node22 run 45747236229](https://github.com/FlareZ123/liber-primus/actions/runs/45747236229). Raw output: [lp2-common-width4-position-fhold-output.json](lp2-common-width4-position-fhold-output.json).

## Decision

The ordinary-consuming family is conditionally excluded for the five stated literary windows by the earlier exact all-period collision gate. The authentic plaintext-F-hold extension independently rejects those same five fixed windows for every common width-four order at packet origin zero, in both the global and nine-chapter reset registers, because their held-F positions cannot be aligned with original ciphertext F positions. The synthetic controls show that the implementation can recover planted order/key pairs and discriminate the tested wrong packet origins.

This is **not** an all-key impossibility result for unknown plaintext, arbitrary English, other languages, nonzero original packet origins, different packet widths, variable/stateful position transforms, or other cipher architectures. The p15 4×4 numeric panel is only a tentative width cue; it does not authenticate a position permutation or its order. No original chapter inversion was justified after the exact F-position gate rejected every fixed donor/order. No unknown LP2 plaintext, key, or destination is recovered.

Reproducers: [ordinary-consuming gate](../sims/lp2_common_width4_position_phase_gate_sft.cjs) and [plaintext-F-hold gate](../sims/lp2_common_width4_position_fhold_gate_sft.cjs). The F-hold gate passed [Windows Node22 run 45747236229](https://github.com/FlareZ123/liber-primus/actions/runs/45747236229). Inputs are the pinned original corpus and the five fixed historical donor windows described above.
