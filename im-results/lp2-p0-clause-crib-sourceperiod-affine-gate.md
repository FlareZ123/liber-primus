# P0 dual-crib source-period affine gate

**Agent13, 18 November 2026. Classification: bounded conditional exclusion. No new LP2 plaintext, authentic key, or complete cipher is recovered.**

## Correction to the first checkpoint

The first version of this report incorrectly treated the 27×27 route's `AS I GO THE WEATHER TURNS` cells as contiguous original p0 offsets13..29. They are cells reached by the 27×27 grid traversal, so that positional assumption was invalid. The erroneous SFT and report were replaced immediately. Workflow run **44418682582** tested the retracted version and must not be cited as evidence.

The corrected test uses only two **physical original-p0 positions**.

## Frozen source hypotheses

The current source-connected route supplies two candidate plaintext islands:

- p0 runes **0..12**: `EPIPHANY SEEKS`, on the original red 8+5 heading;
- p0 runes **235..243**: `THE DEVOTED`, on the independently selected later 2+7 word pair.

Both placements remain conditional plaintext hypotheses. The later island is valuable as a holdout because it is physically separated from the title and was selected through the authenticated-2016 / p50 boundary circuit.

Fit only the opening title under:

```
C_i = a P_i + K[i mod d]  (mod 29),  a = 1..28
```

For each source-motivated period `d`, the 13 title runes determine the key residues they touch. The later nine runes are then checked without fitting any of those already determined residues. A model is still viable when every overlapping holdout residue agrees; holdout residues never seen in training remain free.

## Exact corrected results

| period | source relation | holdout runes forced by title | best forced matches | slopes still compatible |
| ---: | --- | ---: | ---: | --- |
| 13 | red 13-rune heading / large mark offset | 9 | 1 | **0** |
| 27 | 27×27 p0–p2 geometry | 1 | 1 | **a=21 only** |
| 29 | GP alphabet size | 9 | 2 | **0** |
| 32 | p50 table row count | 2 | 1 | **0** |
| 43 | p50 strict-interior length / authenticated 2016 word count | 0 | 0 | **all 28, untested** |
| 58 | LP2 physical page count | 9 | 2 | **0** |
| 60 | twice-peeled p50 perimeter | 4 | 1 | **0** |
| 76 | p55 rune count / p50 outer perimeter | 6 | 1 | **0** |
| 229 | `3301 mod 256` / p50 `00` address | 7 | 1 | **0** |

This exactly rejects the fixed-period affine family for periods **13, 29, 32, 58, 60, 76, and 229**, conditional on both crib placements. Each family has at least one later position whose key residue was already fixed by the opening title, and every slope mispredicts at least one such position.

Period **27 remains viable only in a weak sense**. The title and later phrase share one key residue under period27; slope **21** matches that single forced rune, while the other eight later key residues remain unconstrained. This is a one-rune compatibility result, not positive cipher evidence.

Period **43 is untested by this geometry** because the title and later phrase use disjoint residues. No conclusion about a 43-period key follows from these two islands.

## Decision

Do not use the newly connected values 13,29,32,58,60,76 or229 as a simple fixed affine key period for these two p0 placements.

The 27-period result is too underdetermined to elevate. A useful successor would need an additional independently placed physical p0 crib that reuses more of the 27 title residues, or a source-defined state update that predicts the intervening cipher. The source evidence increasingly favors a word/p50 navigation architecture over a simple repeated key, but that interpretation remains a hypothesis until it makes a blind original-cipher prediction.

## Reproduction

Run `sims/lp2_p0_clause_crib_sourceperiod_affine_sft.cjs`. It reads the canonical original p0 ciphertext and asserts the exact corrected table above.

Related evidence:

- `im-results/lp2-2016-gp0-table-word-pointer-circuit.md`
- `im-results/lp2-p0-2016-epiphany-title-crib-gate.md`
