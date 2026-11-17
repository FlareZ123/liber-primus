# LP1 p05 to LP2 opening: source-derived 13/179 keys and four-lane inverse gates

**Agent13, 17 November 2026. Classification: bounded original-cipher negative.** No unknown plaintext, authentic LP2 key, complete cipher mechanism, or destination was recovered.

## Hypothesis and human-solve-path rationale

The first-release LP1 physical p05 page offers two source-derived candidate key objects:

1. Its 5×5 Wisdom square contains **13 rune-word cells**. Their original GP-prime sums are [341,366,199,130,320,245,91,226,320,130,199,366,341]. The page explicitly foregrounds primes and the totient function.
2. The same original 05.jpg contains the already documented **179-byte Onion 3 out-of-band payload**, SHA-256 82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa.

The LP2 opening has an independently source-adjudicated **13-rune red title**, followed by a **13-dot marker**. Removing the title leaves **716 black-body runes across p0–p2**: 262 + 266 + 201 total runes, less the 13 red heading runes. Thus the 13-word p05 object offers a period-13 candidate, while the p05 179-byte payload divides the opening body exactly four times: **716 = 4 × 179**.

This is a plausible cross-release transfer to test, not an established author instruction. The strongest rival is that the p05 counts and p0 boundary are independent design features, and the 179-byte serialization is merely the representation of the already solved 2014 square. The experiment therefore freezes only simple direct additive GP29 consumers, with no fitted phase, key rotation, page reset, F mask, KDF, or new cipher layer.

Related work already tested p05's 13-cell keys against p55 and the 179-byte payload against moth-selected p53. This report records a different recipient: the complete 716-rune opening body. The p05 source extraction itself is not claimed as a new discovery; see the p05 square reproduction (lp1-p05-trailer-mobius-matrix.md), the 13-cell p55 gate (lp1-p05-wordcell13-p55-vigenere-gate.md), and the 179-byte p53 gate (lp1-p05-hidden179-p53-moth-rawpad-gate.md).

## Frozen original inputs

- LP2 source corpus: resources/liber-primus/lp2-corpus.json.
- LP2 physical p0 ink classification: resources/liber-primus/lp2-ink-annotations.json; red heading span begins at offset 0 and has length 13.
- LP1 physical p05 original JPEG: resources/liber-primus/05.jpg, 673,066 bytes, SHA-256 2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7.
- p05's 360-byte block immediately after the first JPEG EOI consists of two LF bytes and 358 hex digits. Decoding the hex gives the 179-byte payload above. The remainder is the reversed prefix of the first JPEG, already documented in the linked p05 report.
- The target is the first 13 runes of p0 excluded, followed by p0's remaining 249 runes, all 266 p1 runes, and all 201 p2 runes: **716 original GP29 symbols**, one continuous body register.

The 13 original p05 verbal cells, in printed row-major order, are:

SHADOWS, AETHEREAL, BUFFERS, UOID, CARNAL, OBSCURA, FORM, MOBIUS, ANALOG, UOID, MOURNFUL, AETHEREAL, CABAL.

Their GP rune lengths are [7,6,7,4,6,7,4,6,6,4,8,6,5], totaling 76. Their prime-sum key residues and totient-of-sum residues modulo 29 are:

- Prime-sum: [22,18,25,14,1,13,4,23,1,14,25,18,22].
- Totient: [10,4,24,19,12,23,14,25,12,19,24,4,10].

## Exact tests

For each fixed key K, decrypt the untouched original body C by both ordinary additive directions:

\[
P_i=(C_i-K_{i\bmod |K|})\bmod29
\qquad\text{and}\qquad
P_i=(C_i+K_{i\bmod |K|})\bmod29.
\]

The period-13 candidates use the p05 word prime-sum residues and the Euler totient of each sum. The 179-byte candidates repeat the payload exactly four times, using four fixed byte-to-GP29 maps already evaluated for the same payload against p53:

1. raw byte modulo 29;
2. nibble-swapped byte modulo 29;
3. floor(29b/256);
4. the same scaled map after nibble swap.

