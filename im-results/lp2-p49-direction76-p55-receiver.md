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

## Full signed-2016 43-word register: physical-scan continuation is null-compatible

The authenticated 2016 cleartext contains **43** alphabetic words. Freeze the canonical GP0 spelling, the original row-major 256-cell p50 grid, the exact post-SHED base59 alphabet (the 60-symbol printed alphabet with lowercase f removed), and physical scan mapping **LP2 page = scan − 17**. No word, radix, origin, or page is selected after seeing its output.

| # | Signed word | GP0 | p50 token | Base59 | Scan | LP2 page |
|---:|---|---:|---|---:|---:|---:|
| 1 | HELLO | 69 | 1D | 72 | 72 | 55 |
| 2 | THE | 20 | 1g | 100 | — | — |
| 3 | PATH | 39 | 05 | 5 | — | — |
| 4 | LIES | 63 | 0p | 50 | 50 | 33 |
| 5 | EMPTY | 92 | 3u | 232 | — | — |
| 6 | EPIPHANY | 121 | 3v | 233 | — | — |
| 7 | SEEKS | 71 | 1m | 106 | — | — |
| 8 | THE | 20 | 1g | 100 | — | — |
| 9 | DEVOTED | 102 | 0W | 32 | 32 | 15 |
| 10 | LIBER | 69 | 1D | 72 | 72 | 55 |
| 11 | PRIMUS | 62 | 24 | 122 | — | — |
| 12 | IS | 25 | 3I | 195 | — | — |
| 13 | THE | 20 | 1g | 100 | — | — |
| 14 | WAY | 57 | 1w | 116 | — | — |
| 15 | ITS | 41 | 1O | 83 | — | — |
| 16 | WORDS | 52 | 1Q | 85 | — | — |
| 17 | ARE | 46 | 3J | 196 | — | — |
| 18 | THE | 20 | 1g | 100 | — | — |
| 19 | MAP | 56 | 4E | 250 | — | — |
| 20 | THEIR | 34 | 3H | 194 | — | — |
| 21 | MEANING | 77 | 2O | 142 | — | — |
| 22 | IS | 25 | 3I | 195 | — | — |
| 23 | THE | 20 | 1g | 100 | — | — |
| 24 | ROAD | 54 | 2a | 154 | — | — |
| 25 | AND | 56 | 4E | 250 | — | — |
| 26 | THEIR | 34 | 3H | 194 | — | — |
| 27 | NUMBERS | 83 | 3D | 190 | — | — |
| 28 | ARE | 46 | 3J | 196 | — | — |
| 29 | THE | 20 | 1g | 100 | — | — |
| 30 | DIRECTION | 112 | 1D | 72 | 72 | 55 |
| 31 | SEEK | 56 | 4E | 250 | — | — |
| 32 | AND | 56 | 4E | 250 | — | — |
| 33 | YOU | 30 | 2L | 139 | — | — |
| 34 | WILL | 57 | 1w | 116 | — | — |
| 35 | BE | 35 | 0d | 39 | 39 | 22 |
| 36 | FOUND | 36 | 0s | 53 | 53 | 36 |
| 37 | GOOD | 35 | 0d | 39 | 39 | 22 |
| 38 | LUCK | 31 | 2D | 131 | — | — |
| 39 | BEWARE | 88 | 3V | 208 | — | — |
| 40 | FALSE | 77 | 2O | 142 | — | — |
| 41 | PATHS | 54 | 2a | 154 | — | — |
| 42 | VERIFY | 59 | 19 | 68 | 68 | 51 |
| 43 | OPENPGP | 75 | 2v | 174 | — | — |

The scan-range outputs are therefore **nine word hits, seven distinct GP0 addresses, and six distinct pages**: p15, p22, p33, p36, p51 and p55. The p55 landing is already known and cannot count as a new success. Address collisions are material: the 43 words occupy only **27** distinct GP0 addresses (16 collision excess). Repeated addresses are 20×6, 25×2, 34×2, 35×2, 46×2, 54×2, 56×4, 57×2, 69×2 and 77×2.

### Null preserving the table distribution and GP0 collisions

The 256 decoded p50 cell values range from **0 to 251**, with **161** distinct values. **63** cells fall in the physical scan interval 17–74, representing **37** distinct scan values. The null randomly permutes this exact 256-value multiset across the address slots while holding the 43 word GP0 addresses and their multiplicities fixed. Exact combinatorial dynamic programs calculate the weighted word-hit, distinct-address-hit and distinct-page distributions; no simulated or fitted English baseline is used.

| Statistic | Observed | Null expectation | Upper-tail probability |
|---|---:|---:|---:|
| Word hits | 9 | 10.582 | 0.6600 |
| Distinct hit addresses | 7 | 6.645 | 0.5143 |
| Distinct destination pages | 6 | 6.270 | 0.6432 |

The exact null probability of **six** distinct destination pages is **0.2011**. Six pages is ordinary under this null, not an excess. The 43-word scan map therefore fails its decisive test: its number of scan-range hits and distinct pages is fully compatible with the fixed p50 value distribution and the observed GP0 collisions.

### Destination review

- **p55** is the established receiver for the independent p49→DIRECTION route; it is not a new destination.
- **p22** is already an independently supported receiver from the p55→CIRCUMFERENCES route and mirrored LP1 artwork; BE and GOOD also collide at GP0 35, so this is one address and one known page, not a new receiver.
- **p33** is reached by LIES, but its M/NG cuneiform marker loop remains a retrospective correspondence without a source-selected body receiver; it also reuses p50 and supplies no held-out plaintext.
- **p15** has an independently studied Fibonacci-prime square, but no source-selected scan receiver for DEVOTED.
- **p36** has the numbered cuneiform passage, but no independently selected receiver for FOUND.
- **p51** has no pre-existing source-selected receiver for VERIFY.

No new destination meets the positive criterion. The exact p49→76→DIRECTION→p55 convergence remains a bounded positive route; the broader 43-word physical-scan interpretation is a **clean negative**. Do not rescue it with alternate radices, origins, semantic word/page matches, or post-reveal selectors.

Reproducer: sims/lp2_p49_direction76_p55_receiver_sft.cjs.


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

It does not recover p49 or p55 prose, prove recursive SHED is a manuscript-wide cipher, or license arbitrary page-count navigation. The full 43-word register above is null-compatible and does not generalize this receiver into a physical-scan map; the page-family charge shows exactly why p49 is special under the frozen conjunction.

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
