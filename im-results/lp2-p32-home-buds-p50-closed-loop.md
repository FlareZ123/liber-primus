# p32 HOME X -> BUDS -> HOME closes the frozen p50 composite on an unknown receiver

**Agent8, 19 November 2026. Classification: strong source-constrained unknown-receiver transfer. This result strengthens an intended navigation mechanism. It does not recover unknown LP2 plaintext.**

## Fixed inputs before this bridge

Three inputs were already established independently of the present comparison.

1. The authenticated 2016 clause `EPIPHANY SEEKS THE DEVOTED`, together with the reconstructed p28 DH modulus `p=23`, selects a unique 23-step base60 p50 walk from `SEEKS=71` to physical p32. The held-out signed word `EMPTY=92` lies at step7 of that route.
2. P32 has 121 runes. Its first-row and first-column GP-prime sums are 563 and 569, fixing the existing 11x11 row-major orientation check.
3. Agent10 froze the table-wide unique p50 composite `57 --1w/west--> 56 --4E/hex N--> 48`. That operation subsequently transferred to the solved WELCOME adjacency `WAY HERE`. The open requirement in that report was a second independently selected state or an unknown-ciphertext receiver using the same operation.

The current test opens p32 only after those selections are in place.

## EMPTY selects `HOME X`

Corrected page-boundary parsing gives p32 22 page-local fragments and 21 complete word starts. Fragment0 is the one-rune continuation from p31. Route step7 therefore selects local fragment7, which is also the seventh complete p32 word start. Its exact transliteration is:

```text
HOMEXWDSLFD
```

The word has length11. The held-out source number is `GP0(EMPTY)=92`, and:

```text
92 mod 11 = 4
```

so the same source word selects the literal `X` at zero-based position4, p32 rune offset37. The four runes immediately before it are `HOME`, at offsets33..36. Thus the route prospectively identifies the source object `HOME X`. This uses the corrected carry-aware boundary model committed independently by Agent50.

Across all 12,956 unknown LP2 runes, prior source work already established that `HOME` and `HOMEX` occur only at this p32 location. The present route supplies a new independent selector for that location.

## The selected X and DH g map HOME to BUDS

In the fixed 11x11 p32 square, HOME begins at row3, column0. Agent50 independently closed the selected row as `HOME | X | WDSL | FD` with lengths `4|1|4|2`; the first `HOME|X` span therefore has length5, exactly the frozen DH value `g=5`. A literal X supplies the four diagonal orientations. Charge every reconstructed DH field value

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
```

as the equal row/column displacement modulo the 11-cell side, and charge all four diagonal signs. Preserve HOME's left-to-right orientation at the translated location. The selected `HOME|X` span independently supplies the value g, while X supplies the direction family. No language-dependent distance or orientation is fitted.

Only one admissible diagonal in that complete frozen family lands on any four-letter word in the pinned TextBlob dictionary:

```text
field = g = 5
direction = down-right
HOME start 33 = (3,0)
+ (5,5)
= (8,5) = offset93
p32[93..96] = BUDS
```

The following selected X moves under the same translation:

```text
X offset37 = (3,4)
+ (5,5)
= (8,9) = offset97
```

Offset97 is exactly the next printed-word boundary, immediately after BUDS. The boundary is corroboration; the dictionary family already selects the same g/down-right case without using it.

The flat row-major displacement is also exact:

```text
5 * (11 + 1) = 60
93 - 33 = 60
```

The independently selected p50 walk uses base60. This numerical equality is a consistency observation rather than a separate selector.

A whole 11x11 eight-direction four-letter census gives only two pinned-dictionary words on p32:

```text
HOME  at row3,col0, GP0=48
BUDS  at row8,col5, GP0=56
```

This makes the translated target unusually constrained and gives BUDS a page-native tree semantic.

## The carried X is the independently selected PARABLE word TO

A separate p32 route, selected from the solved PARABLE and the authenticated THE/DEVOTED boundary geometry, fixes the straight NE cells

```text
117 -> 107 -> 97 -> 87
INSTAR  TUNNELING  TO  THE
```

by GP-prime residues modulo `B=19`: `[2,3,4,5]`. The HOME/BUDS diagonal above carries the selected X to **offset97**, exactly the third cell of that already fixed route. At offset97 the original rune is `B`, GP-prime61, and `61 mod 19 = 4`, so the PARABLE consumer reads the carried X destination as **TO**.

Charge the complete in-bounds DH/X diagonal family from HOME. The g/down-right case is the **only** charged diagonal whose carried X lands on any of the four fixed PARABLE/SURFACE cells, and it is simultaneously the only case whose translated HOME lands on a four-letter dictionary word. This supplies an operation-independent cross-route junction at the exact cell selected by two different p32 mechanisms.

## The BUDS container is a unique H-shell DH register

The translated BUDS lies inside p32 fragment15:

```text
OENGOMBUDS
indices = [22,21,3,19,17,1,23,15]
```

Apply the already fixed outside-in map `H(x,y)=(x-y,x+y) mod29` to its four nested pairs, preserving orientation:

```text
H(22,15) = [7,8]
H(21,23) = [27,15]
H(3,1)   = [2,4]
H(19,17) = [2,7]

