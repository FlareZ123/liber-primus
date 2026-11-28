# Signed-source word geometry uniquely reselects the p40 cell43 DIRECTION/SEEK/AND route

**Agent4, 28 November 2026. Classification: post-discovery finite source-family control and cross-artifact solve-path synthesis. No unknown LP2 plaintext is recovered.**

## Question

The authenticated 2016 message says that the book's words are the map, their meaning is the road, and their numbers are the direction. Independent p40 geometry selects p50 cell43, whose token has local dual-radix readings base59=72 and base60=73. The earlier DIRECTION/SEEK gate selects the base59 continuation because72 lies on row9 and reaches the unique base59 root189 in four SEEK edges.

This report asks whether a single GP-native word/number coordinate grammar, charged against the complete authenticated 43-word source rather than only the favored phrase, independently reselects that same route.

## Fixed grammar

For each authenticated source word at zero-based index `i`:

1. convert the Latin word canonically into GP29 runes and take its GP **rune count** as p50 row;
2. take `i mod29` as p50 column, retaining only columns0..7 that physically fit the 32x8 panel;
3. form row-major cell `8*row+column`;
4. under the local drop-`f` base59 pointer graph, require pointer distance from that cell to the unique root189 to equal the GP rune count of the **next source word**.

This uses the source's own words and numbers, canonical GP parsing, the printed p50 width8, and the independently established root. It has no unknown-ciphertext score, free offset, direction reversal, or fitted key.

## Complete in-range charge

Exactly two source positions satisfy the next-word-depth condition:

```text
EPIPHANY  index5,  GP length8 -> cell69; depth5 = GP length(SEEKS)
DIRECTION index29, GP length9 -> cell72; depth4 = GP length(SEEK)
```

The paths are nested:

```text
EPIPHANY: 69 -> 72 -> 161 -> 214 -> 247 -> 189   (5 edges)
DIRECTION:     72 -> 161 -> 214 -> 247 -> 189   (4 edges)
```

Original p50 cell69 is another `1D` and base59(cell69)=72, so the EPIPHANY route literally prepends one pointer edge to the DIRECTION route.

The p40-selected cell43 supplies the independent cross-check:

```text
DIRECTION coordinate = 8*9 + (29 mod29) = 72
cell43 base59 value  = 72
cell43 base60 value  = 73
```

Thus the GP-native word geometry predicts the base59 destination72 directly.

## Third-word mirror holdout leaves only DIRECTION / SEEK / AND

Horizontal reflection of the eight-column panel is independently present in the p40/p50 route. The base59 root is

```text
189 = (row23,col5)
mirror(189) = (row23,col2) = 186
horizontal displacement = 3.
```

Extend the same source charge by requiring the GP rune count of the **third** source word to equal that fixed mirror displacement. The two depth hits split:

```text
EPIPHANY / SEEKS / THE: GP lengths 8 / 5 / 2 -> mirror MISS
DIRECTION / SEEK / AND: GP lengths 9 / 4 / 3 -> mirror HIT
```

Therefore **DIRECTION / SEEK / AND is the unique authenticated source triple** under this unchanged GP-native row/index/depth/mirror family.

The resulting route is:

```text
p40 -> cell43
    -> DIRECTION coordinate72
    -> SEEK four pointer edges
    -> root189
    -> AND three-cell horizontal reflection
    -> mirror186.
```

## Source-position DH coordinates: ROAD/PATH <-> ROAD/EPIPHANY

A pre-existing exhaustive source-position role audit uniquely maps authenticated word positions `PATH=2=K`, `EPIPHANY=5=g`, and `ROAD=23=p` inside the full DH register. The p50 mirror/root pair therefore has an exact first-party lexical coordinate reading with no changed numbers:

```text
186 = 8*23+2 = (ROAD, PATH)      = (p,K)
189 = 8*23+5 = (ROAD, EPIPHANY) = (p,g)
```

The same horizontal reflection that swaps DH columns `K <-> g` therefore also swaps authenticated source columns `PATH <-> EPIPHANY` while holding row `ROAD` fixed.

## Evidence boundary

The finite charge is exact and source-only, but the coordinate grammar itself was recognized after the p50 route was already under study. It is therefore a post-discovery solve-path compression, not a discovery-wide probability or an authenticated cipher opcode. It materially strengthens the interpretation that cell43/base59/root/mirror geometry is tied to the signed 2016 word-number instruction, but it still does not specify the missing reversible operation that turns the recovered DH state into unknown LP2 plaintext.

Reproducer: [`sims/lp2_signed_word_geometry_direction_seek_and_sft.cjs`](../sims/lp2_signed_word_geometry_direction_seek_and_sft.cjs).
