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

## The pair brackets the literal instruction/corridor transition

The two indices are not merely adjacent vocabulary entries. In the signed 2016 source they straddle a printed sentence boundary:

```text
... their numbers are the DIRECTION.
SEEK and you will be found.
```

Under the already-established numbered source route, zero-based source indices `30..42` are the 13-word `SEEK ... OPENPGP` tail associated with the physical p30–p42 corridor. Thus the selected cell43's two source-plausible radix edges land on the exact **last word before the corridor / first word of the corridor** boundary:

```text
base59 edge displacement 29 -> DIRECTION (instruction immediately before the tail)
base60 edge displacement 30 -> SEEK      (first word of the 13-word tail)
```

This gives a human-readable interpretation of why retaining both radix edges may be useful: together they bracket an operation transition already visible in the first-party text, rather than forcing a choice between two unrelated numeric coincidences. It still does not specify a fresh unknown-page cipher.
## DIRECTION modulus closes to the p6 grid constants

The source boundary pair has one additional exact consequence under its own authenticated modulus:

```text
[29,30] mod29 = [0,1] = [F,1].
```

Those are precisely the two scalar constants consumed repeatedly by the p6 4/5/4 L/C/T/R grid in addition to its four state fields. The H-free p50 support serializer already supplies those four fields as `[K,-e,g,a]`.

This residue observation is weaker than the literal boundary pair: charging all table cells gives two `[0,1] mod29` displacement-pair hits, cell43 and cell225, while **only cell43** has the literal ordered displacement pair `[29,30]`. Therefore the evidence remains the exact DIRECTION/SEEK boundary at the independently selected cell; `[F,1]` is a consequence of that boundary, not an independent uniqueness claim.

The resulting loop is structurally compact—p40 selects cell43, cell43's dual-radix edge gives DIRECTION/SEEK and hence `[F,1]`, and p50 support geometry supplies the p6 state packet—but it still reproduces already-known p6 corridor structure rather than fresh plaintext.
## DIRECTION/SEEK word lengths resolve the local pointer radix

A fresh source-word consequence resolves the ambiguity **for this cell43 pointer continuation**. The authenticated words themselves have lengths `DIRECTION=9` and `SEEK=4`. The two candidate values are row-major p50 addresses `72=(row9,col0)` and `73=(row9,col1)`, so both satisfy the unused DIRECTION-length row check. Freeze SEEK literally as a four-edge walk to the established table root. Under base59, `72 -> 161 -> 214 -> 247 -> 189` is exactly four edges and 189 is the unique fixed point; under base60, the walk from73 enters a cycle and never reaches189, and the complete base60 table has no fixed point.

Therefore DIRECTION/SEEK selects **base59 locally** once cell43 is treated as the source of the already-motivated pointer edge. This does not promote base59 to a global p50 codec; unrelated starts still require their own source-selected stopping rules. [Full gate](lp2-p40-cell43-direction-seek-local-base59-gate.md) · [reproducer](../sims/lp2_p40_cell43_direction_seek_base59_sft.cjs).

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

But the boundary alone was still retrospective cross-artifact synthesis. The new length/hop gate supplies the missing local consequence: DIRECTION fixes destination row9 and SEEK fixes a four-edge walk, which succeeds only under base59. The remaining unresolved step is how the resulting root/DH packet becomes an unknown LP2 plaintext key or receiver.

Reproducer: [`sims/lp2_p40_cell43_dual_radix_source_boundary_sft.cjs`](../sims/lp2_p40_cell43_dual_radix_source_boundary_sft.cjs).
