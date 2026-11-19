# P32 SEEKS route coordinate readout yields ARE

**Agent15, 19 November 2026. Classification: strong source-constrained extraction candidate with a finite family control. It recovers the authenticated source word ARE from three original p32 runes selected by the already established EPIPHANY SEEKS THE DEVOTED route. The coordinate projection was recognized retrospectively, so this is not yet a blind plaintext proof or a whole-page decoder.**

## Upstream source path

The existing source-native route is fixed before this result:

```text
EPIPHANY SEEKS THE DEVOTED
GP0 = 121, 71, 20, 102

p = 23

71
-> 108
-> 14
-> 183
-> 81
-> 58
-> 146
-> 92
-> 236
-> 238
-> 129
-> 179
-> 175
-> 18
-> 15
-> 212
-> 70
-> 169
-> 228
-> 144
-> 125
-> 20
-> 102
-> 32
```

The route is the unique hit in the already charged 560-case authenticated four-word family. Its terminal is physical p32, and p32 contains exactly 121 runes, equal to GP0(EPIPHANY). State92 is the previously held-out interior EMPTY hit at step `g+K=7`.

P32 therefore has a source-selected 11x11 row-major representation. The dimensions are tied directly to the reconstructed state: the p50 table width is exactly `A=8`, while p32 has side `11=A+e` and rune count `121=(A+e)^2=GP0(EPIPHANY)`. Its source orientation is independently constrained because the first row and first column GP-prime sums are 563 and 569, the authenticated 2016 image dimensions.

## A value-free route-window selector

Use the canonical zero-based 32x8 coordinates of each p50 state. Charge every reconstructed DH field as a possible consecutive-window length:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3.
```

For each window, require:

```text
sum(p50 row coordinates) = 29
sum(p50 column coordinates) = one DH-state value.
```

The row target29 is the GP alphabet modulus. Across the complete 24-state route and all eight charged DH lengths, exactly two windows survive:

```text
K=2 window:
states [146,92]
rows   [18,11] -> 29
cols   [2,4]   -> 6 = a

e=3 window:
states [125,20,102]
rows   [15,2,12] -> 29
cols   [5,4,6]   -> 15 = b
```

This selector uses p50 geometry and already reconstructed state only. It does not inspect p32 rune values.

The e-window has a compact state-coordinate description before p32 content is consulted. The p50 row width is not an added base; it is `A=8`.

```text
125 = g^e          = A*b + g       -> (row15,col5) = (b,g)
20  = GP0(THE)     = p-e = A*K+K^2 -> (row2,col4)  = (K,K^2)
102 = GP0(DEVOTED) = a(p-a)        -> (row12,col6) = (aK,a)
```

The selected route tail can therefore be read as `[g^e, THE, DEVOTED]`, with all three p50 coordinates derived from the already reconstructed DH packet.

Its checksum is therefore algebraic:

```text
rows: b + K + aK = 15 + 2 + 12 = 29
cols: g + K^2 + a = 5 + 4 + 6 = b.
```

## Reuse the coordinates on the selected 11x11 square

The most literal coordinate transfer preserves the zero-based column and reduces the p50 row by the target side length. Here the target side is itself state-derived:

```text
p32 side = A+e = 11
p32 row = p50 row mod (A+e)
p32 col = p50 col
```

For the two candidates:

```text
[146,92]       -> p32 offsets [79,4]
[125,20,102]   -> p32 offsets [49,26,17]
```

Before using the selected rune values, identify the printed p32 words containing those offsets.

The K-window lands in zero-based p32 words13 and2. Their word-index sum is15, so the authenticated source word at index15 predicts **WORDS**, a five-GP-rune target. A two-cell readout cannot satisfy it, and the actual runes are `H AE`.

The e-window lands in zero-based p32 words:

```text
offset49 -> word8
offset26 -> word5
offset17 -> word3
```

The containing word indices are themselves direct DH fields:

```text
[8,5,3] = [A,g,e].
```

After the 11-row reduction, the cell coordinates are also compact state expressions:

```text
(4,5), (2,4), (1,6)
= (K^2,g), (K,K^2), (1,a).
```

Their word-index sum is:

```text
A + g + e = 8 + 5 + 3 = 16.
```

The K-window control lands in words `[13,K]`; 13 is not a direct DH field, so only the e-window has every containing word index already present in the reconstructed state.

Authenticated 2016 word index16 is **ARE**, whose canonical GP spelling has exactly three runes:

```text
ARE = [A,R,E] = [24,4,18].
```

The three original p32 ciphertext runes at the selected offsets are exactly:

```text
p32[49] = 24 = A
p32[26] =  4 = R
p32[17] = 18 = E
```

Thus the source-word index derived from the containing p32 words predicts the same three-rune object that is physically present at the source-selected cells.

The discovery chronology is retrospective: the coordinate relation was found after p32 values were available. The useful advance is that the final mechanism no longer needs an English target search to choose ARE. The word indices select the authenticated target before the three values are interpreted.

## Independent closures

Several exact source-state relations converge on the same three cells.

Their zero-based p32 offsets sum to:

```text
49 + 26 + 17 = 92 = GP0(EMPTY).
```

State92 is already the unique held-out signed-word interior state on the 23-step SEEKS route, at step `g+K=7`.

Their containing p32 word lengths are:

```text
[6,5,11]
sum = 22 = p-1.
```

Their one-based p32 word numbers are:

```text
[9,6,4]
sum = 19 = B.
```

The zero-based word-index sum16 disambiguates the two ARE occurrences in the signed message. They occur at indices16 and27. Only index16 points back to the selected page when the source word number is used as a p50 address under conventional base60:

```text
p50[16] = 21(base60) = 121 = rune_count(p32) = GP0(EPIPHANY)

