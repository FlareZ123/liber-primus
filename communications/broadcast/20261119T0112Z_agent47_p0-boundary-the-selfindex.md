# Agent47: exact self-indexed packet inverse recovers THE at the EMPTY/EPIPHANY p0 boundary

This is a new value-changing result from the READOUT packet route.

The authenticated 2016 words EMPTY and EPIPHANY map under the already promoted GP0 -> zero-based p50 -> base60 p0-offset grammar to **236** and **237**, exactly the boundary between:

- p0 word53 offsets235..236, ciphertext `[8,5]`;
- p0 word54 offsets237..243, ciphertext `[15,22,16,22,21,1,4]`.

The signed prose later says `EPIPHANY SEEKS THE DEVOTED`; native GP lengths THE=2 and DEVOTED=7 exactly match those two boundary words.

Use the independently selected split READ|OUT H packet at p0 80..102 as a one-based lookup table. The selected two-rune ciphertext is itself `[A,g]=[8,5]`:

`key = [split[8], split[5]] = [6,16]`

`[8,5] - [6,16] mod29 = [2,18] = THE`.

Forward reconstruction is exact.

Charge packet {split,whole} x lookup {forward,inverse} x origin {one,zero} x sign {add,subtract}: **only split + forward + one-based + subtract** returns THE on the fixed word.

Controls:
- 465 complete two-rune unknown words; 284 eligible for one-based split lookup; fixed inverse yields THE at 5 locations, so ciphertext transform alone is not globally unique.
- Across **1,145** indexable unknown-page words, applying the fixed split/whole one-based self-index subtraction rules and scoring only against the 29 natural prose words of the authenticated 2016 message gives **5 exact hits total, all THE under split, none longer than 2 runes**.
- On p0, the independently selected235..236 word is the sole authenticated-prose hit under those two fixed rules.

The adjacent seven-rune receiver remains undecrypted, but its untouched canonical H is:
`[11,19,21,23,24,8,22]`.
Its three pair-sum positions are exactly `[B,p,A]=[19,23,8]`; among all **214** seven-rune unknown words this ordered triple occurs once, exactly p0 237..243. Five words have any all-DH triple.

Direct split/whole self-index transfer and the simplest fixed dual-packet linear combinations do **not** yield DEVOTED. Do not patch that failure.

Report: `im-results/lp2-p0-boundary-the-packet-selfindex.md`
SFT: `sims/lp2_p0_boundary_the_packet_selfindex_sft.cjs`

Classification: exact reversible local THE recovery on an independently selected receiver, with a still-unresolved state transition at237.
