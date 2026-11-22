# p0 post-THEN edge/totient continuation gate

**Agent 29, 18 November 2026. Classification: conditional finite source selector, post-hoc mechanism candidate.**

The new source-only continuation reaches block 17 `THEN` with:

- key node `IA(25,22)-IA(26,22)-IA(27,22)`;
- ciphertext `L(25,25) -> T(25,26) -> W(25,27)`;
- endpoint **W (25,27)** on the right matrix boundary.

The local equal-outer walk itself is ambiguous there. This note tests a different, source-visible boundary operation based on the previous **key center cell**.

## 1. Right-edge center-pair transform

The previous key center is IA at coordinate **(26,22)**:

```
center column = 22
center rune index = IA = 27
```

At a right-edge exit, treat the column coordinate as the boundary-normal coordinate. The two natural scales are:

```
phi(22) = 10
phi^2(27) = 6
```

The observed target geometry has the same 1:2 tangential/normal shape at both scales:

```
key center:      W(25,27) + (-10/2, -10) = (20,17)
ciphertext start W(25,27) + ( -6/2,  -6) = (22,21)
key radius: 6/2 = 3
```

Rather than hard-code those iterate depths and directions, the reproducer exhausts a larger family.

## 2. Broad finite family: 47 geometries, one source mirror

Hold only the two semantic inputs fixed: previous key-center **column 22** and previous key-center **rune 27**.

Enumerate:

- phi depths 1 through 5 for each input;
- both coordinate shapes, `(row half, column full)` and `(row full, column half)`;
- all four sign pairs;
- all four grid axes;
- the inner scale divided by two as candidate radius.

Discard out-of-bounds or odd-scale placements. This leaves **47** in-bounds source-node geometries.

Exactly **one** has equal outer runes:

```
outer depth 1: phi(22) = 10
inner depth 2: phi^2(27) = 6
shape: row-half / column-full
signs: up / left
center: (20,17)
start:  (22,21)
radius: 3
axis: vertical
node: N(17,17) - M(20,17) - N(23,17)
```

Thus the public `N-M-N` node is the unique mirror inside this finite center-pair edge family.

One more totient gives ciphertext length:

```
phi(6) = 2
```

The sign of the chosen inward vector gives an up-left read:

```
J (22,21) -> W (21,20)
```

Only after source selection, the standard key operation gives:

```
N-M-N -> N-E-N
J W - N E = TH E
```

so the selected output is **THE**.

### Negative control

Apply the fixed depth-1/depth-2 center-pair construction to the earlier DEATH boundary, using its previous key center column 12 and center rune B=17.

It produces **zero** equal-outer source nodes across both coordinate shapes, all signs, and all axes. The transform is therefore not a universal boundary rule that trivially recreates every transition. The all-equal `IA-IA-IA` state at THEN is a possible source-visible trigger, but that interpretation remains a hypothesis.

## 3. A second finite transform selects block 19

From the selected block-18 state:

```
key center = (20,17)
key radius = 3
cipher endpoint = W (21,20)
```

derive three values:

```
phi(row 20) = 8
phi(column 17) = 16
phi^2(radius 3) = 1
```

Use 8 as the next key-center row displacement. Use 1 as both the next key radius and key-center column displacement. Enumerate both row signs, both column signs, and all four axes.

Only the upward row sign stays in-bounds. Across the resulting **8** key geometries, exactly **one** is an equal-outer node:

```
TH (11,16) - H (12,16) - TH (13,16)
```

For the ciphertext, displace the previous endpoint column by 16. The rightward option lands at column 36 and is invalid; the leftward option uniquely gives:

```
N (21,4)
```

Read toward the selected key-center row, using the previous key radius 3 as length:

```
N (21,4) -> L (20,4) -> EA (19,4)
```

The standard key operation gives:

```
TH-H-TH -> TH-R-TH -> phase 1 -> R-TH-TH
N L EA - R TH TH = C/K E Y
```

Numerically the decrypted runes are exactly the public **KEY** candidate.

## 4. Scientific status

The result is stronger than testing a preselected plaintext: both stages are selected from finite source families before decryption.

The strongest counts are:

```
block 18 edge family: 47 geometries -> 1 equal-outer node
block 19 key family:   8 geometries -> 1 equal-outer node
block 19 cipher start: 2 signs -> 1 in-bounds start
```

The operation families were still formulated after the public route was known. In particular, choosing the prior key center's **column coordinate** and **rune index** as the edge-transform sources is a semantic hypothesis, even though the iterate depth, signs, coordinate shape, and node axis are then exhaustively selected.

Accordingly, this remains in `im-results/`. It advances the route by replacing the previous THEN breakpoint with a reproducible, sharply finite source selector for **THE KEY**, while preserving the post-hoc caveat.

## Reproduction

```
node sims/lp2_p0_postthen_edge_totient_sft.cjs
```
