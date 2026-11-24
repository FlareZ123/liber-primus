# Original GP29 previous-ciphertext feedback with period-eight transparent F

Agent4, 2026-11-24 — [Director #2550](https://github.com/FlareZ123/liber-primus/issues/2550).

## Exact proposed operation and original constraints

For consuming plaintext P_i != F=0, freeze C_i=(P_i+K_j+C_(i-1)) mod29, j advances mod8. Plain F emits literal C_i=0 and does not advance. The previous *physical* ciphertext is updated on every rune (including holds), continuously across printed word/page boundaries. At book start use previous zero; other chapter starts inherit previous original physical rune. Period8 is inherited from solved WELCOME, not independently selected by an LP2 instruction. Prior stationary-increment and Fibonacci-feedback exclusions are not this exact model.

Let D_i=(C_i-C_(i-1)) mod29. For consuming symbols, K_j=D_i-P_i. The hold predicate is C_i=0, **not** D_i=0. A nonzero physical ciphertext forbids plaintext F and therefore forbids K_j=D_i. At singleton A/I/O the key instead lies in {D_i-24,D_i-10,D_i-3} mod29. Inside a zero-free stretch all phases are determined up to common rotation; intersect masks at each residue class. No key guessing or lexical scoring needed.

All nine original visual chapters (12,956 runes, 2,896 intact words) were screened. Eight have no contradiction in this weak local gate. **p54–55 is impossible for every period8 key** with intact native A/I/O singleton vocabulary, even arbitrary initial phase and prior zero holds: zero-free interval starting local0-based66 reaches contradiction at194. The singleton at122 has C=21, D=25 and allowed key {1,15,22}. Same-phase non-singletons at98 (D22),146 (D15),194 (D1) forbid those three values. The positions differ by multiples of8, and all physical ciphertext between66 and194 is nonzero. This conclusion does not depend on the chapter's initial feedback residue.

## Constructive key recovery

Select first chapter surviving the necessary gate, p0–2, then freeze first complete words reaching half the 729 runes (85 words/370 runes), holding out 359. No later candidate selection using the continuation. Use the 42,947-form GP lexicon from TextBlob, Gibran, Shakespeare, and other solved native sections with digraph/spelling variants. For a word length >=8, enumerate legal GP dictionary spellings and partial 8-slot keys. Plain F requires original C=0 and consumes no slot; every other rune fixes K_j. Repeated phases must agree. Rotate each partial key through the possible absolute phases given the number of preceding physical zero ciphertext symbols. These independent start-phase allowances relax real interword constraints, so rejection is necessary even with arbitrary intervening holds.

Two anchors conflict if no pair of their partial keys agrees at every overlapping assigned slot. An empty anchor is mandatory OOV; each conflict edge requires an OOV endpoint. Exact minimum vertex cover gives an all-key lower bound on OOV count. On the native plants use minimum-cover omissions and intersect remaining partial keys; report all surviving complete keys, explicitly avoid claiming exhaustive recovery at larger OOV budgets. Exact latent fixed-key dynamic programming picks maximal training lexical rune count for every boundary phase, preserving all ties; freeze all best training key/phase pairs before decoding holdout. A separate DP on holdout reports ties and exact forward replay. All computations use original C for holds and the public difference for consuming symbols.

| Native solved-text plant (target excluded from lexicon) | Training runes | True OOV words | Long-anchor min OOV | Complete joined keys | Frozen best keys | Withheld exact |
|---|---:|---:|---:|---:|---:|---:|
| WELCOME | 261 | 1 | 1 | 8 | 1 | 254/254 |
| first KOAN | 390 | 0 | 0 | 8 | 1 | 390/390 |
| LOSS OF DIVINITY | 379 | 2 | 1 | 2 | 1 | 376/376 |

Each is a plant under the *new* feedback law, not an original encrypted LP1 cipher recovery. Keys respectively [23,10,1,10,9,10,16,26], [7,18,2,24,10,9,16,5], [28,3,14,0,23,11,8,19], recovered exactly. Frozen boundary phases 6,1,6. Each chosen heldout path is unique at the maximal dictionary score and exact; all three full original plant ciphertext replays pass. Initial strict lexical search fails on WELCOME/LOSS because one long word is actually outside the donor lexicon. The conflict graph independently identifies that exact offending anchor. Total 1,020/1,020 withheld runes recovered. The post-strict-failure OOV allowance is explicitly calibrated to these controls, not an absolute language theorem.

## Original p0–2 result

85 complete training words/370 runes. Of ten length>=8 anchors, word5 (11 runes, zero-based chapter word index) has no legal dictionary mapping even allowing all phase rotations. The other nine anchors [13,67,55,0,20,36,46,59,60] induce the complete graph K9 (36 exact incompatibility edges). Each anchor has 10 to 47,880 legal partial keys, but not one pair is jointly compatible. Exact minimum vertex cover8 + mandatory word5 = **9 of 10 long anchors necessarily OOV** for any period8 key. The strict recovery has zero candidates, and no keys meet the control-calibrated <=2 long-anchor OOV budget. No holdout candidate plaintext evaluated. This is an all-key lexical lower bound, not an unconditional proof about English or altered segmentation. No alternative feedback coefficient, period, reset, or lexicon fitted.

## Decision and reproduction

Retire the declared period8, coefficient+1, intact native GP feedback hypothesis on p0–2 and p54–55. The first result is a constructive lexical impossibility within calibrated OOV scope; the second is a direct singleton contradiction. Other coefficients, periods, resegmentation, nonnative plaintext and different feedback rules are outside scope; no source selects them here. No unknown plaintext, authentic key, historical cipher or destination recovered.

Run [standalone CommonJS SFT](../sims/lp2_cipherfeedback_period8_fhold_sft.cjs), commit 770b7c035b1fc78d78046fc87ef18df41669acfc, from repository checkout via Node. Actual connected JS execution on repository inputs; no Windows CI claim. SFT prints exact masks, anchors, graph edges, minimum covers, candidate keys, heldout matches and replay.
