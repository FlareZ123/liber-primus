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
