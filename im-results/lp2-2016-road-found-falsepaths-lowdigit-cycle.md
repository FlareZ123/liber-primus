# Authenticated 2016 low-digit routes: ROAD / FOUND / PATHS cycle and NUMBERS / DIRECTION -> p28

**Agent16, 19 November 2026. Classification: independent authenticated-source support for the native base60 low-digit p50 state-pointer operation, including a source-only route from the signed clause `NUMBERS ... DIRECTION` through solved `FIND` to physical p28. This materially strengthens the operation already used by the p28 READ OUT self-closure. It does not itself decrypt unknown LP2 ciphertext.**

## Result

The authenticated 2016 message itself privileges three words in clue-bearing clauses:

```text
... their meaning is the road ...
Seek and you will be found.
Beware false paths.
```

Their canonical GP0 values contain an exact collision:

```text
GP0(ROAD)  = 54
GP0(PATHS) = 54
GP0(FOUND) = 36
```

Apply the same candidate operation independently found in the p28 READ OUT route: address the original p50 table by a GP0 state, then read the **zero-based low digit in the native base60 alphabet** as the next state.

The original table gives:

```text
p50[54] = 2a  -> low60(a) = 36
p50[36] = 0s  -> low60(s) = 54
```

Therefore:

```text
ROAD / PATHS (54) -> FOUND (36) -> ROAD / PATHS (54)
```

The numeric operation is completely source-side. It uses the authenticated signed vocabulary and untouched original p50 tokens, without any unknown-page ciphertext or fitted plaintext.

The semantic collision at state54 is unusually apt for a human puzzle: the source itself says that meaning is **the road** and separately warns of **false paths**. The numeric state cannot distinguish ROAD from PATHS because the two words have the same GP0 value. The warning supplies a natural linguistic discriminator rather than another arithmetic parameter. This interpretation is plausible, while the numeric cycle is the reproducible fact.


The printed source order adds a separate human-path constraint. The alphabetic word positions are:

```text
ROAD  = word index23
FOUND = word index35
PATHS = word index40
```

and the frozen pointer gives:

```text
ROAD(54)  -> FOUND(36)
FOUND(36) -> PATHS/ROAD(54)
PATHS(54) -> FOUND(36)
```

Choosing the next matching term that actually appears later in the signed prose yields **ROAD -> FOUND -> PATHS**, after which PATHS loops back to FOUND. This mirrors the three successive source clauses “the road”, “you will be found”, and “false paths”. It gives the “false path” warning a concrete computational meaning: PATHS enters the 36↔54 trap.

## Complete convention charge

The signed message has 34 distinct alphabetic word types occupying 27 distinct GP0 states.

Charge the same obvious token-component family used in the READ OUT audit:

- native base60 versus drop-f base59;
- low versus high token component;
- zero- versus one-based p50 address;
- zero- versus one-based component value.

For each of the 16 modes, keep an edge only when the emitted value is itself one of the authenticated vocabulary's 27 GP0 states, then enumerate exact two-cycles.

Exactly one mode contains any two-cycle:

```text
base60 / low / zero-address / zero-digit
36 <-> 54
```

Its source labels are exactly:

```text
36 = FOUND
54 = ROAD, PATHS
```

No base59, high-component, shifted-address, or one-origin mode produces a two-cycle in the authenticated GP0-state graph.

This is a stronger transfer than the earlier READ OUT loop's internal self-consistency because the 2016 vocabulary was authenticated independently of the unknown LP2 ciphertext.

## Stronger source-only route: NUMBERS and DIRECTION converge to FIND -> p28

The signed clue sentence explicitly presents three noun relations:

```text
WORDS are the MAP
MEANING is the ROAD
NUMBERS are the DIRECTION
```

Use only canonical whole-word GP0 states and the same native base60 low-digit pointer.

The third pair gives:

```text
GP0(NUMBERS)   = 83
GP0(DIRECTION) = 112

p50[83]  = 3D -> low60(D) = 13
p50[112] = 1D -> low60(D) = 13
```

Thus the two nouns in **“their numbers are the direction”** converge after one pointer step. Continue the same operation without changing type, alphabet, origin or receiver:

```text
NUMBERS(83)   \
               -> 13 -> 4 -> 37 -> 20 -> 42 -> 28
DIRECTION(112)/
```

The tail has two independently meaningful states:

```text
20 = GP0(OUT)
42 = GP0(FIND)
28 = physical p28
```

So the authenticated 2016 clause reaches the already solved word **FIND**, then p28, and joins the candidate READ OUT path at OUT=20:

```text
NUMBERS / DIRECTION
        -> 13 -> 4 -> 37
        -> OUT(20)
        -> FIND(42)
        -> p28

READ(55)
        -> OUT(20)
        -> FIND(42)
        -> p28
```

This is the first independent first-party route found here that supplies an external consumer for the low-digit state transition and lands on the same physical page without using unknown p28 ciphertext.

### Relation-family charge

First charge the three parallel noun relations above across the same 16 token conventions:

- base60 versus drop-f base59;
- low versus high component;
- zero- versus one-based address;
- zero- versus one-based emitted digit.

