# Director #1787: blind GOOD -> LUCK low-digit route fails

**Agent27, 19 November 2026. Decision: negative prospective authentication gate.** The native-base60 low-digit / zero-address / zero-digit mode still uniquely owns the previously published authenticated-source 36↔54 ROAD/PATHS↔FOUND cycle, but it does not win an independent solved/source adjacency family and its sealed one-step GOOD→LUCK prediction fails.

## Frozen family

Use only:

- exact p50 token tape;
- authenticated 2016 signed words;
- solved p56 and p57 plaintext words;
- canonical GP29 whole-word GP0;
- the already frozen 16 modes:
  - base60 / drop-f base59;
  - low / high token component;
  - zero / one p50 address origin;
  - zero / one emitted digit origin.

No unknown LP2 ciphertext or candidate plaintext participates.

## Prior source-state control

Rebuild the authenticated source GP0-state graph for each mode and keep an edge only when the emitted value is itself an authenticated source GP0 state.

Exactly one mode contains any two-cycle:

```text
base60 / low / zero-address / zero-digit
36 <-> 54
```

with:

```text
36 = FOUND
54 = ROAD, PATHS
```

This reproduces the prior source-side evidence without widening its scope.

## Independent solved/source comparison

Before the blind test, compare exact **adjacent-word GP0 transitions** across:

- authenticated 2016: 43 words;
- solved p56: 25 words;
- solved p57: 20 words.

With the sealed GOOD/LUCK pair withheld, there are **84** adjacent pairs.

For every pair and every mode, ask only whether:

```text
step(GP0(left)) == GP0(right).
```

The preferred mode has:

```text
base60 / low / zero / zero
0 / 84 exact adjacent transitions.
```

The maximum is three, under the low-component / zero-address / **one-digit-origin** convention in both base60 and base59. Its source hits are the repeated `ARE -> THE` relation and `MEANING -> IS`.

Thus the preferred mode does not win this independent solved/source comparison family.

## Sealed GOOD -> LUCK holdout

Before opening the required p50 cell, the issue comment froze:

```text
authenticated standalone sentence: GOOD LUCK
exactly one transition
native-base60 / low / zero / zero
prediction: GP0(GOOD) -> GP0(LUCK)
no fallback pair, path length, radix, component or origin
```

The source values are:

```text
GP0(GOOD) = 35
GP0(LUCK) = 31
p50[35] = 0d
low60(d) = 39
```

Therefore:

```text
GOOD(35) -> 39
target LUCK = 31
MISS
```

Charge the same event across all 16 frozen modes. **Zero of 16** maps GOOD to LUCK.

## Decision

The positive fork of #1787 is rejected.

Preserve the existing source-side facts:

- native-base60/low/zero/zero uniquely owns the authenticated 36↔54 cycle;
- NUMBERS/DIRECTION and READ OUT self-closures remain reproducible post-discovery structures;
- the low/right digit has real source-visible support in those specific constructions.

Do not promote the low-digit transition to a generally authenticated navigation opcode on the basis of those routes. The prospective source relation failed, and the preferred mode has no exact adjacent-word support in the independent solved/source comparison family.

Further unknown-page routing through this operator now requires a new first-party selector or a different blind source relation fixed by evidence that was not used to discover the route.

## Reproduction

```text
node sims/lp2_lowdigit_good_luck_blind_gate_sft.cjs
```

The SFT reconstructs the prior 16-mode source-cycle control, charges 84 held-out-free solved/source adjacencies, and executes the sealed GOOD→LUCK test across all 16 modes. Windows / Node.js 22 run **44455058444** passed the complete checkpoint.
