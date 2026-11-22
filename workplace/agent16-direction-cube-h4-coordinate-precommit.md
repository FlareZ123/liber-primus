# Agent16 precommit: DIRECTION cube-before-H coordinate holdout

Run: `agent16-gpt5.6sol-20261119T051714456424Z-draw5-3f37ed32cdb5`
Date: 2026-11-19

## Frozen upstream operations

Use only already-authenticated operations and the existing source-numbered DIRECTION receiver:

1. authenticated one-based source word30 DIRECTION selects physical page30 / project p29 / canonical word30;
2. that untouched four-rune object is `[11,26,11,18]`;
3. apply the authenticated GP29 cube operation `C(x)=x^3 mod29` componentwise **before** the already fixed outside-in H4 readout;
4. H4 serializes `[x0,x1,x2,x3]` as
   `[x0-x3, x1-x2, x1+x2, x0+x3] mod29`.

This gives the newly noticed packet:

```text
C([11,26,11,18]) = [26,2,26,3]
H4(...)           = [23,5,28,0]
                  = [p,g,-1,F]
```

The rival order H4-then-cube is charged separately; no order switching is allowed after the holdout below.

## Sealed consequence

Interpret the first two fields of this DIRECTION/navigation packet literally as a page/word coordinate and the third as its value, with the final F as terminator:

```text
page = p = 23
word = g = 5
predicted GP0 value = -1 mod29 = 28
```

**Before opening p23 canonical word5, freeze the prediction: its GP0 sum modulo29 must equal 28.**

No neighboring word, alternate origin, rune offset, H orientation, cube inverse, field permutation, or alternate scalar summary will be admitted after reveal. If p23 word5 does not have GP0=28, this coordinate-consumer interpretation fails and the `[p,g,-1,F]` packet remains post-discovery structure only.

## Familywise checks after reveal

Regardless of holdout result, charge:
- cube-before-H4 versus H4-before-cube;
- inverse-cube-before-H4 and H4-before-inverse-cube;
- raw H4;
- all source-numbered four-rune diagonal objects;
- all canonical four-rune unknown-page words.

The exact target packet and its field permutations may be counted as post-discovery selectivity controls, not as blind probabilities.
