# Conditional p28 READOUT → p50 low-digit selector → p51 72/72 receiver

## Research question

Does the provisional p28 `READOUT` candidate, when read through the p50 table's low-digit map, independently select the unusually structured p51 receiver?

This joins three existing investigations rather than claiming a new decryption:

- [2016 word-number cube operator / p28 READOUT candidate](lp2-signed2016-wordnumber-cube-operator.md);
- [p49–51 source table and p51 same-page 72/72 receiver](lp2-p51-samepage-72-wordedge-numeric-receiver.md);
- the solved p57 parable's instruction to “shed our own circumferences” and find what is within.

## Frozen cross-page readout

The p28 candidate is six GP29 symbols `READOUT`, indices `[4,28,23,3,1,16]` (`EA` is one GP29 digraph). Read these six values as zero-based addresses into the original p50 32×8 base60 table and take each addressed cell's low base60 digit:

| READOUT symbol index | p50 cell token | low digit / page index |
| ---: | --- | ---: |
| 4 | `1b` | 37 |
| 28 | `2U` | 30 |
| 23 | `1R` | 27 |
| 3 | `36` | 6 |
| 1 | `3p` | 51 |
| 16 | `21` | 1 |

The resulting ordered page selector is **[37, 30, 27, 6, 51, 1]**, all valid zero-based indices in the 58-page LP2 gallery. It selects p51 fifth and p27 third. The page27 original scan (44.jpg) has a prominent insect/instar-like illustration, a notable thematic correspondence to p57's explicit “instar” parable. The selected p51 page has the unique 72-cell numeric panel directly above its 92-rune/20-word passage; removing one edge rune per printed word leaves exactly 72 runes, matching the panel size. The p51 report's manuscript-wide census identifies this 72/72 geometry as unique among rune-bearing encrypted pages.

The range check alone is weak: if the six low digits were uniform on 0–59, the chance all fall in 0–57 is \((58/60)^6\approx0.81\). The meaningful observation is the combined, independently sourced p51 geometry and p27 illustration, not merely that six values are in range. The p28 READOUT candidate and its use as table addresses remain provisional; this is a plausible navigation chain, not an authenticated instruction.

## New source-selected p51 cube tests

The p28 report selects \(x\mapsto x^3\bmod29\), with inverse exponent 19. The p57 parable suggests a word-edge operation, while the p51 panel supplies exactly 72 numeric values for the 72 retained runes. A small, frozen family was therefore tested on the original p51 input:

1. Convert each of the 72 panel bytes to \(b\bmod29\), then apply exponent 3 or 19 to obtain the key.
2. Pair that key with the 72-rune stream obtained by dropping the first or last rune of each of p51's 20 printed words.
3. Test both printed and reversed panel order and both additive signs.
4. As a composition check, test cube/inverse-cube after adding the raw panel key, and cube/inverse-cube after cubing the ciphertext rune before adding the key.

This produces 16 transformed-key additive candidates and 32 composition candidates. The cube/inverse-cube map passes the exact 29-symbol positive control; every additive candidate also round-trips a planted GP29 plaintext. **No candidate is readable plaintext.** Across the 48 outputs, the maximum IoC is 0.04108, below the minimum 0.04577 among the 3,036 contiguous 72-rune windows of the normalized solved LP1 reference. The existing p51 SFT separately rejects raw table-byte substitutions, raw additive keys, simple 9×8 transpositions and two word-edge feedback choices.

Reproduce the new finite test from the repository root:

`node sims/lp2_readout_p50_lowdigit_p51_cube_gate.cjs`

## Decision

The p28 → p50 → p51 chain is a **worthwhile intended-navigation hypothesis**: it gives a concrete reason to prioritize the unique p51 72/72 receiver and independently points to the p27 instar-like illustration. It does not yet specify the p51 cipher's changing state or how to choose one edge per word. The tested simple cube-transformed numeric key and cube/additive compositions fail.

Do not expand the same direct additive family with arbitrary offsets or permutations. The next useful input must specify a source-authored state transition, edge-selection rule, or external key that predicts readable p51 plaintext and then an untouched neighboring word. No unknown LP2 plaintext or authentic key has been recovered.
