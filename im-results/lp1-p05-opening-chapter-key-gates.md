# LP1 p05 to LP2 opening: source-derived 13/179-key transfer gates

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

## Decision and next step

Reject only these source-derived **zero-phase direct additive** transfers from LP1 p05 to the LP2 p0–p2 opening:

- the 13-word prime-sum key and its totient transform;
- the 179-byte payload under the four fixed byte-to-GP29 maps, repeated four times.

Do not rescue the result with arbitrary key offsets, F masks, phase changes, key permutations, or KDFs. Those would add operations not selected by the original artifacts. A future p05-to-LP2 attempt needs a new independent clue that selects a different reversible operation or recipient. The result does not reject other uses of p05, stateful ciphers, an external key, or a non-English register.

**Reproducer:** sims/lp1_p05_opening_chapter_key_gates_sft.cjs.
