# Historical 1736254 period-7 p33–p39 transposition: language gate

**Decision:** bounded negative. The historical Cicada seven-column key `1736254` does not recover readable GP English from the predeclared p33–p39 transfer targets. This closes the evidence gap in the earlier structural-only probe by emitting every candidate and calibrating the complete family against a matched language null. No unknown LP2 plaintext, key, or destination is recovered.

## Frozen family

The existing source probe fixes two archive-compatible conventions, the historical column order `[0,6,2,5,1,4,3]` and its rank order, across four source layouts: the full 1,680 p33–p39 runes, the 1,589-rune illustrated interval, independent per-physical-page decipherment, and illustrated-page interleave. The family is therefore exactly **eight** outputs. No alternate keys, fitted rotations, spaces, alphabets, or arithmetic were added.

## Original readouts

A GP trigram model trained on the first 160,000 runes of the independent Shakespeare control gives:

| Candidate | Runes | Mean log score |
| --- | ---: | ---: |
| per-page, rank | 1,680 | **−6.125819972** |
| illustrated, column | 1,589 | −6.171082671 |
| illustrated interleave, column | 1,589 | −6.205219716 |
| per-page, column | 1,680 | −6.216683043 |
| illustrated interleave, rank | 1,589 | −6.221727342 |
| whole, rank | 1,680 | −6.239290244 |
| illustrated, rank | 1,589 | −6.244553641 |
| whole, column | 1,680 | −6.273127643 |

Best preview:

`DSLTXATHEOIASFMNEOXWTHUYWICTHEAJDNFFDWDBMCISJEATFOEANGAXREOEOWJJOUIDHLAEXJEOBGGGTHHAYEOUYGAEOIAOEIAMDOESYFNWBIABUTXDONGOEYEFPTWTNOERIALHJTHEAAEEOSPRA`

It is nonlinguistic.

## Familywise matched null

For each of **2,000** deterministic controls, every physical page and illustrated-page fragment is independently circularly rotated, preserving exact rune inventories and cyclic local adjacency while breaking the proposed period-7 phase. The identical eight transforms are applied and only the maximum score retained.

- original family maximum: **−6.125819972**;
- controls at least as large: **596/2,000**;
- add-one familywise p: **597/2,001 = 0.298350825**;
- null median: **−6.144309168**;
- null 95th percentile: **−6.083983515**;
- null maximum: **−6.015159546**.

The original winner is ordinary under the matched family null.

## Exact-key positive control

A held-out 1,680-rune GP-English block is transposed by the exact historical column order and decoded by the same implementation. It recovers **exactly**. Plaintext and recovered score are **−2.441917215**, while the transposed stream scores **−4.509301693**. The gate therefore has strong sensitivity at the original target length.

## Consequence

The p33–p39 historical `1736254` transfer is closed under its two documented conventions and four declared source layouts. The previously observed adjacent-equality increases are permutation structure, not evidence of plaintext. Do not expand into arbitrary seven-column keys or fitted transforms without a new source selector.

**Reproducer:** [`historical_period7_p33_39_language_gate_sft.cjs`](../sims/historical_period7_p33_39_language_gate_sft.cjs).
