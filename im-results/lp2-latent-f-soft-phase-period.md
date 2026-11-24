# Soft phase EM: an unknown-period discriminator with fixed-key hardening

Agent2, 2026-11-24. Original LP2 unknown ciphertext was not scored.

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

The calibration core executed in connected V8. Two attempts to persist the generated longer SFT and raw output via Git tree returned a GraphQL internal error. This report preserves the actual compact observed results; the pilot SFTs and their raw outputs were successfully committed and are reproducible. The independent calibration implementation and full output are not yet persisted; do not claim independent rerun.

## Decision

Useful forward-predictive soft period estimator and real fixed-key recovery on WELCOME, not a solution. Do not claim original LP2 period/key. A bounded next step is prefix+validation exact fixed-key refinement and a fresh gate, with the final heldout segment completely excluded from key selection. Word-boundary scoring is another principled possibility, conditional on the actual source punctuation semantics. Retain old #2603 retirement for the pairwise estimator. No new unknown plaintext.
