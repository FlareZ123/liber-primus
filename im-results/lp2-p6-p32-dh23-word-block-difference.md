# P6→p32 11-rune block difference: DH23/5 resemblance, no selected state

**Classification (21 November 2026): exact conditional arithmetic correspondence; source-selector decision negative under Director issue [#2055](https://github.com/FlareZ123/liber-primus/issues/2055). No DH state, LP2 key, reversible operation, or plaintext is recovered.** The calculation originated as supporting work for [#2047](https://github.com/FlareZ123/liber-primus/issues/2047). Its p6/p32 inputs, imposed 4|1|4|2 partition, and the 2013 DH23 example were already known before recognizing the 23/5 resemblance; that resemblance is not a prospective cryptanalytic prediction.

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

## Source-selector decision (#2055): no DH state selected

The required selector is absent. Original p6 prints four red words with boundaries 4|1|4|2; original p32 prints the candidate 11-rune sequence `HOMEXWDSLFD` as **one word**, with no boundaries at the imposed 4/5/9 cuts. The direct source gate already found no p6 instruction to multiply the lengths to select p32, transfer those cuts, or use p6−p32 operand order. The separate source-only human-path freeze did not independently select p32, this fragment, the internal cuts, or a GP29 operation. See [the direct original-word gate](lp2-p6-p32-11rune-direct-source-gate.md) and [the committed human-path audit](../workplace/p6-p32-blind-human-path-audit.md). The original-corpus counts in those reports constrain the selected family but do not repair the missing instruction.

The authenticated 2013 TCP-server specification's worked DH exchange is literally:

```text
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
```

It establishes the example values `p=23`, `g=5`, public shares 8 and 19, and shared value 2. The protocol explicitly leaves the server's base and secret selection to the participant. In that transcript, `03` is the response/status code preceding `DATA 2`, not a DH parameter; zero is absent. Zero is also not an element of the multiplicative group of nonzero residues modulo 23. The signed 2016 message's general “words are the map; numbers are the direction” sentence does not name p6, p32, this partition, the subtraction order, or a DH operation. See the [authenticated 2013 source record](../resources/external/2013-tcp-server-signed-source.md) and [signed 2016 payload](../resources/historical/cicada2016-4gq25-outguess.asc).

There is a separate LP2-native p28 route that selects a DH23 state, including `p=23`, `g=5`, and derived `e=3`; it does **not** select p32's internal cuts or the p6−p32 subtraction. That independent result cannot be retrofitted as the missing operand selector for this vector. It also does not assign the vector's zero a DH role. See [the p28 center-line DH selector](lp2-p57-find28-p28-centerword-dh87-loop.md).

A further p6→p7 observation supplies a source-positioned **p/g hint**, but not the missing p6/p32 selector: after the mirrored two-word boundary, the next p7 red word is the unique increasing prime-index triple `[5,7,11]` among the 11 red three-rune words; its GP0 sum is 23 and its leading index is 5. This independently reinforces the *possible* reading of 23/5 as `(p,g)`. It still does not select p32 fragment7, the internal 4|1|4|2 cuts, subtraction direction, or any role for 0 and 3. Treat it as cross-observation supporting only the first two values, not a typed DH state or reversible receiver. See [the p6/p7 red-boundary report](lp2-p6-p7-reversed-red-boundary-gate.md).

**Decision:** `[23,5,0,3]` remains a real arithmetic relation under the chosen partition, but it is **not a source-selected DH state**. The leading 23/5 pair is a match to already-known parameters; 0 is only the third block's equal-sum difference, and 3 is an untyped residual (its separate appearance as p28's derived exponent does not connect it to this p6/p32 subtraction). Close this route as structural-only. Do not search arbitrary DH tuple encodings, exponent roles, signs, cuts, or operand orders.

## Operational consequence and limit

A genuine use of this vector would require an independently selected typed rule specifying exactly how 23, 5, 0 and 3 define a **reversible original-cipher operation** (including GP29 versus a DH23 field, treatment of six symbols outside GF23, key/IV, clock and reset), plus a receiver and untouched plaintext holdout. The established 2013 protocol provides no GP29 cipher serialization. This readout alone supplies no such rule and has recovered **no plaintext**.

Do not start arbitrary modulus, field, phase, shift, byte-map or exponent searches to force this vector into English. Evaluate it only as a potential typed clue in the source-selected p6→p32 chain being independently pursued in #2047.

## Reproduction

`sims/lp2_p6_p32_dh23_block_difference_sft.cjs` reads canonical `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json` and original red annotations; it checks all 28 original 11-rune fragments, the separate p15 shape, both p32 candidates and the exact p6 values.
