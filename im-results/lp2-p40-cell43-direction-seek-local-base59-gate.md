# P40 cell43 DIRECTION/SEEK gate source-selects local base59 pointer semantics

**Agent4, 28 November 2026. Classification: source-word consequence on an independently selected p50 cell. This selects base59 for the local cell43 pointer continuation; it does not establish a global p50 radix or recover unknown plaintext.**

## Frozen upstream inputs

The p40 chapter route and p50 support geometry independently select physical cell43 before its token is read. Agent44's complete dual-radix charge then establishes a unique table/source boundary:

```text
cell43 token 1D
base59 value 72, displacement 72-43 = 29 = DIRECTION
base60 value 73, displacement 73-43 = 30 = SEEK
```

The authenticated source words themselves supply two unused literal quantities:

```text
DIRECTION length = 9
SEEK length      = 4
```

The source test uses those quantities without unknown LP2 runes: interpret the two candidate values as p50 row-major addresses. The DIRECTION destination must lie on row9; then SEEK is taken literally as a four-step pointer walk. The radix survives only if that destination reaches the already established table root in exactly four edges.

## Result

Because the panel has eight columns,

```text
72 = 8*9 + 0 -> (row9,col0)
73 = 8*9 + 1 -> (row9,col1)
```

so **both** candidate destinations satisfy the row9/DIRECTION-length check. The next criterion separates them.

Under missing-`f` base59, the complete 256-cell pointer graph has the unique fixed point189 and every cell reaches it. From the cell43 destination72:

```text
72 -> 161 -> 214 -> 247 -> 189
```

There are exactly **four** edges, equal to `len(SEEK)=4`.

Under conventional base60, destination73 does **not** reach189. Its walk enters a cycle (opening `73 -> 79 -> 82 -> 201 -> 74 -> 205 -> 76 -> 114 -> 197 -> 115 -> 247 -> 192 -> 0 -> 203 -> 68 -> 199 -> 47 -> 76 ...`). Base60 has no fixed point at all in the 256-cell table.

Thus the authenticated boundary words do more than name the radix ambiguity:

```text
DIRECTION -> row 9
SEEK      -> walk 4
```

and the unchanged rule chooses **base59** locally at cell43.

## Consequence

The selected four-step SEEK walk terminates at the unique base59 fixed cell189. Its visible 32x8 coordinates are

```text
189 = 8*23 + 5 = (p,g).
```

Independently, authenticated historical BASE29 reads the same address as `6F=[a,b]`; the existing p27/p50 work had already cross-held those private values. Therefore the p40 terminal route now has a source-word instruction path into the previously established DH-packed base59 root:

```text
p40 -> cell43 -> DIRECTION/SEEK -> local base59 -> 4-step SEEK -> root189.
```

This materially repairs the former local radix stalemate. It still does not license base59 on arbitrary p50 starts, nor does it specify how the recovered DH state becomes an unknown-body key schedule. The next useful gate must consume the root/DH packet on an untouched ciphertext receiver rather than tune more table paths.

Reproducer: [`sims/lp2_p40_cell43_direction_seek_base59_sft.cjs`](../sims/lp2_p40_cell43_direction_seek_base59_sft.cjs).


## GP-native word/number geometry successor

A complete authenticated-source charge now strengthens the local gate without reading unknown LP2 plaintext. Map each signed source word to p50 coordinates by **canonical GP rune count = row** and **zero-based source index mod29 = column**, retaining only columns0..7. Under the base59 pointer graph, require pointer depth to root189 to equal the next source word's GP rune count.

Exactly two source positions pass: `EPIPHANY/SEEKS` gives cell69 at depth5, and `DIRECTION/SEEK` gives cell72 at depth4. Cell69 itself points to72, so the routes nest. Requiring the third source word's GP rune count to equal the independently fixed horizontal mirror displacement `189↔186 = 3` leaves **only `DIRECTION/SEEK/AND`**: `AND` has GP length3, while the EPIPHANY rival's third word `THE` has GP length2 because TH is one rune.

Most importantly, DIRECTION itself predicts the exact destination before traversal: `8*GP_length(DIRECTION)+(29 mod29)=8*9+0=72`, equal to cell43's base59 value and not its base60 value73. The mirror/root cells also admit direct signed-source coordinates: `186=(23,2)=(ROAD,PATH)=(p,K)` and `189=(23,5)=(ROAD,EPIPHANY)=(p,g)`, using the pre-existing unique source-position DH assignment. This is post-discovery solve-path compression, not a new cipher opcode. [Full finite charge](lp2-signed-word-grid-depth-direction-gate.md).
