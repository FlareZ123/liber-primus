# Authenticated 2013 DH transcript order does not identify the p15 descriptor provenance map

**Agent1, 28 November 2026. Classification: bounded source-order audit for Director issue #3422. The three #3399 provenance maps are frozen exactly; no larger fitted role family, p7/p8/chapter labels, body ciphertext or language score is used.**

## Decision

The authenticated 2013 TCP exchange does **not** select one of the three surviving p15 descriptor→DH provenance maps.

The protocol genuinely fixes an event order: the client supplies `p`; the server chooses a base and secret exponent and returns `g,A`; the client returns `B`; the server returns `K`. But p15 visibly orders **words and page objects**, not the analyst-defined descriptor statistics `L`, `S`, `P` inside each word. Once that missing statistic-order freedom is charged instead of silently choosing an order, all three #3399 provenance maps remain compatible with the transcript's lower-red ordering constraints.

This closes the historical-order route under #3422's negative fork. The 2013 DH example authenticates the numerical tuple and remains a historically plausible clue; it does not authenticate which p15 cells/operations supplied the roles.

## Frozen inputs

The authenticated source is:

```text
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
```

with procedure text stating that the client supplies the prime modulus, the server selects a base and secret exponent, the client returns its exponent result, and the server returns the shared secret. Numerically this is the familiar conditional state

```text
p=23, g=5, a=6, A=8, B=19, K=2.
```

The three provenance maps are frozen from #3399:

```text
A (published)
  p=w1.S+1, g=w2.P,   a=w2.S,   K=w2.L

B
  p=w1.S+1, g=w2.S-1, a=w2.P+1, K=w2.L

C
  p=w1.S+1, g=w1.L+1, a=w2.S,   K=w2.L
```

No other map is admitted.

## What p15 actually orders

The lower red words have a source-visible printed order `w1 -> w2 -> w3`. Reversal is an obvious physical rival and is charged.

Each word's `(L,S,P)` triple is a **derived measurement vector**:

- `L` = printed rune count;
- `S` = GP0 sum modulo 29;
- `P` = GP0 product modulo 29.

The manuscript does not print the labels `L`, `S`, `P` or place those three derived statistics in a left-to-right cell order. Therefore using `L>S>P`, `P>S>L`, or any other statistic order as though it were source-visible would add an analyst convention. The finite honest charge is all `3! = 6` statistic orders.

The protocol also does not timestamp whether the server conceptually chooses `g` before secret `a` or vice versa; its prose merely says it selects a base and secret exponent. Both internal orders are charged.

Thus the complete lower-red order family is

```text
3 frozen provenance maps
× 2 word directions
× 6 statistic orders
× 2 server-internal g/a orders
= 72 presentations.
```

## Exact order charge

Project the protocol process onto the directly sourced lower-red roles as either

```text
p -> g -> a -> K
```

or

```text
p -> a -> g -> K.
```

`A=g^a mod p` is a deterministic computation after `g,a`, while `B` is not a lower-red descriptor provenance cell in any of the three maps; in the conditional p15 route it is harvested from the separate number-grid object. A literal full `p,g,A,B,K` physical-cell traversal therefore has an additional problem: p15 physically places the number grid between the two red spans, while the p/g/a/K provenance cells are in the lower red span. Matching the protocol would require leaving the lower span for the grid and returning to a lower-span K cell, a cross-object revisit for which no source-visible traversal is known. The lower-red projection is consequently the strongest order constraint that can be imposed without inventing that hop.

Exhausting the 72 presentations leaves seven ordered presentations, and **every map survives**:

```text
A: S>P>L with p>a>g>K
A: P>S>L with p>g>a>K

B: S>P>L with p>g>a>K
B: P>S>L with p>a>g>K

C: S>L>P with p>g>a>K
C: S>P>L with p>g>a>K
C: P>S>L with p>g>a>K
```

All seven use the actual printed word direction `w1>w2>w3`; the reversed word direction has zero survivors. That is a genuine source-order constraint, but it does not choose provenance.

If the hidden exponent `a` is omitted and only the protocol-visible direct roles `p,g,K` are ordered, ambiguity increases: there are nine surviving presentations, again spanning A, B and C.

If one simply fixes the report's conventional display order `L>S>P`, **zero** of the three maps satisfies the full process order. This is important: the desired published map is not recovered by a pre-existing source order. It appears only after choosing a different derived-statistic order (`P>S>L`) that the artifact does not print.

## Held-out original-p15 relation

Reserve the upper second red word from the ordering charge. Its source descriptor is

```text
(L,S,P) = (5,8,26).
```

Under the conditional state tuple this is

```text
[g, A, B^-1]
= [5,8,26],
```

since `19*26 = 1 mod29`.

This is an exact and historically suggestive transcript-shaped relation, but **all three provenance maps pass it**, because all three already yield the same numerical state tuple. It therefore validates tuple-level compatibility, not lower-red provenance.

The earlier sealed lower-red relation `[w1.P,w3.L,w3.S]=[K*g,g,g]=[10,5,5]` has the same limitation and likewise passes all three.

## Why the transcript cannot repair #3399

The historical transcript gives names and order to **state values**. The ambiguity exposed by #3399 is about the upstream map from p15 measurements to those values. Once A/B/C have been constructed, every downstream expression of `p,g,a,A,B,K` is identical. An order test can discriminate the maps only if p15 independently says how `L`, `S`, and `P` are ordered as operations or if it supplies a typed cross-object traversal tying lower-red cells to the grid in protocol order.

Neither instruction is present in the starting evidence. Charging the live order freedom therefore leaves all three maps.

## Director fork

Negative fork:

- keep the exact 2013 `DH 23 -> 5 8 -> 19 -> 2` match as **tuple-level historical compatibility**;
- keep the p15 source arithmetic and upper-red/grid/spiral relations as conditional state structure;
- do **not** cite the authenticated DH transcript order as justification for the published lower-red descriptor roles;
- reopen provenance only if a new source-visible instruction orders the descriptor statistics or specifies the required lower-red→grid→lower-red traversal.

## Reproduction

Run:

```text
node sims/lp2_p15_dh_transcript_order_provenance_sft.cjs
```

The SFT freezes A/B/C, charges both word directions, all six statistic orders and both g/a internal orders, asserts that all three provenance maps survive, verifies that canonical `L>S>P` selects none, and checks the held-out upper-red `[g,A,B^-1]` relation under all three maps.