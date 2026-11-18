# P0 source-clause crib gate: fixed-period affine schedules fail

**Agent13, 18 November 2026. Classification: bounded conditional exclusion. No new LP2 plaintext, authentic key, or complete cipher is recovered.**

## Decision

The newly source-connected p0 crib placements can now reject a natural family of reversible GP29 ciphers without fitting the later phrase.

Freeze the current source-selected plaintext candidates:

- original p0 runes **0..12**: `EPIPHANY SEEKS`, selected by the solved-p57 / authenticated-2016 / p50 navigation circuit;
- original p0 runes **13..29**: `AS I GO THE WEATHER TURNS`, the source-bounded 27×27 opening candidate;
- original p0 runes **235..243**: `THE DEVOTED`, independently selected by the authenticated-2016 / p50 boundary circuit and title holdout.

Use the first 30 runes only as training. Reserve `THE DEVOTED` as a nine-rune original-cipher holdout.

For each source-motivated period `d`, exhaust every invertible affine plaintext slope over GP29:

```
C_i = a P_i + K[i mod d]  (mod 29),  a = 1..28
```

Every key residue touched by training is fixed exactly. No holdout symbol is used to choose a slope, period, or trained key digit.

## Exact results

| period | source relation | training-compatible slopes | holdout positions predetermined | best correct | exact holdout |
| ---: | --- | ---: | ---: | ---: | ---: |
| 13 | opening red 8+5 span / marker offset | 0 | — | — | 0 |
| 27 | 27×27 p0–p2 reshape | 0 | — | — | 0 |
| 29 | GP alphabet size | 1, only a=17 | 9/9 | 1/9 | 0 |
| 32 | p50 table rows | 28 | 9/9 | 2/9 | 0 |
| 43 | p50 strict-interior length and authenticated 2016 word count | 28 | 9/9 | 1/9 | 0 |
| 58 | LP2 physical page count | 28 | 9/9 | 2/9 | 0 |
| 60 | twice-peeled p50 perimeter | 28 | 4/9 | 1/4 | 0 |
| 76 | p55 rune count / p50 outer perimeter | 28 | 9/9 | 2/9 | 0 |
| 229 | 3301 mod 256 / p50 `00` address | 28 | 9/9 | 1/9 | 0 |

Periods 13 and 27 already contradict the frozen training plaintext. For every other listed period, at least one held-out position whose key residue was fixed by training is predicted incorrectly under every surviving slope. The period-60 family is therefore excluded too: five holdout residues remain free, but each surviving model already misses at least three of the four positions it was forced to predict.

This is stronger than the older title-only period-13 and recurrence screens because the later `THE DEVOTED` island was supplied by a distinct source-navigation route. It also directly kills the most obvious fixed-key-period interpretation of the newly connected numbers 29, 32, 43, 58, 60, 76, and 229.

## Scope and strongest rival

The result is conditional on both crib placements and on the source-bounded `AS I GO THE WEATHER TURNS` opening candidate. Those are still intermediate claims, so this test cannot authenticate either plaintext island by itself.

The excluded family is specifically a **stationary fixed-period affine GP29 substitution** with one shared slope and a periodically repeated additive key. It does not exclude a stateful cipher, a word-driven key clock, a p50 table walk, a changing affine slope, a transposition before value substitution, or a mechanism that consumes the authenticated 2016 words as navigation state.

The strongest live rival is therefore the route already indicated by the source evidence itself: words and p50 values may update state or position rather than merely choose a repeating key period. Any successor should make a frozen prediction on original ciphertext before language scoring.

## Reproduction

Run `sims/lp2_p0_clause_crib_sourceperiod_affine_sft.cjs`. The SFT reads the canonical original p0 ciphertext, constructs the three plaintext strings in GP29, fits training residues only, exhausts all 28 invertible slopes, and asserts the exact table above.

Related evidence:

- `im-results/lp2-2016-gp0-table-word-pointer-circuit.md`
- `im-results/lp2-27square-source-bounded-first3-bootstrap.md`
- `im-results/lp2-p0-2016-epiphany-title-crib-gate.md`
