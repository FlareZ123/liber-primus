# VERIFY selects a p9 DIRECTION / PATHS packet and a nonidentity cube holdout

**Agent31, 19 November 2026. Classification: strong source-linked numeric receiver and independent continuation of the p39 VERIFY candidate.** The route consumes VERIFY through the already authenticated native-base60 low-digit operation, fixes a p9 midpoint receiver before interpreting its content, and uses the unused full value of the same p50 cell as a held-out checksum. The selected original p9 packet directly encodes signed-source word numbers DIRECTION and PATHS. The raw identity packet is an explicit rival to any power transform; conditional on applying the independently source-selected cube, `u-3-27` is the sole nonidentity transform preserving the packet. The resulting letters `WOEFILI` remain secondary and are not promoted as plaintext.

## VERIFY supplies two p50 fields

The existing p39 route gives

```text
p39 offset105 g=5 word
[8,6,4,12,16]
  SHED CIRCUMFERENCE
[6,4,12]
GP0 = 22 = p-1

p50[22] = native-base60 59
GP0(VERIFY) = 59.
```

Use VERIFY directly:

```text
address = GP0(VERIFY) = 59
p50[59] = "19"
full native-base60 value = 69
low native-base60 digit  = 9.
```

The independently authenticated low-digit operation therefore selects physical p9. Keep full value69 as the other field of the same cell.

## P9 midpoint receiver

Physical p9 has 268 runes and midpoint133.5. Its center-crossing word ends at134. The nearest complete `g=5` word begins immediately afterward:

```text
word32 offsets135..139
[25,4,0,3,16].
```

Its immediate boundaries are predecessor19=`B` and successor21=`B+K`.

The two side packets have sums

```text
predecessor + word = 67
word + successor   = 69.
```

The held-out full value69 therefore selects the outward packet without language:

```text
[25,4,0,3,16,21]
AERFOTNG
GP0 total = 69.
```

## K=2 recovers DIRECTION / PATHS in untouched ciphertext

Split after the state-fixed `K=2` runes:

```text
[25,4] | [0,3,16,21]
  29   |     40
```

Zero-based signed-source words29 and40 are exactly

```text
DIRECTION | PATHS.
```

This is already present in the original p9 ciphertext packet.

Its consecutive H pairs are also state-typed:

```text
H(25,4)  = [21,0] = [B+K,F]
H(0,3)   = [26,3] = [-e,e]
H(16,21) = [24,8] = [p+1,A].
```

These H identities are supporting structural evidence rather than a separate probability claim.

## Productive and false branches

Convert the two selected source words back to canonical GP0 and apply the already fixed low-digit navigation:

```text
DIRECTION:
GP0=112
112 -> 13 -> 4 -> 37 -> 20 -> 42 -> 28

PATHS:
GP0=54
54 -> 36 -> 54 -> ...
```

The first returns to p28 through the established OUT(20) and FIND(42) states. The second is the existing PATHS/FOUND false loop. This matches the signed source distinction between “their numbers are the direction” and “Beware false paths” using no new opcode.

## Complete p50 receiver/checksum control

Charge every p50 address under one rule:

1. its low digit selects a physical page;
2. on that page take the nearest complete midpoint word of state length `g=5`, requiring it to begin strictly after the midpoint;
3. append its immediate outward successor;
4. compare the raw packet sum with the full value of the same p50 cell.

Only six pages are eligible:

```text
p9  start135 sum69
p14 start73  sum113
p20 start136 sum81
p28 start135 sum91
p40 start118 sum93
p54 start117 sum103.
```

Across all **256 p50 addresses**, exactly one cell satisfies low-page selection and full-value checksum simultaneously:

```text
address59 -> "19" -> low9 / full69
p9 receiver -> sum69.
```

Across all **43 authenticated 2016 source words**, VERIFY is likewise the sole hit.

This rule was recognized after the p9 phrase object had already been catalogued in the p28 family audit, so these are familywise controls rather than blind discovery probabilities. The result nevertheless supplies the independent consumer that the p39 VERIFY report explicitly lacked.

## Cube transfer and identity caveat

The raw packet itself already has the DIRECTION/PATHS split, so identity must remain charged.

Apply the complete pre-existing 44-transform p28 family to the fixed p9 word plus outward successor and require the transformed `K=2` split to remain `29|40`. Exactly two survive:

```text
u-1-1:
[25,4,0,3,16,21]
AERFOTNG

u-3-27:
[7,22,0,10,20,10]
WOEFILI.
```

Thus p9 does not prove a power operation is necessary. Conditional on applying the separately authenticated nonidentity cube opcode, **u-3-27 is the sole survivor among the 43 nonidentity family members**.

The current exponent9 rival gives

```text
u-3-9:
[16,13,0,21,24,10]
TPFNGAI
K split = 29 | 55
```

and loses PATHS. P9 therefore provides a fresh discriminator favoring exponent27 over exponent9 only on the branch where a cube action is required.

The `WOEFILI` letters admit the already recorded finite-register parse `WOE FILI`, but no semantic reading is needed for this result and the letters remain provisional.

## Decision

Preserve this intended-route structure:

```text
p39 -> VERIFY
VERIFY GP0=59
 -> p50[59]="19"
 -> low9 selects p9
 -> full69 is held out

p9 midpoint
 -> nearest complete g=5 word at135
 -> full69 selects outward successor
 -> raw six-rune packet totals69
 -> K=2 split gives signed indices29|40
 -> DIRECTION | PATHS

DIRECTION -> productive route -> p28
PATHS     -> false PATHS/FOUND loop.
```

This is a source-linked numeric recovery from original p9 ciphertext. It consumes VERIFY and strengthens the p28 `(3,27)` schedule without claiming `WOEFILI` as established plaintext.

## Reproduction

`node sims/lp2_verify_p9_direction_paths_holdout_sft.cjs`
