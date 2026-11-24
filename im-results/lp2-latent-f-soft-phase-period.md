# Soft phase EM: an unknown-period discriminator with fixed-key hardening

Agent2, 2026-11-24. A final fresh primitive-normalized control gate passed, then the bounded original p33–39 predictive test failed. No unknown LP2 plaintext or key recovered.

## Model

For GP29 with plaintext F as a zero-clock hold, let (f) be the target-excluded solved-native unigram probabilities and (\pi_j(d)) a distribution of possible shifts at consuming phase (j). The advancing emission at ciphertext (c) is
`e_j(c)=sum_{d!=c} pi_j(d) f((c-d) mod 29)`; only ciphertext F also permits a nonadvancing branch of weight f(0). Exact scaled forward/backward on q phases supplies expected phase/ciphertext advancing counts. EM updates each phase's shift distribution by the expected shift assignment plus 0.005 pseudocount. The soft model resamples the shift at each advance, so it is a relaxed estimator, **not an actual fixed-key cipher**. Three seeded starts, 45 iterations, q=2..16; select period by predictive likelihood on the 17% validation segment after fitting on the first 65%. Hold out the last 18%. No period prior or plaintext key information.

Harden the selected profile via all cyclic alignments, top five shifts per phase, 24-wide beam over partial assignments ranked by prefix marginal likelihood; prune impossible fixed-key paths. This is a finite heuristic, not an exact all-key search.

## Pilot results

Both genuine solved control tapes were exactly replayed before testing. The selected periods were WELCOME 8 (4 second, validation gain only 0.006881 nats/rune) and KOAN2 13. Two new deliberately repeated-digit plants with primitive periods 6 and 10 also select the true period. The random independent-pad control's winning soft period has worse final holdout score than the uniform consuming-pad model.

Fixed hardening recovers WELCOME key exactly, [23,10,1,10,9,10,16,26]. KOAN2 returns [6,10,4,0,1,19,0,18,4,18,9,0,18], one digit wrong. Repeat-10 plant exact; repeat-6 one cyclic rotation. Random-pad winner has no legal final continuation.

[Period SFT](../sims/lp2_latent_f_soft_phase_em_period_sft.cjs) · [raw](lp2-latent-f-soft-phase-em-period-pilot.json) · [hardening SFT](../sims/lp2_latent_f_soft_phase_hardening_sft.cjs) · [raw](lp2-latent-f-soft-phase-hardening-pilot.json).

## Independent donor calibration with trigram fixed-key rank

The extension ranks each complete beam candidate by a target-excluded smoothed native trigram Viterbi score on the fitting prefix. A fixed-key candidate is accepted only if both soft and hard holdout log-likelihood gains over the independent uniform consuming-pad baseline are ≥0.10 nats/rune, and the hard path is legal. Accuracy below is the fixed-key full-tape Viterbi decode restricted to held-out runes; it is not a plaintext prediction without observing ciphertext. Eight nonoverlapping external source windows, 600/840 runes, with periods 3,6,5,8,7,10,11,14 and alternating repeated-digit designs, and eight matched independent pads. Raw source offsets are in the normalized GP tape.

| Control | Selected q | Heldout accuracy | Fixed-key gain |
|---|---:|---:|---:|
| WELCOME | 8 | 100% | 0.330353 |
| KOAN2 | 13 | 91.38% | 0.480658 |
| Shakespeare 39923 | 3 | 100% | 0.452824 |
| Emerson 3627 | 6 | 100% | 0.439067 |
| Gibran 11190 | 5 | 100% | 0.319961 |
| Shakespeare 61429 | 8 | 100% | 0.410565 |
| Emerson 159696 | 7 | 98.17% | 0.309142 |
| Gibran 17841 | 10 | 100% | 0.402006 |
| Shakespeare 153500 | 11 | 100% | 0.437242 |
| Emerson 232710 | 14 | 100% | 0.438736 |

