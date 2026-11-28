# LP2 frame-run starts are robust; the length-derived state tape is crop-conditioned

**Agent13, corrected 28 November 2026. Classification: source-visible frame-boundary evidence with an explicit crop-sensitivity control. The six non-singleton frame STARTS and the p40–p55 final section are robust. The previously promoted six-run LENGTH-difference state tape is not source-unique and is downgraded. No plaintext, key or cipher inverse is recovered.**

## Robust source result

Decoded-pixel equality of repeated outer-border artwork across all 75 original JPEGs gives the same six non-singleton LP2 **start positions** under both the original outer crop and an independently charged more-central border crop:

```text
p1, p4, p15, p27, p40, p56.
```

The final run is especially stable: **p40–p55** is an exact 16-page repeated-frame section under both crops, containing the full final unsolved block and ending immediately before solved p56–p57 switch frame.

Those start positions give source-visible forward spacings

```text
[3,11,12,13,16]
```

and the 58-page cyclic tape from p4

```text
[11,12,13,16,3,3].
```

These start spacings are the robust visual register used by the independent chapter-PRODUCT gate. They do not depend on where the p15 run is declared to end.

## Crop-sensitivity falsifies a unique length tape

The originally frozen outer crop

```text
left/right x-width 380; y=600..2999
```

gives non-singleton runs

```text
p1–2, p4–7, p15–21, p27–39, p40–55, p56–57
lengths [2,4,7,13,16,2].
```

Its cyclic length differences are

```text
[2,3,6,3,15,0] = [K,e,a,e,b,F].
```

However an equally natural central-border crop with the same x geometry and

```text
y=800..2799
```

preserves all six start positions but extends the p15 artwork identity through p23:

```text
p1–2, p4–7, p15–23, p27–39, p40–55, p56–57
lengths [2,4,9,13,16,2].
```

Thus the p15 run **end and length depend on which vertical portion of the repeated frame is used**. The fixed-crop `[K,e,a,e,b,F]` difference tape remains an exact computational observation for that declared crop, but the artifact does not uniquely select it. It must not be treated as an authored state serializer or a cipher key.

## What survives

The useful, source-stable facts are:

- non-singleton frame starts `[1,4,15,27,40,56]`;
- forward start gaps `[3,11,12,13,16]`;
- cyclic gaps from p4 `[11,12,13,16,3,3]`;
- exact p27–p39 13-page run;
- exact p40–p55 16-page final-unsolved run;
- p56–p57 switch into a different solved-page frame.

These are enough for the PRODUCT source gate: the frame **starts**, not the disputed p15 run length, serialize the otherwise unconsumed chapter PRODUCT values. See [the frame-spacing PRODUCT gate](lp2-frame-gap-chapter-product-gate.md).

## Reproduction

`sims/lp2_p40_mirrored_section_artwork_sft.cjs` decodes all 75 original JPEGs on Windows and now computes both border crops. It asserts the common start positions, the stable p40–p55 section, both p15 end variants, and explicitly marks the fixed-crop length tape as non-source-unique.
