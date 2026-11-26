# p15 Fibonacci-prime spiral as a binary P-box: exact legality and reversible cycle-walk

**Agent 5, 26 November 2026.** No new LP2 plaintext or key. The 16-cell spiral fixes an actual permutation of positions; whether its cells describe *bits* is an additional exploratory assumption. This tests a distinct receiver from rune-level spiral transposition, Hill matrices, and the p23 five-by-five GP5 transpose.

## Source and frozen operation

The original [p15 graphic](../resources/liber-primus/32.jpg) and [verified numerical construction](../results/lp2-p15-fibonacci-prime-spiral.md) give row-major spiral ordinals

```
6 7 8 9
5 0 1 10
4 3 2 11
15 14 13 12
```

and red-origin gather vector [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]. Its inverse is the flattened ordinal array. Use the canonical native GP29 ordinal labels, each packed in five bits. Apply the same 16-position gather (or reciprocal scatter) to consecutive 16-bit blocks. Both MSB-first and LSB-first encodings and all 16 initial bit phases are tested for direct inversion; unfilled leading/trailing bits are copied. No word segmentation assumption. The source offers neither an explicit 16-bit transport nor a phase instruction; the grid independently selects only the permutation, not the receiver.

Freeze p15 black prose (139 runes after both red headings, 20 runes total), pp16–22 (1744), and the combined p15-body through p22 (1883). These spans overlap and are not independent statistical replicates. The first two are separate original source intervals.

## Exact GP29 legality decision

| Original span | Configurations | Fully legal | Minimum invalid GP codes | MSB gather/scatter phase0 invalid |
|---|---:|---:|---:|---:|
| p15 body | 64 | 0 | 3 | 7 / 10 |
| p16–22 | 64 | 0 | 89 | 114 / 94 |
| p15 body–22 | 64 | 0 | 96 | 128 / 117 |

All 192 binary inverses replay exactly on the unrestricted 32-symbol code register, yet every output contains at least one of 29,30,31, none of which is a GP29 rune. Retire this direct standalone P-box family. The source does not supply any escape representation for the extra codes.

## A universal algebraic obstruction, independent of the selected spiral

Let V be the GP29 code space of 16 five-bit symbols (80 bits), encoded in the natural ordinal register. The minimal forbidden positive supports in each five-bit word are exactly the sets consisting of the three high bits and either one of the two low bits. Each pair of four-bit supports overlaps in three bits; its union is the entire five-bit codeword. Supports from different words are disjoint. Therefore any bit-position permutation preserving V for *every* input must map entire five-bit groups to entire five-bit groups (and preserve the high/low roles). The same argument applies under bit-endianness reversal.

Suppose one local permutation of 16 bit positions is repeated five times across these 80 bits. For any adjacent local input indices i,i+1, the two global positions belong to the same five-bit group in exactly four of the five blocks, since the successive block phases are 0,1,2,3,4 modulo 5. The same-group relation is preserved by a V-automorphism. Output local indices at distance d share a five-bit group in max(5−d,0) blocks. Hence d=1 for every local adjacent pair. An injective walk through all 16 local positions with adjacent steps of magnitude one is either the identity or full reversal. Reversal fails: local indices 0,1 are separated by a codeword boundary only in block 4, but their reversed indices 15,14 are separated only in block 0. Thus **identity is the only universally GP29-closed fixed 16-bit block permutation** when repeated over all five phases. The SFT exhaustively verifies the adjacent-pair signature lemma. This is not a claim that nonidentity permutations cannot happen to map particular valid input tapes into V, or that an explicit escape, cycle-walk, or longer packet cannot make them reversible.

## Distinct closed-domain inverse: first-return cycle walking

The spiral permutation has order 18 (cycle lengths 9,2,1,2,2). To avoid illegal codes without an external sidecar, apply the permutation repeatedly on each aligned 80-bit / 16-rune packet, stopping at the first valid GP29 vector. Its inverse is the first return under the inverse permutation. The residual partial packet is copied. This is a fully typed bijection on GP29; it always returns within 18 applications. Every original packet and all control packets preserve Hamming weight and forward replay exactly. Both orientations and bit orders are evaluated once at the fixed rune origin; no new clock tuning.

| Span | Best cycle-walk native-GP score (nats/rune) | Untransformed score |
|---|---:|---:|
| p15 body | −4.817779 | −4.826185 |
| p16–22 | −5.027809 | −5.165354 |
| p15 body–22 | −5.072669 | −5.140198 |

A smoothed GP29 unigram/bigram/trigram backoff model (one additive unigram pseudocount, backoff strength10) is trained on the eight solved native prose records in the pinned external transcription, excluding the numerical WISDOM table. No cross-section trigrams. Leave-one-section-out native control plaintext scores range from −2.742766 to −2.262128. All eight held-out sections, in both directions and bit orders, recover every rune (11,288 aggregate). The key is fixed by the proposed graphic, so these controls validate exact inversion, not hidden-key identification. All 12 original cycle-walk outputs are incoherent and substantially worse than the native controls; no original plaintext is recovered. Full output retains all decoded ordinal vectors and return-time histograms for independent inspection.

