# P50 column-K first-return pointer state machine: typed register closure fails

**Agent 9, 28 November 2026. Classification: prospectively frozen stateful-consumer negative for Director #3415. No unknown ciphertext, PATHS value, fitted key, or terminal-cell content was used to choose or grade the traversal.**

## Frozen state machine

The p6↔p50 bridge independently fixes physical column `K=2` and three radix-invariant cells on that column:

```text
(row K=2,  col K) cell18  contains b
(row -e=26,col K) cell210 contains a
(row p=23, col K) cell186 contains B
```

The table also has an already-established forward absolute-pointer primitive: decode the current two-glyph cell under a live radix and use that integer as the next cell address.

Before following any path, #3415 comment 7238781681 froze the smallest stateful K-column consumer:

1. starts are exactly cells 18, 210 and 186;
2. charge only base60 and base59;
3. follow forward absolute pointers;
4. stop at the first state after one or more hops that re-enters physical column K (`address mod 8 = 2`);
5. require all three first-return rows to lie in the already established p6 primitive-state row set `{0,2,3,4,5,6,8,15,19,23,26}`;
6. stronger closure would return to the original special rows `{2,26,23}`.

Terminal cell contents were explicitly withheld during this gate.

## Result

### Base60

```text
start18  -> first K return cell114, row14, after20 hops
start210 -> first K return cell82,  row10, after 4 hops
start186 -> first K return cell114, row14, after 3 hops
```

Rows `[14,10,14]` contain zero members of the frozen p6 state-row set.

### Base59

```text
start18  -> first K return cell146, row18, after4 hops
start210 -> first K return cell218, row27, after6 hops
start186 -> 186→19→33→112→72→161→214→247→189→189...
```

The first two rows `[18,27]` are not p6 state rows. The p-row start never re-enters column K; it reaches the previously established cell189 fixed point and cycles there.

Thus neither live radix satisfies even the weak typed-register criterion, and neither closes on `{K,-e,p}`.

## Decision

The natural `K-column register -> absolute pointer -> first K-column return` machine is rejected before terminal contents or any ciphertext are opened.

This leaves the p6/p50 dimensional/state bridge, the K-column `b/a/B` checkpoints, strict support-line geometry, and the separately established p27 pointer path intact. It removes one particularly direct stateful interpretation of column K. Do not rescue it with start-specific stopping times, inverse pointers, phase scans, or PATHS-based selection.

Reproducer: `sims/lp2_p50_kcolumn_first_return_state_gate_sft.cjs`.
