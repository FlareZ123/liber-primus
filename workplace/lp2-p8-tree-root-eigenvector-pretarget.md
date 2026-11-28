# P8 rooted-tree eigenvector receiver — pretarget freeze

**Agent13, run `agent13-draw3-20261128T114140Z-b25f776945-directed`. PRETARGET: no candidate p8 body decode from this family was inspected before this file was committed.**

## Source-only selector

Original physical p8 (archive `25.jpg`) visibly contains a rooted tree beside the 49-fragment black body. Its first red heading rune is enlarged into a clean three-pronged branch glyph; exact red-pixel component bounding box on the 2400×3600 JPEG is x=602..884, y=667..1164 (inclusive), and this glyph is the first rune of the four-rune red word, GP0 value **14**.

The already-frozen 7×7 black-fragment length matrix is

```
3  2  3  9  4  3  4
2  2  6  3  7  3  4
3  8  4  3  4  5  5
2  3  4  4  7  5 10
6 12  4  5  3  2  6
10 4  9  6  5  6  8
8  3  2  9  6  6  1
```

Its already-established characteristic factorization is

```
(x+g)(x^3+g x^2-q x+a)(x^3-q x^2+x+A^-1),  g=5
```

over GF(29). The artwork instruction tested here is literal and bounded: **rooted tree → take a characteristic root**. Only the linear factor has a root in the native GP29 field, so the unique native-field root is

```
lambda = -g = 24.
```

The right and left eigenspaces at lambda are each one-dimensional. With the final coordinate normalized to 1 their unique generators are

```
right = [18,9,9,8,28,0,1]
left  = [18,6,18,12,27,6,1]
```

The enlarged first red rune supplies a source-visible scale anchor 14. Anchoring the first coordinate to 14 gives

```
R_top = [14,7,7,3,25,0,4]
L_top = [14,24,14,19,21,24,4]
```

The primary key is **R_top**, because the matrix acts on column vectors and the enlarged rune is at the heading's first/top origin.

## Charged alternatives fixed before target opening

To charge obvious left/right and root/leaf orientation ambiguity without phase-tuning, also test:
- right vs left eigenvector;
- scale anchor at first/top coordinate vs final/root coordinate, both anchored to GP0 14;
- printed orientation vs exact reversal;
- additive vs subtractive use.

The bottom-anchored vectors are therefore fixed as

```
R_bottom = [20,10,10,25,15,0,14]
L_bottom = [20,26,20,23,1,26,14]
```

Together with exact reversals this is **8 fixed seven-rune keys**, and with +/- direction **16 fixed decodes**. No cyclic rotations, per-page resets, F exceptions, affine rescaling, or language-selected phase are permitted.

## Held-out receiver and pass/fail rule

Receiver: original p8 black body only, offsets 12..254 inclusive (243 GP29 runes), printed order, phase zero. Repeat each frozen 7-rune key from its first coordinate and apply ordinary GP29 addition/subtraction.

Primary claim passes only if the source-selected primary `R_top` produces a solved-native-calibrated plaintext-quality result under one of the two fixed signs. The broader charged family is reported to detect an orientation mistake, but a family-only hit cannot retroactively choose the artwork rule without additional source evidence.

All outputs, scores, and any state-expression reading of the decoded runes remain sealed until after this commit.
