# p50 antipodal pair-sum consumer gate for p53 and p55

**Agent 2, 20 November 2026. Classification: bounded intermediate negative.** No unknown LP2 plaintext, authentic key, or cipher architecture recovered. Reproduction: **sims/lp2_p50_centrosymmetric_pair_sum_p53_red55_sft.cjs**.

## Why test this operation

The existing Agent36 report tests the historically motivated 180-degree antipodal XOR of the 256-cell p49–p51 table against the exactly 128 black runes at the start of p53. That direct XOR pad fails.

A narrow companion operation is the pairwise sum of the same 128 antipodal pairs. This is not an established Cicada operation, but it is a simple arithmetic companion to XOR and the p56 GP29 additive/subtractive cipher. Two visually grounded receivers exist:

- p53 black prefix: exactly 128 runes, matching the 128 antipodal pairs.
- p53 red suffix plus p55: 51 + 76 = 127 runes, one fewer than the pair count. The red span is source-verified at p53 rune offsets 128–178.

The upward-arrow-shaped glyph at the start of the p53 red span is the GP29 rune ᛏ, not a separate directional arrow. The red span is a color-defined text region, not an arrow instruction.

## Frozen key and inverse

Use the existing table's printed row-major byte sequence B[0..255] from **resources/liber-primus/lp2-grid-256.json**. Form the 128 physical antipodal pairs under a 180-degree rotation and define:

K[i] = (B[i] + B[255-i]) mod 29, for i=0..127.

Apply the resulting key from phase 0, without reordering, offset search, or fitted exceptions. Test both GP29 arithmetic signs:

P[i] = C[i] − K[i] mod 29
P[i] = C[i] + K[i] mod 29

Test both direct one-use consumption and the solved p56 rule in which plaintext F is transparent and does not consume key state. For the 127-rune red+p55 receiver, use the first 127 pair sums and leave one unused; this is a deliberately explicit but not source-authenticated alignment.

## Results on original ciphertext

| Receiver | Inverse | Original IoC | Direct decoded IoC | F-transparent full paths |
|---|---|---:|---:|---:|
| p53 black128 | C−K | 0.03543307 | 0.03592520 | 0 |
| p53 black128 | C+K | 0.03543307 | 0.03567913 | 0 |
| p53 red51 + p55 76 | C−K | 0.03462067 | 0.04136983 | 0 |
| p53 red51 + p55 76 | C+K | 0.03462067 | 0.03024622 | 0 |

The highest direct IoC occurs for the red+p55 C−K branch, but its decoded sequence is not coherent GP29 prose. All four exact F-transparent inversions have zero complete paths. The clear p57 PARABLE control has IoC 0.06270997.

The pair-sum key begins:

[22,14,0,18,8,3,23,6,23,12,9,12,26,17,5,8,4,12,18,10]

and ends:

[10,19,24,20,17,19,23,17]

The full 128-symbol key and complete decoded strings are emitted by the reproduction script.

**Positive control:** for each receiver key/sign, p57 PARABLE was synthetically encrypted under the same F-transparent rule. The inverse recovered all 95 planted original symbols.

## Decision

Reject the exact antipodal pair-sum GP29 pad for p53 black128 and p53 red51+p55 76 under both signs and both direct/F-transparent consumption rules. The higher red+p55 direct IoC is not plaintext evidence: the sequence remains incoherent and the source-exact F-transparent inverse has no legal path.

This does not reject the established 128-pair geometry, the separate XOR experiment, or all possible uses of the table. The strongest objection is upstream: neither the manuscript nor historical source material explicitly instructs the solver to sum antipodal bytes or to use this pair-sum stream as a GP29 key. Do not expand this into arbitrary offsets, reverse order, or other arithmetic projections without an independent source selector.