shell = [7,8,27,15,2,4,2,7]
      = [g+K,A,-K,b,K,q,K,g+K]
```

Here `q=EMPTY/p=92/23=4`; `g+K=7` is the independently observed EMPTY route step; and `-K=27` was already present in the signed-word/p50 DH-state bridge. The input itself also compresses as `[p-1,p-K,e,B,B-K,1,p,b]`, but that description is recorded after selection and is not used as a gate.

For a manuscript-wide control, take every page-local 8-rune fragment on unknown p0–p55, apply this exact outside-in H shell, and score outputs only against the pre-existing state vocabulary `{p,g,a,b,A,B,K,e,q,-K,g+K}`. There are **159** eight-rune fragments. The score histogram from 0 through 8 matches is:

```text
2, 19, 31, 39, 31, 23, 10, 3, 1
```

The **sole 8/8 hit is p32 fragment15**, the independently selected HOME→BUDS destination. The three nearest controls score 7/8. This converts the BUDS container from a literal-word coincidence into a uniquely state-saturated receiver under an operation fixed elsewhere.

## READ OUT closes the receiver back to THE DEVOTED

The p28 DH branch independently fixes two consumers that were not chosen from this p32 target:

1. `READ OUT` describes reading the outer runes under the forward H operation.
2. The authenticated-source DH transfer fixes state values as zero-based signed-word positions, with `7 -> THE` and `8 -> DEVOTED`.

Apply only the outer H layer to the independently selected p32 destination fragment:

```text
fragment15 = [22,21,3,19,17,1,23,15]

READ OUT:
H(22,15) = [7,8]

signed words 7,8 = THE DEVOTED
```

This exactly returns the suffix of the upstream authenticated selector `EPIPHANY SEEKS THE DEVOTED` that originally drove the 23-step route to p32.

The exact `[7,8]` output is equivalent to outer endpoints `[22,15]`. Across every multi-rune fragment on unknown p0-p55, four fragments have those endpoints; their lengths are 5, 2, 8, and 6. The p32 target is the **only 8-rune fragment** with this exact readout. Within the already locked 159-fragment eight-rune family, it is therefore unique.

A broader adjacency control prevents overclaiming. Five of 159 eight-rune outer H pairs happen to be consecutive signed-word positions, close to the random 29-state expectation. The discriminating fact is the pre-specified upstream suffix itself: the selected receiver returns exactly `THE DEVOTED`, rather than merely some adjacent source bigram.

### DIRECTION carries the same readout to GOOD LUCK

Agent27 independently fixed the authenticated sentence's literal `DIRECTION` word at zero-based position29 as a modulo29 fold between source positions 1..13 and 30..42. This operator was established after the p32 receiver and does not inspect its ciphertext.

Apply that already fixed source operation to the READ OUT result:

```text
receiver READ OUT = [7,8]
DIRECTION = 29

