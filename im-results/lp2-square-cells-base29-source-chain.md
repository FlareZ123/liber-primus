# BASE29 square cells extend the center91 pair into a held-out signed-source chain

**Agent7, 19 November 2026. Classification: strong source-structural holdout that independently selects the p0 phrase; no complete unknown-page cipher is claimed.**

## Chronology and fixed radix

The preceding three-center experiment selected BASE29 before this full-cell scan.

The authenticated 2014 square centers are:

```text
809 -> BASE29 [27,26]
331 -> BASE29 [11,12]
 91 -> BASE29 [ 3, 4]
```

Across every radix2..809 and all eight whole-pair mirror masks, the sole family that turns all three centers into forward adjacent signed-source indices is base29 with only the p22-reused 809 square reversed. That result was already frozen and passed Windows run `44474459983`.

Only after that center result was established did this experiment inspect the remaining square cells.

## Full square-cell holdout

The three authenticated square resources contain:

```text
99 cell occurrences
50 distinct integer values
maximum cell value 1311
```

Under the already selected BASE29 radix, five distinct values are forward adjacent pairs in the authenticated 43-word signed-source register:

```text
 91 = [ 3, 4] = LIES EMPTY
121 = [ 4, 5] = EMPTY EPIPHANY
151 = [ 5, 6] = EPIPHANY SEEKS
181 = [ 6, 7] = SEEKS THE
331 = [11,12] = IS THE
```

The sole reverse-adjacent BASE29 square value is the already known center:

```text
809 = [27,26] = ARE NUMBERS
```

P22's independent mirror reverses that center to `[26,27] = NUMBERS ARE`.

The important holdout is the first four values. Center91 was part of the radix-selection experiment. The non-center values **121, 151, 181 had not been used to choose the radix**. They extend the center into four overlapping bigrams:

```text
[3,4] LIES EMPTY
[4,5] EMPTY EPIPHANY
[5,6] EPIPHANY SEEKS
[6,7] SEEKS THE
```

Collapsing overlaps reconstructs the exact authenticated source substring:

```text
LIES EMPTY EPIPHANY SEEKS THE
```

The value151 therefore gives a second direct square-derived selection of **EPIPHANY SEEKS** as source indices5/6. This does not consult the p0 title ciphertext, the p0 residual key, or the p22 ARE27 route.

## Cell locations are fixed by the source squares

The four chain values occur at:

```text
91   third 5x5 square center
121  second 7x7 square at (2,2) and (4,4), zero-based
151  third 5x5 square at (0,4) and (4,0)
181  second 7x7 square at (0,6) and (6,0)
```

Thus the three held-out values are source cells rather than derived arithmetic values.

## Radix family control

To measure whether the four-bigram run is a generic radix artifact, charge every integer radix from2 through1311, the largest square cell.

For each radix:

1. convert all 50 distinct square values to canonical two-digit form where possible;
2. keep values whose two digits are valid signed-source indices `[n,n+1]`;
3. collect the starting indices `n`;
4. measure the longest consecutive run of starts.

Result:

```text
BASE29: unique longest run length4 at starts [3,4,5,6]
all other radices: maximum run length2
```

Some other radices produce more isolated adjacent pairs, so raw hit count is not the claim. The discriminating structure is the four-edge overlapping chain.

## Honest next prediction

The next overlapping bigram would be:

```text
[7,8] = THE DEVOTED
integer = 7*29 + 8 = 211
```

Value211 is absent from all three authenticated source squares.

The fixed 256-cell pp49-51 table is a natural manuscript-native receiver because211 is in range. Its zero-origin cell211 contains byte61, printed token `11`, whose existing base59 interpretation is60. That does not give a signed-source continuation.

Therefore the present chain honestly stops after source index7 under these two direct receivers. Do not infer 211 through unrelated numeric inventories without a new source clue.

## Consequence for p0

The p0 title candidate **EPIPHANY SEEKS** now has three independent source-side selectors that do not read the p0 ciphertext values:

1. p55 state roles `g=5 / a=6` select source indices5/6;
2. p22 center809 emits `NUMBERS ARE`, whose established ARE27 route sheds/H to `[5,6]`;
3. the held-out authenticated square cell151 is literally BASE29 `[5,6]`, inside the uniquely long square-cell source chain.

The exact 13-atom additive key ordering on p0 remains retrospective. This result strengthens plaintext selection, while it does not by itself supply the missing encryption-key serialization.

## Reproduction

```text
node sims/lp2_square_cells_base29_source_chain_sft.cjs
```

Windows Node22 workflow: pending at report creation.
