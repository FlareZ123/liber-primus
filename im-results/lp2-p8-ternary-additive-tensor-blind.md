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


## Exhaustive all-key language-score upper bound (same invocation)

To remove beam pruning from the negative, relax the three higher axes and the global shift to **27 completely independent arbitrary block shifts**, one per consecutive nine-rune block. Keep the two lower axes shared, with all four effective parameters unknown. The true full tensor key is a special case of this strictly larger family. Ignore the 52 trigrams crossing block boundaries; each has nonpositive log score, so the 189 retained trigrams upper-bound the full 241-trigram sum for every key.

For each of **all 707,281 = 29^4** lower-axis keys, compute the exact maximum independently over all 29 shifts in each of 27 blocks. This covers 29^31 relaxed keys without explicitly enumerating the 29^27 shift combinations. Reconstruct and recompute the maximizing witness to check the score. The frozen language models and six controls are unchanged. All six plants recover their true four lower-axis parameters; independent block shifts occasionally overfit (225–243/243 plaintext recovery), exactly as expected from the relaxation.

| Case | Exact maximum within-block mean | Upper bound on whole-page mean | True within-block mean (control only) |
|---|---:|---:|---:|
| modern0 | -2.313885 | -1.814623 | -2.315507 |
| modern1 | -2.348602 | -1.841850 | -2.348602 |
| modern2 | -2.216120 | -1.737953 | -2.216120 |
| oldEnglish0 | -2.407728 | -1.888218 | -2.414905 |
| oldEnglish1 | -2.330693 | -1.827805 | -2.330693 |
| oldEnglish2 | -2.438564 | -1.912401 | -2.468631 |
| original-modern | -3.287373 | -2.578064 | — |
| original-oldEnglish | -3.151657 | -2.471631 | — |

The strongest possible original score across **every** full tensor key is therefore at most -2.578064 (modern) or -2.471631 (OE) per whole-page trigram, below all matching control full-page scores from the first test. The modern gap is substantial; the OE whole-page bound beats the weakest control by only 0.006435. The within-block comparison has a considerably larger gap for both registers (all original relaxed maxima below all true within-block control scores).

**Decision:** this is an exact upper bound on the stated score over the entire proposed cipher family, not merely a beam failure. Its linguistic interpretation remains conditional on the two trained models and finite control samples; it is not an impossibility proof for all real languages. No authenticated plaintext/key.

[Exact exhaustive SFT](../sims/lp2_p8_ternary_additive_tensor_exact_bound_sft.cjs) · [Raw output](lp2-p8-ternary-additive-tensor-exact-bound-output.json) · [Windows Node22 PASS run 45727125472](https://github.com/FlareZ123/liber-primus/actions/runs/45727125472).


## Source-cued cubing composition, exact lower-axis relaxation

The documented [p7/p8 cubing orbit](lp2-p7-p8-complete-cube-orbit-receiver.md) independently singles out the exponent3 and inverse19, beyond the speculative tensor shape. Test only the two natural layer orders C=(P+K)^3 and C=P^3+K over GF29, with the same arbitrary eleven-parameter mask K. For the first, apply the exact cube-root permutation to ciphertext before the prior inverse; for the second, evaluate the unchanged plaintext model at the cube-root of each tentative recovered rune. No exponent search. Six controls per order recover every true lower-axis key; the gate requiring all six passes for both.

| Original register / order | Exact max within-block mean | Whole-page upper bound (omitting seams) |
|---|---:|---:|
| original-modern / cubeOutside | -3.254051 | -2.551932 |
| original-oldEnglish / cubeOutside | -3.127651 | -2.452805 |
| original-modern / cubeInside | -3.248641 | -2.547689 |
| original-oldEnglish / cubeInside | -3.109654 | -2.438691 |

All four relaxed within-block maxima remain well below all corresponding genuine control within-block scores. The modern whole-page bound is below all matching full control scores; the OE whole-page bound is too loose for that claim for both orders. No original decipherment; an exact seam upper-bound refinement is queued rather than widening the layer family. [SFT](../sims/lp2_p8_ternary_cube_tensor_exact_bound_sft.cjs) · [raw](lp2-p8-ternary-cube-tensor-exact-bound-output.json) · [CI PASS 45727403409](https://github.com/FlareZ123/liber-primus/actions/runs/45727403409).
