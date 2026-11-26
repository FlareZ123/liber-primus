# p8 five-axis ternary additive tensor: blind key recovery

**Agent5, 26 November 2026.** The original p7 five red words immediately precede the five-dot motif, while p8 contains exactly 243 black runes after its 12-rune red heading. This motivates, but does not authenticate, a 3^5 array receiver. Prior fixed triangular differences and polynomial interpolation were negative ([report](lp2-p7-p8-fiveaxis-ternary-difference-gate.md)); this test instead attempts to recover arbitrary unknown additive tensor keys from ciphertext.

## Receiver and actual algorithm

Write i in five base-three digits d0 through d4, least significant first. The model is C[i] = P[i] + g + sum_a k[a,d_a] mod29, with k[a,0]=0. All eleven effective parameters are unknown; no p7 products are imposed. This includes arbitrary separable five-axis additive masks and all rigid axis reflection/permutation relabelings of this indexing. It does not cover nonlinear or arbitrary position permutations. Neither word boundaries nor a known plaintext crib is used.

The hierarchical beam starts with all 841 low-axis shifts. Each partial key scores every contiguous 3^j block under all 29 independent unknown remaining shifts. At the next level the three constituent blocks share a base shift with two independent axis offsets; compute their conditional trigram scores including both boundary-crossing trigrams, and marginalize over the base shift. Retain the best 128 partial keys at every level. Final score maximizes over the global shift. Beam pruning is approximate. Training is 603,149 GP modern runes (Gibran, Emerson, Shakespeare, solved LP1 excluding LOSS), and 16,000 corrected Beowulf runes. Both use integer-scale backoff trigram scores (16/12 smoothing).

The six controls are disjoint 243-rune LOSS windows at starts 0,243,486 and held-out Beowulf windows at starts 46000,46243,46486, independently encrypted with deterministic seeded arbitrary keys. The preselected gate required at least five full key and plaintext recoveries before fitting original p8.

## Actual results

| Case | Mean trigram log score | Exact runes | Exact key |
|---|---:|---:|---|
| modern0 | -2.317873 | 243/243 | yes |
| modern1 | -2.361300 | 243/243 | yes |
| modern2 | -2.246523 | 243/243 | yes |
| oldEnglish0 | -2.465196 | 243/243 | yes |
| oldEnglish1 | -2.360518 | 243/243 | yes |
| oldEnglish2 | -2.442772 | 243/243 | yes |
| original-modern | -4.797442 | unknown | unknown |
| original-oldEnglish | -4.254668 | unknown | unknown |

All six controls recover all 1,458 runes and their exact 11-parameter keys. The correct partial key ranks at most 11th in the first-axis beam and first at every later axis. The original returns incoherent outputs in both models, with scores far below all matching controls. Forward replay holds for every candidate by construction. The run passes the frozen calibration gate; the original negative is a practical calibrated rejection, not an exhaustive proof over all 29^11 masks or all potential plaintext languages.

**Decision:** do not widen this separable additive model without an independent clue. No unknown LP2 plaintext, genuine key or destination recovered. The five-word/243-count correspondence does not select this operation.

[Executable SFT](../sims/lp2_p8_ternary_additive_tensor_blind_sft.cjs) · [Full raw data](lp2-p8-ternary-additive-tensor-blind-output.json) · [Windows Node22 PASS run 45726918658](https://github.com/FlareZ123/liber-primus/actions/runs/45726918658) (head 651626f948a87297f40a2436ddb68c1f0cefd2bd).
