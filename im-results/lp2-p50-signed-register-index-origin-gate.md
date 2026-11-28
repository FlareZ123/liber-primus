# Signed-message index-origin source gate downgrades the p50 DIRECTION29 bridge

**Agent20, 28 November 2026. Classification: historical/source-selection gate for Director issue #3354. No unknown LP2 plaintext or key recovered.**

## Decision

P50 contains real numerical geometry, but its English interpretation depends on an indexing origin that the signed 2016 text never fixes. Its exact body has **43 alphabetic words**. Integer29 gives:

```text
zero-origin source[29] -> DIRECTION
one-based word29       -> THE
```

No prose line contains more than 11 alphabetic words, so line-local word29 is impossible.

The p50 report uses the same origin throughout: conventional one-based prime rank `r` is dereferenced as zero-based `words[r]`. The finite rival table is:

| r | zero-origin | one-based word r |
|---:|---|---|
|17|THE|ARE|
|18|MAP|THE|
|19|THEIR|MAP|
|20|MEANING|THEIR|
|21|IS|MEANING|
|22|THE|IS|
|23|ROAD|THE|
|24|AND|ROAD|
|28|THE|ARE|
|29|DIRECTION|THE|
|35|FOUND|BE|
|36|GOOD|FOUND|
|39|FALSE|BEWARE|
|40|PATHS|FALSE|

Therefore THE MAP, THE ROAD, IS, AND, DIRECTION, BEWARE FALSE PATHS and the p29 THE ROAD echo are all conditional on the same zero-origin choice. Phrase quality cannot independently select that origin without circularity.

## Historical controls

The Cicada-signed 2012 payload at `im-results/2012-845145127/162667212858-image-payload.asc` contains human book coordinates including `1:29` and `1:1`. A pinned later reconstruction at `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3` shows source-dependent origins: Britannica helper blob `13e829bae40bcd5fb51e89702668739968d05699` leaves its first coordinate un-decremented relative to the CICADA anchor but decrements the second; Agrippa helper blob `611aeafdaf002e087949f3ac1eab70d20a03ee45` decrements both. These helpers are community reconstructions, not Cicada-authored code; their bounded evidentiary value is that the same puzzle used context-specific origin conventions.

The closer 2014 signed Self-Reliance book code (`zN4h51m.jpg.asc`, blob `1f9a61b97d5de9c4ca57402c064365a503d956a9`) uses paragraph:sentence:word:letter coordinates. Its successful pinned helper `book-code.py` (blob `96a9b2dabcab8927fdbb2130b4538d162a37354e`) subtracts one from **all four** coordinates. Again the helper is later reconstruction, but this is the closest preserved textual-word coordinate and it is one-based.

The 2016 signed prose has no array syntax, index-zero marker or coordinate tuple. The OpenPGP key ID supplies hexadecimal notation, not a textual-index origin.

## Consequence

Preserve the p50 alphabets, base59/base60 values, prime ranks, adjacency/support geometry, cell43 `1D` and its numeric values, and finite token censuses. Downgrade every signed-message word label derived from `source[r]`, plus DIRECTION29→p29, ROAD23, cell186 and downstream navigation, to a **conditional zero-origin hypothesis**.

Issue #3347 must not treat DIRECTION29 as source-supported navigation unless a first-party clue fixes the register origin.

## Reproduction

Run `node sims/lp2_p50_signed_register_origin_sft.cjs`. It parses the committed signed 2016 message, asserts the 43-word rival table, proves line-local29 impossible, and checks the local signed 2012 coordinate markers.

Pinned reconstruction: `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`; 2012 README blob `96c7d5ddc613fa9b26c3007fecd9072937802c2e`; 2014 README blob `7f2f414d13fa964d54cd1fdd5823f623e32c0059`.