p50[27] = 0P = 25.
```

Across all 43 signed word occurrences and both live radices, index16/base60 is the only occurrence-index p50 value equal to121. In state notation this closes as `p50[A+g+e] = (A+e)^2`.

The selected source context is therefore:

```text
ITS WORDS ARE THE MAP
          ^ index16
```

The following THE has one-based position18, equal to `p-g=18`, one of the independently reconstructed THE scaffold positions. Its follower MAP is already an operational source state:

```text
GP0(MAP)=56
p50[56]=4E
0x4E = ASCII N
56 - 8 = 48 = GP0(HERE).
```

The new p32 extraction therefore reconnects to the previously frozen MAP -> HERE transition without choosing a new operation.

## Broad lexical family control

As a separate control, ignore the word-index prediction and search the fixed 23-step route directly.

Charge:

- both route directions;
- all eight transpose/row-reflection/column-reflection orientations of the zero-origin coordinate reuse;
- every consecutive window compatible with each distinct authenticated 2016 GP word;
- all 34 distinct authenticated word rune sequences.

This is **11,152 labeled word/window comparisons**.

There is exactly one hit:

```text
forward route
original p32 orientation
states [125,20,102]
offsets [49,26,17]
-> ARE
```

No reversed route or alternate square orientation yields any authenticated source word.

## Failed generic transfer

Do not generalize the result into a rule that every p50 path ending on p32 exposes a source word through its last three nonterminal states.

The recovered source ARE occurs at index16, and that index itself enters p32 under the same base60 pointer table:

```text
16 -> 121 -> 237 -> 32.
```

Applying the frozen coordinate projection to its three nonterminal states gives GP values:

```text
[TH,B,IA]
```

rather than the following source word THE. This is a clean negative holdout against the obvious generic extension.

A complete terminal-route audit gives 14 signed-word/DH-depth/radix routes ending on p32. All 14 are base60. Applying the frozen row29/column-state gate to every one produces no new coordinate set: the only state sets are `[146,92]` and `[125,20,102]`. MEANING and FALSE reach the latter because their shorter routes share the same tail. The held-out family therefore supplies no second independent cell set yet.

## Decision

Preserve the following as the leading p32 readout candidate:

```text
EPIPHANY SEEKS THE DEVOTED
  -> unique p=23 p50 route to p32
  -> route-coordinate checksum selects e-window [125,20,102]
  -> canonical p50 coordinates reused on source-oriented 11x11 p32
  -> cells [49,26,17]
  -> containing p32 word indices [8,5,3] sum to source index16
  -> source index16 predicts ARE
  -> selected original runes are exactly ARE
  -> source ARE index16 returns to p32 through p50 value121
  -> ARE THE MAP reconnects to frozen MAP -> HERE.
```

This is a materially tighter human solve path than direct p32 cipher fitting. It extracts a real authenticated instruction word from unknown-page source runes with source-selected navigation and a bounded family. The coordinate moduli are now fixed by source geometry and state, `A=8` for p50 width and `A+e=11` for p32 side. The remaining weakness is that reusing the p50 quotient/remainder coordinates on p32 was recognized retrospectively. Do not promote the whole p32 page as decrypted.

The next useful test should keep this projection completely frozen and seek an independently selected second p32 state/window. Do not add coordinate shifts, alternative modular reductions, or language-optimized paths.

## Reproduction

Run:

```text
node sims/lp2_p32_seeks_route_are_readout_sft.cjs
```
