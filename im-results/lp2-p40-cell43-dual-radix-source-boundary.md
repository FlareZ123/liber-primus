# P40-selected cell43: the base59/base60 edge ambiguity lands exactly on the DIRECTION/SEEK source boundary

**Agent44, 28 November 2026. Classification: unique target-independent table/source convergence after an independently selected cell; post-discovery mechanism clue, not plaintext or a radix proof.**

## Fixed inputs

A separate p40 route selects p50 physical **cell43** before reading its token. The token is `1D`.

The existing p6/authenticated-source route independently fixes the zero-based 2016 source boundary:

```text
word29  DIRECTION
word30  SEEK
...
word42  OPENPGP
```

so `SEEK ... OPENPGP` is the 13-word tail at source indices30–42.

P50 has two live local integer interpretations for tokens without lowercase `f`:

```text
base59(1D) = 72
base60(1D) = 73.
```

## Natural pointer displacement

Because the p50 object is already treated as an address/value table, the simplest quantity involving a selected cell and its printed value is its **forward integer displacement**:

```text
destination - sourceCell.
```

At cell43:

```text
base59: 72 - 43 = 29 = source index of DIRECTION
base60: 73 - 43 = 30 = source index of SEEK
```

Thus the one-unit radix ambiguity maps exactly to the two words straddling the authenticated DIRECTION/tail boundary.

## Whole-table charge

This is not merely true at the favored cell. Charge every physical p50 cell whose token is readable under **both** base59 and base60, compute the ordered pair

```text
[value59 - cellIndex, value60 - cellIndex],
```

and ask for exactly `[29,30]`.

There is **one** hit in the entire table:

```text
cell43  token 1D  values [72,73]  displacements [29,30].
```

So the independently selected p40→cell43 address lands on the unique p50 cell whose two conventional radix edges reproduce the already-established authenticated source boundary.

## Relationship to the local radix stalemate

The same token also has exact nearby count identities:

```text
hex(1D)=29    = GP alphabet size
base59(1D)=72 = p48 rune contribution to the intact pretable sentence
base60(1D)=73 = 33+40 complete words in the two table-flanking sentences.
```

Those identities mean `1D` alone cannot authenticate a radix. The new displacement result is different: it uses the **independently selected cell address 43** and the natural pointer-table edge `value-cell`, and the ambiguity itself becomes the ordered boundary pair `[29,30]`.

## Decision

This is a materially stronger connection between the p40/p50 route and the p6/authenticated-2016 source corridor:

```text
p40 geometry -> cell43
cell43 token 1D
base59/base60 edge displacements -> [29,30]
authenticated source -> [DIRECTION, SEEK]
```

But it is still retrospective cross-artifact synthesis. It does **not** say which radix is intended, whether to use DIRECTION or SEEK as a receiver, or how to turn either source index into an unknown LP2 plaintext key. The correct next experiment must freeze a consequence of this boundary pair before reading a new destination; do not choose one radix merely because one downstream path is attractive.

Reproducer: [`sims/lp2_p40_cell43_dual_radix_source_boundary_sft.cjs`](../sims/lp2_p40_cell43_dual_radix_source_boundary_sft.cjs).
