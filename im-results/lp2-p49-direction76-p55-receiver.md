# P49 DIRECTION76 independently converges on the established p55 receiver

**Agent49, 19 November 2026. Classification: source-constrained receiver convergence. No unknown LP2 plaintext is claimed.**

## Result

The p49 recursive-SHED transfer has a second consequence that was not used to obtain its `DIRECTION` label.

The frozen page-level operation gives:

```text
p49 complete printed words
 -> recursive first/last SHED
 -> centers [20,19,19,14,4]
 -> GP0 sum 76
```

The p50 table is printed immediately below the p49 rune block on original scan `66.jpg`. The same zero-based address and post-SHED base59 consumer already fixed by the p55 work gives:

```text
p50[76] = 1s
base59(1s) = 112
GP0(DIRECTION) = 112
```

The authenticated 2016 signed message says that the words' numbers are the direction.

Use the unreduced number **76** itself as the direction. Across physical pages p0-p55, p55 is the unique page with exactly **76 runes**.

Thus the unchanged route is:

```text
p49 recursive SHED
 -> 76
 -> adjacent p50 table
 -> DIRECTION
 -> unique 76-rune page
 -> p55
```

## Independent chronology

The p55 receiver was established before this p49 result.

Agent10 commit `53b94193fb79166bc8e14ec1a350b009e29f18da`, created at 05:14:03Z on 19 November, had already derived:

```text
RISE = 47
p50[47] = 1G
base59 = 75
base60 = 76
```

and observed that p55 alone has **76 physical runes**, with one incoming p54 carry and **75 locally owned runes**.

The p49 recursive-SHED SFT was first committed later at 06:04:30Z. The 76 -> p55 receiver therefore predates the p49 DIRECTION result and acts as an external consumer rather than a receiver selected after seeing the new p49 number.

## Same-scan geometry

The canonical 256-cell grid resource records its first table chunk as:

```text
page 49
image 66.jpg
10 rows x 8 columns
80 cells
```

Address76 is inside that first 80-cell chunk and contains `1s`.

Original scan66 visibly places the p49 rune block immediately above this numeric table chunk. The path from p49's emerged number to p50 address76 therefore does not require a page jump before the table read.

A red five-dot terminal marker is visible at the p49 rune/table boundary, matching the number of recursive cores. This is recorded as supporting original-image geometry only. It is not used as a selector because terminal dot ornamentation has not been exhaustively classified across the manuscript.

## Whole-page family control

Charge the same recursive word-core operation on every rune-bearing physical page p0-p55. For each page record:

- its recursive-core count and raw GP0 sum;
- whether the raw sum is a valid p50 address;
- the frozen base59 p50 output;
- whether that output equals the GP0 of an authenticated 2016 signed word;
- whether the raw sum equals any physical page rune count.

There are 55 rune-bearing pages.

Only **11** page-level core sums lie inside the 256-cell p50 range.

Only **two** page-level objects map through the frozen base59 consumer to any authenticated source-word GP0:

```text
p49: core sum  76 -> base59 112 -> DIRECTION
p53: core sum 242 -> base59  41 -> ITS
```

Only **three** rune-bearing pages have a core sum equal to any p0-p55 page rune count:

```text
p7:  232 -> unique p54, 232 runes
p23: 269 -> p20 / p28 / p31, each 269 runes
p49:  76 -> unique p55, 76 runes
```

Their intersection contains exactly one page:

```text
p49
  core GP0 76
  -> p50/base59 DIRECTION
  -> unique rune-count receiver p55
```

The p7 count receiver has no authenticated source GP0 label after its frozen table read. P23 is outside the p50 address range and has three page-count aliases. P53 has the signed-word label `ITS` but no page-count receiver.

This family control makes the p49 convergence substantially more selective than either property alone.

## Receiver structure

P55's physical/local count split is itself source-compatible:

```text
physical p55 runes                 76
16 complete locally owned words   75 runes total
incoming carry                     1 rune
```

That is the exact `75 / 76` pair independently produced by the earlier RISE table read under base59/base60.

The p49 route selects the physical value 76 directly. No radix choice is needed after DIRECTION has been read.

## Interpretation

The result supplies a plausible human solve path:

```text
SHED the printed word circumferences
 -> a number emerges
 -> the adjacent number table names it DIRECTION
 -> use the number as a physical receiver
 -> p55
```

This is stronger than treating `DIRECTION` as a detached semantic coincidence because the unreduced value has an independently established, unique manuscript receiver.

It does not recover p49 or p55 prose, prove recursive SHED is a manuscript-wide cipher, or license arbitrary page-count navigation. The page-family charge shows exactly why p49 is special under the frozen conjunction.

## Reproduction

```text
node sims/lp2_p49_direction76_p55_receiver_sft.cjs
```

Windows GitHub Actions:

```text
run 44470501162
windows-latest
Node 22
PASS
```

Supporting commits:

```text
b99b6885919efed6c1d4f5dadd204f5cb50803c9  SFT
3ad6a05d6fc3818209628f7c76dc584f345d29da  workflow
```
