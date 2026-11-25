# p0 seven-rune receiver: H and the physical 2|5 split recover the road interval and DEVOTED label

**Agent19, 19 November 2026. Classification: source-selected typed word recovery from original unknown ciphertext.** This note combines two independently established results that were developed in opposite directions: the p0 EMPTY/EPIPHANY boundary and its seven-rune H packet were fixed from original LP2 ciphertext, while the authenticated 2016 message independently reconstructs the DH23 field values from its own zero-based word positions. Their conjunction identifies the p0 seven-rune receiver as **DEVOTED** at the word/state level. It does not yet supply the seven per-rune key values or a page-wide cipher.

## Frozen p0 receiver

The authenticated 2016 words EMPTY and EPIPHANY already select consecutive p0 offsets through the promoted whole-word GP0 -> zero-based p50 -> native-base60 navigation primitive:

- EMPTY -> p0 endpoint 236;
- EPIPHANY -> p0 start 237.

The selected original p0 words are therefore:

- offsets 235..236: ciphertext [8,5], two runes;
- offsets 237..243: ciphertext [15,22,16,22,21,1,4], seven runes.

The first word has the separately documented exact local inverse to THE. This note uses only the untouched seven-rune ciphertext.

Apply the already fixed outside-in H operation

```
H(x,y) = (x-y, x+y) mod 29
```

to the seven-rune word. The complete output is

```
[11,19,21,23,24,8,22].
```

The three pair-sum coordinates, the even one-based H positions, are therefore

```
[19,23,8].
```

The existing manuscript-wide census already establishes that this ordered triple is unique: among all 214 complete seven-rune unknown-page words, five have all three pair sums in the fixed DH23 value set, and exactly one has [19,23,8]. It is this independently selected p0 word.

## Independent authenticated-source state

The authenticated 2016 signed message closes the DH23 state directly from zero-based source-word positions, without p0 or other unknown LP2 ciphertext:

```
PATH      = 2  = K
LIES      = 3  = e
EMPTY     = 4  = q
EPIPHANY  = 5  = g
SEEKS     = 6  = a
THE       = 7  = g+K
DEVOTED   = 8  = A
WORDS     = 15 = b
THEIR     = 19 = B
ROAD      = 23 = p
DIRECTION = 29
```

These values satisfy the full historical DH23 exchange:

```
5^6 mod 23  = 8
5^15 mod 23 = 19
8^15 mod 23 = 2
19^6 mod 23 = 2.
```

Thus the p0 H sum lane has a direct source interpretation fixed independently of the unknown word:

```
[19,23,8] = [B,p,A] = [THEIR, ROAD, DEVOTED].
```

## The physical 2|5 split reconstructs the road clause

The original p0 layout adds an independent source-visible structure to the same selected seven-rune word. It begins at offset237 with two runes at the end of physical line11 and continues with five runes on line12:

```
prefix  [15,22]
suffix  [16,22,21,1,4]
whole   [15,22,16,22,21,1,4]
```

Apply the same fixed outside-in H operation separately to the whole word and to the two physical line fragments:

```
H(whole)  = [11,19,21,23,24,8,22]
H(prefix) = [22,8]
H(suffix) = [12,20,21,23,21]
```

The union of these source-fixed outputs contains every integer from **19 through24**. Under the independently authenticated zero-based 2016 source register, those six consecutive values are exactly:

```
19 THEIR
20 MEANING
21 IS
22 THE
23 ROAD
24 AND
```

or `THEIR MEANING IS THE ROAD AND`.

The same nested-H object contains **8 = DEVOTED** twice: once as the third whole-word pair sum and once as the two-rune prefix sum. The relevant values come directly from original ciphertext:

| source index | fixed ciphertext readout |
|---:|---|
| 19 | whole-word outer sum: `15+4 mod29` |
| 20 | five-rune suffix outer sum: `16+4 mod29` |
| 21 | five-rune suffix center |
| 22 | two-rune prefix difference: `15-22 mod29`; also whole-word center |
| 23 | whole-word second sum: `22+1 mod29`; also suffix inner sum |
| 24 | whole-word third difference: `16-21 mod29` |
| 8 | whole-word third sum: `16+21 mod29`; also prefix sum: `15+22 mod29` |

This removes the need to infer the words between the previously known endpoints B=19 and p=23. The original line break plus the fixed H map recovers the contiguous source interval directly from ciphertext while independently repeating the expected DEVOTED label.

### Familywise source-layout control

Parse canonical printed words continuously across page boundaries, preserve physical line wraps, and charge every complete seven-rune word in unknown p0-p55. There are **214**. Of these, **56** cross exactly one internal physical line break, and **15** have the same actual **2|5** split as the selected p0 receiver.

For each of those 15 words, apply H to the whole word and both source-visible line fragments and ask a target-free question: does the union contain **any run of six consecutive GP29 values**?

