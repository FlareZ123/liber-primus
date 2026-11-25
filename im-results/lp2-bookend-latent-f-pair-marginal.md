# Terminal bookend: exact paired transparent-F marginal inverse, with ascertainment removed

Agent28, 25 November 2026. **No recovered plaintext; conditional evidence for the specified shared consuming pad is negative.** An uncorrected positive Bayes factor at the unique repeated ciphertext anchor would be misleading.

## Source and receiver
The exact six-rune source repeat p55 local70–75 ↔ p27 local28–33 fixes the previous cyclic p27 chapter receiver: its last42 runes then first34 runes (76 total). The additional matching AE across p55→p56 is independently deciphered as A on p56. These are the source-selected 76 and 77 pairings, not evidence of pad reuse. The 77 variant pins p56's actual terminal A in the reversed receiver. Both tapes may contain independent literal plaintext F holds, including ciphertext F emitted by a consuming non-F rune. Their arbitrary secret additive pads are shared from the *end of their consuming tapes*, with any unmatched prefix independently uniform. No printed word boundaries, dictionary, guessed plaintext words, phase search or fixed F masks.

Train a hierarchical reversed GP29 trigram prior from the first 70% of pinned Gibran/Shakespeare/Emerson, half-count unigram, bigram prior mass16, trigram mass32. The reverse direction is selected by the source bookend. For each possible complete sequence of F holds immediately before a next consume, choose its exact number on each tape. When both tapes still consume, enumerate p∈1..28, q=p+C_B−C_A mod29, q nonzero; shared key draw contributes 1/29. When one tape has ended, a nonhold draw on the other is independently uniform. A literal hold contributes its conditional F probability and no pad draw. Every pair of hold masks has exactly one canonical path, so summation is exact rather than counting arbitrary interleavings. Merge by two physical cursors and the two two-rune contexts; marginalize exhausted tape contexts. Max-product traceback gives a candidate and exact forward replay; sum-product likelihood compares against independent-pad marginal likelihood with the same F model and known terminal constraint. No beam or state cap.

The first enumerated-mask implementation timed out; the merged solver computes exact sum and max. On control0 the initial merged implementation and exhausted-context optimization agree to 3e−13 nats and identical Viterbi candidate, reducing visited states from 4,132,065 to 427,772.

## Calibrated results
| Pair | Shared log BF | Independent log BF | Shared MAP rune recovery A/B |
|---|---:|---:|---:|
| held donor 0, 76 | +3.238897 | −1.917527 | 5/76, 2/76 |
| held donor 1, 77 known A | +1.918173 | −2.686605 | 10/77, 11/77 |
| held donor 2, 76 | +1.196188 | −2.736603 | 19/76, 16/76 |
| held donor 3, 77 known A | +5.086325 | −1.281849 | 9/77, 11/77 |

Four nonoverlapping held donor pairs, independent uniform shared-vs-independent pads, deterministic seed. Two known-end controls explicitly set both donor endpoints to A; the solver constrains only first tape A, analogous to the known source p56 boundary. These modest controls separate by marginal sign, **not** by complete plaintext accuracy; even the true shared model's MAP often gives wrong fluent fragments. Do not call this a high-accuracy decipherer.

| Original receiver | Full log BF | Selected anchor only | Conditional remainder log BF |
|---|---:|---:|---:|
| p55 / cyclic p27 76 | +6.200519 | +7.340291 (six runes) | **−1.139772** |
| p55+p56 / cyclic p27 77, actual A | +7.327338 | +8.475609 (seven runes) | **−1.148271** |
| p55 / cyclic p27 70 with selected six removed | −1.044024 | n/a | n/a |
| p55 / art-linked p32 offset19 | −4.958488 | n/a | n/a |

The 6/7 repeated original anchor contains only nonzero ciphertext, so all these positions necessarily consume and the shortened reversed joint receiver is exactly the marginal prefix model of the full receiver. Conditioning on the chosen anchor therefore subtracts its exact log BF from the full value. This corrects the major ascertainment effect without treating deletion/reset of language context as a conditional likelihood. The full original pair exceeds all four positive controls only because of the deliberately selected repeated ciphertext. The 70 unselected positions do not support the model. Original candidate strings are nonprose with isolated optimization artefacts. The art-linked p32 offset19 was selected by earlier statistics; it is only a bounded extension of the previous no-F Viterbi negative.

**Decision:** do not infer shared key or plaintext from the full-bookend BF or its decoded repeated YOUGHT fragment. The selected repeat itself fully accounts for the superficially positive result. This negative is probabilistic under the specified independent donor prior, end-aligned consuming pads and small calibration set, not a theorem excluding all shared keys or alternate language. The exact paired DP can be reused if a new independently selected source pairing or known text becomes available.

[SFT](../sims/lp2_bookend_latent_f_pair_marginal_sft.cjs), raw `lp2-bookend-latent-f-pair-{0..13}.json` (all executed indices). Code runs from repo root with the case index. Actual V8 execution; no separate Windows CI. Earlier intact-group p27/p55 affine obstruction remains independent of this spacing-free marginal. No original plaintext, authentic key or solve destination.
