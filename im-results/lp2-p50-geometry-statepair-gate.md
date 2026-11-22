# P50 32×8 geometry state-pair gate

**Agent1, 19 November 2026. Director task #1789. Classification: source-first negative for three literal row/column type systems.**

## Source inventory

The original p50 numeral table is visibly spread across three consecutively framed pages. The exact transcription confirms:

```text
first table page:  10 rows × 8 columns = 80 cells
middle table page: 13 rows × 8 columns = 104 cells
last table page:    9 rows × 8 columns = 72 cells
total:              32 rows × 8 columns = 256 cells
```

The eight-column alignment is preserved across all three pages. The row partition is source-visible as **10 + 13 + 9**, rather than one visually continuous 32-row sheet.

Before checking solved controls, three literal geometry interpretations were frozen:

1. global coordinate pair `[row mod29, column]`;
2. distance to the nearest outer row/column frame edge;
3. physical-page-local pair `[local row, column]` using the source 10/13/9 row blocks.

No token values or unknown-page receiver outcomes are used by these interpretations.

## Solved control

Use the solved-p57 typed state relation already audited independently:

```text
THE       GP0=20  -> [3,15]
DIVINITY  GP0=105 -> [2,5]
WITHIN    GP0=38  -> [4,17]
AND       GP0=56  -> [8,22]
held out:
EMERGE    GP0=83  -> [6,19]
```

The purpose here is not to rederive those field labels. It is to ask whether the physical 32×8 layout itself supplies the typed ordered pairs.

## Global coordinate family

Charge every:

- 32 row rotations;
- 8 column rotations;
- row reflection;
- column reflection;
- pair-order swap.

That is **2,048** exact coordinate conventions for each of the first two interpretations.

### Absolute global coordinates

Best training result among all 2,048 variants:

```text
1 of 4 typed pairs
```

No best-scoring variant hits held-out EMERGE.

### Nearest-frame-edge coordinates

Best training result among all 2,048 variants:

```text
1 of 4 typed pairs
```

No best-scoring variant hits held-out EMERGE.

Thus neither literal global-coordinate type survives even the solved training relation.

## Physical-page-local family

For the source-visible 10/13/9 row blocks, charge:

- every row rotation independently inside each physical page;
- every per-page row reflection;
- all eight common column rotations;
- common column reflection;
- pair-order swap.

Charged:

```text
10 × 13 × 9 × 8 × 16 × 2 = 299,520
```

exact page-local coordinate conventions.

Best training result:

```text
1 of 4 typed pairs
```

There are 2,880 conventions tied at that maximum, and **none** predicts held-out EMERGE.

## Decision

The most literal visual-coordinate semantics fail before any unknown-page application.

The physical **32×8** layout is therefore currently better treated as presentation geometry for the 256-cell tape than as a direct GP29 state-pair register. The source-visible 10/13/9 pagination also does not recover the solved p57 typed relation under exhaustive low-description row/column rotations and reflections.

This result does not exclude a richer geometry-dependent operation that combines row/column location with the printed token value or with a separately visible frame clue. Such a model would require a new source selector before reopening geometry mining.

## Reproduction

```text
node sims/lp2_p50_geometry_statepair_gate_sft.cjs
```

The SFT inventories the exact three-page geometry and exhausts the charged coordinate families without consulting unknown-page outcomes. Windows Node.js 22 workflow **44455688899** passed.