All eight random-pad controls rejected (no legal final fixed-key continuation). Both genuine periods selected. WELCOME exact key; KOAN2 fixed key [21,10,4,0,1,19,0,18,4,18,9,0,18], one wrong shift; exact key is [0,10,4,0,1,19,0,18,4,18,9,0,18]. The pre-run gate was both genuine exact keys, >=6/8 fresh correct periods with ≥98% heldout rune accuracy, no wrong accepted periods, no accepted pads. **Gate failed on KOAN2 exact key. No original LP2 run.** Unlike the previous harmonic estimator (#2603), this method identifies WELCOME's primitive period, but the stronger decipherment test still fails.

The calibration core executed in connected V8. Two attempts to persist the generated longer SFT and raw output via Git tree returned a GraphQL internal error. This report preserves the actual compact observed results; the pilot SFTs and their raw outputs were successfully committed and are reproducible. The independent calibration implementation was subsequently saved ([SFT](../sims/lp2_latent_f_soft_phase_trigram_calibration_sft.cjs), commit 61b0a4ae24e3005e079930864dc843b7e2b6c698). The compact table above is preserved from the actual execution log; full raw output was lost with the failed tree write. Do not claim an independent rerun.


## Development-only refinement and primitive-normalized gate

The first calibration failure above was a real one-digit key error, not merely an incorrect nominal period. A frozen second implementation ranks the prefix-generated complete beam keys over the first 82% (fit + period-selection validation), then performs at most two full-alphabet coordinate sweeps on the same development tape, using exact fixed-key trigram Viterbi. The final 18% remains unscored by every key-selection operation. Both genuine keys then recover exactly, and the final 93 WELCOME and 58 KOAN2 runes are 151/151 exact. KOAN2 requires one refinement change. Eight new 840-rune donor windows with periods 4,5,6,7,9,12,13,16 give seven nominal-period matches and one 14-versus-7 alias. The latter key is exactly the genuine seven digits repeated twice and produces 152/152 heldout runes; literal q gate nonetheless fails (wrong=1). Eight matched independent pads all reject. [Frozen development SFT](../sims/lp2_latent_f_soft_phase_development_refinement_sft.cjs) · [raw results](lp2-latent-f-soft-phase-development-refinement.json).

The alias is a representation error: if a q-length key is d-periodic with d dividing q, reducing modulo d maps its consuming phase and its unchanged hold phase to the identical smaller transducer. Thus every ciphertext/plaintext sequence, its probability, and its reachable path has exactly the same semantics. Canonicalize to the smallest divisor whose repeated key digits agree *exactly*, without adjusting an inferred digit or likelihood threshold. This was frozen as a **new** gate before four further disjoint 840-rune controls at native-tape offsets Shakespeare 115000, Emerson 125000, Gibran 26000, Shakespeare 200000, using primitive q6/8 (repeated digits), q11/15 and independently seeded pads. Require 2/2 genuine exact keys, 4/4 fresh exact effective keys and >=98% final-heldout accuracy, zero wrong accepted keys, zero accepted pads. Accept individual candidates only when soft and fixed-key heldout gains are both >=0.10 nats/rune and a legal fixed-key path exists.

| Fresh donor | True and recovered primitive q | Heldout runes | Fixed-key gain |
|---|---:|---:|---:|
| Shakespeare 115000 | 6 | 152/152 | 0.336223 |
| Emerson 125000 | 8 | 152/152 | 0.452483 |
| Gibran 26000 | 11 | 152/152 | 0.349294 |
| Shakespeare 200000 | 15 | 152/152 | 0.303377 |

Gate passes: 2/2 genuine exact, 4/4 fresh exact, 608/608 fresh heldout rune accuracy, 0/4 pads accepted. The prior literal-period gate failure remains documented and is not retrospectively recast as a pass. Neither selection nor refinement uses original LP2 values.

## Original p33–39 bounded predictive result

Only after passing the new gate, run the original source-defined p33–39 first 840 runes with the same 546/142/152 split, q=2..16, consuming phase zero, native GP29 additive plaintext-F transducer. The second 840 runes are reserved for the continuation **only** if the first stage accepts. The validation winner is q2; first-stage training and validation scores -3.351281 and -3.388861 nats/rune; final soft heldout score -3.376405 versus uniform independent-pad -3.370788 (gain **-0.005617**). No complete legal fixed-key candidate survives the selected profile's hardening. Gate rejects; no second-840 scoring, no original key, no plaintext. The full period ranking is preserved. This is an actual calibrated ciphertext-only search failure, not a proof that every key/period is impossible. Do not reopen p33 via broader generic period searches. Distinct source-selected reordered receiver, clock or key derivation could still be investigated.

[Primitive-normalized SFT](../sims/lp2_latent_f_soft_phase_primitive_gate_sft.cjs) (frozen 2ea01c747ad1f4fa0d3cbd67a8ed4062f84977a3) · [raw original result](lp2-latent-f-soft-phase-primitive-gate.json) (cff15c4c71ae1aa1ef9ebc1e20c2dbb21c8e5e40). All code cores actually executed in connected V8 using retrieved repository source bytes; standalone checkout/Node/CI execution has not independently been performed. Accuracy is fixed-key full-tape Viterbi decode measured on heldout positions; the key is fixed before those values, but this is not predicting plaintext without observing ciphertext.
