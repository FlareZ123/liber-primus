# Two-ended triangular GP29 prime-clock inverse (#3131)

**Decision:** exclude the fixed two-pass prime-clock architecture as a shared ordinary-GP receiver on p40–53 and p54–55. All 841 coefficients fail original p40–53 under exact intermediate F-holds. Ordinary-clock fitting gives null-like heldout text and cannot reproduce the long chapter's low-repeat count in 24 independent native windows per key. No unknown plaintext/key recovered.

## Receiver and relation to earlier work

Freeze the authentic p56 prime-minus-one sequence r_j, reset at the source chapter boundary; all arithmetic mod29. For the ordinary model let X_i=P_i+r_i. For the F variant let X_i=0 for literal plaintext F=0 without advancing j, otherwise X_i=P_i+r_j and increment j. Then

    U_i = X_i + a*U_(i-1)
    C_i = U_i + b*C_(i+1)

with U_(-1)=C_N=0. Given any a,b, invert U_i=C_i-b*C_(i+1), X_i=U_i-a*U_(i-1); for i>0 this is the three-tap expression (1+ab)*C_i-a*C_(i-1)-b*C_(i+1). The first rune instead uses X_0=C_0-b*C_1. Thus the two triangular maps are exactly reversible for all 841 keys. The ordinary clock is bijective; the intermediate F-clock can have multiple legal plaintext histories, and is **not** claimed to be uniquely invertible. Mixing hides literal F in X, not necessarily C. We tested this one placement only.

The [unclocked bidirectional containment](lp2-bidirectional-diffusion-containment-output.json) gives an earlier three-tap collision exclusion but does not cover subtraction of the nonstationary prime tape or ambiguous F cursor. The [one-way two-lag receiver](lp2-prime-carry-two-lag-feedback-gate.md) uses past observed ciphertext alone and is a different boundary law. The p15 [overlapping lifting source gate](lp2-p15-overlapping-lifting-source-typing-gate.md) concerns a four-lane source interpretation, not these full-chapter passes. No original source selects the added two-ended mixing.

The exact F reachability maintains all possible j. At X_i=0 permit a nonconsuming literal hold; also permit a consuming step whenever (X_i-r_j) mod29 !=0. Empty reachable set is an exact exclusion. The F Viterbi adds two preceding plaintext indices to j, merges by maximum fixed native trigram score, freezes prefix key and best prefix state, then decodes continuation without reselecting. Whole-interval best paths for surviving keys are a separate permissive diagnostic. Ordinary scoring uses the same conditional trigram trained on solved GP records, with fixed smoothing 0.5.

## Controls and original fit

All six blinded ordinary plants from three independent literary references (308 and 3008 runes, hidden keys (7,11), (13,5), (19,8)) recovered the unique true pair and every rune (9948/9948). Actual p56 at a=b=0 F-hold replays 85/85. Six F plants retain the true cursor and recover the correct pair at rank1; prefix ambiguity remains. Terminal heldout recovery 228/228; longer heldout 4479/4524; full F plant recovery 9682/9948. These are calibration, not evidence of the original mechanism.

Original p54–55 is one continuous 308-rune input, fit first physical p54=232 and predict p55=76, including its initial NG belonging to the cross-page 11-rune carry. No word resets, no red-heading-as-key claim. The known following ciphertext symbol at the seam is a required reverse-pass operand, not revealed plaintext. Long independent chapter p40–53, 3008 runes, fits first1500 and predicts next1508.

| Original scope | Ordinary best (a,b), fit / continuation | Native continuation minimum | F exact full keys /841 | Frozen F fit / continuation |
|---|---|---:|---:|---|
| p54–55 | (9,27), -3.3885 / -3.4804 | -3.2132 | 9 | (27,22), -3.4007 / -3.4119 |
| p40–53 | (21,21), -3.4225 / -3.4474 | -3.0766 | **0** | no legal training key |

No readable original continuation. Terminal F full-key best is (27,22), -3.4032 over the complete tape; all nine full paths are nonprose under the fixed model. The exact zero-path long negative is independent of language, scores, F mask and key preferences; even the longest survivor dies at offset496, i.e. rune497. The terminal original ordinary holdout score is in the range of eight matched uniform-fit negatives; longer likewise. F plant ambiguity and score overlap prevent claiming universal English exclusion.

## Required joint repeat explanation

For every key and clock generate 24 fixed donor windows (eight each Shakespeare, Gibran, Emerson, disjoint from the planted test windows); compare observed C adjacent equalities and IoC to the finite simulated ranges. Also generate 24 uniform GP controls and 24 uniform-off-diagonal tapes conditioned on the exact observed repeat count (matched low-repeat null). These are finite reference comparisons, not independent statistical p-values.

| Original scope | Actual repeats | Ordinary generated range (all 841x24) | F generated range | Ordinary / F joint range pass keys |
|---|---:|---:|---:|---:|
| p54–55 | 3 | 1–25 | 1–27 | 113 / 102 |
| p40–53 | 18 | 65–150 | 68–212 | **0 / 0** |

Long uniform null 81–117 repeats (mean101.5), while the explicitly low-repeat-conditioned null matches original IoC (0.0345426 lies within 0.0343531–0.0346424). The best per-key native means are still 96.75 ordinary and 97.21 F. Therefore linear mixing with this fixed clock does not explain the long chapter's unusual repeat suppression. The finite range comparison alone does not reject the terminal chapter; its train/continuation diagnostics and complete F-path scores supply the bounded negative there.

**Research fork:** retire precisely the fixed zero-boundary, chapter-continuous prime-clock two-ended model. No alternate phase, coefficients changing within a chapter, other F placement, or source-unselected reset tuning. An independent nonlocal operator/clock clue is required for a successor.

[Standalone reproducible Node22 SFT](../sims/lp2_two_ended_prime_triangular_sft.cjs), [final successful Windows CI run](https://github.com/FlareZ123/liber-primus/actions/runs/45925572693), full output artifact 15166306948. Initial experiment run 45925428541 supplies the same feature/ordinary and exact reachability rows; final run adds blind F fits and all nine terminal F-path diagnostics. Inputs: pinned LP2 corpus and solved-native reference; source-native orthography helper; pinned Shakespeare/Gibran/Emerson reference texts. No new interpretation was tuned on original ciphertext.
