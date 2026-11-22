# P49/P55 four-field packets partition p50 144/112, but no source selects the aggregation or consumer

**Consolidated decision (21 November 2026): retain the 144/112 correspondence as intermediate geometry; retire the four-field packet consumer and the separately tested simple inner-core additive-key consumers.** The p49 and p55 five-core signatures produce exact four-field totals matching the two-shell/inner-core cell counts of p50, but the four-field aggregation duplicates the middle core and no preserved source selects it. A separate source-motivated use of the 28×4 inner core as 28 four-symbol spread keys or 56 two-symbol page keys was also tested under both base60 and drop-f base59 readings; every fixed additive variant remains near the uniform GP29 IoC. No unknown plaintext or cipher key is recovered.

## Observed packet correspondence

The fixed outside-in H map and recursive-SHED page-level cores give:

| Page | Cores | GP0 | H0 | H1 | Middle | Four-field total |
|---|---|---:|---:|---:|---:|---:|
| p49 | [20,19,19,14,4] | 76 | 21 | 28 | 19 | **144** |
| p55 | [1,6,2,11,18] | 38 | 36 | 36 | 2 | **112** |

Here H0 and H1 are the ordinary integer sums of the first and second coordinates from the fixed outside-in H pairs. The packet total is the investigator-defined sum `GP0 + H0 + H1 + middle`. The middle core is a separate typed field even though it is already included in GP0.

The original p50 table has 32 rows × 8 columns = 256 cells. Its purely geometric decomposition is:

- first outer circumference: `2(32+8)-4 = 76` cells;
- second circumference after removing the first: `2(30+6)-4 = 68` cells;
- two outer circumferences together: **144** cells;
- remaining inner rectangle: `28×4 = 112` cells.

Thus the p49 packet total equals the two outer circumferences and the p55 packet total equals the inner rectangle. The page-level census reports p49 and p55 as the only five-core pages and the only pages whose four-field totals are 144 and 112, respectively. The identity 144+112=256 is one partition of the table, not two independent confirmations.

The p50 original image visibly presents a 32×8 number table inside mirrored botanical artwork. It does not print a four-field packet legend, mark a two-layer shell boundary, label a 28×4 inner receiver, or divide the table into four-column blocks.

## Bounded alternative-aggregation charge

For the two observed four-field vectors, enumerate all 15 nonempty subsets of `[GP0,H0,H1,middle]`. Only the **all-four** subset returns the desired pair (144,112):

| Selected fields | p49 sum | p55 sum |
|---|---:|---:|
| GP0 | 76 | 38 |
| H0 | 21 | 36 |
| H1 | 28 | 36 |
| middle | 19 | 2 |
| GP0+H0 | 97 | 74 |
| GP0+H1 | 104 | 74 |
| GP0+middle | 95 | 40 |
| H0+H1 | 49 | 72 |
| H0+middle | 40 | 38 |
| H1+middle | 47 | 38 |
| GP0+H0+H1 | 125 | 110 |
| GP0+H0+middle | 116 | 76 |
| GP0+H1+middle | 123 | 76 |
| H0+H1+middle | 68 | 74 |
| **GP0+H0+H1+middle** | **144** | **112** |

The natural no-duplication alternative `GP0+H0+H1` gives **125/110**, not 144/112. The exact match therefore depends on counting the middle core twice. That is not mathematically invalid, but no original instruction selects that duplicate weighting or the four fields as a packet. This finite subset check is a diagnostic, not a probability calculation; it does not license a wider search over arbitrary weights or signs.

## Source audit: missing packet selector

The preserved first-party material supports parts of the surrounding story but not the packet construction:

1. **Solved p57** explicitly says “SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE.” This supports recursive circumference removal as a motivated operation. It does not say to form `[GP0,H0,H1,middle]`, add the four fields, count the middle twice, stop p50 after two circumferences, or interpret the resulting totals as regions.
2. **Original p50 image** supplies a 32×8 number table with a botanical frame. The 76/68/144/112 regions are derived from its dimensions; no printed boundary or label selects the two-shell/28×4 partition as a receiver. The image does not visibly encode the four-field packet recipe.
3. **Authenticated 2013 TCP challenge** supplies BASE29 and DH/NEXT protocol details, but no instruction to sum p49/p55 core fields, select p50 rows, or feed this packet into a table cipher. The worked DH23 tuple is participant-chosen protocol data, not a fixed LP2 packet recipe. The signed `NEXT` command stores participant-supplied text rather than selecting a successor operation. See [authenticated 2013 source record](../resources/external/2013-tcp-server-signed-source.md).
4. **Authenticated 2014 square metadata** supplies three magic squares of dimensions 5×5, 7×7 and 5×5. It does not specify a 4-field packet, 144/112 partition, or a p50 region traversal. See [preserved original square values](../resources/cicada2014-openpuff-magic-squares.txt).
5. **Authenticated 2016 signed clue** says “their numbers are the direction.” This is compatible with the already reported p49 `DIRECTION` and p55 `CIRCUMFERENCES` outputs, but does not select the four-field aggregation or the p50 two-shell/inner-core partition.

The source evidence therefore selects neither the **four fields**, their **addition with a duplicated middle**, nor the **144/112 region assignment**. The exact correspondence remains a structural observation rather than an authored cipher instruction.

## Previously tested direct consumer: negative

A bounded Hill4 proposal used the existing p29 H4 packet `[22,15,8,0]` as row indices in the 28×4 p50 inner rectangle:

1. remove the two outer circumferences;
2. select rows [22,15,8,0] in printed order;
3. decode the p50 tokens under base59 and base60, reducing modulo29;
4. invert the resulting 4×4 matrix over GF(29);
5. apply both conventional row-vector and column-vector orientations to p55's 76 original runes as 19 blocks of four;
6. require exact forward re-encryption.

Both selected matrices are invertible and all four inverses round-trip exactly, but none of the four outputs is readable p55 plaintext. The full original outputs and reproducer remain in [the original bounded report history](../sims/lp2_p49_p55_p50_144_112_partition_sft.cjs). Do not repeat direct Hill4, row permutations, radix sweeps or arbitrary table-to-GP29 mappings.


## Independent inner-core key-schedule gate: 28 spreads / 56 pages

The p57 instruction to “SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE” makes the 28×4 inner rectangle a reasonable human-solver target after removing the two outer circumferences. That leaves **112 cells**. LP2 physical pages p0–p55 comprise **56 page positions**, naturally divisible into **28 adjacent two-page spreads**. This motivates one bounded consumer: read each inner row as a four-symbol GP29 additive key for its corresponding spread (p0/p1, p2/p3, …, p54/p55). A second natural grouping treats the same 112 cells as 56 adjacent two-symbol keys, one per page.

This is a motivated hypothesis, **not an authenticated instruction**. No preserved source explicitly says to reduce the table to GP29, use additive Vigenère, map rows to physical spreads, or assign two cells per page.

### Frozen original-input tests

The SFT reads the canonical 32×8 p50 grid and p0–p55 corpus directly. It extracts rows 2–29 and columns 2–5 in printed row-major order. Two table interpretations are kept distinct:

- **Base60:** the canonical two-character token value 60·digit(first)+digit(second).
- **Base59-drop-f:** the same printed tokens with the lowercase f digit omitted before radix-59 conversion. This is an investigator-defined rival, not a source-authenticated radix.

For the **28-spread / four-symbol** interpretation, each inner row supplies four key symbols modulo29 to the corresponding adjacent page pair. The fixed finite variants test both additive signs, literal-F bypass/nonconsumption versus ordinary consumption, and phase reset at the page boundary versus phase carry across the two pages: 16 variants total across both radix readings.

For the **56-page / two-symbol** interpretation, adjacent inner cells supply one period-two key per physical page, in p0–p55 order. Both signs and both F policies are tested under each radix: 8 variants total. The table page p50 is an empty text receiver but retains its physical page slot.