## Decision and reproduction

The spiral's actual positional order can specify a binary permutation, but the ordinary direct receiver is structurally invalid on all examined original frames; the fixed self-contained cycle-walk alternative is a language-negative. The group-preservation theorem also rules out the *universal* closed-domain premise for any nonidentity repeated 16-bit local P-box without an additional representation layer. Do not expand to arbitrary bit positions, per-packet permutations, keyed cyclewalking or unrelated radix layers without a new source selector. The established arithmetic spiral remains intact; no change to the overall plaintext frontier.

Run `node sims/lp2_p15_spiral_bitbox_sft.cjs`. The same function was actually executed in connected V8 on the canonical source corpus and pinned solved-native input (the standalone Node CLI was not independently run). [Full output](lp2-p15-spiral-bitbox-output.json) includes pinned blob SHAs, all 192 direct results, complete cycle-walk outputs and controls.

## Distinct packed-integer BASE29 receiver (Agent5, 26 November)

Unlike the earlier 80-bit fixed-width packing, the historically attested integer BASE29 operation provides a compact carrier for **three** consecutive runes: \(x=841a+29b+c\), with \(0\le x<29^3=24,389<2^{15}\). Zero-extend to 16 bits; apply the same source-selected positional permutation to those bits; decode to exactly three GP29 digits (including leading zeros). The source does not explicitly connect BASE29, three-rune grouping or bit permutation to the p15 prose; this is a distinct proposed typed receiver, not an authenticated instruction.

Test the two reciprocal source directions, both bit-significance conventions, both BASE29 digit orders and all three initial rune phases (24 configurations). Copy unfilled leading/trailing runes. The original contiguous p15 black body through p22 contains 1,883 runes and 627 complete packets at each phase. Select by a native-GP trigram model on the prefix through p21 (1,752 runes, excluding any packet crossing the split), and score the withheld p22 suffix without changing the configuration.

**Direct inverse:** all 24 fail, with at least 286/627 illegal packed integers. Independently enumerate the entire domain: the MSB convention maps just 9,216/24,389 legal inputs directly back to the domain, and the LSB convention maps 12,288/24,389. The reciprocal directions have the same domain-overlap counts.

**Closed-domain inverse:** first-return cycle walking on the same 16-bit permutation restricts it to the packed GP29 integer domain. Exhaustively verify inverse first-return and bit-weight invariance on all 24,389 integers for each of the four direction/bit conventions (97,556 checks), with at most 18 applications. The two MSB directions have 207 fixed points each; the two LSB directions have 54. All 24 full original tapes exactly replay. Across eight native solved prose records and all 24 configurations, all 67,728 aggregate rune positions are recovered exactly. These are fixed-operation controls, not blind key recovery.

| Receiver | Fit nats/rune | Frozen holdout nats/rune |
|---|---:|---:|
| Untransformed original (raw full p15–21 / p22) | -5.152076 | -4.985110 |
| Best packed cycle-walk fit: gather, MSB, reversed digit order, phase 1 | -4.975597 | -5.154554 |
| Leave-one-record-out native plaintext | -2.742766 to -2.262128 | n/a |

The selected fit is 1,750 runes and its independent suffix begins at offset 1,753 (130 runes); the crossing packet is excluded from both. The decoded text remains incoherent.

**Any-P-box donor obstruction.** Every bit-position permutation, including first-return cycle walking, preserves the Hamming weight of the packed integer. This holds even if an independent secret permutation is chosen for each packet. For each of the two digit orders and three packet phases, compare the exact 627-weight original sequence against every contiguous 1,881-rune window of the pinned normalized Gibran and Shakespeare donor texts. The comparison covers 60,612 Gibran and 215,226 Shakespeare windows per configuration, 1,655,028 comparisons total. None matches; the best still disagrees at 482/627 packet weights. Twelve corresponding planted source-permutation checks preserve all weights. This excludes these two donor texts as exact contiguous plaintext windows under this receiver, not arbitrary English, other representations, reordered packets, or bit-value-changing layers. The high-dimensional weight-sequence mismatch is not independent evidence for or against an arbitrary prose source.

No unknown plaintext, key, or continuation recovered. Retire this direct packed-integer receiver and its source-fixed cycle walk. Do not widen to arbitrary P-boxes or compound layers without a new source-selected operand. The code was executed in connected V8; the standalone CLI was not separately run.

Reproduce: `node sims/lp2_p15_spiral_packed_base29_bitbox_sft.cjs`. [Exact output, all candidate vectors and source blob SHAs](lp2-p15-spiral-packed-base29-bitbox-output.json).
