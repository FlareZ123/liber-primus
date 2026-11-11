# P39 polynomial jet: autonomous and ciphertext-driven original-input gates

**Classification:** exact original-source arithmetic and two bounded original-cipher negatives. Unknown LP2 plaintext, an authentic key, and the historical encryption method remain unrecovered. Reproduction: [autonomous-clock test](../sims/p39_grid_jet_autonomous_state_sft.cjs) and [ciphertext-driven feed-forward test](../sims/p39_grid_jet_ciphertext_feedforward_sft.cjs).

## Source-extractable proposal

The marked p39 three-rune red span at local offset 119 gives GP29 indices **[27,5,15]**. Read the unchanged 256-byte row-major printed table as descending coefficients of a polynomial P over GF(29); original byte SHA-256 is **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. The exact original-source jet is **[P(15), P'(15), 15] = [27,5,15]**. Input 14 produces the same value and derivative, so the jet does not identify its input uniquely. Also P(24)=P'(24)=0 at the enlarged p54 Ac, and the derivative's only zero inputs are 13 and 24, with P(13)=8. These are algebraic identities, not an authenticated instruction to differentiate the table.

The smallest natural state-machine interpretation of a triple displaying a value, derivative and input is to initialize **s=15**, emit **k=P(s)**, then update **s=P'(s)**. To test an invertible direct GP29 decoder, apply **plaintext = ciphertext plus or minus k (mod 29)**. Compare a source-seed15 book-continuous stream against seed15 restarted at each physical page. An all-secret finite gate tests the same two signs and two clock conventions for each of the 29 possible initial states: **116 distinct parameter combinations** (some yield identical keystreams). No hidden extra state, alphabet permutations, fitted phases or cipher layers are introduced.

## Exact state graph and implication

Under this unmodified polynomial the derivative map on the 29 field elements has **one fixed point, 27**, and **one length-five cycle, [16,21,12,3,7]**. Seven initial states enter the fixed-point basin; the other 22 enter the five-cycle. The maximum transient length is **six**. From the marked seed 15 the states are:

15 → 5 → 19 → 16 → 21 → 12 → 3 → 7 → 16.

The first eight emitted key indices are **[27,4,10,2,14,5,3,1]**; the subsequent repeated five-key block is **[2,14,5,3,1]**. Two pairs of seeds, **14/15** and **21/25**, have identical *entire* keystreams, leaving **27 distinct streams** from 29 initial states. Every autonomous derivative-driven pad of this specific form becomes constant or period-five within at most six runes. This is a mathematical obstruction to a genuinely long original-text keystream regardless of the unknown seed.

## Full original test and positive control

All **12,956** unknown-LP2 rune indices were evaluated under the 116 choices. Every inverse exactly re-encrypts the corresponding original ciphertext, as a bijective implementation must. A trigram model was trained on 100,000 GP-normalized Shakespeare symbols and calibrated on a disjoint 12,956-rune passage; no LP2 ciphertext was used to fit its parameters.

| Material | GP29 trigram log score, nats/rune | Index of coincidence |
| --- | ---: | ---: |
| Independent native Shakespeare passage | **−2.45950** | **0.05884076** |
| Raw unknown LP2 ciphertext | −4.14750 | 0.03447840 |
| **Best of all 116** inversions: seed9, subtract, page reset | **−4.14758** | 0.03449676 |
| Marked seed15, subtract, page reset | −4.15027 | 0.03449885 |
| Marked seed15, subtract, continuous | −4.15999 | 0.03451096 |
| Marked seed15, add, page reset | −4.17103 | 0.03449840 |
| Marked seed15, add, continuous | −4.17515 | 0.03446604 |

Even the best of the 116 original outputs scores slightly *below* the unmodified ciphertext; all remain near GP29's uniform 1/29 coincidence baseline. The source-seed15 additive cipher also correctly enciphers and recovers a separate GP Shakespeare plant **12,956/12,956** with recovered language score **−2.45950**, while the wrong fixed-point seed27 scores **−4.23687**. This plant shows that the implementation discriminates keys when this mechanism actually generated the text. It does not authenticate the mechanism for LP2.

## Ciphertext-driven feed-forward comparison (Agent 30, 11 November 2026)

The autonomous derivative clock rapidly becomes period-five, so one distinct, still source-shaped causal reading is to **evaluate the printed table polynomial at the previously published ciphertext rune itself**. This generates a potentially aperiodic key without introducing a hidden state. Freeze the marked p39 value `15` as the initial previous-ciphertext rune. For `J=P` or `J=P'`, test the exact inverse

`plaintext[i] = ciphertext[i] + sign × J(ciphertext[i−1]) (mod 29)`,

with `sign = ±1` and a book-continuous or physical-page reset to 15. This produces **eight** complete, invertible variants, without an unknown fitted parameter, glyph deletion, or extra cipher layer. Their forward encoders use the *actual preceding emitted ciphertext*, so synthetic planted-input and original-source round-trip checks are exact. The p39 triplet specifies the polynomial value/derivative and a point; it **does not specify** using the previous ciphertext glyph, so these are finite candidate operations rather than authenticated decoders.

All 12,956 original unsolved runes were decoded with the exact 256 original table bytes (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). The unmodified GP29 IoC is **0.0344783979**. The eight decoded IoCs are:

| Key function and sign | Book-continuous | Page-reset |
| --- | ---: | ---: |
| `P`, negative | 0.0344918746 | 0.0344902540 |
| `P`, positive | 0.0345041955 | 0.0345031111 |
| `P'`, negative | 0.0344866078 | 0.0344894676 |
| `P'`, positive | 0.0345353314 | 0.0345340802 |

Each decoded prefix remains nonlinguistic. All eight full original candidates encode back to exactly **12,956/12,956** original runes, as any invertible feed-forward transform should. The reproducer asserts the exact original table checksum, `[P(15),P'(15)]=[27,5]`, original ciphertext count and all frozen IoCs. It also encrypts and recovers an independent 18-GP-symbol planted sequence under every trial transform. Original results are near the uniform **1/29** baseline and far below the source-native English comparison of **0.05884076** documented in the autonomous-clock section. This rejects the *specific one-step source-value/derivative feed-forward* route for direct native-GP29 prose, without excluding a source-selected different feedback rule or non-GP intermediate.

## Decision and scope

The visible p39 jet suggests finite operations, but the tested **autonomous derivative-state / value-pad** and **one-step ciphertext-dependent value/derivative feed-forward** direct-GP29 architectures are negative under book-continuous and page-reset clocks. The actual historical meaning of the marked triplet remains unresolved; a different ciphertext-dependent register, field representation or non-GP intermediate would require an independent source instruction. Further arbitrary five-period pad fitting would repeat discarded search families.

Related: [original marked-triad source-root evidence](../sims/lp2_red_triad_extension_root_sft.cjs), [complete grid factorization](lp2-grid-complete-gf29-factorization.md), and [integrated original-input challenge](../workplace/integrated-original-inversion-challenge.md). The p39 jet equality itself was previously noted in the Issue #3 discussion; the new contribution is the explicit autonomous dynamical interpretation, exact collapse theorem and all-state original-input negative.
