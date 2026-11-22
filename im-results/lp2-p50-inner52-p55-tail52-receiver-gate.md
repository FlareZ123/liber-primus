# p50 innermost 52-cell ring → p55 final 52 runes

**Status:** bounded negative for the direct inner-ring receiver. No plaintext, key, or cipher mechanism recovered.

**Reproducer:** [`sims/lp2_p50_inner52_p55_tail52_sft.cjs`](../sims/lp2_p50_inner52_p55_tail52_sft.cjs) (Node.js, original repository inputs, 104 orientations, exact stationary-map maximum and fixed direct consumers).

## Source-selected hypothesis

The original p50 table is 32×8. Its nested one-cell perimeters have lengths 76, 68, 60 and 52. The existing research already tests the outer 76-cell ring against all 76 p55 runes, plus the 180-cell interior receiver; see [the 76/180 partition gate](lp2-p50-76-perimeter-180-interior-source-partition.md) and [the exhaustive outer-76/p55 gate](lp2-p50-ring76-original-p55-allsecret-stationary-gate.md).

A narrower, source-visible partition had not been tested there: original p55 has 76 runes, with 24 in its first line and 52 in the remaining three lines. Thus the tail length matches the p50 innermost 26×2 perimeter, and 24 = 76−52 = φ(52). The p57 Parable wording can motivate “shed the outer circumference,” but the Parable is inherited 2013 ID3 metadata, not an authenticated LP2 instruction. This is therefore a candidate receiver, not an established pairing.

## Frozen extraction

- Inner rectangle: one-based rows 4–29, columns 4–5.
- Clockwise perimeter: top row (3,3),(3,4); right edge (4,4)…(27,4); bottom row (28,4),(28,3); left edge (27,3)…(4,3).
- This yields exactly 52 original base60 bytes. The target is p55's final 52 original GP29 indices (after its 24-rune first line).
- For orientation controls, test all 52 cyclic starts in both directions: 104 alignments.
- For direct symbol operations, use the natural top-left clockwise order and byte mod29; additionally test low-five-bit XOR and byte-mod29 XOR.

## Results

| Test | Result |
|---|---:|
| Inner ring source bytes | 52 unique positions, 45 distinct raw byte values |
| Best arbitrary stationary lookup, raw byte classes, all 104 orientations | **47/52**, no exact 52/52 map |
| Best arbitrary stationary lookup, byte mod29 classes, all 104 orientations | **28/52**, no exact map |
| Direct add: p55-tail index + (ring byte mod29) | IoC **0.04147813** |
| Direct subtract: p55-tail index − (ring byte mod29) | IoC **0.03393665** |
| XOR with ring byte low five bits | only **48/52** outputs are valid GP29 indices; four are outside 0–28 |
| XOR with ring byte mod29 | IoC **0.03619910** |

The stationary-map score is the exact family-wide maximum: for each repeated source value, assign whichever GP29 output occurs most often at its aligned target positions. The maximum over all 104 orientations is 49/52, so at least five positions contradict every memoryless mapping from raw source bytes. Mod29 classes are more restrictive and fit still worse. The direct arithmetic outputs have no language-like signal.

## Decision

The exact 52-to-52 length correspondence is worth recording, but the natural inner-ring alignment does **not** support a stationary substitution, direct mod29 addition/subtraction, or the tested XOR consumers. Do not search arbitrary offsets, per-position overrides, or extra cipher layers to rescue it. A future attempt needs an independent source instruction selecting a stateful/position-dependent consumer. This test is distinct from the already-exhausted outer-76→full-p55 mapping and should not be counted as plaintext progress.
