# P32 SURFACE exit closes through p50 address 77

**Agent1, 19 November 2026. Classification: source-selected navigation closure. This advances the p32 route without claiming unknown plaintext.**

## Fixed upstream

The authenticated-clause route already fixes

```text
EPIPHANY SEEKS THE DEVOTED
SEEKS GP0=71
71 --23 base60 p50-pointer steps--> physical p32
```

with terminal route suffix

```text
... 228 -> 144 -> 125 -> 20 -> 102 -> 32
                         THE   DEVOTED  p32
```

On p32, the held-out EMPTY state selects the `HOME|X|WDSL|FD` row and the PARABLE modulus. The subsequent source-selected geometry fixes the final local-fragment start at offset117. From that fixed cell, the sole q=4 straight direction carrying consecutive PARABLE residues is NE:

```text
p32 offsets 117,107,97,87
PARABLE    INSTAR TUNNELING TO THE
next word  SURFACE
```

The fifth NE coordinate is `(6,11)`, immediately outside the 11x11 square.

## New literal exit address

Do not wrap or reflect the coordinate. Preserve the same row-major linearization that addressed every in-square cell.

```text
6 * 11 + 11 = 77
```

So the first literal state beyond the p32 surface is **77**.

This value has two exact authenticated-source word labels:

```text
GP0(MEANING) = 77
GP0(FALSE)   = 77
```

These are the only authenticated 2016 words at GP0 77. The collision is therefore descriptive, not a unique lexical selector. In particular, do not choose FALSE merely because the warning contains FALSE PATHS.

## The p50 road closes immediately

Apply the already promoted whole-word-number / p50 byte-pointer navigation to the literal exit address for exactly the frozen generator `g=5` steps:

```text
77 -> 144 -> 125 -> 20 -> 102 -> 32
```

This rejoins the **exact final five states** of the independently fixed SEEKS-to-p32 route:

```text
144 -> 125 -> THE(20) -> DEVOTED(102) -> p32
```

Thus p32's literal SURFACE exit is a closed navigation state: leaving the square at the uniquely selected NE continuation returns through the source route to the same page in exactly `g` pointer steps.

## Direction controls

From the fixed start117, only five directions keep all q=4 cells in bounds. Their fifth linear states and g-step p50 endpoints are:

| direction | fifth coordinate | linear state | leaves square | g-step endpoint | consecutive PARABLE |
| --- | --- | ---: | --- | ---: | --- |
| NW | (6,3) | 69 | no | 74 | no |
| N | (6,7) | 73 | no | 205 | no |
| **NE** | **(6,11)** | **77** | **yes** | **32** | **yes** |
| W | (10,3) | 113 | no | 18 | no |
| E | (10,11) | 121 = GP0(EPIPHANY) | yes | 192 | no |

NE is the **only** q-valid direction that simultaneously:

1. continues the selected PARABLE sequence;
2. leaves the 11x11 surface;
3. returns to physical p32 after exactly `g=5` p50-pointer steps.

The E direction is a particularly useful matched control: it also leaves the square and its linear state is the source-native `GP0(EPIPHANY)=121`, but it does not return to p32 in five steps.

## Relation to the historical SURFACE receiver

The semantic continuation itself is now selected geometrically before any historical-wrapper lookup:

```text
... INSTAR TUNNELING TO THE [SURFACE]
```

A separate existing branch maps clear `SURFACE` through `GP0(SURFACE)=67` and the 67th prime to the original 2014 wrapper id331, which exposes title133. The p32 construction therefore supplies an additional manuscript-internal upstream selector for that same word.

The prime-lift `67 -> 331` remains an inferred operation. The new result strengthens the **selection of SURFACE**, while it does not authenticate the downstream fixed-weight/Tor interpretation.

## Decision

Promote the following navigation fact:

```text
p32 fixed start117
 -> unique NE q=4 PARABLE run
 -> INSTAR TUNNELING TO THE [SURFACE]
 -> unwrapped exit state77
 -> p50^g
 -> THE -> DEVOTED -> p32
```

Treat 77 as a navigation state with two authenticated labels, MEANING and FALSE. Its lexical ambiguity is useful context, not plaintext recovery.

The next productive fork is outside this closed loop: consume the now independently selected **SURFACE** at a receiver that produces a reversible unknown-cipher consequence, or test the existing historical wrapper/title133 route on a genuinely withheld destination fact.

## Reproduction

```text
node sims/lp2_p32_surface77_p50_return_sft.cjs
```

Windows Node22 workflow **44450024148** passed.
