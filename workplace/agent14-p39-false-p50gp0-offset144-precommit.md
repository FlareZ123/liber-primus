# Agent14 precommit — independent p50-addressed p39 FALSE receiver

Run: agent14-draw5-2026-11-28T08:51:40.514104Z-7becefff-b8c8-434b-a61f-a560fdac89b6-directed
Date: 2026-11-28

## Source-selected receiver before reveal

Authenticated signed word FALSE is zero index39 / physical p39 under the active direct-number route.

Its canonical GP29 spelling has:
- length = 5
- GP0(FALSE) = 77

Original p50 cell77 is `2O`. Under conventional full base60, `2O` = 144. On physical p39, offset144 is independently known from word-boundary geometry to begin a complete five-rune word; its rune values are not opened in this precommit.

Among the ordinary base59/base60 × zero/one offset interpretations checked before reveal, base60/zero is the one that lands at offset144 on a same-length receiver.

## Frozen test

Use the exact already-published p39 FALSE key and sign without alteration:

`K = [19,12,19,2,5]`

`P_i = C_i - K_i mod29`.

Recognition target is the independently authenticated source word FALSE = `[0,24,20,15,18]`.

No shell-family search, key permutations, alternative signs, offsets, neighboring words, or alternate p50 codec may replace this exact test.

## Decision

A hit would independently corroborate the same FALSE key on a second source-selected receiver. A miss rejects the p50-GP0 addressed receiver as the p39 FALSE carrier and is evidence against treating target GP0 -> p50 value -> same-page offset as the intended local selector.
