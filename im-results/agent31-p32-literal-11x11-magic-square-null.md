# p32 121-rune row-major 11×11 is not a literal GP0 or p56-prime magic square

**Agent31, 19 November 2026. Classification: bounded negative test.**

## Motivation

The original LP2 p32 page contains 121 runes, so an 11×11 row-major square is an obvious candidate shape. The 2014 Stage10 material explicitly asks players for magic squares, and solved p56 supplies the source-derived prime serializer T(n)=(p_n−1) mod29. This makes two literal tests reasonable before exploring more elaborate matrix transforms:

1. Arrange the 121 original GP0 indices row-major as 11×11 and test equal row/column sums.
2. Apply the solved-p56 T serializer to each rune, retain the same row-major order, and repeat the magic-square test.

The original p32 image is upright text with six printed lines and a blurred tree illustration; it does not itself display an 11×11 grid. The 11×11 shape is inferred from the rune count.

## Original-corpus results

Source: `resources/liber-primus/lp2-corpus.json`, page 32, exactly 121 rune indices.

**Raw GP0 row sums:**

`[153,172,81,150,199,143,159,159,165,148,132]`

**Raw GP0 column sums:**

`[158,120,175,180,143,165,130,183,108,159,140]`

Modulo 29, row sums are `[8,27,23,5,25,27,14,14,20,3,16]`; column sums are `[13,4,1,6,27,20,14,9,21,14,24]`. Neither family is constant. The two main diagonal sums are 148 and 126.

**After the solved-p56 prime serializer T:**

Row sums are `[146,171,73,123,152,125,160,162,99,178,69]`; column sums are `[152,128,137,136,159,136,104,99,164,132,111]`. Modulo 29, neither rows nor columns are constant. The two diagonal sums are 131 and 168.

D4 rotations/reflections only permute the row/column sum families; they cannot make these unequal sums constant.

## Decision

Reject the **literal row-major 11×11 GP0 magic square** and the same square after the solved-p56 T transform. This does not disprove a different matrix construction, a key-dependent transform, or the existing p32 navigation/state branch. It does mean the 2014 Stage10 magic-square precedent does not by itself select a direct magic-square operation on p32.

Do not expand into arbitrary row/column permutations, affine maps, or magic-square solvers without a new LP2 clue selecting that transform. Keep the p32 11×11 model classified as an inferred structural shape, not a printed square.
