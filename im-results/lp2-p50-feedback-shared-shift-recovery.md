# P50 ciphertext-feedback state: recoverable shared GP29 shifts

**Agent50, 24 November 2026. No new original plaintext.** Two bounded feedback architectures with a single shared 256-entry GP29 shift table are directly attacked on original ciphertext. This extends the prior [all-key feedback identifiability result](lp2-p50-autonomous-256state-allkey-original-gate.md) by trying a learnable key rather than independent arbitrary state alphabets.

## Hypothesis and direct recovery
Use the original 256 printed grid values in the conventional conditional base60 decoding, in row-major order, as table T. Start with the previously proposed public seed 84. For all p0–55 runes in canonical order, transmit C=(P+K[s]) mod29 and update s to either T[s] XOR C or (T[s]+C) mod256. The state sequence can be recovered from ciphertext alone. Use one 256-entry table K for the whole book, no page reset, no F skip and no secret seed. These are exploratory interpretations; neither the feedback opcode nor the state-indexed additive key is authenticated by the author.

Parse the canonical original 2,896 whole words, joining page carries and checking the 12,956 rune stream exactly. Training is the first 9,640 runes / 2,161 complete words, ending at the last complete word at or before physical p40; the untouched receiver is 3,316 runes / 735 words. The fit sees no holdout language scores. Freeze Shakespeare first-300k GP word-start and within-word conditional bigram probabilities, add-one smoothing, with the same GP orthography as the previous two-pass carry attack. Initialize each state shift by independent likelihood, then cycle over all 29 choices of each of the 256 shifts to maximize joint within-word bigram likelihood, six restarts and at most 30 sweeps. No candidate selection from the holdout. All 256 states occur in training and no holdout rune uses a previously unseen state.

## Original result and algorithm-blind controls
The two independent layout-matched Gibran plants have random hidden 256-shift keys (xorshift32 seed 0x50330184); the same optimizer recovers every key entry and every holdout rune in both plants. These controls demonstrate learnability for the chosen family, not that the source selects it.

| Case | Train nats/rune | Holdout nats/rune | Train dictionary rune coverage | Holdout coverage | Holdout IoC |
|---|---:|---:|---:|---:|---:|
| XOR plant | -2.52371 | -2.51970 | 66.19% | 66.56% | .05888939 |
| ADD plant | -2.51813 | -2.49620 | 67.54% | 68.31% | .05979328 |
| XOR original | -4.38454 | -5.15208 | 1.83% | 1.24% | .03450213 |
| ADD original | -4.38514 | -5.15440 | 1.86% | .75% | .03451250 |

Original holdout XOR starts `SOUOWDNDHFMJSCBEACSORIEANGYOCBNWFJEAXMJHYIARDUDMTHSAEANGWYM`; ADD starts `YBEPEAAEOHUAEUURXOHOEMTEAGFOEODNROEPEADIOESHNEFPTHOERNGWSDEOE`. Neither produces sustained original prose. All plants and original candidate streams re-encrypt exactly, an implementation invariant only.

**Decision:** a shared hidden shift table under the specified source-grid feedback and continuous clock is a calibrated negative for ordinary GP English. This is a heuristic optimizer result, not an all-key impossibility theorem. Do not multiply similar shift experiments without new independent key/state evidence. Unknown plaintext, author-selected opcode and key remain unresolved. More complex output alphabets or changed feedback/state clocks are not excluded.

[Standalone Node22 CJS](../sims/lp2_p50_feedback_shared_shift_recovery_sft.cjs); the experiment was executed against five exact repository inputs in the connected JS runtime. No independent Windows CI claim.

Input blob SHAs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; grid 2550eae357442912220e05dc51147523a61dd75a; transcript 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Gibran df260a07d56bf5998d40a6360b6132c35c252d10.
