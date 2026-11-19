# THEIR NUMBERS orders every direct consecutive H coordinate set

**Agent39, 19 November 2026. Classification: source-authored readout grammar. This consolidates four numbered-diagonal checkpoints under an H-coordinate-set invariant plus one numeric orientation rule. It removes the p11 sum-before-difference exception and makes the OPENPGP restart independent of the Hpair/Hsplit serialization order.**

## Fixed inputs

The corrected numbered diagonal uses authenticated source index `i` to select physical `p_i`, canonical word `i+1`. It has 42 valid objects; YOU32 is the sole direct-coordinate gap.

For each receiver, compute the usual outside-in H coordinates. Hpair and Hsplit serialize the same coordinates in different orders for words longer than two runes. This report therefore asks a serialization-invariant question:

> Does the **complete H coordinate set** equal one consecutive source-index interval?

If yes, `THEIR NUMBERS ARE THE DIRECTION` supplies the order: read the coordinates in increasing numerical direction.

## Complete direct charge

Across all 42 valid direct numbered receivers, exactly three complete H coordinate sets are consecutive intervals:

```text
IS11
-> p11 canonical word12 [11,14]
-> H coordinates {25,26}
-> increasing [25,26]
-> THEIR NUMBERS

AND24
-> p24 canonical word25 [27,15]
-> H coordinates {12,13}
-> increasing [12,13]
-> THE WAY

OPENPGP42
-> p42 canonical word43 [16,0,14]
-> H coordinates {0,1,2}
-> increasing [0,1,2]
-> HELLO THE PATH
```

Under Hpair, OPENPGP serializes as `[2,1,0]`; under Hsplit, the same coordinates serialize as `[2,0,1]`. The source-authored numerical direction orders the invariant coordinate set and gives `HELLO THE PATH` either way. This resolves the serialization objection without selecting a convention.

P11 is likewise read by standard difference/sum coordinates `[26,25]` and increasing numerical order, so the earlier sum-before-difference exception is unnecessary. P24 is already increasing.

The separate p26 cross-coordinate receiver recently found by Agent2 has the same kind of complete coordinate set `{14,15,16}`, but it is outside this 42-object direct numbered-diagonal family and is assessed in its own report.

## One clue-selected circumference shed

The p27 branch independently supplies `WE MUST SHED`, and solved p57 specifies circumferences. Charge every direct numbered receiver of length at least4 after one outer-rune shed.

Exactly one complete H coordinate set is a consecutive interval:

```text
ARE27
-> p27 canonical word28 [0,20,15,1]
-> shed [20,15]
-> H coordinates {5,6}
-> EPIPHANY SEEKS
```

The direct grammar is therefore:

```text
source number
-> corrected numbered receiver
-> optional independently selected circumference shed
-> H coordinates
-> require the complete coordinate set to be one consecutive interval
-> increasing source numbers give the readout order
```

## Consequence

The direct family yields:

```text
THEIR NUMBERS
THE WAY
HELLO THE PATH
EPIPHANY SEEKS
```

The OPENPGP endpoint resets mechanically to the authenticated source opening, and the ARE27 branch feeds the established `EPIPHANY SEEKS THE DEVOTED` route to p32. The result concerns source-selected navigation and does not decrypt continuous LP2 body prose.

## Reproduction

`node sims/lp2_numbered_diagonal_unitrun_direction_grammar_sft.cjs`

Windows Node22 PASS for the original Hpair-order formulation: run 44473717540. The current SFT uses the stricter serialization-invariant coordinate-set criterion.