For each relation/mode pair, require:

1. both nouns converge after the first pointer step;
2. iterate the same mode until its first repeat;
3. before repeating, the path must contain the exact consecutive transition `FIND(42) -> 28`.

There are 48 relation/mode configurations. Exactly one survives:

```text
NUMBERS / DIRECTION
base60 / low / zero-address / zero-digit
13 -> 4 -> 37 -> 20 -> 42 -> 28 -> ...
```


A broader source control reaches the same result. Freeze ten obvious semantic pairs from the authenticated message:

```text
PATH / EMPTY
EPIPHANY / DEVOTED
LIBER PRIMUS / WAY
WORDS / MAP
MEANING / ROAD
NUMBERS / DIRECTION
SEEK / FOUND
GOOD / LUCK
FALSE / PATHS
VERIFY / OPENPGP
```

Crossing these ten relations with the same 16 component conventions gives **160** relation/mode cases. The sole pair/mode that both converges after one step and reaches consecutive `FIND(42) -> 28` is still **NUMBERS/DIRECTION under native base60 low digit with zero-based address/value semantics**.

Several unrelated signed words share first state13 under the canonical mode, so the arithmetic convergence alone is not unique across the whole vocabulary. What is selective is that **NUMBERS / DIRECTION is the sole explicitly related noun pair** that both converges and reaches `FIND -> p28` under the charged convention family.

### Fixed seven-cell calibration

The complete source-selected route consumes seven fixed p50 cells:

```text
83, 112, 13, 4, 37, 20, 42
```

and requires their low-base60 outputs to be:

```text
13, 13, 4, 37, 20, 42, 28
```

Under a uniform permutation of the 256 labeled original token instances, while keeping those seven addresses fixed, the exact multiset probability is:

```text
88000 / (256 * 255 * 254 * 253 * 252 * 251 * 250)
= 1 / 753817095360
≈ 1.32658e-12
```

This remains a fixed-route diagnostic because the low-digit operation and source corpus were already under investigation. The stronger evidential point is the bounded 48-case source-relation/convention charge and the exact `FIND -> p28` endpoint.

## Fixed-pair calibration

As a narrow diagnostic, uniformly permute the 256 **labeled original p50 token instances** while holding the two source-selected cells54 and36 fixed.

The original table contains four low-base60 digits equal to36 and eight equal to54. The exact probability that the two fixed cells receive the required ordered values is:

```text
(4 * 8) / (256 * 255)
= 32 / 65280
= 1 / 2040
= 0.0004901960784
```

This is a fixed-pair table-multiset calibration rather than a discovery-wide p-value. The useful familywise evidence is the 16-mode source-vocabulary charge above.

## Consequence for READ OUT

The previously documented p28 candidate uses the same operation:

```text
READ(55) -> OUT(20) -> FIND(42) -> p28
```

through original cells:

```text
p50[55] = 1K -> low60 = 20
p50[20] = 1g -> low60 = 42
p50[42] = 0S -> low60 = 28
```

That route previously lacked an independently selected consumer outside READ OUT / FIND / p28. The authenticated ROAD / FOUND / PATHS cycle supplies one.

The evidence upgrade is now broader than a single cycle: **native base60 low-digit p50 state transition is supported by an authenticated source trap, a uniquely charged NUMBERS/DIRECTION route into `FIND -> p28`, and a direct merge with the p28 READ OUT tail.** This still does not imply that every p50 use is a low-digit pointer or recover a packet key scheduler.

## Next decision

Use the low-digit transition as a preferred state-navigation primitive when a source clue supplies a GP0 state. Do not widen to new token components unless a separate clue requires it.

The strongest current interpretation is a candidate intended navigation route: the authenticated 2016 `NUMBERS ... DIRECTION` clause selects the canonical low-digit pointer and reaches `FIND -> p28`, while the ROAD/FOUND/PATHS prose demonstrates a literal false-path trap under the same operation.

That route has now been consumed prospectively on the independently fixed p28 center-plus-word28 object. Across all 440 charged DH/shell transform-orientation-split configurations, the numeric condition `GP0(left) -> GP0(right) -> FIND(42) -> p28` selects one raw output before language scoring. Across all 1,440 independent reversible uniform GP29 power-pair/orientation/split configurations, it still selects one unique raw output; the only parameter alias acts identically on the center rune and is resolved to exponent3 by the source DH state. The selected runes then transliterate as **READ OUT**.

A second p28-local checkpoint, **HERE**, recovered independently by the fixed outer-H page-start mechanism, has `GP0(HERE)=48` and `p50[48]=4D -> 13`, so it enters the same `13 -> 4 -> 37 -> OUT -> FIND -> p28` route as NUMBERS/DIRECTION. This is a cross-operation closure, with HERE remaining a local checkpoint candidate.

The next decision is narrower: identify a first-party clue that demands the separate reversible GP29 power-map operator class on the p28 center-plus-word object, or derive a fresh ciphertext consequence that depends specifically on the selected READ OUT instruction.

## Reproduction

```text
node sims/lp2_2016_road_found_falsepaths_lowdigit_cycle_sft.cjs
```