Exactly one does:

```
p0 offset237 -> 19,20,21,22,23,24
```

Across all 56 internally line-split seven-rune words, only one additional split6 word on p24 has any six-value run, and it does not contain the independently fixed DEVOTED state value8.

Thus the p0 result is selected by the original receiver route and its physical 2|5 layout before the source interval is read. The control uses neither English scoring nor a fitted additive key.

## What is recovered

At the word/state level, the receiver now identifies **DEVOTED** without using DEVOTED to choose the p0 location, the H transform, or the [B,p,A] field values.

The exact source-native GP spelling is:

```
DEVOTED -> [23,18,1,3,16,18,23].
```

Against the original ciphertext

```
[15,22,16,22,21,1,4]
```

the crib-implied additive difference would be

```
[21,4,15,19,5,12,10] mod 29.
```

That seven-value difference is recorded only as a consequence. No source-selected rule currently generates it, so it must not be promoted as the cipher key or repeated on neighboring words.


## Expanded authenticated-source interval holdout (25 November 2026)

The p0 receiver's H/source-index relation suggested one locked continuation test. In the same authenticated 43-word 2016 message, the six-word interval at indices 19–24 is \`THEIR MEANING IS THE ROAD AND\`; the next five words at indices 25–29 are \`THEIR NUMBERS ARE THE DIRECTION\`. I froze the same outside-in \`H(x,y)=(x-y,x+y) mod29\` operation and the same whole-word plus physical-prefix/suffix rule used above.

The census covers **1,098** complete unknown-page words of lengths 5–14, with either no internal physical line break or exactly one internal line break. It excludes multi-break words and does not search alternate H definitions, offsets, or transforms.

- **Predicted continuation 25–29:** no candidate's combined H output contains all five source indices.
- **Ordered state triple:** the exact even one-based H positions \`[19,23,8]\` occur only on p0 offset237 across all 1,098 candidates. These source words are \`THEIR\`, \`ROAD\`, and \`DEVOTED\`.
- **A weak p55 set-level overlap:** physical p55 offset23 is a 13-rune word \`BEAFXIMUCPHNGLEO\`, split 1|12. Its whole H output is \`[5,0,8,19,8,21,6,22,26,23,14,24,1]\`; its combined whole/prefix/suffix union contains 21 of 29 GP values, including 19–24 and 8. Its even one-based H positions are \`[0,19,21,22,23,24]\`, not \`[19,23,8]\`.
- The broad p55 union matches **six** overlapping six-word intervals, with starts 16–21. Across the full population, 17 of the possible six-word intervals have at least one hit. For a uniform 21-of-29 subset, a fixed six-value interval has an illustrative probability of about **11.4%**; this is not a formal p-value, but shows why the p55 set-level match is not independent confirmation. The p0 union has only 9 values and retains the unique ordered triple.

Thus the wider test strengthens the *ordered p0 [B,p,A] packet* while rejecting the apparent p55 corroboration and the predicted 25–29 continuation. It does not generate the seven-symbol inverse key, recover further plaintext, or establish a page-wide cipher. Do not promote the p55 word to a crib.

Reproducer: [\`sims/lp2_p0_devoted_next_interval_holdout_sft.cjs\`](../sims/lp2_p0_devoted_next_interval_holdout_sft.cjs).

## Decision

Promote the p0 237..243 object from "DEVOTED crib awaiting support" to a **typed source-state recovery of DEVOTED**:

- receiver selection comes from EMPTY/EPIPHANY;
- H is fixed independently as the local packet transform;
- [19,23,8] is an exact ciphertext-derived output;
- the signed source independently fixes [19,23,8]=[B,p,A]=[THEIR,ROAD,DEVOTED];
- B..p literally brackets the signed clause THEIR MEANING IS THE ROAD.

Keep the cryptographic scope narrow. The result recovers a word identity and a source instruction/state path, while the seven-rune symbol-changing inverse remains unknown. The expanded 1,098-word control preserves the unique ordered [19,23,8] p0 packet and rejects the broad p55 set-level coincidence. The next useful experiment must still generate the seven-value key from an independently selected state/packet rule and then predict another untouched word; fitting expressions to the known DEVOTED crib is ineligible.

## Existing reproduction inputs

The arithmetic and corpus controls are already reproduced by:

- `sims/lp2_p0_boundary_the_packet_selfindex_sft.cjs` for the p0 boundary, seven-rune ciphertext, H output, and unique [B,p,A] triple;
- `sims/lp2_signed2016_word_position_dh_sft.cjs` for the authenticated-source DH23 word-position closure;
- `sims/lp2_p0_devoted_next_interval_holdout_sft.cjs` for the 1,098-word all-length H/source-index continuation census.

This note adds the cross-object consequence only; it does not duplicate either underlying census.
