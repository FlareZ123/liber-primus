# P8 red sqrt196 → p6 14×14: an original mirror-H inverse gate

**Agent1, 21 November 2026. Director #2072.** **Bounded negative** for a source-constrained two-dimensional, value-changing, exactly reversible GP29 mirror transform. The manuscript's square-size selector is a concrete original clue; the value-changing mathematical opcode remains **conjectural** and yields no unknown plaintext, key, or manuscript continuation.

## Distinct source path and alternative

On physical p8 (`25.jpg`), the first red printed word is **XIXM**, original GP29 rune indices **[14,10,14,19]**. The published GP *prime weights* sum to **196 = 14²**, and both first and third rune indices equal its exact square root, **14**. P8 shows a slender illustrated tree with a central trunk, a crown and roots. The adjacent earlier physical p6 (`23.jpg`) has **196 original runes** and large, horizontally mirrored marginal spirals. The same mirrored spiral motif is also visible on p4–p7; it **does not** uniquely name p6 as a special cipher receiver. The original p8 red total's equality with p6's entire rune count is an established source observation ([p8 source analysis](lp2-p7-p8-red-product-state-header-keyclock.md)), but was recognized after looking at the manuscript. It is not an independent authenticated command to write a square.

A minimal construction worth one direct inversion is: lay out the **196 original p6 runes** in literal reading order as **14 rows×14 columns**. The two opposed p6 spirals nominate outside-in symmetric row pairs and the p8 rooted-tree vertical axis suggests a second outside-in column pair operation. A reversible algebraic version of left/right branching over GF29 is the weighted sum/difference:

~~~text
Forward for a paired word (a,b) at opposite ends: (d,s)=(a−k b, a+k b)
Inverse: a=(d+s)/2,  b=(s−d)/(2k)    (mod 29)
2^(-1)=15 mod29
~~~

To avoid fitting an arbitrary parameter, interpret the literal red word as **(axis size14, row coefficient10), (axis size14, column coefficient19)**. These are the actual 2nd and 4th original red rune indices. Apply the inverse across all seven symmetric column-end pairs in each of the fourteen rows, then across all seven symmetric row-end pairs in each of the fourteen columns. The operations commute, so the ordering does not introduce a searched parameter. Each round-trip recreates **all 196 original GP29 runes** without punctuation changes, changed boundaries, phase optimization, chosen ciphertext offsets or a fitted English crib.

**Most important objection:** neither the source's rooted tree nor the spiral art instructs the player to compute addition/subtraction, to write a 14×14 row-major matrix, to associate 10/19 with the two axes, or to take the GF29 inverse. The source-derived numbers select a *possible operand*, while the proposed opcode is an interpretive test. This is not presented as a discovered cipher.

## Exact original result

| Receiver on all 196 original p6 runes | GP29 index of coincidence | Decipherment |
| --- | ---: | --- |
| Unchanged original ciphertext | **0.03233909** | No source-native prose |
| Unit-weight outside-in two-axis H inverse (k=1,1) | **0.03485086** | No source-native prose |
| Source red-index weighted inverse (row k10, column k19) | **0.03417059** | No source-native prose |
| Independently clear p57 (95 runes) | **0.06270997** | Known readable GP text |

The weighted inverse's 150-rune opening contains a series of isolated common-looking digraphs but no continuous English/Latin message. Its original full-page output retains near-uniform rune statistics. Both inverse variants reencrypt exactly to the source, and a separate 196-rune solved-p57 native-message plant is recovered exactly after the forward weighted transformation. These are positive algorithm checks, not evidence for the authored cipher.

**Exact reproduction:** [read-only one-file CommonJS SFT](../sims/lp2_p8_red14_p6_mirror_haar2d_original_sft.cjs) · [Windows Node22 unit run 44943996622](https://github.com/FlareZ123/liber-primus/actions/runs/44943996622) · [expanded weighted run 44944090297](https://github.com/FlareZ123/liber-primus/actions/runs/44944090297). The source-prime sum, square cardinality, direct rune corpus, red-ink annotation, and full-round-trip assertions are fixed.

## Director decision

**Close #2072 without a claimed source-authored 14×14 cipher.** P8's red 196→14²→p6 196 relationship and p6's bilateral artwork provide a bounded recipient hypothesis. The decisive missing original field is the **value-changing operator and the exact 2D traverse**, before any genuine recovery of p6 plaintext can be asserted. The single directly source-weighted mirror-H model is negative. Further unhinted grid reflow, magic-square arrays, affine coefficient searches or extra secret whitening would be arbitrary and have no causal path to plaintext.
