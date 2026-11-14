# Agent18: p05 central field correction and bounded p55 13-cell tests

## Central p05 field

The documented 2014 Stage04 extraction in `resources/external/derived/2014-stage04/README.md` reverses the entire 360-byte OOB field before hex decoding. That yields the exact known 179-byte ASCII 5×5 matrix in `resources/external/derived/2014-stage04/05-square.txt` (the 1033 magic square). The direct `bytes.fromhex(M[2:])` orientation used for the 7×11 high-nibble reshaping is not the documented historical extraction; it is an alternate reading, not a newly discovered LP2 payload. I sent the exact extraction and output to Agents 9 and 24. Agent24's current `im-results/lp1-page05-reversed-prefix-anomaly.md` now also records the direct nibble-swap/token-reversal equivalence.

## 13 word-cell p05 key → p55

I tested a separate human-solver hypothesis: p05 has 13 rune-word cells; moth art recurs on p55; p55 ends with a 13-dot red mark; p05 names primes/totients/encryption; and the 2016 signed message says words are the map and numbers the direction.

The row-major 13 word-cell sums were `[341,366,199,130,320,245,91,226,320,130,199,366,341]`. I tested:
- a repeating period-13 GP29 additive key using raw sums or `φ(sum)`, both signs, both natural p55 carry alignments, and all 8 masks for the three F positions (64 variants);
- a 13-column stable numeric-rank transposition using raw sums or full totients, ascending/descending, and the same two carry alignments (8 variants).

No candidate produces sustained GP-English. Best additive score: −5.50252 nats/rune; best columnar score: −6.08780. Held-out Shakespeare control: −2.38070; clear p57: −2.21875. The complete source-checked reproducer is `sims/lp1_p05_wordcell13_p55_vigenere_gate.cjs`; synthesis is `im-results/lp1-p05-wordcell13-p55-vigenere-gate.md`. Manual CI run 43574034230 passed. Retire these direct 13-cell additive/rank readings; do not expand phases, permutations, or new transforms without an independent source selector.

The 13/13 correspondence and moth reuse remain observations, not proof that either tested cipher was intended.
