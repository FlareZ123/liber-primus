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

The coordinate alphabet was recognized retrospectively. Widening it with unrelated `g=5` makes other pages much more permissive, so freeze C exactly as ARE-components plus the selected window length e. Also note the dependency: ARE coordinates and e were fixed by the upstream SEEKS/p50 route, so the later PATH/SEEKS→p=23 convergence is a consistency check within that route, not a second independent selection of the DH modulus. This remains an intended-navigation candidate rather than proof that p32 plaintext literally equals the signed 2016 message.

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

That successor now exists independently on p33. The solved-p56 serializer recovers `THEIR RISE`; signed THEIR occurs only at zero-based positions19 and25, so the instruction rises from this p32-selected first THEIR to the second. The second occurrence immediately opens `THEIR NUMBERS ARE THE DIRECTION`, and the rise is6=`a`. Using each signed word's zero-based index (one-based ordinal minus one) as an upward row displacement on the 8-column p50 table makes PATH index2 and SEEKS index6 the only valid words to land on a reconstructed DH field, both at `p=23`. This supplies a source-side selector for the p=23 depth of the established SEEKS route. See `lp2-their-rise-signed-direction-bridge.md`.

## Downstream p23 / p28 source bridge (Agent1, 19 November 2026)

The p32 → THEIR RISE → signed-word-number route now has a plausible downstream connection to the p28 AL/DH receiver, without using the failed p32 9×9-inner-grid/p33 additive consumer:

1. The upward 8-column word-number operation converges on the already reconstructed DH modulus **p=23** from both signed words PATH (index2) and SEEKS (index6). PATH/SEEKS agreement is an internal consistency check, not an independent authentication of p=23.
2. The p23 packet independently emits **THE ORIGIN | AL**; the pre-2014 printed New Comment supplies the human-visible AL=31 interpretation.
3. P28's unique literal-DH line independently reconstructs the DH23 tuple and exponent 3. AL=31 gives 31 mod 28 = 3 and 31 mod 29 = 2.
4. The signed source's one-based word ordinals are THEIR(26) NUMBERS(27) ARE(28) THE(29) DIRECTION(30), equivalent to zero-based indices25–29. The 2014 Stage11 index labels physical LP2 pages 0–57, while earlier Cicada book-code precedents use one-based word/letter coordinates; the natural typed conversion is source ordinal n→physical page p=n−1, so THE ordinal29/index28 points to p28 and DIRECTION ordinal30/index29 to p29. The direct ordinal n→same-numbered-page p=n rival instead points THE to p29 and DIRECTION to p30; it misses p28's unique center-adjacent receiver and sends DIRECTION to six-rune p30 word30. The page p→one-based word p rule remains an interpretation of the signed “numbers are the direction” instruction, not an explicit format statement; the [source-origin audit](lp2-2016-index-origin-p32-p29-source-audit.md) records the p29 holdout and controls. Solved p57's “find the divinity within” plus p28's physical page number select the candidate p28 center-rune + word28 receiver. P28's three printed periods and page number28−1 supply the [3,27] fragment exponent pair.

The resulting candidate is documented in [the p28 READ OUT/HERE receiver report](lp2-p28-readout-here-page-start.md): central rune + word28, exponent 3 on the center/boundary rune and exponent 27 on word28. Its already-known READ OUT result is **not** a blind validation, and the later local HERE continuation remains negative.

**Evidence boundary:** this is a cross-report solve-path hypothesis, not an established decryption. The p32 coordinate alphabet C was recognized retrospectively; the p23 AL=31 connection is a printed external source rather than a Cicada-signed cipher instruction; and “find the divinity within” does not literally say “concatenate the center rune with word28.” Do not treat the p32 9×9 interior as the receiver or revive its failed additive/EN-spiral consumer. Keep this p32 word-coordinate route distinct from the closed 9×9 D4 selector question.

## Reproduction

```text
node sims/lp2_p32_coordinate_number_direction_sft.cjs
```
