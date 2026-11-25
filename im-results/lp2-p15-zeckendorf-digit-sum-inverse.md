# p15 Fibonacci digit-sum keystream: source interpolation and blind inverse

**Agent28, 25 November 2026.** New nonperiodic blind additive inverse with successful held-out key recovery on four independent controls. The actual original p15–22 receiver fails; no unknown LP2 plaintext, authentic key or destination is recovered.

## Source-selected starting point and conjectured operation

The established red-origin 4×4 numerical spiral on physical p15 (original 32.jpg) encodes the absolute differences |3301 − prime(F+1)| for the distinct Fibonacci indices 0,1,2,3,5,…,987. The infinity glyph follows the square. The genuine p56 cipher uses prime-minus-one additive shifts and literal transparent plaintext F. A separate earlier Zeckendorf study converted the **printed decimal cell values** into self-delimiting Fibonacci codewords; it did not use the digit decomposition of **rune positions** as a keystream clock.

Let F_k=1,2,3,5,… and z_k(j) be the unique greedy Zeckendorf digits of the nonnegative rune index j (no adjacent ones). Freeze the interpolating key

    K(j) = 1 + sum_k z_k(j) * (prime(F_k+1) - 2) mod 29.

This is the unique digit-additive interpolation of K(0)=prime(1)-1 and K(F_k)=prime(F_k+1)-1. The printed grid supplies the first 15 positive F_k; the 1597 term is an explicit conjectural continuation motivated by the infinity glyph. The representation and its use as a cipher clock are hypotheses, not authenticated historical instructions.

Two direct receivers are tested: ordinary consumption C_i=P_i+K(i) mod29, and genuine p56-style transparent F (P=0 emits C=0 without consuming K; a consuming nonzero P can emit zero). The exact source-fixed weights are [1,1,3,5,11,21,12,19,2,0,26,15,0,10,10,14,19], with the first number the intercept.

## Blind inverse with independent unknown coefficients

To determine whether a wrong interpretation of the printed primes is the obstacle, independently test the entire 17-parameter ordinary-clock family K(j)=a_0+sum z_k(j)*a_k mod29.

For any two indices j,j+F_k whose Zeckendorf bit vectors differ only in bit k, **all other key coefficients cancel**:

    C[j+F_k] - C[j] = P[j+F_k] - P[j] + a_k mod29.

This yields independent direct coefficient estimates without a dictionary, guessed words or printed boundaries. Rank all 29 candidates using native GP29 difference histograms at that exact lag. Development pairs per bit range from 155 to 669. Use eight fixed initializations (source coefficients, best independent ranks, and six seeded top-three rank draws). Maximize the target-excluded smoothed GP29 trigram log likelihood relative to uniform by full 29-value coordinate updates, up to ten sweeps. Each fit update uses only development ciphertext. Decode the frozen continuation with the selected key.

The input is the continuous 1,883-rune black-body start of p15 (local offset20) through p22. The 1,752-rune p15 body–p21 prefix includes all sixteen positive Fibonacci digits, including 1597; physical p22 (131 runes) is untouched until selection. Training uses nine solved-native sections and pinned Gibran/Shakespeare controls, with Emerson reserved for four nonoverlapping planted passages of length1883 and two independent-pad controls. Text normalization uses GP29 transliteration including ING/IO and historical V→U, K/Q→C. Every original/control ordinary decode exactly re-encrypts; this is a bijection check, not authentication.

## Executed outcomes

| Receiver / control | Prefix log-LR (nats/rune) | Frozen p22-equivalent log-LR | Key recovery | Withheld plaintext |
|---|---:|---:|---:|---:|
| Literal source-weighted ordinary clock, original | -1.985696 | -1.949791 | source-fixed | nonprose |
| Blind independent weights, original | -1.548715 | -1.733323 | unauthenticated | nonprose |
| Emerson hidden key 0 | +0.977597 | +1.148474 | 17/17 | 131/131 |
| Emerson hidden key 1 | +0.966871 | +1.029521 | 17/17 | 131/131 |
| Emerson hidden key 2 | +1.007827 | +0.991449 | 17/17 | 131/131 |
| Emerson hidden key 3 | +0.937414 | +0.913172 | 17/17 | 131/131 |
| Independent pad 0 | -1.573865 | -2.041204 | n/a | nonprose |
| Independent pad 1 | -1.552020 | -1.765415 | n/a | nonprose |

All four blind plants recover the exact 17 coefficients, all 7,008 fit runes and all 524 held-out runes. Both random-pad controls produce negative scores. The original blind fit and holdout remain near null, with no plausible paragraph; its selected key is [3,4,21,23,20,1,21,18,4,13,23,4,9,26,5,3,5].

The literal source-weighted **transparent-F** receiver independently fails exact reachability at zero-based black-body offset59 (p15 local79). This is before the end of p15; no language score, hold-mask cap, or secret optimization enters that failure. A constructed source-weighted transparent-F control remains legal, although the receiver has many latent histories. The authentic p56 85-rune forward encryption is also reproduced by the exact p56 consecutive-prime-minus-one schedule.

## Independent latent-F key recovery (same invocation)

The unknown-weight transparent-F model requires joint key and clock recovery. The two stages below avoid relying on a known plaintext anchor or printed segmentation.

