# P6/P23 shared [22,25] H packet source-selects the p25 cube operand

**Director, 28 November 2026. Classification: new source-constrained cross-holdout selecting a previously known p25 operand. No unknown plaintext, general body cipher, or authenticated p40 plaintext is recovered.**

## Decision

Director issue #3403 established a structural continuation across the p6/p23 red-to-black boundary. Under the same canonical outside-in H transform, their immediately following black words have H streams

```text
p6  [12,17,22,25,5,1,0]
p23 [0,16,8,12,9,22,25,27]
```

and share exactly one ordered adjacent H pair:

```text
[22,25].
```

That pair has a source-visible consequence on a page already selected independently upstream. The established p23 `THE ONE RISE -> +2` navigation fixes physical p25 without using the present result. On p25, the first rune-bearing line contains exactly **22 runes**. The next line therefore begins at local rune offset22, where the first complete printed word is

```text
[26,6].
```

Canonical H2 gives

```text
H2([26,6]) = [20,3].
```

Across all **465** complete page-local two-rune words on physical p0-p55, this exact H2 value occurs once: p25 offset22.

Charge both orientations of that two-coordinate packet as a prefix for every complete five-rune word in the same manuscript:

```text
[20,3] -> 0 hits
[3,20] -> 1 hit
```

The sole reversed-orientation hit is p25 offset145:

```text
[3,20,10,11,16].
```

This is exactly the five-rune operand inside the independently older p25 side object

```text
[18 | 3,20,10,11,16].
```

Thus a new route from the p6/p23 black-successor packet converges on the same p25 operand without using PATHS, MEANING, p40 ciphertext, or a fitted key.

## Frozen transform cross-holdout

The p25 side-object work already fixed the cube/reciprocal operation on the complete six-rune object. Replaying it unchanged gives

```text
[18,3,20,10,11,16]
 -> [3,10,16,3,8,20].
```

The transformed outer endpoints are

```text
[3,20],
```

exactly the orientation that the new top-of-p25 selector chose from the two charged possibilities. The new selector therefore does two related things: it identifies the already-known five-rune operand and agrees with the frozen transform's outer endpoint order.

## Source controls

The first rune-bearing line has length22 on exactly **13** physical pages p0-p55:

```text
p18 p20 p21 p22 p24 p25 p29 p34 p41 p45 p46 p48 p53.
```

Only **p25** has a complete two-rune word beginning immediately after that 22-rune line. Its H2 image `[20,3]` is also manuscript-unique over all 465 complete two-rune words.

The five-rune prefix charge is complete over **318** complete five-rune words: no word begins `[20,3]`, while exactly one begins `[3,20]`, the p25 offset145 operand above.

These are exact corpus statements under the same page-local word parser used by the #3403 successor analysis.

## Evidence boundary

The result materially reduces object-selection freedom in the p23->p25 producer. It does **not** establish PATHS plaintext or authenticate the downstream serializer.

The important caveats are:

- the `[22,25]` ordered-pair overlap was discovered retrospectively after the p6 and p23 H streams were opened;
- the interpretation `[first-line rune count, selected page]` is a new semantic reading, although p25 is fixed independently by the older RISE(+2) route and 22 is a literal visible line count rather than an index convention;
- the `[20,3]` versus `[3,20]` orientation is explicitly charged as a two-way choice; only the reverse orientation has a five-rune prefix hit;
- the cube/reciprocal operation predates this selector, so agreement with transformed outer endpoints is a cross-holdout, not a new transform discovery.

The correct next gate is therefore a fresh consequence of the now independently selected p25 operand before PATHS or MEANING is used. Director issue #3410 reserves that decision.

## Reproduction

Run:

```text
node sims/lp2_p6_p23_pair22_25_p25_selector_sft.cjs
```

The reproducer derives the p6/p23 successor packet from canonical ink annotations, verifies the unique shared ordered pair, reconstructs p25 line geometry and word starts, exhausts both two-coordinate prefix orientations over all five-rune words, replays the pre-existing cube/reciprocal transform, and checks the manuscript-wide controls.