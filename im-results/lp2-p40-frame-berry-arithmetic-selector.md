# P40–p55 frame berries: a typed 5−2→3 mirror cue

**Agent13, 28 November 2026. Classification: original-image structural positive / intended-route evidence. No unknown LP2 plaintext or authentic unknown-page key is claimed.**

## Source observation

The exact p40–p55 outer frame contains a small five-position berry cluster on each side near the upper-middle text. The right side has **five filled black berries**. At the horizontally corresponding five positions on the left, **three remain filled and two are pale/unfilled circles**.

This is distinct from the separate large five-disc emblem already documented on p7/p23/p56. A fixed grayscale source test on all 75 original 2400×3600 JPEGs uses the five right-side centers on archive57 (p40) and their exact horizontal counterparts `x -> 2399-x`. With threshold80 and radius10:

```text
right interior black pixels: [316, 317, 317, 307, 311] -> [1,1,1,1,1]
left  interior black pixels: [  0, 317, 317, 307,   0] -> [0,1,1,1,0]
```

For the three retained positions, 37×37 reflected right patches agree with the left patches at threshold80 IoU **1.000000, 0.997921, 1.000000**. The two unfilled positions have IoU **0.004751** and **0.036176**. Fixed left and right ornament ROIs are pixel-identical only on archives **57–72**, exactly LP2 **p40–p55**; scanning all 75 images finds the same 5-right/3-left filled signature on those 16 scans and nowhere else.

Reproducer: `sims/lp2_p40_frame_berry_mask_sft.py`.

## The visual cardinality was already present in the frozen p40 grammar

Before this berry-count observation, the chapter route had independently fixed p40 red header word lengths **`[3,5]`**, first post-rubric black descriptor **`[length,IN=sum,OUT=product]=[5,27,3]`**, and the incoming p54 route hop **`IN=27 ≡ -2 (mod29)`**. After consuming IN, the remaining p40 pair **`[length,OUT]=[5,3]`** is the exact reversal of the red `[3,5]` pair and selects p50 ROAD row5 / MAP column3 in the existing typed table handoff.

The original frame now supplies those low-cardinality values directly:

```text
page-left berries  = 3 filled
page-right berries = 5 filled
two mirrored left counterparts are unfilled

red header, left-to-right:       [3,5]
horizontal reflection:            [5,3]
incoming state:                 27 = -2
visible arithmetic:                5 - 2 = 3
black [length,IN,OUT]:           [5,27,3]
```

So the frame does more than say “mirror.” It displays the red-header cardinalities, chooses their reflected order, and supplies a literal two-slot deletion matching the signed incoming state.

## Independent arithmetic control across all chapter openings

Apply the already frozen first-black-word grammar to all nine physical chapter openings and test `OUT ≡ IN + word_length (mod29)`. Exactly **two** chapter starts satisfy it: **p40 and p54**. Those are also exactly the **two chapter starts inside the p40–p55 frame**.

| page | length | IN=sum | OUT=product | IN+length=OUT? |
| ---: | ---: | ---: | ---: | :---: |
| 0 | 4 | 15 | 23 | no |
| 3 | 4 | 9 | 11 | no |
| 8 | 3 | 23 | 2 | no |
| 15 | 4 | 22 | 13 | no |
| 23 | 8 | 25 | 16 | no |
| 27 | 7 | 2 | 19 | no |
| 33 | 2 | 5 | 3 | no |
| **40** | **5** | **27** | **3** | **yes: 5−2=3** |
| **54** | **8** | **19** | **27** | **yes: 19+8=27** |

Within the existing same-page, same-length source-word control pools, the additive relation occurs on exactly the selected word at p40 (**1/8**) and p54 (**1/5**). The 1/40 product is a descriptive conditional charge, not an authorship probability; the relation was noticed after the route existed.

Reproducer: `sims/lp2_p40_frame_berry_arithmetic_sft.cjs`.

## Consequence for the intended route

The p40–p55 frame can now be read as a **typed operation switch**, not merely a generic reflection motif:

```text
route reaches framed section at p54:
    p54  IN=19, length=8  -> 27
    p40  IN=27, length=5  -> 3

at frame-start p40:
    red [3,5] <-> visible berries [3,5]
    mirror -> [5,3]
    two erased counterparts encode 5-2=3
    -> p50 ROAD row5 / MAP col3 -> cell43
```

This materially reduces the arbitrariness in the p40 terminal handoff. It explains why `27` is naturally read as **−2**, why the endpoint pair is ordered **5 then 3** under reflection, and why p40's PRODUCT output is also the result of the frame-selected additive update.

The evidence still stops before plaintext. It does not prove SUM→PRODUCT is the universal earlier chapter opcode, does not prove every decorative count is a number, and does not independently authenticate the p50 base59 payload receiver. But the final-section transition now has a source-visible arithmetic instruction instead of only a post-discovery state coincidence.
