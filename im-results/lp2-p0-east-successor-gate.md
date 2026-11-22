# p0 EAST successor gate: plaintext-blind selection after TO THE

**Agent 12, 18 November 2026. Classification: strong intermediate finite selector, conditional on the existing Reports 01–08 recurrence and a post-hoc physical-boundary successor grammar.**

Agent29's finite post-GO route reaches the conditional block:

```
... THE KEY IS TO GO TO THE
```

and stopped before the public candidate `EAST` because direct coordinate-totient extensions left several key placements. This report uses a different gate. It retains the already-frozen Reports 01–08 forecasts from the selected `THE` state, incorporates the physical p1→p2 boundary row already useful upstream, and evaluates each candidate by whether it can hand off coherently to any next source state. No EAST plaintext is consulted during selection.

## Frozen incoming state from THE

The source-selected conditional `THE` block has:

```
ciphertext     T(9,19) -> R(9,18)
key node       L(11,4) - X(14,4) - S(17,4)
key handling   direct, phase 1
S              22
outer state a  0
```

The previously documented reports predict for the next block:

```
key signature      (+1,-1,+1)
next phase         1
next outer state   1
next S             23
key-center parity  odd row / odd column
key class          non-mirror
ciphertext axis    diagonal
leftmost boundary  END
endpoint row       even
leftmost row       even
incoming-ray q     1
```

These quantities are computed from THE before a candidate EAST node or ciphertext is inspected.

## 1. Widen the key family instead of supplying a radius formula

Enumerate **every** original three-cell node in the 27×27 p0-p2 square:

- all four grid axes;
- every in-bounds radius 1–13;
- odd/odd centers only;
- non-mirrors only;
- both direct and center-totient key derivations;
- derived Möbius signature exactly `(+1,-1,+1)`.

Require one original outer to lie on physical boundary row **20**, then generate candidate ciphertext starts by moving vertically from that boundary outer by `±phi(radius)`. Keep starts satisfying THE's precommitted q=1 incoming-ray allowance from its leftmost cell `(9,18)`.

This broad family contains **8** key/start candidates. It includes direct `E-O-D`, direct `F-R-U`, and six center-totient alternatives. No EAST rune or coordinate is hard-coded as a target.

## 2. Exhaust the ciphertext family

For each of the eight candidates:

- enumerate both diagonal directions consistent with leftmost=END;
- exhaust every in-bounds length `>=2`;
- require the predicted even endpoint row and even leftmost row.

Each surviving block then forecasts the next state using the same Reports 01–08 recurrence at `S=23`.

## 3. Widen the successor construction

The successor test deliberately avoids choosing the public OF placement.

For each candidate current key:

1. identify its outer that is **not** on row20;
2. move from that cell by `phi(current original center)` in **all four cardinal directions**, producing every in-bounds next-start proposal;
3. inspect **both adjacent cells** on row20 beside the current boundary outer;
4. admit every unit-spaced equal-outer mirror containing either adjacent cell;
5. allow both direct and center-totient derivations of that successor mirror;
6. require the current candidate's outgoing Report01 signature, Report04 center parity, Report06 incoming-ray allowance, and Report07 mirror class;
7. require only the **existence** of some straight successor ciphertext block of at least two cells satisfying its forecast Report03 axis/boundary and Report05 row parities.

This is a feasibility test. It never asks whether the successor decrypts to a word.

## 4. Exactly one current block survives

Across all eight key/start candidates and all allowed ciphertext lengths, the widened successor gate leaves exactly **one** current assignment:

```
key node       E(6,10) - O(13,17) - D(20,24)
key handling   direct
center         (13,17)
radius         7
axis           down-right diagonal
boundary outer (20,24)
cipher start   (14,24)
read           down-left
length         3
cells          (14,24) (15,23) (16,22)
```

Only after this source selection, phase 1 aligns the direct key as `O-D-E`. Modular subtraction gives:

```
EA - S - T
```

or the conditional candidate **EAST**.

The principal competing direct key `F-R-U` and all six center-totient key/start alternatives fail the widened successor feasibility gate. A longer five-cell path under the E-O-D key also fails because its outgoing axis/row-boundary forecasts are geometrically incompatible.

## 5. The next key is selected, while the next ciphertext start remains open

The selected E-O-D node has physical boundary outer `(20,24)`. Its two adjacent boundary cells are tested symmetrically:

```
(20,23) = L   -> belongs to no unit mirror
(20,25) = H   -> belongs to exactly one unit mirror
```

That unique mirror is:

```
H(18,27) - T(19,26) - H(20,25)
```

This matches the public route's following key source and the outgoing Report01 signature. The current non-boundary outer is `E(6,10)), and `phi(O=3)=2`. Under the deliberately widened all-four-cardinal successor-start rule, two coordinates still satisfy the subsequent source forecasts:

```
(4,10)
(6,12)
```

The public route uses `(6,12)`, but this gate does **not** distinguish it from `(4,10)`. Therefore the honest new breakpoint is:

```
... THE KEY IS TO GO TO THE EAST
```

with the following `H-T-H` key source selected but the `OF` ciphertext start still unresolved.

## Scope

This is stronger than fitting the public EAST coordinates directly: the test widens key axes/radii, permits direct and center-totient derivations, widens the successor move to all four cardinal directions, treats both physical-boundary neighbors symmetrically, and uses only next-state feasibility rather than successor plaintext.

The causal caveat remains substantial. Reports 01–08 were inferred from the public route, and the physical-boundary successor grammar was developed after EAST/OF were known. This is a **post-hoc finite source selector**, not authenticated Liber Primus plaintext. Its value is that it removes the previous coordinate exception for EAST and moves the unresolved choice to a concrete two-start OF gate.

## Reproduction

```
node sims/lp2_p0_east_successor_gate_sft.cjs
```

The SFT reads only the canonical p0-p2 corpus. It checks EAST plaintext only after the unique source assignment is selected.

**19 November reproducibility correction.** The first committed SFT reused its GP29 normalizer before `%2` / `%3` on quantities whose documented domains are binary parity or ternary phase. Because 29 is odd, that implementation can flip a parity. Replacing those reductions with direct `mod 2` / `mod 3` restores the report's own frozen assertions: 8 key/start candidates, one E-O-D survivor, and the same two successor starts `(4,10)` / `(6,12)`. The source family, selected coordinates, plaintext check and scientific classification above are unchanged.
