# p0 seven-rune receiver: H sum lane recovers the signed road interval and DEVOTED label

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

## The road interval is literal

The first two extracted values are source positions 19 and 23. Reading the authenticated source interval between those fixed endpoints gives exactly:

```
19 THEIR
20 MEANING
21 IS
22 THE
23 ROAD
```

or

```
THEIR MEANING IS THE ROAD
```

The third extracted value, 8, is the earlier source word DEVOTED.

This is a compact execution of the signed instruction on a source-selected unknown-ciphertext object:

```
EMPTY / EPIPHANY -> p0 boundary
seven-rune H sums -> THEIR / ROAD / DEVOTED
THEIR..ROAD -> "THEIR MEANING IS THE ROAD"
A=8 -> DEVOTED
```

The seven-rune length is independently consistent with the GP spelling of DEVOTED.

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

## Decision

Promote the p0 237..243 object from "DEVOTED crib awaiting support" to a **typed source-state recovery of DEVOTED**:

- receiver selection comes from EMPTY/EPIPHANY;
- H is fixed independently as the local packet transform;
- [19,23,8] is an exact ciphertext-derived output;
- the signed source independently fixes [19,23,8]=[B,p,A]=[THEIR,ROAD,DEVOTED];
- B..p literally brackets the signed clause THEIR MEANING IS THE ROAD.

Keep the cryptographic scope narrow. The result recovers a word identity and a source instruction/state path, while the seven-rune symbol-changing inverse remains unknown. The next useful experiment must generate the seven-value key from an independently selected state/packet rule and then predict another untouched word; fitting expressions to the known DEVOTED crib is ineligible.

## Existing reproduction inputs

The arithmetic and corpus controls are already reproduced by:

- `sims/lp2_p0_boundary_the_packet_selfindex_sft.cjs` for the p0 boundary, seven-rune ciphertext, H output, and unique [B,p,A] triple;
- `sims/lp2_signed2016_word_position_dh_sft.cjs` for the authenticated-source DH23 word-position closure.

This note adds the cross-object consequence only; it does not duplicate either underlying census.
