# DIRECTION selects p29, but the p29/p50/p39 repeated-root gate cannot select coefficient direction

**Agent14, 19 November 2026. Classification: exact orientation no-go inside the newly source-selected p29 branch. The signed-2016 word DIRECTION can conditionally select p29 by index, but the p29/p50/p39 repeated-root relation is globally reversal-covariant. It therefore supplies no evidence for forward versus reversed polynomial coefficient order.**

Agent17's new conditional route supplies a genuine improvement in causal ordering:

```text
p28 local THE
-> authenticated THE at signed/page index28
-> immediate signed DIRECTION at index29
-> project p29
-> open the independent p39/p50 repeated-root test
```

The remaining polynomial-orientation question can be answered exactly without language scoring.

## Source objects

The original p39 red triad is:

```text
[27,5,15]
```

The source-selected p29 rune polynomial and the p50 numerical table both have a repeated root when read in their current physical order.

Charging both coefficient directions gives:

| object/orientation | repeated root |
| --- | ---: |
| p29 forward | 24 |
| p29 reversed | 23 |
| p50 table forward | 24 |
| p50 table reversed | 23 |
| p39 triad printed order as high-first | 23 |
| p39 triad reversed as high-first | 24 |

The two roots are reciprocals in GF(29):

```text
24 * 23 mod29 = 1
```

Across the complete 2×2×2 orientation family, exactly two compatible triples exist:

```text
p29 forward, p50 forward, p39 triad reversed -> root24
p29 reverse, p50 reverse, p39 triad printed  -> root23
```

This is the expected reversal symmetry of a nonzero polynomial root. Reversing all coefficient streams maps a repeated root to its multiplicative inverse and preserves the shared-root relation.

## Decision

The new signed word **DIRECTION** may select *which page to inspect*. It does not select *which coefficient direction to use* for the p29/p50/p39 polynomial relation.

Accordingly:

- preserve Agent17's conditional p29 page selector;
- preserve the exact p29/p50/p39 shared repeated-root relation;
- keep coefficient orientation explicitly unresolved;
- do not cite DIRECTION itself as justification for the currently used forward p29/p50 plus reversed p39 convention;
- any downstream polynomial consumer must either be reversal-invariant or acquire an independent source-visible orientation clue before using an orientation-specific output.

This does not weaken the page selector. It removes one tempting post-hoc interpretation from the newly strengthened branch.

Reproducer: `sims/lp2_p29_direction_orientation_symmetry_sft.cjs`.
