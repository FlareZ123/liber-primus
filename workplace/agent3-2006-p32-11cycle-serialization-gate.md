# p32 p50-11-cycle serialization gate

**Agent3, 21 November 2026.** Decision for Director Issue #2006: the source-selected p50 route reaches p32 and fixes the phase/direction of the p50 functional graph, but it does not select an 11×11 serialization or inverse on p32's body.

## Frozen p50 cycle and selected phase

The original p50 table's forward base-60, row-major, zero-based successor map has exactly the documented 11-cycle:

`0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 → 247 → 192 → 0`.

The independent `EPIPHANY SEEKS THE DEVOTED → p32` route reaches p32 after 23 steps and fixes the cycle phase at node 115 because the next pointer is `T[32]=115`. Starting at that selected phase and following the source-selected forward successor gives:

`115 → 247 → 192 → 0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115`.

This is a genuine source-selected navigation-cycle order. It is not yet a permutation of p32's row/column labels.

## Original p32 layout

The original p32 scan (`resources/liber-primus/49.jpg`) has six printed rune lines, a red 13-dot terminal mark, and a blurred tree illustration below the text. The body has 121 runes, so 11×11 is a factorization of its length; no 11-row or 11-column grid is printed. The tree has no numbered nodes, marked start, arrow, or visible traversal direction. The earlier source-first audits #1878/#1667 already establish that the tree does not independently select node order or a physical orientation.

## What is and is not selected

The p50 route fixes:

- the original p50 table serialization (row-major, forward, zero-based);
- the successor direction (forward);
- the terminal page p32;
- the 11-cycle phase at node 115.

It does **not** fix:

- whether the cycle is assigned to p32 rows, columns, both axes, or cell positions;
- how cycle vertex values 0–255 become row/column labels 0–10 (rank, quotient/remainder, or modulus are different operations);
- whether the body is row-major or column-major as an 11×11 array;
- an 11×11 matrix to invert, a linear/nonlinear transform, or a sign/field convention.

The p50 report's separate quotient/remainder word-pair readout is a cross-source structural interpretation, not a p32 body permutation. It does not supply the missing 11×11 embedding.

## Existing decoder evidence; no duplicate test

- `im-results/lp2-p32-full-branch-audit.md` preserves the unique p32 navigation/readout loop, but it does not establish a body cipher.
- `im-results/lp2-p32-receiver-decoder-gate.md` tests its five admitted source-selected reversible consumers on the fixed p32 receiver; all outputs are nonlinguistic.
- `im-results/lp2-p32-11x11-121state-prevmod11-allsecret-capacity.md` rejects a fixed 121-state previous-ciphertext-mod-11 substitution family and direct p32 additive shifts; it does not validate a general 11×11 inverse.
- `im-results/lp2-p32-tree-laplacian-edge-inverse.md` tests one conventional edge-filter inverse on the original 121-rune body and obtains no plaintext.

A pure row/column permutation would preserve the p32 rune histogram/IoC and therefore cannot by itself turn the near-uniform original body into ordinary GP29 prose. A non-permutation inverse would need an explicit matrix/operator, which neither the 11-cycle nor the page supplies.

## Decision

**Bounded negative; no cipher test run.** The unique p50 route is a navigation mechanism and fixes a p50 cycle phase, not a p32 11×11 decryption. The exact missing selector is a first-party rule mapping the p50 cycle to p32's 11 row/column labels and specifying axis, serialization, matrix/operator, field, sign and receiver. Without that mapping, choosing rank/mod11/q-r and row/column conventions would be analyst-created. Retire this transfer; preserve p32 as a source-selected navigation endpoint, not a recovered plaintext page.
