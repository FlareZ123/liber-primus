# P32 coordinate numbers point to WORDS ARE THE MAP THEIR

**Agent15, 19 November 2026. Classification: strong retrospective navigation candidate.** Starting from the independently selected p32 ARE cells, their printed word/rune numbers plus the already selected window length `e` define a finite coordinate alphabet. On p32, authenticated source words uniquely embedded in that coordinate grid generate a five-index run, 15–19. Reading those zero-based indices in the authenticated signed source gives `WORDS ARE THE MAP THEIR`. No other unknown page reaches a run longer than three under the frozen rule.

## Frozen post-ARE coordinate alphabet

The upstream SEEKS-route extraction fixes:

```text
A = word9 rune6 = (e^2,a)
R = word6 rune2 = (a,K)
E = word4 rune9 = (K^2,e^2)
```

The selected route window has length `e=3`. Freeze:

```text
C = components(ARE coordinates) union {e}
  = {2,3,4,6,9}.
```

Treat p32's printed one-based word number and one-based rune position as coordinates and inspect only C x C.

Exactly five authenticated 2016 words have one coordinate realization:

```text
THE  = (6,4) (4,9)       -> 28,17    -> TH E
PATH = (3,3) (9,6) (6,4) -> 6,49,28  -> P A TH
ARE  = (9,6) (6,2) (4,9) -> 49,26,17 -> A R E
MAP  = (4,6) (9,6) (3,3) -> 14,49,6  -> M A P
BE   = (9,2) (4,9)       -> 45,17    -> B E
```

BEWARE is also representable, but has two W choices and is excluded from the unique-realization number step.

## Their numbers are the direction

For each uniquely embedded word, sum its one-based word numbers and its one-based rune positions. The p32 sum set contains one longest consecutive run:

```text
15 = MAP rune-position sum = 6+6+3
16 = MAP word-number sum    = 4+9+3
17 = ARE rune-position sum  = 6+2+9
18 = PATH word-number sum   = 3+9+6
19 = ARE word-number sum    = 9+6+4
```

Those are signed-source zero-based indices:

```text
15 WORDS
16 ARE
17 THE
18 MAP
19 THEIR
```

So p32's coordinate numbers point to `WORDS ARE THE MAP THEIR`, exactly at the boundary between the source clauses `its words are the map` and `their meaning is the road, and their numbers are the direction`.

## All-page control

Apply the identical C x C rule, unique-word filter, coordinate sums, and consecutive-index test to every unknown rune-bearing page p0–p55:

```text
p32: 15..19, length 5
     WORDS ARE THE MAP THEIR

p43: 7..9, length 3
     THE DEVOTED LIBER

all other pages: length <= 2
```

Thus p32 is the unique receiver for a five-index run under the rule fixed from its independently selected ARE extraction.

The direct state-native THE result independently selects the same p32 pair `(6,4),(4,9)` / offsets28,17 through `p+g --N--> p-a`, so the coordinate network and the MAP-supplied north route converge.

## Scope

The coordinate alphabet was recognized retrospectively. Widening it with unrelated `g=5` makes other pages much more permissive, so freeze C exactly as ARE-components plus the selected window length e. This is an intended-navigation candidate rather than proof that p32 plaintext literally equals the signed 2016 message.

The strongest causal route is now:

```text
EPIPHANY SEEKS THE DEVOTED
 -> p50 route to p32
 -> ARE
 -> THE
 -> C = components(ARE)+e
 -> PATH / ARE / THE / MAP / BE coordinate network
 -> sums 15..19
 -> WORDS ARE THE MAP THEIR...
```

A decisive successor should use fixed source position19 THEIR and the continuation `MEANING IS THE ROAD` to select a new operation or original ciphertext target before reading its values.

## Reproduction

```text
node sims/lp2_p32_coordinate_number_direction_sft.cjs
```
