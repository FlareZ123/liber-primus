# P28 HERE now has an independent source consumer: HERE -> FOUND -> p39 -> VERIFY

**Agent7, 19 November 2026. Classification: strong conditional route-state convergence. This revives exactly one previously retired HERE-indexed continuation under a source-selected depth and two independent downstream consumers. It does not promote HERE, FOUND, or VERIFY to continuous unknown-page plaintext.**

## Fixed upstream state

The repository already had these ingredients before this route was opened:

- p28 READ OUT locally selects the page-start marker `HERE` under the fixed outer-H operation;
- the authenticated 2016 source reconstructs DH state `K=2`;
- p33 independently recovers `THEIR RISE`, whose two source occurrences fix rise `25-19=6`;
- the established p50 page grammar already uses a source/state number as a zero-based p50 address and reads the conventional full base60 value as a physical page, for example `B=19 -> p50[19]="0X" -> 33 -> p33`;
- p39 independently recovers `VERIFY` from a receiver selected by the p57 shed route, p50/DH page selection, the p39 title, and the DIVINITY reverse-tree depth;
- the existing VERIFY holdout independently consumes that source state and reaches p9 `DIRECTION|PATHS`.

The old HERE report retired free HERE-derived pointer and key menus after its blind local H continuation produced `MPAEO`. The route below uses one source-selected p50 depth, `K=2`, and then lands on independently established source/page states.

## K=2 consumes HERE through p50

Canonical GP0 gives:

```text
HERE = 48
```

Read conventional full base60 values from p50 and iterate exactly `K=2` times:

```text
48
 -> p50[48]  = "4D" = 253
 -> p50[253] = "0a" = 36
```

The authenticated 2016 source has exactly one word with GP0 36:

```text
index35 FOUND, GP0=36.
```

So the exact source-selected continuation is:

```text
HERE
 -> T^K
 -> FOUND.
```

No language search or choice among multiple GP0=36 source words is required.

## Source-side calibration of T^K

Charge the same `T^K` rule against all 42 adjacent authenticated 2016 word pairs. For each source word, start from its GP0, apply the full-base60 p50 map twice, and ask whether the result equals GP0 of the next authenticated word.

Exactly one adjacent pair hits:

```text
index33 WILL -> index34 BE

GP0(WILL)=57
57 -> p50[57]=118
118 -> p50[118]=35=GP0(BE)
```

Thus the exact two-step map already has a source-side control independent of HERE. The depth is the reconstructed DH value `K=2`, rather than a depth selected from HERE after reading its result.

## The same operator closes p28 through p32 before HERE

The p28 instruction itself supplies an additional fixed-state check. Apply the same `T^K` map separately to its two source words:

```text
GP0(READ)=55
55 -> 80 -> 142
```

The result is outside the physical LP2 page range.

For the operational word:

```text
GP0(OUT)=20
20 -> 102 -> 32
```

so `OUT` selects physical p32 under the unchanged full-base60 map.

P32 was independently selected by the authenticated SEEKS route before this relation was noticed. Its existing low-digit-selected word subset has exactly 42 runes:

```text
42 = GP0(FIND)
p50[42] = "0S" = 28
```

which returns to physical p28. Therefore the same source-selected table grammar forms a closed route before the new HERE continuation is used:

```text
p28 READ OUT
 -> OUT
 -> T^K
 -> p32
 -> selected aggregate 42 = FIND
 -> p50[42]
 -> p28.
```

This does not require choosing a p32 page after inspecting its ciphertext. Both p32 and its 42-rune aggregate predate the present route.

## FOUND converges on p39 VERIFY in two independent ways

The recovered source state is authenticated word35 `FOUND`.

First, the existing p50 number-to-page grammar gives:

```text
source number35
 -> p50[35] = "0d"
 -> conventional base60 39
 -> physical p39.
```

Second, the independently recovered p33 instruction `THEIR RISE` fixes rise6:

```text
35 FOUND + 6
= 41 VERIFY.
```

These two branches meet on an already independently selected unknown-page result:

```text
p39
 -> DIVINITY-selected g=5 receiver at offsets105..109
 -> SHED CIRCUMFERENCE
 -> interior [6,4,12]
 -> GP0 22
 -> p50[22]="0x"=59
 -> VERIFY, whose GP0 is uniquely 59 in the signed source.
```

The route therefore converges as:

```text
FOUND index35
 |                     \
 | p50[35]              \ THEIR RISE +6
 v                       v
p39 -----------------> VERIFY index41
      independent p39
      receiver/readout
```

## Charge over the pre-existing source-word/page candidates

Before this route, the repository already had independently selected source-word/page candidates for:

```text
SEEKS  -> p6
ARE    -> p32
THE    -> p32
WILL   -> p33
BE     -> p34
BEWARE -> p38
PATHS  -> p40
VERIFY -> p39
```

For each target at source index `j`, apply the fixed `THEIR RISE` predecessor `i=j-6`, address p50 at `i`, and require the conventional full value to equal that candidate's physical page.

Exactly one of the eight relations closes:

```text
i=35 FOUND
 -> p50[35]=39
 -> p39
 -> target index41 VERIFY.
```

The other seven candidate pages miss under the unchanged relation.

This is a finite post-discovery control over the existing candidate registry. It is useful because the p39 target and page were independently fixed before the new HERE route, while it is not an authorship probability.

## Existing downstream holdout consumes VERIFY

The route does not stop at VERIFY.

The pre-existing VERIFY holdout fixes:

```text
GP0(VERIFY)=59
p50[59]="19"
full value = 69
low digit  = 9
```

Low digit9 selects physical p9. The held-out full value69 selects the outward packet at the first complete `g=5` word right of the p9 midpoint. Its fixed `K=2` split has raw sums:

```text
29 | 40
```

which are authenticated source indices:

```text
DIRECTION | PATHS.
```

Thus the new HERE consumer reaches a source state that was already wired to an untouched downstream numeric receiver.

## Decision

Revive exactly this conditional route:

```text
p28 READ OUT
 -> p28 page-start HERE
 -> GP0(HERE)=48
 -> full-base60 p50 map iterated K=2
 -> 48 -> 253 -> 36
 -> unique signed source word FOUND at index35

FOUND
 -> source number35 -> p50[35]=39 -> p39
 -> THEIR RISE +6 -> signed word41 VERIFY

p39 independently
 -> VERIFY
 -> existing VERIFY holdout
 -> p9
 -> DIRECTION | PATHS.
```

This is the first independent downstream consumer that gives the retired HERE marker a concrete source-selected consequence. It materially strengthens HERE as a route-state candidate and connects p28 to the independently selected p39/p9 branch.

The chronology remains post-discovery: HERE, p39 VERIFY, and the source DH state were already known when this convergence was recognized. Preserve the chain as source-linked route evidence. Do not generalize `T^K` into an unrestricted p50 opcode or reopen arbitrary HERE-derived keys.

## Reproduction

```text
node sims/lp2_p28_here_found_p39_verify_route_sft.cjs
```

The SFT reconstructs the signed source GP0 register, the exact `T^K` source-adjacency census, the HERE-to-FOUND transition, the rise6/page39 convergence, the original p39 VERIFY receiver, and the existing p9 DIRECTION|PATHS holdout.
