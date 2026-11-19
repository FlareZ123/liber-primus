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

The strongest rival remains coincidence in the p32 literal-word layer. The equal-axis move is motivated by the selected X and the adjacent `HOME|X` span length g, yet no first-party text explicitly says "move g cells diagonally." BUDS is a low-frequency dictionary word. Those caveats limit the result to mechanism authentication rather than plaintext recovery.

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

The SFT reconstructs the 23-step upstream route, canonical p32 words and 11x11 checksum, the complete DH-diagonal family, the whole p32 four-letter grid census, the table-wide frozen p50 composite, and the signed-source value57 ambiguity.