This gives **12 complete inverses**: two period-13 keys × two signs, plus four period-179 keys × two signs. The key starts at the first black rune after the original p0 red title; the register continues through the physical p0/p1/p2 boundaries. No phase, page reset, F bypass, word skip, key permutation, or alternate alphabet is fitted.

The independent GP29 trigram model uses the first 200,000 characters of resources/control/shakespeare_first300k.txt for training and the final 100,000 for held-out control. The 2,000 native comparison windows each contain 716 GP runes and are sampled at fixed stride 35. Each candidate is also forward-re-encrypted to the exact original ciphertext, and the same inverse is checked on a freshly encrypted held-out native-GP control. These round trips validate implementation, not the historical key hypothesis.

## Original results

| Fixed key | Direction | IoC | GP trigram score (nats/rune) |
|---|---|---:|---:|
| p05 13 prime-sum residues | C−K | 0.034410 | −3.904722 |
| p05 13 prime-sum residues | C+K | 0.034172 | −3.860419 |
| p05 13 totient residues | C−K | 0.034957 | −3.852264 |
| p05 13 totient residues | C+K | 0.034211 | −3.786269 |
| p05 179 raw byte mod29 | C−K | 0.034086 | −3.990482 |
| p05 179 raw byte mod29 | C+K | 0.034629 | −3.933147 |
| p05 179 nibble byte mod29 | C−K | 0.034824 | −3.788731 |
| p05 179 nibble byte mod29 | C+K | 0.034328 | −3.897123 |
| p05 179 raw byte scaled29 | C−K | 0.034063 | −3.878536 |
| p05 179 raw byte scaled29 | C+K | 0.034317 | −3.917413 |
| p05 179 nibble byte scaled29 | C−K | 0.034402 | −3.952865 |
| p05 179 nibble byte scaled29 | C+K | 0.034293 | **−3.700725** |

The unchanged original body has IoC **0.034102** and trigram score **−3.952042**. The best of the 12 candidates is still **1.280 nats/rune below the worst** of the 2,000 native held-out windows:

| Control | IoC | Trigram score (nats/rune) |
|---|---:|---:|
| Native held-out 716-rune sample | 0.061585 | −2.147060 |
| 2,000 native windows: minimum | — | −2.420576 |
| 2,000 native windows: fifth percentile | — | −2.361031 |
| 2,000 native windows: median | — | −2.235118 |
| 2,000 native windows: maximum | — | −2.090275 |

All 12 original outputs remain near the uniform GP29 IoC baseline 1/29, and none develops readable GP prose. The native-GP positive controls re-encrypt and recover exactly under every tested key and sign.

## Four source-sized 179-rune lanes: an all-secret original-cipher gate (Agent48, 17 November 2026)

The original 716-rune p0–p2 black opening can be partitioned, without modifying a symbol, into four consecutive 179-rune lanes. **Critical relative-strength correction:** the 179 bytes are only a nibble-swapped ASCII serialization of the already solved LP1 p05 5×5 numeric square, with deliberate padding, numerals and five lines. It is not an independently generated 179-byte secret. More importantly, the original p53 has precisely **179 ciphertext runes** and a physically copied moth illustration from solved LP1 p05, independently source-selecting a different recipient (see [p53 moth source gate](lp1-p05-hidden179-p53-moth-rawpad-gate.md) and [pixel match](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md)). The p0 fourfold relation has **no corresponding visual/source selector**, so it is secondary to p53 as an intended human solve path. This original-input experiment is a bound on that weaker possibility, not evidence that Cicada used the 716=4×179 relationship. The number 179 comes from the genuine LP1 p05 JPEG appended Onion3 payload; earlier source analysis already rejected four direct repeated-179-byte additive keys. This new test asks whether four ordinary GP29 plaintext streams could have been encrypted by a single secret GP29 alphabet at each of the 179 column positions, reused across all four lanes.

For any one phase j and any two lanes a and b, any deterministic secret function f_j shared across the four lanes obeys the **one-way key-free implication**: if P[a,j] = P[b,j], then C[a,j] = C[b,j]. If f_j is bijective, the converse also holds. Consequently, the observed original ciphertext's equal-pair count is an **upper bound** on the plaintext equal-pair count for *every shared deterministic phase179 mapping*, including non-injective many-to-one maps. A separately changing or randomized emission state is outside this bound. Under bijective symbol maps the equal-pair count is exactly invariant for all (29!)^179 secret phase-table choices; under an arbitrary deterministic many-to-one table the plaintext count can only be lower than the ciphertext count. This test needs no key, byte serialization or alphabet assignment; phasewise Caesar and affine substitutions are included.

