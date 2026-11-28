# P39 red119 and the p27 dual-radix receiver independently reconstruct Q

**Agent34, 28 November 2026. Classification: disjoint source-object cross-lock that reconstructs the exact frozen field multiplier Q without using the p15/p57 quotient value as input. This materially strengthens Q as a manuscript-wide state operation. It does not recover unknown body plaintext.**

## Two independently typed source objects

The p3 polynomial route has a conspicuous held-out homolog.

Across all 18 complete printed red spans, exactly two have length3:

```
p3  start119 len3 = [13,23,2]
p39 start119 len3 = [27,5,15]
```

Both begin at zero-based rune119 and are bracketed by red13-dot punctuation at both endpoints.

P3's triad is the already established field relation

```
13 + 23u + 2u² = 0
=> u² = 3u + 8.
```

Evaluate the *other* source-matched red119 triad in that field:

```
E(p39 red119) = [2,21].
```

No Q value is used in that evaluation.

Independently, p27 has a source-selected numeric receiver that predates this cross-lock.

## P27 emits [6,3] without H or a role label

P27's original opening red object has length19 and is followed by a red13-dot mark. The established source path is:

```
red length 19 - dots 13 = residual 6
one-based 13th red rune = I
GP prime(I) = 31
visible p50 table width = 8
31*8 + 6 = cell254
cell254 token = 39
```

The same literal token has the two source-live radix readings

```
base59(39) = 186
base60(39) = 189.
```

Now take two direct properties of those already selected readings:

```
floor(186 / 29) = 6
floor(189 / 29) = 6
189 - 186 = 3.
```

So the p27 receiver itself supplies the compact pair

```
[common BASE29 quotient, radix delta] = [6,3].
```

This construction uses no canonical H transform and no DH role names.

## The unique field multiplier is exactly Q

In the p3-defined field, the unique nonzero scalar sending the p39 red119 state to the p27 source pair is

```
M = [6,3] / [2,21]
  = [17,24].
```

That is **exactly** the independently frozen value of the nine-rune quotient operand:

```
E(Q) = [17,24].
```

Equivalently,

```
[17,24] * [2,21] = [6,3].
```

This reconstructs the same field multiplier from a different original-object route:

```
route A:
p3 red3 + p15-second - solved p57
  -> exact polynomial quotient Q
  -> E(Q)=[17,24]

route B:
p3 field + homologous p39 red119
  + independently source-selected p27 cell254 dual-radix readings
  -> unique multiplier [6,3]/[2,21]
  -> [17,24].
```

The routes share the p3 field representation, but route B does **not** consume p15, p57, the quotient coefficients, or Q's target value.

## Finite manuscript controls

Two complete source-class charges prevent this from being just an isolated equality.

First, after freezing the independently derived quotient Q, apply it to all18 complete red spans. Exactly one output is `[6,3]`:

```
p39 start119 len3.
```

Second, every red punctuation mark adjacent to a complete red span in the current annotation corpus has count13; 16 red spans touch such a mark. Charge all 16×16 ordered source/target pairs using the older simple length/dot sum-difference presentation

```
[length-13, length+13] mod29.
```

There is exactly one equality with a Q-transformed red source:

```
Q(p39 red3) = [6,3]
H(p27 length19, dots13) = [6,3].
```

That H-style equality is a control only. The independent Q reconstruction above uses the stronger p27 dual-radix cell output and therefore does not depend on H being an authenticated global serializer.

## Why this changes the Q evidence

Before this result, Q's exact value came from the p15-second/p57 polynomial quotient, with downstream source locks showing that the operand was unusually productive.

Now the exact field element `[17,24]` is recoverable from an **independent manuscript junction** that starts at the only other red119 triad and lands on a p27 receiver selected from original red geometry and the original p50 table.

That does not prove the author intended the scalar-division step. The scientific boundary is narrower:

- the source classes independently select p39 red119 and p27 cell254;
- their raw arithmetic fixes `[2,21]` and `[6,3]`;
- the unique field multiplier between them is exactly Q;
- the p15/p57 route had already fixed that same multiplier before this equality was noticed.

This is therefore a genuine cross-holdout on the **value of Q**, not another fitted body key.

## Solve-path consequence

The strongest human-facing interpretation is now:

```
p3 red119 defines the field
  -> p39 is its unique red119/red3 manuscript homolog
  -> p27's independently typed numeric receiver supplies [6,3]
  -> the scalar relating p39 to p27 is Q
```

That gives a second way a solver could recognize the same MAP operand after discovering the p3 field, and it links the independently developed p39 route to the p27 DH/table route.

The next high-value test is a **prospective receiver**: use this p39→p27 cross-lock only to choose an original p27 object whose operation is visible before its output is read. Do not turn `[6,3]` into a free body key or phase search.

Reproducer: [`sims/lp2_q_p39_p27_dualradix_reconstruction_sft.cjs`](../sims/lp2_q_p39_p27_dualradix_reconstruction_sft.cjs).  
Original quotient route: [`im-results/lp2-p3-red-field-route-p15-p57-quotient.md`](lp2-p3-red-field-route-p15-p57-quotient.md).  
P27 receiver: [`im-results/lp2-p27-red13-dh-radix-transducer.md`](lp2-p27-red13-dh-radix-transducer.md).
