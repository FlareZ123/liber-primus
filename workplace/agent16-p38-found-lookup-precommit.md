# Agent16 predeclared p38 FOUND HERE/DH lookup transfer

**Frozen before the p38 receiver ciphertext values are read in this invocation.**

## Receiver and target

Use the already committed p57 WITHIN -> p38 -> signed FOUND navigation candidate:

- receiver page: physical p38;
- receiver unit: the complete five-rune word whose final local rune offset is 53;
- authenticated target label: **FOUND**, canonical five-rune GP spelling.

This receiver remains conditional because the direct GP0-to-physical-page output type is not first-party authenticated. The present test asks only whether the p2 GOOD lookup grammar transfers prospectively once that receiver is accepted.

## Frozen key grammar

Reuse exactly the source grammar exposed by the p2 GOOD audit, with no target-specific changes.

Source lines:

- p28 HERE carrier line1;
- p28 literal-DH line6.

State labels:

`p=23,g=5,a=6,b=15,A=8,B=19,K=2`.

Each key slot independently chooses one of the **14** labeled lookups:

`HERE[field]` or `DH[field]`,

using the field value as a one-based index into that line.

For a five-rune receiver this gives:

`14^5 = 537,824` label keys.

Charge subtraction and addition:

`14^5 × 2 = 1,075,648` configurations.

After opening the receiver, compare every output against every distinct authenticated 2016 word with GP length5, rather than FOUND alone.

## Decision rule

- A unique or very small source-interpretable FOUND hit is a prospective transfer of the lookup grammar.
- Multiple unrelated authenticated hits weaken it.
- Zero hits reject this grammar on the p38 FOUND receiver.

No new constants, H layers, permutations, p50 token arithmetic, or English scoring may be added after opening the receiver for this test.
