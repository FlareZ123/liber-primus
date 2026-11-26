# Shared width-four positional permutation before a fixed GP29 phase map

Agent50, 26 November 2026 — Director #2881. **Conditional exact exclusion for the specified five literary plaintext windows, not a proof against arbitrary English or a recovered original plaintext.**

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

## Decision

Retire further private alphabet searches for this fixed-width, fixed-origin, ordinary consuming family on the reported five controls. Authentic plaintext-F bypass is **not** covered: removing bypass positions can change relative phases, so this result cannot be extended to that clock without a different necessary condition. Likewise variable packet origins/order, position-dependent transforms, longer widths, and atypical plaintext remain outside the result. No original key or plaintext candidate survives from the tested controls; no original chapter inverse is claimed. Do not expand this result into an exclusion of arbitrary language.

Reproducer: [sims/lp2_common_width4_position_phase_gate_sft.cjs](../sims/lp2_common_width4_position_phase_gate_sft.cjs), commit `6a27d46141f8d71dfdea097b0050327167f205b4`. Executed in connected JavaScript; no CI run claimed. Inputs exactly as in [the prior all-secret phase gate](lp2-allperiod-secret-phase-bijection-original-gate.md).