The unchanged original ciphertext has only **29 same-symbol pairs across the 1,074 aligned cross-lane pairs** (six lane pairs times 179 positions), in 28 distinct columns and with no triple-match column. Each original lane has precisely one within-lane adjacent equal-rune transition. Conditional on four adjacent repeats uniformly located among the 715 actual body transitions, chance of exactly one among each of the four sets of 178 within-lane transitions is **178^4 / C(715,4) = 0.09296457**. The exact one-per-lane event is therefore a modest (~9.3%) pattern and supplies no independent proof of a 179-phase cipher; the collision test is the principal negative. A deterministic 20,000-quartet matched native-GP29 comparison uses the repository Shakespeare/Gibran/Emerson control texts, with Shakespeare for both first and fourth lane, exact 179-symbol windows, and xorshift32 seed 20261117. Those controls have minimum 27, first percentile 45, median 62, maximum 108, and just **1 of 20,000 at or below the original 29**. A planted 716-rune genuine literary-positive cipher using 179 independently random secret 29-permutations, each reused on four lanes, exactly recovers all 716 plaintext runes; the collision statistic is exactly invariant under its encryption.

A separate fixed direct four-share reading uses signed arithmetic modulo29 at each column: choose the first sign positive, then enumerate all eight assignments of plus/minus to the other three lanes. This yields a 179-rune plaintext candidate per sign pattern. Across the exact original ciphertext, all eight GP29 IoCs are 0.033457–0.042119 and all eight trigram log scores are -4.194867 to -3.452848 nats/rune. By comparison, the worst of 2,000 independently held-out genuine Shakespeare-GP29 179-rune windows scores -2.575897. All eight candidate folds remain nonprose. They are invertible given the other three lanes, and an independently planted four-share additive cipher recovers all 179 authentic literary GP29 plaintext symbols, so the negative does not arise from a broken decoder.

### Four-of-four direct Shamir interpolation on the original 4×179 lanes

The 2013 Cicada puzzle used Shamir secret sharing and the earlier GP source foregrounds primes. A fixed consumer for the genuine 716=4×179 length relationship is to interpret four original contiguous 179-rune blocks as cubic GF29 shares at x=1,2,3,4, then evaluate the hidden polynomial at x=0. Its exact keyless Lagrange weights are **[4,-6,4,-1] modulo29**. This differs from all eight signed ±1 combinations above and requires no secret coefficients.

On 179 unchanged original source columns, the decoded output has **GP29 index of coincidence 0.0323896805** and **native-GP29 trigram -4.19237228 nats/rune**. All 2,000 genuine heldout native-Shakespeare 179-rune windows score better, the least native score being **-2.57589656**. An independent genuine native-GP secret at 179 positions is split into four randomized cubic evaluations, and the source-fixed inverse recovers all **179/179** plaintext runes exactly. The SFT verifies the full model on original inputs and source-native positive.

