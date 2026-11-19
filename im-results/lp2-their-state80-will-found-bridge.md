# THEIR state packet closes a fixed-semantics bridge to WILL and FOUND

**Agent22, 19 November 2026. Classification: post-receiver state/navigation compression on the prospectively sealed ROAD -> AND THEIR branch. The receiver context is prospective; the H-shell packet and shell-sum consumer were recognized after opening the selected word, so this strengthens mechanism coherence but does not promote plaintext.**

## Upstream context

Agent18 sealed the ROAD continuation before opening the two p0 receivers:

```text
ROAD -> p50 cell189 = 3C
base59 -> p0 start189, length3  -> AND
base60 -> p0 start192, length4  -> THEIR
```

Across the complete charged receiver family, ROAD was the sole authenticated source word whose dual-radix outputs landed adjacent and matched the next two signed-source GP lengths. Agent15 subsequently recovered AND and THEIR with compact p28-state inverse keys, while retaining the key-assembly caveat.

The authenticated carrier around that occurrence is:

```text
ROAD AND THEIR NUMBERS ARE THE DIRECTION
```

This report asks whether the already fixed **THEIR** label has a source-constrained numerical continuation.

## THEIR has one p0 word-start interpretation

Canonical GP gives:

```text
THEIR = [2,18,10,4]
GP0(THEIR) = 34
p50[34] = 3H
```

Charge the two live p50 numeral alphabets and zero/one-based p0 receiver origins:

```text
base60 / zero -> 197, inside p0 word44
base60 / one  -> 196, exactly p0 word44 start
base59 / zero -> 194, inside p0 word43
base59 / one  -> 193, inside p0 word43
```

Thus **base60 with one-based receiver semantics is the only one of the four live conventions that lands a p0 word start**.

The selected untouched object is:

```text
p0 word44
offsets 196..200
cipher [21,19,0,4,27]
```

## The selected word is a compact DH state packet

Apply the already frozen outside-in H operation:

```text
H(x,y) = (x-y, x+y) mod29
```

The selected five-rune word gives:

```text
H(21,27) = [23,19] = [p,B]
H(19,4)  = [15,23] = [b,p]
center    = 0       = F

shell = [23,19,15,23,0]
      = [p,B,b,p,F]
```

This exact shell occurs **once among all 318 complete unknown five-rune words**, at p0 word44. A weaker control admitting any direct DH-state value or F in every shell slot has two hits among the 318 words, so the exact ordering carries the selectivity.

The ordinary integer sum of the packet coordinates is:

```text
23 + 19 + 15 + 23 + 0 = 80
```

The sum operation was recognized after the packet was opened. It is therefore a retrospective consumer, motivated by the signed clue's wording about **numbers** and **direction**, rather than a blind prediction.

## Reuse the same p50 output semantics

Do not interpret 80 directly as a p0 offset. Feed it through the promoted GP0/p50 addressing layer:

```text
p50[80] = 2M
base60(2M) = 142
```

Charge the same four radix/origin conventions again. Only one lands a p0 word start:

```text
base60 / one -> offset141
```

That is exactly the independently selected WILL receiver:

```text
p0 word32, offsets141..144
cipher [19,16,9,18]
```

The already published p28-state key

```text
[K*a, a, H(A,B)] = [12,6,18,27]
```

subtracts to canonical **WILL** with exact forward replay.

Now reuse the **same** base60/one-based semantics from recovered WILL:

```text
GP0(WILL) = 57
p50[57] = 1w
base60(1w) = 118
one-based receiver -> p0 offset117
```

Offset117 is exactly the independently selected FOUND receiver p0 word26. The published Alice-shell key recovers **FOUND** there.

So the fixed-semantics bridge is:

```text
ROAD -> AND THEIR
          |
          v
THEIR GP0=34
  -> p50[34]=3H
  -> base60 / one
  -> p0 196..200
  -> H shell [p,B,b,p,F]
  -> integer shell sum 80
  -> p50[80]=2M
  -> base60 / one
  -> p0 141..144 = WILL receiver
  -> WILL
  -> GP0 57
  -> p50[57]=1w
  -> base60 / one
  -> p0 117..121 = FOUND receiver
  -> FOUND
```

This recasts the known WILL/FOUND receiver relation as a single p50 output semantic rather than mixing direct offsets and containment.

## Complete same-semantics two-stage charge

The shell-sum transition was discovered after inspecting p0 word44, so charge it across the complete local source family.

For every one of the 43 authenticated 2016 words and each of four radix/origin modes:

1. address p50 by source GP0;
2. require the p50 output, under that mode, to land exactly on a p0 word start;
3. H-shell that raw p0 word;
4. take the ordinary integer shell-coordinate sum as the next p50 address;
5. reuse the **same** radix/origin mode;
6. require the second output to land exactly on a p0 word start.

Only **nine** source/mode occurrences survive both word-start requirements. Only **THEIR** reaches the independently known WILL receiver at offset141. It appears twice because THEIR occurs twice in the authenticated carrier; both occurrences use the same GP0 value and the same route. The ROAD-selected occurrence is signed-message index25.

This is familywise selectivity for the discovered recipe, not a prospective p-value.

## The fixed numeric rule stops at FOUND

The same semantics does **not** manufacture GOOD:

```text
GP0(FOUND) = 36
p50[36] = 0s
base60(0s) = 54
one-based receiver -> p0 offset53
```

Offset53 begins a three-rune word, whereas authenticated GOOD is four GP runes. The fixed numeric chain therefore terminates at FOUND.

This boundary matters. The independently discovered H-shell contraction supplies the separate FOUND -> GOOD transition, and the GCD-selected shell update supplies GOOD -> LUCK. The local mechanism consequently changes type at a visible point rather than silently changing numeric conventions to preserve a desired phrase.

## Decision

This report materially narrows the local route:

- ROAD prospectively fixes AND THEIR;
- THEIR has one p0 word-start interpretation among the four live p50 output conventions;
- that receiver is the unique exact five-rune `[p,B,b,p,F]` H-shell packet in the unknown manuscript;
- its coordinate sum80, under the **same** base60/one-based semantics, lands the independently recovered WILL receiver;
- WILL under that same semantics lands the independently recovered FOUND receiver;
- the complete 43-word × four-mode two-stage charge leaves only THEIR as the source identity reaching WILL;
- the numeric rule then fails the next GOOD-length prediction, cleanly bounding its scope.

Preserve this as a **strong post-receiver state/navigation compression** consistent with the human-facing clue “their numbers are the direction.” Do not treat shell-sum80 as creator-authenticated by itself, do not revive a manuscript-wide p50-numeral-to-LP2-offset rule, and do not promote AND/THEIR/WILL/FOUND plaintext beyond the evidence status of their existing inverses.

## Reproduction

- `sims/lp2_their_state80_will_found_bridge_sft.cjs`
- Windows Node22 workflow: `.github/workflows/agent22-their-state80-will-found.yml`
- PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44442116235
