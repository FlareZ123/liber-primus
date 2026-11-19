# P11 × P24 cross-coordinate continuation: THE WAY ITS WORDS ARE

**Agent2, 19 November 2026. Classification: strong source-constrained structural continuation candidate. The cross-coordinate operation was recognized after the H-serialization audit exposed p26 word13, so preserve the chronology and do not promote it as a general decoder. The complete charged family has one hit; the same rule does not recurse.**

## Result

Three source-selected numbered-diagonal receivers were independently established before this investigation:

```text
IS11
 -> p11 word12
 -> Hpair [26,25]
 -> increasing source direction [25,26]
 -> THEIR NUMBERS

AND24
 -> p24 word25
 -> Hpair [12,13]
 -> THE WAY

OPENPGP42
 -> p42 word43
 -> Hpair [2,1,0]
 -> increasing source direction [0,1,2]
 -> HELLO THE PATH.
```

Treat those three complete unit-run packets as the only coordinate material.

Cross every distinct pair using the already established source-number coordinate grammar:

```text
source index i -> project page i
source index j -> canonical word ordinal j+1.
```

Charge:

- every pair among the three independent packets;
- both choices of which packet supplies the page and which supplies the word;
- every element of both packets;
- both live H serializations, Hpair and Hsplit;
- the same complete-unit-run predicate and increasing-number orientation already used by the numbered route.

This is **64 transform cases on 32 distinct coordinate receivers**.

Exactly one case is a complete authenticated-source unit run:

```text
page packet: IS11 -> THEIR NUMBERS [25,26]
choose 26 = NUMBERS

word packet: AND24 -> THE WAY [12,13]
choose 12 = THE
source index12 -> canonical word ordinal13

=> p26 canonical word13, start60
=> raw [15,15,28]

Hsplit:
difference = 15-28 = 16 mod29
center     = 15
sum        = 15+28 = 14 mod29

=> [16,15,14]
=> increasing source direction [14,15,16]
=> ITS WORDS ARE.
```

The Hpair serialization on the same receiver is:

```text
[16,14,15]
```

and is not a unit run. The hit therefore uses the Hsplit convention explicitly.

## Exact authenticated-source continuation

The independently recovered p24 packet already fixes:

```text
[12,13] = THE WAY.
```

The unique cross-coordinate hit fixes the immediately following source indices:

```text
[14,15,16] = ITS WORDS ARE.
```

Concatenating the two independently numbered runs gives the exact source interval:

```text
12 THE
13 WAY
14 ITS
15 WORDS
16 ARE

=> THE WAY ITS WORDS ARE.
```

No language model, dictionary scoring, word target, or plaintext inversion is used to choose the hit. The predicate is numerical: a full H output must be a unit-step run of valid authenticated-source indices.

## Why the cross is clue-constrained

The page coordinate comes from the already authenticated phrase **THEIR NUMBERS**. Its right member is literally NUMBERS, and index26 is used as a page number.

The word coordinate comes from the independently recovered **THE WAY**. Index12 is THE, and the existing numbered-route convention converts source index12 to one-based canonical word ordinal13.

The resulting object is therefore selected entirely from two existing source-derived packets before its raw values are interpreted.

The strongest caution is chronology. This cross-family was formulated after the H-serialization boundary audit exposed p26 word13 as the sole Hsplit descending-source rival to OPENPGP43. The full family charge prevents a single-coordinate anecdote, while it does not erase that retrospective discovery path.

## Complete family result

The three established unit packets are:

```text
IS11       [25,26]
AND24      [12,13]
OPENPGP42  [0,1,2].
```

Across all pairings, packet-role assignments, member choices, and both H serializers, the p26 word13 Hsplit case is the **only** complete authenticated-source unit run.

This matters because the output was not constrained to the expected continuation `[14,15,16]`. Any valid source-index unit run could have passed. The sole hit happens to be exactly the next three authenticated words after `THE WAY`.

## Pre-existing downstream closure: WORDS ARE THE MAP

A separate Agent10 route was committed around 04:55 UTC, well before this cross-coordinate family was formulated. It fixes the second authenticated THEIR at source index25 and applies the already selected base60 low-digit p50 consumer:

```text
25 THEIR
 -> low60(p50[25]) = 18
 -> MAP

18 MAP
 -> low60(p50[18]) = 15
 -> WORDS.
```

That older route therefore selects the exact authenticated source interval:

```text
15 WORDS
16 ARE
17 THE
18 MAP

=> WORDS ARE THE MAP.
```

The new cross-coordinate packet was selected independently as:

```text
14 ITS
15 WORDS
16 ARE.
```

The two routes overlap exactly on:

```text
15 WORDS
16 ARE.
```

Combining the independently fixed p24 packet, the new cross packet, and the older low-digit clause gives one continuous authenticated interval:

```text
12 THE
13 WAY
14 ITS
15 WORDS
16 ARE
17 THE
18 MAP

=> THE WAY ITS WORDS ARE THE MAP.
```

The held-out check is structural. The SFT reconstructs the low-digit path directly from the canonical p50 grid and requires the overlap and complete interval exactly. The cross-coordinate search did not use the low-digit route or this seven-word interval in its selection predicate.

This materially strengthens the p26 receiver as a bridge between two pre-existing source-register mechanisms. It does not make the cross rule recursive. The prospective recursion test below remains negative.

## Prospective recursion gate

Freeze the newly derived packet:

```text
P26W13 -> [14,15,16] = ITS WORDS ARE.
```

Now cross it prospectively with each of the three original unit packets under the same page/index grammar, both packet-role assignments, every element choice, both H serializations, and the same complete-unit-run predicate.

Result:

```text
no second-stage unit-run hits.
```

The cross-coordinate mechanism therefore does not currently continue recursively to `THE MAP` or another source phrase. Preserve the first continuation as a bounded structural result.

## Research consequence

This result links five independently sourced components:

```text
p11 -> THEIR NUMBERS
p24 -> THE WAY
their number packets -> p26 word13
p26 word13 Hsplit -> ITS WORDS ARE
older p50 low-digit route -> WORDS ARE THE MAP.
```

The shared `WORDS ARE` overlap closes authenticated source indices12 through18 as `THE WAY ITS WORDS ARE THE MAP`. This strengthens the interpretation of the signed 2016 source as an executable coordinate register and gives a concrete role to Hsplit outside the local-inverse plaintext work.

Continuous LP2 prose remains unresolved. The evidence supports a bounded cross-coordinate bridge rather than a universal opcode, since the frozen derived packet produces no second-stage unit run. A future advance should seek a source-visible clue explaining why the THEIR NUMBERS and THE WAY packets are crossed, or an independent consumer of the resulting seven-word source interval.

## Reproduction

```text
node sims/lp2_p11_p24_cross_coordinate_sft.cjs
```

Windows Node22:
- exploratory complete-family pass: **44473862009**
- prospective second-stage pass: **44473997715**
- locked assertions: **44474146385 PASS**
- pre-existing low-digit held-out closure: **44474937986 PASS**.
