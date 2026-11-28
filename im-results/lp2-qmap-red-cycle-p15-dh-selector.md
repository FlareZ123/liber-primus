# Q-orbit red cycle source-selects p15's first red span before the DH readout

**Agent34, 28 November 2026. Classification: exact source-order operand selector and solve-path consolidation. It materially reduces one downstream choice in the p3/Q route, but it does not independently authenticate Q and does not recover unknown body plaintext.**

## Frozen upstream

The current p3 route fixes all of the following before this test:

- physical p3's marked triad gives the field relation `u²=3u+8`;
- p15's **second** red span minus solved p57's red opener is exactly divisible by that triad, giving the nine-rune quotient `Q`;
- `E(Q)=[17,24]` and Q has multiplicative order `840=29²-1`;
- writing the unique Q-orbit exponent as `k=29*row+col` uses the same width29 independently exposed by authenticated signed word29 = **DIRECTION**;
- solved p56 maps to Q-coordinate `[4,5]` = **EMPTY -> EPIPHANY**;
- unknown p40 maps to `[5,8]` = **EPIPHANY -> DEVOTED**, and the complete signed interval 5..8 is the independently older operational route **EPIPHANY SEEKS THE DEVOTED**.

This report does not refit Q, the field, the signed word register, p56, or p40.

## The missing edge is fixed before opening its downstream Q product

Treat each nonzero printed complete red span as the directed edge

`row -> col`

given by its Q-orbit coordinate. P56 and p40 already form the directed path

`4 -> 5 -> 8`

or

`EMPTY -> EPIPHANY -> DEVOTED`.

The smallest closure question is therefore fixed: **does any printed complete red span supply 8 -> 4?**

Across the 17 nonzero printed complete red spans, exactly one does:

`p15 first red9: [8,4] = DEVOTED -> EMPTY`.

Consequently the three spans form

`p56 [4,5] -> p40 [5,8] -> p15-first [8,4]`,

the only nontrivial directed three-cycle in the complete printed red-span graph. The vertices are exactly the boundary words of the authenticated clause

`... EMPTY; EPIPHANY SEEKS THE DEVOTED.`

This is stronger than choosing p15-first merely because its nine-rune length happens to match Q's quotient length: the selection occurs in the Q-orbit address layer before the downstream field multiplication is inspected.

## Source-order control

The manuscript has 18 complete red spans total; physical p3's marked triad evaluates to zero and therefore has no multiplicative discrete log. The remaining 17 are the finite graph above.

Charge both orientations and every cyclic start of all 18 spans: **450 presentations**. Exactly two presentations give coordinate `[8,4]`:

1. p15 first red9, **printed orientation, rotation0**;
2. p15 second red11 only after **reversal plus rotation5**.

Thus the original manuscript presentation uniquely selects p15-first. The only artificial rival requires changing both the direction and start of the already separately typed p15-second object that was used upstream to derive Q.

## Held downstream consequence: the selected span says DH

Only after fixing p15-first by the red-cycle closure, apply the already-frozen Q multiplication:

`E(p15 first)=[24,6]`

`E(Q) * E(p15 first)=[23,8]`.

Canonical GP transliteration of indices `[23,8]` is exactly **DH**. The same pair is also the authenticated 2013 DH example's modulus/public value `(p,A)=(23,8)`.

This makes the causal order cleaner:

1. p15-second participates in deriving Q;
2. solved p56 plus p40 fix the red-graph path `4 -> 5 -> 8`;
3. the graph uniquely selects the *other* p15 span as the printed closure `8 -> 4`;
4. frozen Q multiplication of that selected operand yields **DH / [23,8]**;
5. authenticated “their numbers are the direction” then points to physical p23 and p8, whose independent source registers already reconstruct the DH state. The separately preregistered direct-Q use on their immediate black successor words is negative, so this report does not extend that failed consumer.

## Evidence boundary

This cycle is **not independent evidence for the existence of Q**, because Q was derived using p15-second. It is instead a downstream operand-selection result inside the already source-constrained Q construction. It removes a real choice—why p15-first, rather than another red span, should receive Q—without inspecting the selected span's Q-product first.

The cycle also should not be turned into a body key. Existing direct periodic and all-state Q-stream body consumers are negative in their charged scopes. The next useful step is a new source-typed receiver selected by the DH/page23/page8 route or by another first-party direction cue, not a phase/key sweep.

Reproducer: [`sims/lp2_qmap_red_cycle_p15_dh_selector_sft.cjs`](../sims/lp2_qmap_red_cycle_p15_dh_selector_sft.cjs).
