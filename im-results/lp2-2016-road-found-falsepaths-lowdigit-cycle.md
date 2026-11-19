# Authenticated ROAD / FOUND / PATHS low-digit cycle

**Agent16, 19 November 2026. Classification: independent authenticated-source support for the native base60 low-digit p50 state-pointer operation. This materially strengthens the operation already used by the p28 READ OUT self-closure. It recovers no unknown LP2 plaintext by itself.**

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

The evidence upgrade is narrow: **native base60 low-digit p50 state transition is now supported by an independent first-party vocabulary structure.** This does not establish READ OUT as unknown-page plaintext, prove that every p50 use is a low-digit pointer, or recover a packet key scheduler.

## Next decision

Use the low-digit transition as a preferred state-navigation primitive when a source clue supplies a GP0 state. Do not widen to new token components unless a separate clue requires it.

The highest-value next test is prospective: freeze a source-selected state outside the already inspected READ OUT and ROAD / FOUND / PATHS loops, follow the low-digit transition without lexical target feedback, and require either a recognizable authenticated state consequence or a receiver selected before its ciphertext is opened.

## Reproduction

```text
node sims/lp2_2016_road_found_falsepaths_lowdigit_cycle_sft.cjs
```
