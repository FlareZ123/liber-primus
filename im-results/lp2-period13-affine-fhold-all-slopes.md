# Period-13 global affine multiplier under native F holds (#2554)

**Decision:** all 28 nonzero GP29 slopes fail exact intact-word CSP on the frozen p54–55 prefix. The stronger relaxed pair-conflict bound requires at least five OOV words for *every* slope. No key or unknown plaintext recovered. This is a bounded model exclusion, not a claim about arbitrary plaintext segmentation or language.

## Model and method

For consuming P != F, C = aP + K[j] mod 29, one global a in 1..28, period 13, and phase advances once. F emits F and does not advance. Ciphertext F may represent an ordinary encrypted non-F or the transparent F. Inverse for consuming symbols is P = a^{-1}(C-K[j]) mod 29, rejecting zero. Phase starts at zero; equivalent rotations are not new parameters.

For any complete lexical word, consuming rows specify K[j+i] = C_i-aP_i. Repeated slots must agree, and comparing two overlapping rows cancels key values: C_i-C'_t = a(P_i-P'_t) mod29. The shared phase/key-domain CSP enforces these affine invariants through intersections; no per-position slope or language-score pruning. The generic module's new optional slope defaults to 1, so previous additive callers are preserved. It reconstructs and replays each surviving key witness. A fixed-key continuation uses exact word-DP, allowing OOV words.

The target is p54–55, the prior collision-compatible native q13 scope (2/96 window controls). Freeze 45 words/205 runes for training, remaining 103 for prediction. All slopes are treated identically, expanded 42,468-spelling lexicon, no holdout rescue.

## Controls

| Source | True slope | Prefix/held runes | Surviving slopes | Result |
|---|---:|---:|---|---|
| Actual LP1 KOAN2 | 1 | 155/164 | 1 | Exact unique key, 155+164 exact, replay |
| Independently encrypted KOAN1 | 7 | 155/625 | 7 | At least two compatible keys; rotated ambiguity persists at 206 runes. No prediction claimed. |
| Independently encrypted KOAN2 | 17 | 155/164 | 17 | Exact unique key [8,0,11,6,28,10,19,8,17,11,23,20,26], 155+164 exact, replay |
| Independently encrypted LOSS OF DIVINITY | 11 | 155/600 | none | True plaintext excluded by finite lexicon at word indices 8,22; failed calibration, not cipher exclusion. |

Each control lexicon excludes its native target section. The synthetic controls use independent seeded keys. All competing slopes are excluded in the two unique successes. The method identifies slope under the second control but does not identify a unique full key. The last control emphasizes the limitation of strict lexical constraints.

## Original result and robust bound

All 28 slopes return zero keys, one DFS node and a first forward pass contradiction, no cap. First contradiction word indices for slopes 1..28:
`4,24,21,18,21,40,18,20,18,18,17,24,35,25,18,24,20,20,31,25,22,18,18,31,24,18,36,20`.

To relax the exact word assumption locally, retain only words >=4 runes (28 of 45), let each pair choose arbitrary legal intervening F holds independently, and compare all overlapping affine key projections. A pair with no common assignment requires one of its words to be outside the lexicon. Minimum vertex cover is solved exactly for each slope. Lower bounds in slope order:
`8,9,9,7,8,7,8,8,8,7,7,8,9,8,9,9,9,8,8,10,7,7,6,7,5,7,9,7`.
Thus at least five of 45 original prefix words (five of 28 long words) must be OOV for any slope, even under the pairwise relaxation; the bound does not show that five suffice. No candidate survives strict training, and the untouched 103 runes are not used for inference.

## Reproduction

`node sims/lp2_period13_affine_fhold_sft.cjs control1`, `control2`, `control3`, `control4`, `target`. All executed on checked-in source strings via JS. Generic solver commit 876d0db9eee8657300167f8dff3fc9b51c367724, driver 8036d45be2f89838ce49a413cddd3610549ef5e3. The source does not authenticate an affine mechanism; no new slope/reset tuning warranted.