7 + 29 = 36 -> GOOD
8 + 29 = 37 -> LUCK
```

So the same p32 receiver has the prospective source continuation **GOOD LUCK**, exactly the complete two-word sentence in the authenticated trailing block. This does not add a new familywise uniqueness claim because every exact `[7,8]` receiver would inherit the same source fold. Its value is causal: an independently fixed source operation converts the p32-returned selector suffix into a clean human-facing continuation without choosing a new transform from the target.

The route now closes as:

```text
EPIPHANY SEEKS THE DEVOTED
  -> p=23 / base60 SEEKS walk
  -> p32
  -> EMPTY@step7
  -> HOMEX
  -> g=5 X-diagonal
  -> OENGOMBUDS
  -> READ OUT / outer H
  -> [7,8]
  -> THE DEVOTED
```

This is a source-to-unknown-ciphertext-to-source loop under previously fixed operations. It remains a receiver/readout closure, not a continuous plaintext decryption of p32.

## The frozen p50 composite returns BUDS to HOME

The already fixed Agent10 composite has exactly one valid two-stage transition anywhere in the complete 256-cell p50 table:

```text
57 -- p50[57]=1w --> west to 56
56 -- p50[56]=4E --> hex ASCII N --> north to 48
```

The p32 labels above identify those two internal states without changing the operation:

```text
56 = GP0(BUDS)
48 = GP0(HOME)
```

so the same frozen operator gives an unknown-page receiver:

```text
WAY 57 -> BUDS 56 -> HOME 48
```

The final table cell is `p50[48]=4D`, whose hexadecimal ASCII value is `M`, outside the cardinal alphabet. The frozen second-stage cardinal consumer therefore supplies no automatic third move from HOME.

Across the authenticated signed message, both WAY and WILL have GP0 value57. Within the already fixed six-word THE-follower scaffold `PATH DEVOTED WAY MAP ROAD DIRECTION`, WAY is the sole value57 word. The source role, rather than the numeric value by itself, selects WAY.

## Why this changes the frontier

The p50 composite previously had one independent solved-text transfer, WELCOME `WAY HERE`, while its own report explicitly asked for a second independently selected state or unknown receiver. The independently selected p32 now supplies exactly that receiver. Its two internal numerical states are labeled by the only two four-letter grid words on p32, and the separately reconstructed DH value g links those words geometrically through the EMPTY-selected X.

The strongest rival remains coincidence in the p32 literal-word layer. The equal-axis move is motivated by the selected X and the adjacent `HOME|X` span length g, yet no first-party text explicitly says "move g cells diagonally." BUDS is a low-frequency dictionary word. The exact offset97=TO cross-route junction, the unique 8/8 fixed-H state shell, and the READ OUT closure back to the pre-specified source suffix THE DEVOTED materially reduce that rival, while the absence of a source-selected reversible full-page plaintext transform still limits the result to receiver/mechanism recovery rather than continuous plaintext.

The causal path is now concrete:

```text
authenticated EPIPHANY/SEEKS/THE/DEVOTED + p=23
 -> base60 p50 walk
 -> p32
 -> held-out EMPTY@7
 -> HOMEX...
 -> X diagonal with g=5
 -> BUDS
 -> frozen p50 4E/N consumer
 -> HOME
```

This is a reusable route worth carrying forward. Further work should use HOME/BUDS as fixed state labels and seek a source-selected value-changing operation on untouched p32 ciphertext, instead of reopening page selection or generic p32 key searches.

## Reproduction

`node sims/lp2_p32_home_buds_p50_loop_sft.cjs`

The SFT reconstructs the 23-step upstream route, canonical p32 words and 11x11 checksum, the complete DH-diagonal family, the whole p32 four-letter grid census, the independent PARABLE/SURFACE offset97 junction, the 159-fragment H-shell control, the READ OUT / THE DEVOTED source closure, the held-out DIRECTION -> GOOD LUCK continuation, the table-wide frozen p50 composite, and the signed-source value57 ambiguity.
