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

## Fixed-key collision-redraw extension

The observed scarcity of adjacent equal ciphertext glyphs motivates a distinct consuming rule: if a nonzero plaintext rune's next shifted ciphertext would equal the preceding emitted ciphertext, redraw with the next key digit, either certainly or with probability 0.8. Transparent F still emits zero and consumes nothing. The printed Fibonacci samples, sign, origin, and 1,883-rune source span are unchanged. Evaluate exact Viterbi states (consuming cursor, previous two plaintext symbols), including the log probability of an observed collision choice. No beam or cursor truncation enters this fixed-key test.

The extrapolated key has no consecutive equal shift values anywhere in the first 7,532 positions. One redraw therefore always removes a collision, so unrestricted repeated redrawing reduces exactly to one redraw on this finite source window. The saved raw table includes duplicate rows because the nominal unlimited cap evaluates to one.

Both deterministic and 0.8-probability receivers become **unreachable at body offset 155**, on p16. The most simultaneous reachable DP states were eight. Three fresh Emerson passages with the fixed key and each redraw probability demonstrate 5,253/5,256 fit and 392/393 holdout recovery for deterministic redrawing, and 5,247/5,256 fit and 393/393 holdout for 0.8 redrawing, with exact legal path replay. The same three source passages are used for the two redraw probabilities, so these are not six independent texts.

This excludes the frozen source-weighted key under these collision-redraw rules, independently of the language score. It does not exclude secret digit weights with collision redraw or unrelated mechanisms. [Code](../sims/lp2_p15_zeckendorf_collision_redraw_sft.cjs) (113b38af); [raw](lp2-p15-zeckendorf-collision-redraw.json) (26ff97c4).

## Blind collision-redraw extension

The exact fixed-key exclusion does not exclude a secret digit weight vector under collision redraw. Derive a spacing-free marginal carry-shift proposal and joint search with 0.8-probability **one** redraw on a provisional repeat. This is an explicitly hypothetical cipher rule, motivated by the original adjacent-repeat deficit; it does not assume that the deficit proves redraw.

For consecutive nonzero emitted ciphertext runes, if the new rune consumes normally at cursor j, then the observed difference D obeys D = ΔP + d_class(j). If it triggers a redraw, then ΔP = −d_class(j), and the emitted difference is D = d_class(j+1). These are distinct emissions with advance one or two. F hold advances zero and is allowed only when the visible rune is zero. Construct an approximate marginal HMM over consuming cursors with the native non-F adjacent plaintext difference distribution, independent native F probability, and uniform average emission for unassigned carry classes and prior zero context. Retain the four best d0 candidates; exhaust their 29 possible d1 values. Cap cursor overshoot at 180 in this proposal, not in the subsequent beam. The HMM is a proposal likelihood, not exact full language likelihood.

The top (d0,d1) is correct in all four fresh Emerson controls. Fix those two proposed shifts, enumerate all intercepts, introduce each later secret coefficient at its first used Fibonacci index, and branch exactly over legal ordinary, hold and one-redraw events. When a redraw reaches the first occurrence of a new coefficient at its second draw, the observed ciphertext determines that coefficient uniquely given the first shift and inferred plaintext. Deduplicate by key prefix, consuming cursor and actual two-rune plaintext context; retain 8,192 highest trigram-plus-redraw-log-probability states. Exact fixed-key Viterbi rescores the top eight distinct complete observed keys on the prefix, chooses the best, and freezes key, cursor and language context before any p22 decoding.

| Input | HMM top score (nats/rune) | Prefix joint score | Frozen continuation score | Identified coefficients | Fit / heldout runes |
|---|---:|---:|---:|---:|---:|
| Emerson 0 | +0.044823 | +0.970904 | +0.681093 | 17/17 | 1752/1752; 131/131 |
| Emerson 1 | +0.045829 | +0.971564 | +1.046309 | 17/17 | 1752/1752; 131/131 |
| Emerson 2 | +0.033109 | +0.995748 | +0.973968 | 17/17 | 1752/1752; 131/131 |
| Emerson 3 | +0.031092 | +0.951770 | +1.056975 | 17/17 | 1752/1752; 131/131 |
| Original p15–22 | +0.010594 | −1.430890 | unreachable at global body offset1760 | unauthenticated | nonprose; no complete path |

These are four new independent hidden-weight plants. All observable coefficients (68/68), all 7,008 fit runes, all 524 withheld runes, and all 209 source collision redraws and 201 literal-F holds are recovered exactly (the 2584-place coefficient is never reached, and is neither fitted nor credited). All decoded events replay the exact ciphertext and satisfy the original forward collision rule. The original HMM nominates [25,16]; original fitted key [3,25,12,18,2,17,24,18,10,12,17,8,14,6,25,6,4] gives nonprose and a complete legal prefix, with 38 F holds, 46 redraws, consuming cursor1760; its frozen best prefix state dies at physical p22 offset8. This is a scoped failure of the calibrated predictor, not an exact all-key impossibility or an exclusion of all prefix terminal states.

Reproducers: [marginal proposal](../sims/lp2_p15_zeckendorf_redraw_hmm_sft.cjs) (acbc7134), [joint inverse](../sims/lp2_p15_zeckendorf_redraw_beam_sft.cjs) (fed7cfbd), each takes index 0–4 (four controls, then original). Raw: [HMM original](lp2-p15-zeckendorf-redraw-hmm-4.json), [beam original](lp2-p15-zeckendorf-redraw-beam-4.json); replace terminal index 4 with 0–3 for individual controls. Five independently executed V8 jobs per stage, after a combined call disconnected without results. No separate Windows CI claimed.

## Decision and scope

Retire the fixed source-interpolated key under all three tested clocks, and this calibrated ordinary-clock blind receiver. The ordinary blind optimization is heuristic and does not constitute an exhaustive all-key proof. The separate latent-F receiver also fails with the HMM-selected low shifts and fixed-width key beam. Neither finite receiver establishes an all-key exclusion, nor excludes position origins other than zero, different representations, other redraw rules or unproposed/pruned redraw keys, or H-decoy generally. The calibrated one-redraw predictor also fails its original frozen continuation. There is no independent source rule selecting Zeckendorf interpolation. Do not tune the literal weights or change phase after observing failure. Do not widen the pruned low-shift or coefficient search merely to rescue this model; a further route requires independent new evidence or a genuinely different receiver addressing another established ciphertext property.

## Reproduction

- [Single-file CJS inverse](../sims/lp2_p15_zeckendorf_digit_sum_inverse_sft.cjs), commit 78d56663d080cebd6d6787b508310c4d120e748a.
- [Raw complete results](lp2-p15-zeckendorf-digit-sum-inverse.json), commit ea737e130743f5bd945b9f7ae3248ab571563eed.
- Canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native solved-reference blob 1b064ef6d85819b7d96adaff31a82d1ec551598f; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a.

Executed the exact experiment function in connected V8 with the repository source file contents; the standalone Node/Windows invocation has not been separately run.