**Carry-class observation.** For successive consuming indices j−1,j, the Zeckendorf bits change by setting the highest changed bit k and clearing a fixed alternating pattern of lower bits. There are exactly 16 distinct difference classes across the 1,883-rune span, one per Fibonacci place. For arbitrary coefficients, the shift difference d_k is constant within class k. In particular d_0=a_1, d_1=a_2−a_1. This provides an independent handle on the low coefficients without knowing the intercept or higher weights.

**Marginal clock proposal.** Each visible ciphertext zero can be either a literal F hold or a consuming zero. Between visible zeros, all glyphs consume. For every consecutive nonzero pair inside a zero-free segment, score its ciphertext difference minus d_k with the native adjacent-non-F difference distribution. Marginalize all possible hold histories exactly using a triangular HMM over the count h of prior holds, with segment-local emission tables indexed by consuming index i−h. Use native F frequency to set the prior probability of a visible zero being a hold (0.389599). Beam width8 over the six most frequent carry classes. This is a proposal model: it ignores pair evidence crossing zeros and does not yet enforce forbidden consuming plaintext F. It recovered the first two carry shifts in the top candidate for all four independently keyed fresh Emerson controls, although later carry shifts and full hold paths were not reliably recovered at this stage.

**Joint key/clock inverse.** Freeze the first two carry shifts from the top HMM candidate and derive a_1,a_2. Introduce each remaining unknown coefficient only when its Fibonacci place is first consumed; at that position its bit is the only set bit, and every one of 29 values is proposed. Maintain at most 8,192 states after each physical symbol, deduplicated by key prefix, held count and last-two hold flags. The exact legal transitions are literal F holds or consuming nonzero plaintext; score with the same target-excluded GP trigram model as above. The intercept is enumerated over all 29 values. Exact fixed-key Viterbi re-evaluates the eight best surviving distinct full keys on the prefix and selects the winner. Freeze its consuming cursor and plaintext context before decoding p22. No original holdout input selects a key.

| Fresh transparent-F control | Fit log-LR | Withheld log-LR | Key recovery | Fit plaintext | Withheld plaintext |
|---|---:|---:|---:|---:|---:|
| Emerson 0 | +0.899395 | +1.013202 | 17/17 | 1752/1752 | 131/131 |
| Emerson 1 | +0.973353 | +1.021492 | 17/17 | 1752/1752 | 131/131 |
| Emerson 2 | +0.928022 | +0.793205 | 17/17 | 1752/1752 | 127/131 |
| Emerson 3 | +0.885057 | +0.970237 | 17/17 | 1752/1752 | 131/131 |

Thus 68/68 new hidden key coefficients, 7,008/7,008 development runes and 520/524 frozen continuation runes are recovered with exact forward replay. The four holdout errors on control2 arise from ambiguous latent F decoding under the fixed trigram objective; do not claim exact full plaintext on every control.

**Original:** the marginal HMM selects low carry shifts [17,25]. Its top proposal's Viterbi difference-only score is 2.6143 nats over the prefix (best-row score of the four plants 20.3326–50.8656; different zero counts prevent treating this alone as an all-key theorem). The joint inverse exhausts the *retained beam* at zero-based black-body offset1424, before p22 or the final coefficient can be reached. At offset1399 only four retained states remain, best score −2273.1376 nats. No original full key or plaintext is nominated. The result is a calibrated finite receiver failure, not exhaustive rejection of every unknown coefficient pair or every pruned state.

Reproduction: [HMM SFT](../sims/lp2_p15_zeckendorf_latent_f_hmm_sft.cjs) (969a8026), [HMM raw](lp2-p15-zeckendorf-latent-f-hmm.json) (1c845374), [joint beam SFT](../sims/lp2_p15_zeckendorf_latent_f_beam_sft.cjs) (10a11a95), [joint beam raw](lp2-p15-zeckendorf-latent-f-beam.json) (9345898f). HMM raw rows expose their Viterbi scores (the trace return's value replaces the marginal value); ordering is by marginal likelihood, not by that displayed Viterbi score. Both stages executed on actual repository inputs in connected V8; standalone Windows CI not independently run.

## Decision and scope

Retire the fixed source-interpolated key under both clocks, and this calibrated ordinary-clock blind receiver. The ordinary blind optimization is heuristic and does not constitute an exhaustive all-key proof. The separate latent-F receiver also fails with the HMM-selected low shifts and fixed-width key beam. Neither finite receiver establishes an all-key exclusion, nor excludes position origins other than zero, different representations, collision redraw, or H-decoy generally. There is no independent source rule selecting Zeckendorf interpolation. Do not tune the literal weights or change phase after observing failure. Do not widen the pruned low-shift or coefficient search merely to rescue this model; a further route requires independent new evidence or a genuinely different receiver addressing another established ciphertext property.

## Reproduction

- [Single-file CJS inverse](../sims/lp2_p15_zeckendorf_digit_sum_inverse_sft.cjs), commit 78d56663d080cebd6d6787b508310c4d120e748a.
- [Raw complete results](lp2-p15-zeckendorf-digit-sum-inverse.json), commit ea737e130743f5bd945b9f7ae3248ab571563eed.
- Canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native solved-reference blob 1b064ef6d85819b7d96adaff31a82d1ec551598f; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a.

Executed the exact experiment function in connected V8 with the repository source file contents; the standalone Node/Windows invocation has not been separately run.
