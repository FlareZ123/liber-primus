# p32 joint repeated-block permutation and additive shifts: exact row-local inverse

## Decision

A previously untested joint inverse for the natural 11×11 reflow of physical LP2 p32 is negative. The exact maximum of the rounded row-local GP language objective over **all 11! × 29^11 keys** is −3.1380181431 nats/rune, versus the weakest of sixteen independently sourced native planted plaintexts at −2.716708097. A full-stream trigram refinement recovers all sixteen planted keys and all 1,936 planted runes, but the refined original output scores −3.66449744 nats/trigram and is not readable. This is a calibrated finite-model negative, not an unconditional impossibility theorem.

## Hypothesis and provenance

The 121-rune p32 has a motivated square reflow (the GP0 EPIPHANY count and the 563/569 border prime sums); its actual image does not print eleven rows. Historical Stage04 demonstrates ordinary additive GP shifts and Stage05 a fixed permutation of successive seven-symbol blocks (see [historical replay](lp2-2014-stage04-source-exact-stage05-seven-column-inverse.md)). Neither identifies an eleven-slot key or authorizes combining the mechanisms. The exploratory model is:

`C[r, π(j)] = (P[r,j] + k[j]) mod 29`, with fixed block order, independent k[j], and one shared permutation π. All positions consume. There is no F interruption or row shuffle. Unlike the already negative separable row/column mask, this inverse moves the positions; unlike the p50 rank transfer, it does not prescribe the permutation.

## Exact optimization

Each candidate state (observed column a, shift s) represents an eleven-rune vector V[r]=C[r,a]−s mod29. Sum unigram scores for a first state and row-local bigram scores for each directed edge. A subset DP indexed by used observed columns and last state computes the maximum over every permutation and shift combination, with no beam pruning. Integer scores are rounded at 1/1024 natural-log resolution. Unigram add-one smoothing and bigram backoff weight 16 are fixed before original evaluation. The first pass trained on 603,149 GP runes, excluding LOSS OF DIVINITY. Three of six disjoint 121-rune LOSS controls recovered exactly; two failures were rotations of the block order, and a third displaced blocks. The original was gated off in that pass.

The refinement optimizes full-stream trigram score, including row seams, from all eleven rotations of the exact DP's best path. It considers every single-slot shift, pair swap and contiguous relocation, taking the best improving move (maximum 60 iterations). This second objective is heuristic, not globally optimized. The refined training set has 601,854 runes, excluding all three control source sections. Six LOSS development controls and ten fresh controls (six KOAN_1 and four WELCOME disjoint windows) pass, with all keys and all 121 runes recovered in each case. Planted ciphertext uses native plaintext, seeded keys (3301), and the stated forward model; no plaintext is supplied to the inverse. The original is evaluated only after the fresh gate.

| Result | Value |
|---|---:|
| Development controls recovered after refinement | 6/6 |
| Fresh held-source controls recovered | 10/10 |
| Total native control runes recovered | 1936/1936 |
| Weakest control true row-local score | −2.716708097 |
| Original exact maximum row-local score | −3.138018143 |
| Weakest control full-stream trigram score | −2.444606749 |
| Original refined full-stream trigram score | −3.664497440 |
| Original forward replay | 121/121 |

Original candidate starts `P M Y W A X E W A U L EA TH E A T W D M I G I`. Its fitted permutation and shifts are recorded in the raw output; neither is authenticated. The original maximum proves no key in this model can attain the weakest observed native-control row-local score under this exact language objective. It does not rule out arbitrary plaintext distributions, variable blocks, a different geometry, F interruptions or a further cipher layer.

## Row-transport extension (derived, no extra search)

The exact row-local objective sums first-symbol and adjacent-pair scores over all eleven rows. Permuting complete ciphertext rows merely permutes terms in every candidate state's start/edge sum, so the entire DP table and maximum are invariant. Therefore the same calibrated score ceiling extends to an arbitrary permutation of the eleven complete eleven-rune blocks, before or after the fixed column transformation. This extension does not preserve the separate full-stream trigram objective or guarantee a native row order; arbitrary individual-rune or printed-word transport is not covered.

## Reproduction

- [First-pass SFT](../sims/lp2_p32_joint_q11_blockperm_exact_sft.cjs), [raw output](lp2-p32-joint-q11-blockperm-exact-output.json).
- [Refined SFT](../sims/lp2_p32_joint_q11_blockperm_refine_sft.cjs), [raw output](lp2-p32-joint-q11-blockperm-refine-output.json).

Run either CJS entry point from a repository checkout using Node. The computation itself was executed in connected V8 against the five repository source texts; the separately generated Node wrapper was not independently run. No workflow was created. The authoritative plaintext status is unchanged.
