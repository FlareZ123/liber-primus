# Fixed two-lane whole-group weave on original p23–26 (#2720)

## Decision

The stable deweave of odd/even complete printed groups, concatenating the two original 112-group halves, **does not produce a discriminating native word-length order signal** on p23–26. The deweave actually lowers the frozen length-transition likelihood ratio, and neither predeclared gate passes. Retire the fixed two-way weave as the working solution; no value-key search is justified. This is a calibrated statistical negative, not an all-language impossibility theorem.

The source-confirmed p24–26 half-turn insect pairs motivate two lanes only weakly. This experiment does not authenticate their traversal meaning. It differs from #2690 (two independent rune-level keyword lanes), #2271 (three physical pages and pure word permutation), #2713 (identical plaintext in two physical halves), and #1323 (large-punctuation outside-in marked blocks). Their closure/assignment scopes do not contain this exact two-way stable group-length deweave.

## Frozen receiver and gate

Use the entire original p23–26 chapter, 224 complete printed groups and 1,021 runes with original word carries. Preserve all objects. Weave: interleave the first 112 input groups with the last 112. Invert: collect odd and even printed group indices, then concatenate. Exactly reweave to the input by object identity; no altered rune values, split words, offsets, extra lanes, or inferred subblocks.

The model scores internal group-length transitions as log(P(next length | preceding length)/P(next length)). Use lengths 1–15 and a >=16 bucket, add-one marginal counts, and row shrinkage of 20 pseudocounts to the pooled marginal. Training: first half of Gibran, Shakespeare, Emerson donor words, existing native GP transliteration and greedy multi-letter tokens (CW/QU, U/V, K/Q->C, Z->S, ING and IO). Test on disjoint last-half nonoverlapping 224-word windows (first 40 available per source, 28 for Gibran). No original parameters fit.

Score each lane internally, omitting the seam between the recovered halves, so reversing the lane labels gives exactly the same score. Compare with the printed order scored with its central seam also omitted, for equal counts (222 transitions). A candidate passes only if both the deweave total and the improvement over identity are upper-tail significant at p<=.05 against histogram-matched shuffled groups. No additional orientation hypothesis is selected because the seam is deliberately excluded. Fixed seeds, 199 shuffled controls per fixture and 9,999 for the original. Pair woven and unwoven versions of each held-out native window; shuffle fixture order before evaluation, and evaluate without using labels. This is computational label-independent calibration, not an investigator-blind preregistration or global virgin holdout.

## Results

| Held-out source | Woven accepted | Unwoven accepted | Woven mean improvement (nats) |
|---|---:|---:|---:|
| Gibran | 24/28 | 0/28 | 9.2718 |
| Shakespeare | 17/40 | 0/40 | 5.6996 |
| Emerson | 38/40 | 0/40 | 11.1700 |
| Total | 79/108 | 0/108 | — |

Finite control power 73.15%; source-dependent and only 42.5% on Shakespeare. Zero accepted unwoven controls, not a zero true false-positive rate. Every distinct control object round-trips exactly.

Original p23–26:
- Printed-order matched-seam total: -4.5673083614 nats.
- Odd/even lane scores: -3.7819642848 and -1.9445723519.
- Deweave total: -5.7265366367.
- Improvement: -1.1592282753.
- Matched shuffle p-value for deweave total: 0.3617.
- Matched shuffle p-value for improvement: 0.6206.
- Exact object reweave: all 224 groups, all 1,021 runes, including carries.

There is no observed discrimination, even relative to the existing weak printed order. The finite power and unknown plaintext register mean this cannot prove that the author never performed this weave. It fails the explicit Director gate; no native-key receiver is warranted for either pre-encryption or post-encryption permutation order.

## Reproduction

`node sims/lp2_p23_26_two_lane_group_weave_sft.cjs` prints controls and original diagnostics. Core executed through connected JS with repository blobs (standalone Node/Windows not independently run). Inputs: canonical corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; image-corrected transcription f7b534a33edeb212d427329798438325307463d7; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a.

No unknown plaintext, key, or intended author traversal recovered. No generalized word-shuffle exclusion. Do not expand lane counts, offsets or block widths absent new source evidence.