Every output is forward-replayed against its exact original ciphertext; synthetic p57 positive plants verify the fixed transform and F-clock implementations. These replay checks validate the implementation only; they do not authenticate the cipher.

### Results

| Fixed receiver | Base60 global IoC range | Base59-drop-f global IoC range |
|---|---:|---:|
| 28 four-symbol keys, one per adjacent spread | 0.03445918–0.03585028 | 0.03447071–0.03584661 |
| 56 two-symbol keys, one per page | 0.03446290–0.03565160 | 0.03447567–0.03584661 |

The original p0–p55 unknown ciphertext baseline is **0.03447840**; the uniform 29-symbol baseline is **1/29 = 0.03448276**. The independently clear p57 text has IoC **0.06270997**. None of the fixed additive outputs approaches the clear-text control; the best shifts remain close to the original near-uniform ciphertext distribution. The test does not claim that IoC alone proves every possible language model impossible; it rejects these specific source-shaped additive schedules as a route to plaintext.

A classic **2×2 Hill matrix per spread** is also not a complete alternative under the same row grouping: one of 28 base60 matrices is singular (row20, assigned p40/p41), and one of 28 base59 matrices is singular (row21, assigned p42/p43). In addition, **eight** adjacent page spreads have odd combined rune counts, requiring an unprovided terminal-symbol/padding rule for a 2×2 block cipher. These are structural failures of this exact Hill2 interpretation, not evidence against all possible inner-core consumers.

### Decision

Retire the fixed 28-row period-four additive spread key, the 56 period-two additive page keys, and the direct 2×2 Hill-per-spread interpretation. Do not tune phases, page permutations, alternate pairings, padding, or state updates to rescue these candidates without a new first-party selector. The 28×4 geometry and its 112-cell count remain an intermediate observation; other uses are logically open only if a source supplies the missing operation and receiver.

Reproduction: node sims/lp2_p50_inner112_pagepair_key_gate.cjs.

## Separate page-level SHED route

The p49/p55 page-level SHED results remain independently useful and must not be conflated with this packet hypothesis:

```
p49 cores [20,19,19,14,4]
 -> GP0 76
 -> p50[76]=1s
 -> base59 112 = DIRECTION
 -> unique 76-rune receiver p55

p55 cores [1,6,2,11,18]
 -> GP0 38
 -> p50[38]=2D
 -> base59 131 = CIRCUMFERENCES
 -> unique 131-rune receiver p22
```

These same-operation page-level transfers are documented in [the p49 matched-control report](lp2-p49-recursive-shed-direction-transfer.md), [the p55→p22 receiver report](lp2-p55-circumferences131-p22-receiver.md), and [the composite route SFT](../sims/lp2_p49_p55_p22_navigation_route_sft.cjs). They provide a source-constrained navigation candidate. They do not use the 144/112 packet totals, prove a 4×4 p50 consumer, or recover unknown body plaintext.

## Decision and reopening condition

Retain the exact 144/112 correspondence and subset-sum audit as intermediate geometry. Retire the **four-field packet consumer branch** because the source does not select the aggregation or region assignment and the bounded direct Hill4 consumer is negative.

Reopen only if a first-party clue or contemporaneous player-visible convention independently specifies the four fields, their weighting/addition, the selected p50 region, traversal, token/radix interpretation, initialization/state, and output type. A positive must then recover a held-out original-cipher consequence. Do not search new matrix variants or alternative packet weights without that selector.

## Reproduction

```sh
node sims/lp2_p49_p55_p50_144_112_partition_sft.cjs
node sims/lp2_p50_inner112_pagepair_key_gate.cjs
```

The SFT reproduces the page-level five-core census, the four-field totals, the p50 32×8 geometry, the p29 row selector, both radix-specific matrices, exact inverses, and exact forward re-encryption of all 19 p55 blocks.
