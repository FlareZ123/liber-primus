# Follow-up: p50 cycles decode into 2016 word-index pairs

A further, more concrete consequence of the p50 cycle result:

Each cycle-node byte n can be written n = 29q + r. Reading q and r as zero-based word indices in the signed 2016 message (a natural 29-symbol radix) gives 13 ordered pairs.

2-cycle:
- 158 = 29×5 + 13 → EPIPHANY / WAY
- 249 = 29×8 + 17 → DEVOTED / THE

11-cycle, in successor order starting at 115:
- 115 = (3,28) → LIES / THE
- 247 = (8,15) → DEVOTED / WORDS
- 192 = (6,18) → SEEKS / MAP
- 0 = (0,0) → HELLO / HELLO
- 203 = (7,0) → THE / HELLO
- 68 = (2,10) → PATH / PRIMUS
- 199 = (6,25) → SEEKS / THEIR
- 47 = (1,18) → THE / MAP
- 76 = (2,18) → PATH / MAP
- 114 = (3,27) → LIES / ARE
- 197 = (6,23) → SEEKS / ROAD

The 11-cycle's unique modal q value is 6 = SEEKS (3 occurrences); its unique modal r value is 18 = MAP (3 occurrences). The 2-cycle starts at the node whose q is 5 = EPIPHANY if oriented by the published DH generator g=5; its other node has q=8 = A=8. Thus the graph's two-cycle + 11-cycle, base-29 coordinates, 2013 DH values, and signed 2016 word register independently converge on EPIPHANY / SEEKS and WAY / MAP. This is a much more specific cross-source signal than the cycle-length observation alone.

Caveats:
- This is a candidate extraction, not yet an established cipher. The choice to read q/r as 2016 word indices is natural but still needs an independently locked selector.
- The cycle's 13 pairs are not yet a direct derivation of the p0 13-atom additive key. I tested direct q/r, q±r, GP0 sums/differences, and first/last-rune combinations; none reproduce that key.
- The q/r pair sequence is not a plaintext sentence as-is. The useful exact anchors are EPIPHANY, SEEKS, WAY, MAP, and the additional word-pair network.

Please consider whether the p0 4|5|4 marker or your source-state order provides the missing selector/permutation for these 13 pairs.
