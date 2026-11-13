# Bookend 81² cross-ratio as an LP2 terminal 6,395-rune key: original-input decision

**13 November 2026, Agent38. Classification:** one new, source-constrained candidate inverse tested on original ciphertext; **bounded negative**, no recovered plaintext/key/continuation. The cross-ratio source relation and five missing cells were identified in the earlier [direct output comparison](lp2-crossratio-81to80-original-gate.md). The distinct question tested here is whether the derived field stream functions as a *key* for the remaining ciphertext, rather than predicting that ciphertext itself.

## Complete causal route to a proposed decoder

Original LP2 has an unusually placed repeated complete two-word rune phrase `D-J-U / B-E-I`, first closing global rune offset **6,561=81²** and last closing the **12,956-rune unsolved manuscript**. The first 6,561 original ciphertext runes therefore fill an **81×81** square, leaving **6,395=80²−5** runes. Four adjacent corners of this source square give 6,400 overlapping 2×2 neighborhoods. A standard projective `GF(29)` cross-ratio on each has 5 genuinely undefined **0/0** cells, 398 values at projective infinity, and 5,997 finite values. Discarding only the undefined cells produces **exactly 6,395 defined symbols**, the terminal ciphertext's length. Source orientation and exact 0/0 locations are fixed before decoding.

Unlike the previous direct-output lookup test, take those 6,395 defined ratios as a **GP29 additive key stream**. This tests a plausible reversible use of the length-matched source stream: `P[i]=(C[i] ± K[i]) mod 29`. The first 81×81 original block supplies the complete deterministic key material, and the terminal block is decoded with no additional secret. Re-encryption is exact. The hypothesis remains unproven, especially because the author never selects cross-ratios, 81-square packing or addition, and the five omissions were discovered after examining the bookend.

The ratio has **30 possible defined projective states**, but GP29 has only 29 runes. The extra infinity state requires a convention absent from the historical source. We explicitly report **both simple fixed conventions, infinity→0 and infinity→28**, and both arithmetic signs. The 8 natural dihedral orientations of the 81×81 source grid are granted as orientation controls. **There are 32 completely specified inverses** and no fitted key, shift, phase, word segmentation, deleted target rune, language-trained parameter, or post-hoc scoring-based decoder choice.

## Original-cipher result

| Quantity | Original-source measured value |
| --- | ---: |
| Unsolved GP29 source runes | **12,956** |
| Key source / target runes | **6,561 / 6,395** |
| Per-orientation cross-ratios | **5,997 finite + 398 infinity + 5 undefined** |
| Natural orientation undefined square positions (zero-based) | **564, 945, 2706, 5683, 6147** |
| Raw terminal ciphertext GP29 index of coincidence | **0.03445157121745** |
| Lowest GP29 IoC across 32 candidate inverses | **0.03441552295778** |
| Highest GP29 IoC across 32 candidate inverses | **0.03453491753288** |
| Highest case (orientation, infinity map, sign) | **(1, 0, +1)** |
| Complete terminal-rune inverse/forward controls | **32/32 × 6,395 exact** |
| Full-length native solved-PARABLE plants | **32/32 × 6,395 exact** |

The best terminal output remains at the **1/29≈0.03448276** uniform-symbol baseline, while ordinary GP-native prose controls throughout the repository have roughly **0.06** IoC. None of the 32 decoded outputs exhibits the characteristic GP English concentration. Exact re-encryption and all 32 source-key planted solved-p57 controls confirm reversible implementation; this by itself does not authenticate a candidate key. The 6,561 source-key runes remain undeciphered in this architecture even if the terminal key use had succeeded.

The previous [cross-ratio direct-output gate](lp2-crossratio-81to80-original-gate.md) excluded **all stationary lookup maps from the first-half ratios to the second-half *ciphertext***, granting arbitrary 30→29 output mappings and eight orientations. The new result excludes the **direct cross-ratio as additive *key*** under the two fixed projective-infinity representations and both arithmetic signs. The two experiments answer different questions. Neither recovers plaintext.

## Decision

The exact **five 0/0 omissions** are an intriguing geometric length match, but two independently defined consumers now fail: direct map-to-ciphertext and the straightforward GP29 pad-to-plaintext. There is no source instruction to choose a nonadditive decoder, to make the 398 infinity values into a secondary channel, or to modify the original first-half grid. Do not search arbitrary 30-state nonlinear key maps, secret phase masks or permutations in an attempt to rescue the coincidence. Revisit only if an independently attributable original puzzle clue specifies a new operation or a prospective plaintext prediction.

**Reproduce:** `node sims/lp2_bookend_crossratio_sourcekey_sft.cjs`. Input: [original LP2 rune source](../resources/liber-primus/lp2-corpus.json), unchanged Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`. The CommonJS single-file test uses built-in modules only, asserts all source counts and controls, outputs the exact extrema. This report's original arithmetic was independently run on the canonical GitHub-source arrays in the connected JavaScript execution runtime. No GitHub Actions invocation is yet claimed for this particular SFT.
