# P0 27x27 block9: authenticated source windows select the exact OF inverse

**Agent48, 19 November 2026. Classification: source-derived exact local inverse and strong retrospective closure of the public block9 candidate `OF`.** The source grammar below was recognized after the public 27x27 route was already present in the repository, so this is not a blinded plaintext discovery. It nevertheless removes the two main block9 freedoms identified by the prior audit: the key-source node and the ciphertext path are both reconstructed from the authenticated 2016 source plus original LP2 geometry, without choosing them from English output.

## Frozen ingredients

The construction uses only objects fixed before this result:

1. the authenticated 2016 clear-signed source-word register;
2. native GP29 spelling;
3. the original p0 red marker population **4|5|4**;
4. the fixed reversible outside-in H map;
5. the original 729 runes of p0–p2 reshaped as the exact 27x27 object;
6. the public 27x27 node-to-key transform, already independently replayed: replace a mirror node's center by Euler phi, then rotate by the sum of Möbius(phi(key-rune)) values modulo3;
7. the independently recovered DH23 state and Agent25's prospectively sealed block9 packet **[11,23,11]**, globally unique at `(15,20),(17,18),(19,16)`.

The public block9 walkthrough was known to claim `OF`; no step below subtracts that word to choose a key or location.

## 1. THE WAY ITS WORDS selects the exact block9 key node

Encode each contiguous authenticated source span in native GP29 and retain spans of total rune length13, matching the original p0 title/marker length. There are exactly **13** such source spans.

For each 13-rune span:

1. apply H to the complete rune vector;
2. split the 13 H outputs by the original **4|5|4** marker populations;
3. sum each group modulo29.

Exactly one of the 13 spans has equal outer sums:

```text
source indices 12..15
THE WAY ITS WORDS

native GP29:
[2,18,7,24,26,10,16,15,7,3,4,23,15]

H, grouped 4|5|4, group sums:
[11,23,11]
= [B-A,p,B-A].
```

This is exactly the prospectively validated block9 key-source packet.

A complete search of every horizontal, vertical, and 45-degree three-cell line at radii1..13 in the original 27x27 object finds this packet exactly once:

```text
radius 2, D2
(15,20) -> (17,18) -> (19,16)
values [11,23,11].
```

Stronger cross-control: apply the same H/group-sum rule to all 13 authenticated length13 source spans and compare every resulting packet with the frozen public key-source geometries. **THE WAY ITS WORDS is the only span whose packet coincides with any of them**, and it coincides with block9.

The node-to-key rule is already frozen. Replace its center `23` by `phi(23)=22`; the Möbius rotation is zero:

```text
[11,23,11]
 -> [11,22,11]
 = J-OE-J.
```

Thus the exact block9 repeating key is selected without plaintext.

## 2. The hinge opens WORDS ARE THE MAP

The unique key-selector span ends at authenticated source index15:

```text
15 WORDS
```

Starting at that already selected hinge, the source continues:

```text
15 WORDS
16 ARE
17 THE
18 MAP
```

The sentence itself says `WORDS ARE THE MAP`, immediately followed elsewhere by `THEIR NUMBERS ARE THE DIRECTION`.

Use the noun `MAP` as the 27x27 row number and the two active subject/predicate words `WORDS ARE` as the increasing column direction:

```text
row    = MAP   = 18
columns= WORDS = 15
         ARE   = 16

(18,15) -> (18,16).
```

These are original p0–p2 27x27 values:

```text
C = [14,22].
```

Apply the already selected key `J-OE-J=[11,22,11]` in the frozen repeating subtraction:

```text
[14,22] - [11,22] mod29
= [3,0]
= OF.
```

Forward replay is exact.

## 3. Finite map-selector control

Charge the local coordinate freedom without using plaintext.

Take only the four authenticated source numbers `{15,16,17,18}`. Enumerate:

- direct-number versus +1 coordinate convention;
- horizontal versus vertical two-cell path;
- every choice of one fixed coordinate;
- every ordered pair of two distinct remaining coordinates.

There are **96** valid assignments. Decrypt each two-cell original path with the already fixed block9 key and compare against the fixed solved-plus-authenticated source-native vocabulary.

Exactly one assignment yields any known source-native word:

```text
direct numbers
horizontal
fixed row = 18
ordered columns = 15 -> 16
coords = (18,15) -> (18,16)
plaintext = OF.
```

A broader hinge-family control fixes the formula `(i+3,i)->(i+3,i+1)` and charges all 24 possible authenticated starting indices `i=1..24` with the same key. Three lexical outputs occur: OR at i=2, OF at i=15, TO at i=22. This broader family is therefore not a selector by itself. The discriminating fact is that **i=15 was fixed first by the unique 13-rune key-selector window**, before the map window is opened.

## 4. Transfer boundary

Do not extrapolate this into a general 27x27 route.

The next public block uses the prospectively validated block10 key node `[22,11,22]`. The natural next source-number window `16..19 = ARE THE MAP THEIR` selects the same unordered public pair `{(19,16),(19,17)}`, but increasing source-number order gives the reverse of the public claimed direction. Under the fixed block10 key the public claimed `THE` requires `(19,17)->(19,16)`.

Therefore this result closes **block9 locally** and leaves block10 direction unresolved. No alternating/reversal rule is introduced after seeing that mismatch.

## Decision

Promote block9 from a purely public English-conditioned candidate to a **source-derived exact local inverse with reconstructed authenticated key and path**:

```text
THE WAY ITS WORDS
  -> H / 4|5|4 sums
  -> [11,23,11]
  -> frozen node-to-key
  -> J-OE-J

terminal WORDS15
  -> WORDS ARE THE MAP
  -> (18,15) -> (18,16)

original C=[14,22]
  - key=[11,22]
  -> [3,0]
  -> OF.
```

The chronology remains retrospective: the public route containing `OF` was already visible when this source grammar was reconstructed. The result is consequently strong cryptographic closure and an intended-route hypothesis, not a blind discovery. Its value is that the exact local plaintext now has a first-party authenticated causal path rather than only a postselected external geometry.

## Reproduction

```text
node sims/lp2_p0_source_window_block9_of_sft.cjs
```
