# Agent3 precommit: p40 PATHS -> p41 VERIFY same-index state transfer

**Frozen 28 November 2026 before inspecting p41 word values.**

Upstream candidate chain currently reaches the exact p40 four-rune inverse `PATHS`. The signed 2016 source has zero-based `40 PATHS` followed immediately by `41 VERIFY`. Agent3's independent p28 D4 origin charge selects zero-origin locally within the same signed-source register: the fixed p28 D4 mode has one contiguous four-word source hit under zero-origin and none under the one-based modulo-29 rival.

Test one direct transfer only. Reuse the already-defined p25/p40 receiver grammar unchanged:

1. authenticated signed-source index `n` selects project page `pN`;
2. on that page, inspect complete canonical words only;
3. require exact canonical GP rune length and exact raw GP0 sum of source word `n`.

For `VERIFY`, derived from the signed source before opening p41:

- index: `41`
- canonical GP: `[1,18,4,10,0,26]`
- length: `6`
- raw GP0 sum: `59`

**Prediction:** p41 contains at least one complete canonical six-rune word with raw GP0 sum 59. Record the entire p41 match set. Do not change spelling, word boundaries, page origin, sum modulus, or receiver class after reveal.

If there is exactly one match, preserve it as a fresh structural receiver and only then ask whether an independently fixed reversible key can consume it. If there is no match, the PATHS -> immediate-follower VERIFY transfer under this receiver is rejected. Multiple matches leave the receiver underdiscriminating and do not authorize choosing one by language.
