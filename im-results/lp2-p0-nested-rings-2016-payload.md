# Conditional opening-chapter 27×27 nested-ring alignment with the signed 2016 payload

**Classification: newly observed exact arithmetic on original source, with an underdetermined cipher consumer.** No unknown LP2 plaintext, source-authenticated key, cipher operation, destination, or decoded signed-message bytes have been obtained. These are exploratory coincidences selected after examining original sums; do not promote their shuffled-rune frequencies to discovery-wide significance.

## Natural artifact geometry and the exact readout

The first source-visible unknown chapter, original physical LP2 pages **0–2**, contains exactly **729 GP29 runes**, or **27²**, in original page/rune order. A 27×27 row-major placement has already been explored independently in [the p0 opening selector](lp2-p0-27x27-opening-selector.md). The original solved LP2 p57 PARABLE text uses the instruction to shed circumferences, providing a plausible, though nonspecific, reason to peel square borders.

For a finite, reversible-to-source inspection, define ring depth `d` as every cell on the boundary of the concentric square from row/column `d` through `26−d`. Count each corner once. Starting at the top-left of each ring, traverse clockwise. The thirteen noncentral rings contain **104, 96, 88, 80, 72, 64, 56, 48, 40, 32, 24, 16 and 8** original runes; the center contains one.

| P0 original ring | Rune count | GP-index sum (indices 0–28) | GP-prime-value sum |
| --- | ---: | ---: | ---: |
| Depth 3 (21×21 outer perimeter) | **80** | **1,136** | 4,130 |
| Depth 5 (17×17 outer perimeter) | **64** | 902 | **3,302 = 3,301 + 1** |
| Center depth 13 | 1 | **21 (NG)** | **79** |

The exact **1,136-byte** byte length of the signature-verified, OutGuess-extracted 2016 message `resources/historical/cicada2016-4gq25-outguess.asc` matches the depth-3 GP-**index** sum. A different original p32 11×11 **central five-cell** perimeter has sixteen GP-**prime** values totaling exactly 1,136, as established earlier in [the tree partition report](tree-prime-canvas-partition.md). These are different pages, ring sizes, alphabets of weights, and interpretations. The matching constant is a candidate cross-artifact alignment, without proof that any designer linked them.

The depth-5 GP-prime sum is 3,302, adjacent to Cicada's 3,301 identifier; the central `NG` has GP prime value79, a number that also appears in the known p15 Fibonacci-prime spiral. The **+1 offset** is an extra interpretive choice, and 79 is common in existing prime-related proposals. Their appearance does not independently specify ring depths, an operation or plaintext.

## Explicit attempted use, and its failure

One direct way to turn the shared 1,136 sums into a transformation would partition the 1,136 signed payload bytes into **80 consecutive lengths** given by the depth-3 GP rune indices. These lengths include **four zero-length fragments**, with no source rule for their special meaning. Alternatively, group every five such lengths to produce **16 sizes** and compare them to the sixteen GP-prime widths of the p32 inner-five perimeter. The sizes would need to align to make a nested 2016-message partition mechanically transferable.

That prediction **fails**: only **1 of 16** widths agrees in the source's top-left-clockwise orientation. Even allowing all 80 source starting positions, both directions, all 16 p32 rotations and both p32 reflections, the best pairing agrees at only **2 of 16** widths. No direct shared segmentation, instruction or authentic plaintext emerges. Retire this direct five-to-one partition, without interpreting more rotations as evidence.

## Conditional source-multiset control

A seeded 150,000-trial Fisher–Yates simulation retains the exact 729 original GP symbols and their frequencies, redistributing them over the 27×27 square. It recalculates all rings and checks the observed value combinations; seed `0x27113679`.

| Original-defined event on shuffled pages | Hits / 150,000 |
| --- | ---: |
| Depth-3 GP index sum equals 1,136 | 808 |
| Depth-5 GP-prime sum equals 3,302 | 213 |
| Center is NG / prime79 | 5,955 |
| First two specific ring sums both agree | **2** |
| All three specific constraints | **0** |
| *Any* ring index sum1,136 and *any* ring GP-prime sum3,302 | **2** |

These controls say the selected source values coexist unusually under this particular original-multiset shuffling. **The source selection occurred after looking at the arithmetic.** The two numeral targets, one unit above 3,301, their mixed index/prime weight systems, the 27×27 packing and the ring depths were all researcher choices; the simulation does not account for the far larger space of potentially recognized historical numbers or geometric readouts. Its probability cannot establish author intent or cipher truth. Counts are reproducible, and seeded null tests can prevent overconfident interpretations.

## Research decision

This is an **intermediate structural candidate**. Preserve the exact 1,136 alignment as a potential pointer from the opening chapter to the 2016 authenticated message, while requiring an independent source-selected ring depth or a deterministic original-cipher output before advancing it. In particular, obtaining a unique plausible command or source-bound plaintext from one ring would change the decision. Generic new key searches, regroupings or neighboring-number adjustments would simply extend postselection.

[Single-file original-source and matched-multiset reproducer](../sims/lp2_p0_rings_2016_payload_gate_sft.cjs). The original ring sums, 2016 payload size, p32 widths, explicit segmentation failure and seeded null were independently executed against the canonical GitHub source bytes.