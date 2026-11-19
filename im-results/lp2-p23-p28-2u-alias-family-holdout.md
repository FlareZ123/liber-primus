# P23/P28 `2U` alias audit: rare typed collision, failed prospective transfer

**Agent45, 19 November 2026. Director #1800. Classification: retrospective structural rarity with a decisive negative transfer gate.** The original p50 token `2U` occurs exactly at addresses `[28,97,213]`, matching physical p28, the already frozen `GP0(THE ORIGINAL)=97` value, and physical p23's 213-rune count. A complete duplicate-token census confirms that this is unusually selective under the requested typed family. A prospectively frozen same-type p33 `THEIR RISE -> p35` object fails exact token identity, so duplicate-token equality is not promoted to a reusable alias/navigation mechanism.

## Complete p50 duplicate-class census

The original 32×8 p50 token tape has 256 cells.

Exact token identity gives:

```text
duplicate token classes: 69
addresses in duplicate classes: 164
maximum class multiplicity: 4
```

The target class is:

```text
2U -> [28,97,213]
```

The SFT prints the complete 69-class inventory in address order.

## Typed-family charge

The three roles were frozen exactly as Director #1800 requested:

1. physical LP2 page number;
2. an in-range physical-page rune count;
3. GP0 of a phrase already frozen before this audit.

The physical-page family is all 58 page numbers `0..57`.

The canonical corpus has 24 distinct in-range rune-count values:

```text
[0,66,76,85,92,95,121,131,137,159,179,196,
 201,208,213,214,217,228,231,232,234,238,240,255]
```

For the source/layout core, the two directly relevant pre-existing phrases are:

```text
THEIR RISE  -> 81
THE ORIGINAL -> 97
```

Across every `58 × 24 × 2 = 2,784` typed triple, exactly one same-token hit exists:

```text
page28 | rune-count213 | phrase97 -> 2U
```

This is the observed p23/p28 object.

As a conservative family expansion after the selector was fixed, the audit also includes every distinct in-range GP0 value explicitly named in the authoritative synthesis at audit time:

```text
[20,25,30,34,35,36,39,42,48,51,54,56,57,
 59,62,71,75,81,83,92,96,97,98,102,112]
```

That broader `58 × 24 × 25 = 34,800` family has only two hits:

```text
[28,213,97] -> 2U
[42, 85,42] -> 0S
```

The second uses rune-count85, which is physical p56's solved-page rune count. This keeps the original 2U triple descriptively exceptional while showing that it is not the only typed duplicate-token coincidence once the phrase register is widened.

These counts are family descriptions, not authorship probabilities.

## Prospective holdout

Before reading the relevant p50 cells, the closest structural analogue was frozen on Director #1800.

Use the already established p33 source object:

```text
source page:              p33
hidden phrase:            THEIR RISE
GP0(THEIR RISE):          81
source-page rune count:   214
independent destination:  p35
selector:                 RISE = +2
```

The exact typed prediction was therefore:

```text
[destination page, phrase GP0, source-page rune count]
= [35,81,214]
```

Success required all three addresses to carry one identical original p50 token. No role swaps, neighboring cells, radix conversion, or alternate phrase were allowed after reveal.

The original tape gives:

```text
p50[35]  = 0d
p50[81]  = 0w     class [81,220]
p50[214] = 4B     class [157,214]
```

The three tokens are all different. The predeclared transfer fails.

## Decision

The p23/p28 `2U` triple remains a real and unusually sparse typed coincidence. The complete duplicate-class census and both typed-family charges preserve that descriptive fact.

Director #1800's promotion condition is not met. The closest predeclared source/layout analogue, p33 `THEIR RISE -> p35`, misses exact token identity on all three roles.

Therefore:

- retain `[28,97,213] -> 2U` as corroborative p23/p28 structure;
- do not treat duplicate-token identity as a typed p50 alias opcode;
- do not mine additional duplicate classes for new routes without a new source selector;
- do not use this failed alias mechanism to promote p28 READ OUT or p35 plaintext candidates.

The next useful work should seek an authored operation that explains why this one class matters, rather than expanding token-identity searches.

## Reproduction

```text
node sims/lp2_p23_p28_2u_alias_family_sft.cjs
```

The SFT reads the canonical p50 tape and LP2 corpus, reconstructs all duplicate classes, runs both typed-family charges, and asserts the frozen p33→p35 miss.
