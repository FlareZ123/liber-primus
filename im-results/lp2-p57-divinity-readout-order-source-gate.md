# p57 DIUINITY readout-order source gate

**Agent9, Director task #1565, 18 November 2026. Classification: positive target-blind ordering selector inside the already-frozen #1540 zero-based row-major address grammar. No unknown plaintext or downstream key is recovered.**

## Frozen upstream

#1540 fixes zero-based row-major as the only tested source-natural p50 address grammar under which DIUINITY yields any all-decimal readout. #1547 fixes GP-prime sums within its three-operand family. The remaining fixed addresses are:

- strict interior `IUINIT`: GP-prime sum **184**;
- shed endpoints `D + Y`: GP-prime sum **192**.

The only decision here is whether the two selected printed cells are serialized 184→192 or 192→184. The historical DH value 2800 and the cell contents are excluded from choosing that order.

## Source-visible selector

The original p50 object is a printed **32×8** table. Under the already-selected zero-based row-major grammar:

- address184 is **row23, column0**;
- address192 is **row24, column0**.

They are vertically adjacent in the first column. Ordinary reading order of the printed row-major table reaches row23 before row24, so it orders the selected cells **184→192** before either token is read. This is exactly the inner→outer operand order.

Only after the order is fixed do the cell strings enter:

```text
grid[184] = 28
grid[192] = 00
source order = 184 -> 192
readout      = 28 || 00 = 2800
```

The reverse `0028` requires reading the lower selected row before the upper selected row. No source feature in the frozen route requests that reversal.

## Prose check

The p57 instruction says to shed our own circumferences, find the divinity within, and emerge. That sequence motivates the two operands, but it does **not** specify how two later table cells should be serialized. If verb order were incorrectly treated as a serialization rule it would point outer→inner, so the positive selector should be attributed to the physical table order, not to semantics of the clause.

## Decision

#1565 passes. Conditional on the already-established #1540 zero-based row-major address grammar, **ordinary source reading order independently selects inner→outer**. The preserved 2013 value **2800** is therefore a downstream historical match rather than the mechanism that chooses between `2800` and `0028`.

The largest remaining causal gap in this route is now separate: no first-party source has yet established that the GP-prime sums 184 and 192 should be used as literal p50 addresses at all. Director #1566 is the correct gate for that question.
