# P6→p32 11-rune block differences expose a DH23/5-shaped operand

**Classification (21 November 2026): exact original-cipher arithmetic observation, not a solved decoder or historical design proof.** This is a supporting independent calculation for the already-claimed Director issue [#2047](https://github.com/FlareZ123/liber-primus/issues/2047). Its source inputs and the 4|1|4|2 receiver partition were known before this comparison. The 2013 DH23 worked example was also already known, so recognizing 23 and 5 is not a prospective cryptanalytic prediction.

## Derivation on original page data

The p6 red inscription at rune offsets 71–81 has four **printed** words of lengths `4|1|4|2`, with GP29 index sums `[71,19,65,26]`. The previously identified p32 fragment7 at offsets 33–43 is one **continuous, unseparated 11-rune printed fragment**; its indices are exactly:

`[8,3,19,18,14,7,23,15,20,0,23]`.

The p6 segmentation can be transferred as a *hypothetical* 4|1|4|2 partition of that p32 fragment. This is an imposed analytical partition; p32 does **not** itself print those four word separators.

| Segment | Length | P6 GP0 printed word | P32 GP0 imposed block | P6−p32 |
|---|---:|---:|---:|---:|
| 1 | 4 | 71 | 48 | **23** |
| 2 | 1 | 19 | 14 | **5** |
| 3 | 4 | 65 | 65 | **0** |
| 4 | 2 | 26 | 23 | **3** |

The exact vector is **[23, 5, 0, 3]**. The leading **23,5** reproduce the modulus/base pair of the signed 2013 DH23 teaching example, while the third zero restates an already observed GP0=65 agreement. The remaining 3 has no source-authenticated role established by this calculation.

## Original-corpus controls

The canonical p0–p55 physical-page transcription has **28 complete fragments of 11 GP29 runes**, including **two on p32**. Holding p6's four printed word sums and the 4|1|4|2 partition fixed, only p32 fragment7 produces a *first* block difference of 23; therefore it alone also produces the leading 23,5 pair and the full [23,5,0,3] vector. The other p32 11-rune fragment (fragment3) yields [28,2,−9,−11].

The other red span containing 11 runes is p15's three-word 4|2|5 passage with sums [51,6,63]. Applying **that separately source-defined partition** to each of the same 28 original length-11 fragments produces **zero** leading 23,5 differences. This is a bounded competing-original-span control; it does not charge every possible reinterpretation of every fragment.

The red p6/p7 reverse-pair relation was discovered separately: p6 last two red words have lengths/sums (4,65),(2,26) and p7 begins (2,26),(4,65). It supports treating p6's *printed word boundaries* as visible structure, but does not independently select p32 fragment7 or a cipher transform.

## Operational consequence and limit

A genuine use of this vector would require an independently selected typed rule specifying exactly how 23, 5, 0 and 3 define a **reversible original-cipher operation** (including GP29 versus a DH23 field, treatment of six symbols outside GF23, key/IV, clock and reset), plus a receiver and untouched plaintext holdout. The established 2013 protocol provides no GP29 cipher serialization. This readout alone supplies no such rule and has recovered **no plaintext**.

Do not start arbitrary modulus, field, phase, shift, byte-map or exponent searches to force this vector into English. Evaluate it only as a potential typed clue in the source-selected p6→p32 chain being independently pursued in #2047.

## Reproduction

`sims/lp2_p6_p32_dh23_block_difference_sft.cjs` reads canonical `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json` and original red annotations; it checks all 28 original 11-rune fragments, the separate p15 shape, both p32 candidates and the exact p6 values.
