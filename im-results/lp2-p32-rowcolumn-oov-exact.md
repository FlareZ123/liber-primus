# p32 11×11 two-axis additive mask: exact OOV-aware original inverse

**Agent 5, 25 November 2026.** No unknown LP2 plaintext or authentic key. Under the intact printed-group dictionary register, this excludes every independent additive row/column mask with at most three OOV groups on p32. The result is a conditional exact exclusion, not a universal cipher theorem.

## Hypothesis and actual key recovery

The unique 121-rune page p32 has an inferred row-major 11×11 arrangement. Agent2's Stage10 prime-ordinal extraction yields TWA (conditionally interpreted as “two”); p50 has a real eleven-node orbit. Neither selects the two-axis mask, and the printed page has six lines. This is a distinct exploratory consumer of the inferred square, not an authenticated instruction. Previous p32 tests of fixed one-axis additive cycle keys, direct transposition, and circulant Hill kernels were negative; earlier p0–2 row-column studies address a different 27×27 target and/or a crib-based heuristic, not the following exact p32 receiver.

Model C[r,c]=P[r,c]+u[r]+v[c] (mod29), gauge v[0]=0. This permits 29^21 distinct masks. Keep the 22 original p32 printed groups; use the canonical TextBlob word-frequency register and exact solved native GP words, greedy GP29 normalization as in prior repository solvers. No TWA plaintext crib is imposed.

For each candidate plaintext dictionary word, every internal same-row adjacent pair fixes a difference v[j+1]-v[j] by subtracting the plaintext pair difference from the ciphertext pair difference. Join exact partial assignments using overlapping column edges. Four **disjoint** anchor covers (zero-based group indices) are [[7],[3],[9,13],[11,19]]. The first covers all ten differences, the second covers nine (enumerate the remaining 29 values), and both pairs cover all ten. Thus with <=3 OOV groups at least one entire cover consists of dictionary words, and its true mask is necessarily enumerated. For a fixed v, every within-row group gives an exact unary row-shift miss cost; every crossing group (length <=11, at most one per seam) gives a pairwise cost between consecutive row shifts. Exact chain DP minimizes OOV over all 29^11 row shifts. A separate row-local bigram tie-break uses solved sections other than LOSS OF DIVINITY; no language score alters the exact OOV decision.

## Original result and controls

- Dictionary: 29081 distinct GP forms, 1450 length-11 forms.
- All four covers: 68122 distinct column masks (per-cover counts in raw JSON).
- Minimum OOV among enumerated masks: 12/22; 1 column masks attain it. Best row-local log score -3.852126 nats/edge. Exact forward replay. No candidate prose. The minimum is over the union of covers, not an all-key global minimum when >3 OOV is allowed.
- Two independently masked 121-rune native LOSS OF DIVINITY windows, one row-aligned anchor and one crossing anchor: 121/121, key exact=true, OOV=0; 121/121, key exact=true, OOV=0. The exact native dictionary supplements include the donor; these are blind-key implementation controls, not unknown-vocabulary tests. Bigram training excludes the donor.
- Exact p32 length-layout lexical stress plant removes both eleven-rune anchors and one member of the third cover: 121/121, key exact=true, OOV=3. This plant is a sequence of lexical items rather than coherent prose; it tests missing-anchor coverage, not language plausibility.

**Decision:** reject this receiver for p32 with <=3 OOV and intact groups in the pinned dictionary. Do not interpret the best lexical islands as recovered text. More OOV, different word inventory/segmentation, nonadditive maps and other geometry remain outside the exclusion. No reason to add arbitrary offsets, outer substitutions or new square layouts. No change to the authoritative solution frontier.

[Reproducer](../sims/lp2_p32_rowcolumn_oov_exact_sft.cjs) · [Raw output](lp2-p32-rowcolumn-oov-exact-output.json). The experiment function ran against the connected canonical inputs in JavaScript V8; standalone Windows Node22 CI was not run. No new workflow.


## Old English register sensitivity (same mechanism; distinct language premise)

Because the motivating `TWA` extraction is an Old English number word, the original modern/native lexical restriction is potentially material. The optional `--old-english` mode adds the exact corrected Beowulf source-native register (`resources/control/beowulf_oe_gp_profile_corrected.json`), splitting its 48,012-rune base29 tape by all 10,885 preserved source word lengths. It contributes 3,127 previously absent forms, for a 32,208-form union (1,453 eleven-rune forms). The first 16,000 OE runes are added to the bigram tie-break training, while two complete source windows at 47,318 and 47,782 provide 121-rune controls, the first crossing a row with its length-11 anchor and the second row-aligned. The dictionary includes these donor words, so this is key recovery with known lexical support, not a vocabulary-held-out test.

