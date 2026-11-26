# p32 two-half shared-pad inverse: literal donor, arbitrary pad, and period-11 key decisions

**26 November 2026 — no recovered unknown plaintext or authentic key.** The finite literal-donor family has no matching prefix (Agent49); the unrestricted spacing-free shared-pad inverse has poor blind identifiability (Agent8). A distinct periodic specialization recovers hidden keys and genuinely withheld native runes in controls, but fails on the original p32 continuation; an all-key cyclic relaxation also bounds every period-11 key and relative shift below eight independent native controls. The directly invertible duplicate-text specialization and every shared invertible affine pair map, with or without the central rune as a public row operand, are nonprose. The latter controls recover all 18 hidden maps up to stream exchange and 540/540 held-out runes. A physically interleaved continuous-plaintext specialization also fails, despite 8/8 exact ordered hidden keys and 240/240 withheld runes. The conditional TWA extraction and inferred square remain unconfirmed as author instructions.

## Source framing and hypotheses

Physical p32 (archive image 49.jpg) prints six text lines above a blurred tree, not a square. Its 121 runes permit a conditional row-major 11×11 reflow. The [Stage10 prime-ordinal extraction](lp2-grid-byte-pointer-11cycle.md#prime-ordinals-as-p32-rune-positions-twa-agent2-25-november-2026) selects TWA in the central column, conditionally interpreted as Old English “two.” Neither this nor the 11-node p50 orbit establishes a cipher. Retain the central eleven runes unchanged (transliteration UOETWAWAIABNJ); extract 55 symbols from each of the five left and five right columns, in row-major order. On the right test the ordinary or per-row mirrored order. Define

`C_L[i]=P_L[i]+K[i]; C_R[i]=P_R[i]+s*K[i]+b (mod29)`, with `s=±1`.

The four orientation/sign combinations are fixed. All receivers are conditional on this geometry, ordinary consuming GP29 symbols (no F skips), the two streams and the shared-key relationship. No original printed word boundary is required. The central column is not decrypted or used as a fitted crib.

## 1. Literal-source exact inverse (Agent49)

For an arbitrary 55-rune pad and independent constant relative shift b, D=C_R−s*C_L=P_R−s*P_L+b. Consecutive differences eliminate b. Index exact ten-increment prefixes of every 55-rune window in the source library. For each possible left source window, join the computed right increment prefix, solve b from position 0, test through position 31, then predict all 23 withheld pairs. Each surviving pair determines all 55 pad digits.

The library comprises nine solved GP29 sections, corrected native Beowulf, historically linked Self-Reliance and three Liber AL chapters, and Gibran's Prophet fixture (including packaged paratext). English transliteration greedily uses the canonical GP table per alphabetic word, with QU→CW, V→U, K/Q→C, Z→S. Windows never cross source records. There are 176,508 indexed placements and 31,155,074,064 ordered pairs per orientation/sign.

All eight blind source-pair plants retain the true pair, b and all 55 pad digits, and replay every withheld pair (184/184). Four controls have two source-pair records rather than unique prefixes. **All four original orientation/sign settings have zero matching 32-pair prefixes and zero full survivors.** This excludes only literal reuse of the frozen library under the stated geometry and cipher.

[SFT](../sims/lp2_p32_two_halves_literal_sharedpad_sft.cjs) · [raw results and inputs](lp2-p32-two-halves-literal-sharedpad.json).

## 2. Arbitrary pad, unseen plaintext: exact joint trigram inverse (Agent8)

Train an interpolated native-GP29 unigram/bigram/trigram model on Shakespeare (218,800 runes) and Emerson (324,630 runes), normalizing as above. Use add-one unigram smoothing and interpolation strength10 for both higher orders. For each fixed b, the right plaintext is a deterministic function of the left rune at each position: P_R[i]=D[i]+s*P_L[i]−b. Viterbi over 29² previous-left-rune states, with 29 transitions and summed left/right trigram scores, gives the global maximum for that score. Enumerate all 29 b values. Every candidate yields a concrete pad and exact forward replay. Separately select b from the first32 pairs; the remaining text is still decoded jointly and the full score is **not** a genuine frozen-key holdout.

Eight blind 55-pair plants from held-out Gibran and authentic solved sections give only **1/8** exact full-MAP b recoveries; the best full-MAP plaintext recovery is **22/110** runes. Selecting b on the first32 pairs gives **2/8** correct b values and at most30/110 correct runes. Eight independent uniform ciphertext-pair nulls overlap the positive scores.

| Input | Exact optimized mean joint log score per rune |
|---|---:|
| Eight genuine shared-pad plants | −1.916816 to −1.876550 |
| Eight independent uniform ciphertext pairs | −1.925786 to −1.867210 |
| Original row-forward, s=+1 | −1.899347 |
| Original row-forward, s=−1 | −1.928379 |
| Original row-mirror, s=+1 | −1.903695 |
| Original row-mirror, s=−1 | −1.909056 |

This score does not identify plaintext or even discriminate the planted family in these controls. For example, the original row-forward s=−1 optimizer begins `ANDCONATIMETHINGTHATIS...` / `INGHISEDFORTWHICHOURE...`; these are model-generated fragments, **not recovered plaintext**. All four exact original optima and their pads are preserved as counterexamples to language-score-only interpretation. The control failure does not exclude arbitrary shared pads or unseen prose. It shows that a new independent constraint is needed to justify an actual inverse.

[SFT](../sims/lp2_p32_two_halves_joint_trigram_sft.cjs) · [raw exact candidates and controls](lp2-p32-two-halves-joint-trigram-output.json).

## 3. Constructive q11 key recovery with actual withheld continuation (Agent8)

A narrower hypothesis uses the two 55-rune streams as five complete repetitions of a shared period-11 key, consistent with the inferred square's dimension. This is an exploratory restriction, not a source-selected key. Use `K[i]=k[i mod11]`. For each phase, retain the 12 highest combined-unigram key candidates. Precompute the summed trigram factor for each cyclic triple of key digits. Enumerate the first two phase labels; conditional max-sum dynamic programming with exact closing factors optimizes all 12^11 retained-domain keys. This avoids unconstrained coordinate descent. The score agrees with direct rescoring; all candidates re-encrypt exactly. The pruning makes this a finite calibrated receiver, **not** an all-29-values-per-phase exclusion.

Fit only the first44 pairs, freeze the complete 11-digit key, and apply it to the final11 pairs (22 withheld runes). No withheld ciphertext contributes to key ranking. The separate full-page run uses all55 pairs and is diagnostic only. First test b=0; then enumerate all29 relative shifts b and select key and shift by the same prefix-only score.

| Control/target | Exact key recoveries | Withheld rune matches | Held-out mean log score |
|---|---:|---:|---:|
| b=0: eight held-out Gibran/native plants | 8/8 | 176/176 | −3.076207 to −1.937234 |
| b=0: four original configurations | no authenticated key | unknown | −7.821105 to −6.294398 |
| Unknown b: four independent plants | 3/4 full keys, 4/4 b | 86/88 | −3.129247 to −2.076046 |
| Unknown b: four original configurations | no authenticated key | unknown | −7.308409 to −5.557684 |

For the one imperfect unknown-b plant, the true key digit is outside the retained unary top12 in exactly one phase; 10/11 key digits and 20/22 withheld runes are recovered. This is a real receiver limitation, not a cipher ambiguity claim. All original held scores are substantially below the weakest control in their respective experiment. Full-page b=0 original means are −4.069943 to −3.897164; no output is coherent prose. The best unknown-b frozen continuation uses row-forward s=+1, b=8 and key [11,1,17,12,24,4,28,28,28,4,28]; its text is nonprose and withheld score −5.557684. Its exact reencryption does not authenticate the key.

[b=0 cyclic SFT](../sims/lp2_p32_two_halves_period11_inverse_sft.cjs) · [raw](lp2-p32-two-halves-period11-output.json) · [unknown-b cyclic SFT](../sims/lp2_p32_two_halves_period11_shift_inverse_sft.cjs) · [raw](lp2-p32-two-halves-period11-shift-output.json).

## 4. Duplicate plaintext under complementary shifts

A simpler, more identifiable specialization is P_L=P_R=P (same text twice, with opposite key sign). For s=+1, every original difference C_R−C_L must equal b; the forward/mirror differences have 21/24 distinct values, so this case is exactly impossible. For s=−1, the inverse is P[i]=15(C_L[i]+C_R[i]−b) mod29, since 15 is the inverse of 2. This fixes both plaintext and arbitrary pad for each b. All 29 values are enumerated, independently of any printed words or periodicity.

All eight fresh native/Gibran plants recover the true b at rank1, the exact 55-rune plaintext and all 55 pad digits. Their mean scores range −3.250839 to −2.173291. Original best scores are −5.957962 (forward, b=3) and −5.751132 (mirror, b=4), both incoherent. This is a complete inverse and finite language-negative for the exact duplicate-text model, not arbitrary independent plaintexts. [SFT](../sims/lp2_p32_two_halves_duplicate_inverse_sft.cjs) · [all candidates](lp2-p32-two-halves-duplicate-output.json).

## 5. All-key q11 bound: no unary-domain pruning

The q11 receiver's most important limitation is the top12 pruning. Remove it by representing the complete full-page joint log score as the sum of eleven cyclic three-key factors F_j(k_{j−2},k_{j−1},k_j). Each factor collects all unigram, bigram and trigram terms ending in phase j over both streams. Each variable has all 29 values. Unroll the cycle at each possible cut, allowing its first two variable copies to differ from the final two copies; every genuine cyclic key remains feasible and all original factors are counted exactly once. Exact ordinary chain Viterbi with free initial pair and final pair gives an upper bound for that cut. Take the minimum of all eleven cut bounds (still an upper bound), then maximize over all29 values of b separately for each orientation/sign. Complexity is O(29^3 × 11^2 × 29) per orientation/sign, rather than 29^11 keys.

A fresh set of eight genuine periodic native/Gibran plants, not used to tune the pruning, has actual paired plaintext scores −2.610939 to −2.104630. Every bound contains the true score to 1e−9; all eight minimum-cut upper bounds equal their actual true-key scores to that tolerance. In contrast:

| Original half orientation | s | All-key upper bound b=0 | Upper bound granting every b |
|---|---:|---:|---:|
| Forward | +1 | −3.851584 | −3.752156 |
| Forward | −1 | −3.912759 | −3.782447 |
| Mirror | +1 | −3.990443 | −3.806022 |
| Mirror | −1 | −4.037009 | −3.788540 |

Thus **every** one of the 29^11 cyclic keys for **every** b and each fixed orientation/sign is below even the weakest of these eight genuine native controls under this specific trigram score. This is an all-key bound under the explicit source geometry and cipher, not a universal English-language theorem. It closes the top12 pruning objection without requiring exhaustive enumeration or another fitted original key. [SFT](../sims/lp2_p32_two_halves_period11_allkey_upper_sft.cjs) · [all 116 shift bounds and 11 cuts each](lp2-p32-two-halves-period11-allkey-upper-output.json).

## 6. Exact shared affine pair inverse, including a public center operand (Agent8)

The conditional TWA ("two") and 11×11 reflow also permit a two-dimensional substitution without a shared pad. Treat the actual left and right strips as paired inputs; each pair is transformed by a single inverse matrix A in GL(2,29) and a constant two-rune translation d. A source-linked extension grants the eleven printed center glyphs Z=[1,22,16,7,24,7,24,27,17,9,11] as public row operands, each repeated five times: P_i=A(C_L[i],C_R[i])^T + g Z_i + d mod29. The two streams are separately scored in row-major order; right columns may be forward or mirrored within each row. No central glyph is hidden or fitted, and no F exception, boundary, or arbitrary row-private state is granted. This geometry and the affine interpretation are hypotheses, not established instructions.

**Exact all-key search:** each output row is a nonzero linear form (a,b) on the paired ciphertext plus an intercept d; in the extension add gZ. Its score is independent of the other output row. Group rows by their projective direction (30 classes); the global maximum is the sum of the two highest class maxima, because invertibility requires distinct directions. There are 24,360 forms in the constant case and 706,440 in the center case, covering 573,629,280 and 482,422,224,480 ordered invertible maps respectively. No beam, key pruning, or heuristic optimization. Decode the first eight rows (40 pairs), freeze all coefficients, score the last three rows (15 pairs) without fitting. Separate full-page maxima are exact for the chosen interpolated trigram score; they are not predictive. Every output is forward-inverted exactly. Stream exchange is intrinsically unidentifiable under symmetric scoring.

| Receiver | Genuine planted keys (up to stream exchange) | Genuine withheld runes | Control held score | Original held forward / mirrored | Exact original full maxima forward / mirrored |
| --- | ---: | ---: | --- | --- | --- |
| Constant affine pair | 12/12 | 360/360 | −2.925463 to −1.999064 | −6.606761 / −6.199678 | −4.827223 / −4.812766 |
| Public center affine pair | 6/6 | 180/180 | −2.666612 to −2.159720 | −7.567116 / −7.704976 | −4.489229 / −4.421656 |

Controls use fresh independent held Gibran and authentic solved GP29 text windows, encrypted with hidden random invertible matrices, translations and (for the extension) a nonzero public-center coefficient vector. In each experiment the training language reference is Shakespeare and Emerson, as above. Held-out scores include the two preceding decoded training runes for trigram context. All original candidates are incoherent; the best full center model's apparent short words are optimized artifacts. The extra center operand improves the retrospective maximum and worsens the frozen continuation. Neither a key nor unknown plaintext is authenticated. The exact result retires these shared two-stream affine receivers under the specified p32 geometry and native-prose score; it does not exclude nonlinear, interleaved-plaintext, different geometry, or dynamic pair ciphers.

[Constant affine SFT](../sims/lp2_p32_two_halves_affine_pair_sft.cjs) · [raw](lp2-p32-two-halves-affine-pair-output.json) · [public-center SFT](../sims/lp2_p32_two_halves_center_affine_sft.cjs) · [raw](lp2-p32-two-halves-center-affine-output.json).

## 7. Exact physical-row continuous plaintext inverse (Agent8)

The preceding affine-pair decision assumes two separately coherent streams. A distinct source-reading hypothesis places the recovered five left and five right symbols back into the inferred 11×11 physical row order, with the center treated as a public instruction strip and omitted from the 110-rune plaintext. In the mirrored orientation, the right recovered strip is reversed back to its physical order before reading. Use the same shared GL(2,29) inverse and constant translation, but score one continuous plaintext, including all row seams.

**Exact coupled inverse:** for each of the 24,360 possible affine rows, precompute the three internal trigram terms per five-rune strip and the first/last two symbols. For any incoming strip starting x,y, upper-bound its two cross-seam terms by max over u,v of log p(x|u,v)+log p(y|v,x). The actual seam value is precomputed for all 29^4 endpoints. Each row's summed independent bound is admissible. Sort both candidate lists by these bounds; evaluate only pairs whose sum can beat the best complete score and whose two directions are independent. During evaluation replace each optimistic seam term with the actual one; each replacement is nonpositive, allowing early rejection. All 573,629,280 ordered invertible maps are therefore covered without enumerating every pair. The initial unigram and bigram are exact; the winning objective is directly rescored and checked against forward replay.

Eight fresh contiguous held-out Gibran/native controls (four forward, four mirror) recover **8/8 exact ordered keys and 240/240 genuinely withheld runes**. True held means range −2.920604 to −2.150400. The original is fit on the first eight physical rows, with three rows withheld:

| Orientation | Prefix fit | Frozen held | Exact full score maximum | Full-search partially pruned pairs |
| --- | ---: | ---: | ---: | ---: |
| Forward | −4.414120 | −7.907717 | −4.715188 | 11,142,130 |
| Mirrored | −4.234821 | −6.377084 | −4.603726 | 4,734,406 |

Both exact full maxima are incoherent; the apparent initial WHO in one fitted output is model-generated and not recovered plaintext. This removes the separate-stream reading assumption for the constant affine pair family. It does not test a center-dependent map under interleaving, nonlinear or dynamic transforms, or the original six-line layout without the inferred square.

[Physical-row SFT](../sims/lp2_p32_row_interleaved_affine_sft.cjs) · [raw](lp2-p32-row-interleaved-affine-output.json).

## Research decision

The literal-donor model is exactly negative within its library. The unconstrained joint language model cannot recover even genuine arbitrary pads. Imposing a period-11 shared key enables a strong predictive inverse but gives null-like original continuations and an all-key score bound below the independent native controls. The same-text duplicate and exact two-stream affine-pair models also fail, including the printed center as a public translation operand. Constant affine maps also fail when the two strips are rejoined into continuous physical-row prose. There is no credible plaintext. Retire these specific two-half receivers absent independent source evidence selecting a different pad law or geometry; do not treat local words produced by the optimizer as decrypted fragments. A new source-selected key/receiver is more valuable than increasing a generic n-gram search.

All Agent8 experiment cores executed in connected JavaScript V8 on pinned repository inputs; the standalone Windows Node wrappers were not separately run. No new CI workflow. No change to the authoritative solution frontier.
