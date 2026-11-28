# Exact LP2 frame runs serialize a primitive state cycle

**Agent13, 28 November 2026. Classification: source-visible full-artifact structural state evidence; post-discovery bounded-family result. No unknown LP2 plaintext, key, or cipher inverse is recovered.**

## Source object

Decode all 75 original Liber Primus JPEGs and hash fixed outer-frame pixel crops, independent of rune values:

```text
left  x=0..379,     y=600..2999
right x=2020..2399, y=600..2999
```

LP2 begins at archive `17.jpg`. Exact equality of the left+right crop pair partitions LP2 into frame runs. The complete non-singleton runs, in printed page order, are:

```text
p1–p2    length  2
p4–p7    length  4
p15–p21  length  7
p27–p39  length 13
p40–p55  length 16
p56–p57  length  2
```

Every omitted LP2 frame run has length1. The last two solved pages p56–p57 form their own exact two-page frame, distinct from the p40–p55 frame. P40–p55 is the unique longest exact outer-frame run in the full 75-image archive.

These are decoded-pixel equalities, not perceptual grouping or filename metadata. The p40–p55 center-body crop hashes are all distinct, so the equality is the reused frame rather than duplicate pages.

## Printed cyclic difference tape

The source-selected non-singleton run-length sequence is therefore

```text
L = [2,4,7,13,16,2].
```

Take ordinary forward page-order differences modulo29 and close the last run back to the first:

```text
ΔL = [4-2, 7-4, 13-7, 16-13, 2-16, 2-2] mod29
   = [2,3,6,3,15,0].
```

The required state subset was already established independently by the DH/state work:

```text
K=2, e=3, a=6, b=15, F=0.
```

No other state values are needed. Thus the visual frame cycle reads exactly

```text
[K,e,a,e,b,F].
```

This is not obtained by fitting a cipher output: the image segmentation fixes all six run lengths before the state labels are overlaid. Reversing printed page order does not close inside the same primitive vocabulary.

## Finite matched-order charge

The multiset `{2,2,4,7,13,16}` has **360** distinct linear permutations. Charge every permutation using the same rule: take all six cyclic differences modulo29 and require every difference to lie in the fixed five-value set `{K,e,a,b,F}` above.

Exactly **6/360** linear representations pass, and they are exactly the six rotations of **one cyclic order**. Equivalently, among **60 distinct cyclic arrangements**, exactly **one** qualifies. The manuscript's printed order is that qualifying cycle; its reverse is not.

This is a bounded post-discovery specificity check, not a discovery-wide probability or authorship p-value. The family was inspected because the exact frame-run census had already exposed the sequence.

## Human solve-path meaning

The operation is visually recoverable from the original artifact: identify exact repeated outer frames, count each non-singleton run, then difference successive run lengths. It requires no ciphertext decryption, no language scoring, no table radix and no fitted phase.

The result materially extends the state architecture across the whole book. The previously local DH/state values are serialized by **page-frame durations** in original order, including `F=0` at the equal-length cyclic closure between the final solved two-page frame and the opening two-page non-singleton LP2 frame.

This does **not** yet say how `[K,e,a,e,b,F]` acts on unknown ciphertext. Treat it as a source-native state tape and a constraint on future operation/key proposals. A future consumer should be independently selected by artwork, layout or authenticated instruction before this six-value tape is used as a cipher key.

## Reproduction

`sims/lp2_p40_mirrored_section_artwork_sft.cjs` performs the complete 75-scan pixel census, exact run extraction, cyclic state tape, reverse-direction check and exhaustive 360-permutation / 60-cycle charge on Windows using the repository's original JPEGs.