The original 70,699 distinct masks give minimum 12 OOV among their union (11 masks attain that value); no key satisfying the at-most-three-OOV premise exists in the expanded register either. Both OE controls recover 121/121 runes, both full keys and zero OOV; both modern native controls and the three-OOV stress control remain exact. This does not imply that the three-rune extraction is authentic, or exclude unrepresented Old English, resegmentation, or a different cipher. The highest-ranked full candidate is incoherent and is not a plaintext proposal. No broader sweep warranted.

Reproduce from repository root: `node sims/lp2_p32_rowcolumn_oov_exact_sft.cjs --old-english`. The full [output](lp2-p32-rowcolumn-oe-union-output.json) was generated by executing the same `experiment` function in V8; standalone Node CLI not separately run.

## Independent spacing-free joint row-marginal recovery

The intact-word result leaves a segmentation loophole. Test the same 11×11 arbitrary additive-mask family without words, using a new left-to-right column-key beam and exact row-shift Viterbi. Fix v[0]=0. As each column key is appended, maintain 29 conditional GP29 language scores for each of 11 rows. Rank partial column keys by the sum of row-wise log-sum-exp scores over all possible independent row shifts. Use independently trained unigram, smoothed bigram and trigram distributions: 603,149 modern training runes (native LOSS excluded), 16,000 Beowulf training runes. Freeze beam width 1,000. For the final 1,000 column keys, exact 29-state row-chain Viterbi maximizes full-page trigram score including the two seam-crossing trigrams between each adjacent pair of rows. Exact forward replay asserts every result. Beam pruning makes the outer search approximate; it is not an all-key proof.

Before scoring original p32, run six disjoint 121-rune windows of native LP1 LOSS (starts 0,121,242,363,484,605) and six disjoint 121-rune windows of held-out Old English (starts 46000+121j), each independently masked using deterministic seed3301. The keys and source passage are used only to generate and score plants, never in search. Windows Node22 [run 45725852547](https://github.com/FlareZ123/liber-primus/actions/runs/45725852547) passed. All 12 plants recover every rune and exact normalized key. Maximum true-prefix rank retained is243; the true column key ranks first after the final column in all plants.

| Input | Mean trigram score | Runes recovered | Key exact | Worst true-prefix rank |
|---|---:|---:|---|---:|
| modern0 | -2.381 | 121/121 | yes | 43 |
| modern1 | -2.254 | 121/121 | yes | 74 |
| modern2 | -2.410 | 121/121 | yes | 70 |
| modern3 | -2.334 | 121/121 | yes | 11 |
| modern4 | -2.140 | 121/121 | yes | 9 |
| modern5 | -2.360 | 121/121 | yes | 2 |
| oldEnglish6 | -2.439 | 121/121 | yes | 26 |
| oldEnglish7 | -2.496 | 121/121 | yes | 4 |
| oldEnglish8 | -2.377 | 121/121 | yes | 243 |
| oldEnglish9 | -2.353 | 121/121 | yes | 4 |
| oldEnglish10 | -2.490 | 121/121 | yes | 46 |
| oldEnglish11 | -2.358 | 121/121 | yes | 9 |
| Original modern | -3.111 | unknown | no authenticated key | — |
| Original Old English | -3.022 | unknown | no authenticated key | — |

The exact same width and frozen models were used for original p32 in connected V8 after the successful CI calibration. Neither output is coherent prose; both lie below all matching controls. A first cheap row-invariant column-difference marginal rank test gave true ranks from88 to >276,000 under a 5m-node cap, motivating the stronger joint marginal solver. Do not treat the original best key as authentic. This provides a direct practical negative independent of printed grouping and a reusable blind short-square receiver, not an exhaustive statistical or mathematical exclusion of every language/segmentation. No more additive-mask parameter expansion without independent selector.

Reproduce `node sims/lp2_p32_rowcolumn_spacingfree_beam_sft.cjs all 1000` (controls) and `node sims/lp2_p32_rowcolumn_spacingfree_beam_sft.cjs original 1000`; [raw output](lp2-p32-rowcolumn-spacingfree-beam-output.json).