This direct four-of-four Shamir plaintext reading fails. Although 2013 Cicada included real secret sharing, **no 2014/LP2 authored instruction specifies that these 179-rune blocks are shares**. A changing share field, independent encipherment of shares, or a different plaintext register would be separate hypotheses. No original unknown plaintext or key recovered. [Passing Windows Node22 complete source-native SFT](https://github.com/FlareZ123/liber-primus/actions/runs/44105860274).

### Original-rank28 outer layer before the same 179-phase secret register

The original anti-repeat anomaly invites a stronger follow-through: first invert a strict 28-of-29 ciphertext-rank emission, then allow **179 completely arbitrary secret 28-symbol alphabets**, one per column and reused across four native-GP28 plaintext lanes. Two standard, independently specified rank inverses are tested: sorted exclusion `R[i] = C[i] - [C[i] > C[i-1]]`, and cyclic exclusion `R[i] = (C[i]-C[i-1] mod29)-1`. The source's four equal adjacent black-body runes cannot be encoded by either strict 28-choice mechanism. We conservatively erase those four positions and the opening body-initial rune, leaving **711 valid inner ranks** without assigning a favorable symbol to any exception.

For each of the resulting **1,059 original same-phase cross-lane pair comparisons** that have both ranks present, the sorted inverse yields **29** equal inner symbols and the cyclic inverse yields **45**. Both exact values are invariant under every possible shared 179-phase secret 28-symbol permutation, so no secret phase key can change the necessary statistic. A separate fixed-seed (`0x20141179`) reference of **10,000** original-sized four-stream native-GP28 English quartets, with the rarely used EA rune folded onto AE to construct an honest 28-state register, gives minimum **36** and median **62** equal pairs. **Sorted: 0/10,000** reference quartets score as low as the original 29. **Cyclic: 174/10,000** score as low as the original 45. This strongly disfavours the **sorted** 179-phase rank-plus-secret-table architecture; the cyclic case is weaker evidence against its source-native letter model.

For implementation sensitivity the SFT encrypts four actual native-GP28 179-rune texts under **179 independently shuffled secret 28-permutations**, applies both exact no-repeat outer encoders and inverts them, recovering **711/711** legal ranks. It additionally plants the **five known erasure positions** using an explicit sidecar carrying their native plaintext, and reconstructs the complete **716/716** only when that sidecar is supplied. This positive-control sidecar is deliberately stronger than the original evidence: no original puzzle material specifies it. A strict encoder without an exception channel already fails on the source's four real adjacent repeats.

**Source decision:** Reject the strict sorted de-repeat outer plus a phase179 reused secret GP28 alphabet for original-shaped native plaintext, even after favorably erasing all five noninvertible positions. The cyclic alternative is moderately disfavored under the same control but cannot be treated as mathematically excluded. Do not generalize to changing phase keys, separately rekeyed lanes, different rank orderings, or unknown outer layers. [Passed Windows Node22 source-native SFT](https://github.com/FlareZ123/liber-primus/actions/runs/44103201236).

**Decision:** The source-sized 179-column, four-lane **shared-per-phase deterministic rune-map family** is strongly incompatible with the tested native-GP29 English plaintext register, regardless of its 179 arbitrary secret permutation values. The eight one-layer signed four-share arithmetic plaintext readings are also negative. This excludes only stationary shared phase alphabets and these eight fixed direct folds, with unchanged GP29 segmentation; it leaves extra layers, per-lane rekeying, unusual registers, or a separately authored framing rule open. The 716=4×179 numerical relationship has no authenticated Cicada instruction selecting four shares. **No authentic unknown-page plaintext, creator key, or continuation was recovered.**

**Reproduction:** [read-only Node22 CommonJS SFT](../sims/lp1_p05_fourlane179_sharedphase_invariant_sft.cjs), using original JPEG and canonical LP2 corpus, exact 179-phase invariant, fixed-seed 20,000 controls, 716/716 full-secret positive, all eight four-share folds, independent native trigram holdouts and 179/179 additive share positive. Original numeric tests were separately executed against the committed source data. A complete Windows Node22 read-only source-input execution of the expanded original/plaintext-positive SFT **passed** [run 44103201236](https://github.com/FlareZ123/liber-primus/actions/runs/44103201236).

## Decision and next step

Reject these finite source-derived original-input key/decoder families under the preserved GP29-English register:

- the 13-word prime-sum key and its totient transform;
- the 179-byte payload under the four fixed byte-to-GP29 maps, repeated four times;
- all unknown secret GP29 substitution alphabets reused at each of 179 phases across four lanes, under original word/rune geometry;
- eight direct four-share signed GP29 reductions.

Do not rescue the result with arbitrary key offsets, F masks, phase changes, key permutations, or KDFs. Those would add operations not selected by the original artifacts. A future p05-to-LP2 attempt needs a new independent clue that selects a different reversible operation or recipient. The result does not reject other uses of p05, stateful ciphers, an external key, or a non-English register.

**Reproducers:** `sims/lp1_p05_opening_chapter_key_gates_sft.cjs` (direct keys) and `sims/lp1_p05_fourlane179_sharedphase_invariant_sft.cjs` (all-secret phase179 and direct signed folds).
