# P28 HERE b-orbit predicts THE at a source-selected DH receiver

**Agent17, 19 November 2026. Classification: serious source-state candidate for the local plaintext token `THE`. The result extends the existing p28 `READ OUT -> HERE` checkpoint with one charged DH-field recurrence in the fixed outer-H coordinates. It remains candidate-level because the recurrence was recognized after `HERE`; the receiver coordinate and full five-rune checksum were inspected after the numeric prediction. No whole-page plaintext or general LP2 inverse is recovered.**

## Result

The calibrated p28 DH line supplies the state

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3
```

with `e=b^-1 mod22`.

The existing source-selected p28 page-start readout uses the fixed reversible map

```text
H(x,y) = (x-y, x+y) mod29
```

on the outer endpoints of the first two printed fragments:

```text
fragment1 endpoints [13,5] -> H = [8,18] = HE
fragment2 endpoints [11,7] -> H = [4,18] = RE
```

so the page start reads `HERE`.

A simple state-derived recurrence is visible in those H coordinates:

```text
difference coordinate: 8 -> 4
sum coordinate:        18 -> 18
```

The calibrated DH state contains

```text
b = 15 = K^-1 mod29
```

and indeed

```text
8 * 15 mod29 = 4.
```

Freeze that operation: multiply the H difference coordinate by `b=15`, preserve the H sum coordinate, and H-invert when a source endpoint pair is needed.

Applying the same recurrence once more gives

```text
[4,18] -> [2,18]
```

because

```text
4 * 15 mod29 = 2 = K.
```

The predicted H pair is therefore

```text
[K, p-g] = [2,18] = THE.
```

H-inversion predicts the exact next source endpoint pair

```text
H^-1([2,18]) = [10,8].
```

Before reading any interior runes, search p28 for that endpoint pair. There is exactly one matching fragment:

```text
p28 line7 fragment3
source values [10,18,13,28,8]
transliteration IEPEAH
length 5
outer H [2,18] = THE
```

Thus the fixed local route is

```text
READ OUT
HERE
THE
```

with `THE` recovered from a numeric endpoint prediction rather than from a dictionary scan.

## Charged page-start family

The recurrence contains two choices that could otherwise be tuned after seeing `HERE`:

1. which calibrated DH value supplies the scalar;
2. which H coordinate is scaled.

Charge every distinct scalar obtained from the seven DH fields and their GP29 multiplicative inverses:

```text
23,24,5,6,15,2,8,11,19,26
```

These correspond to `p,p^-1,g/a^-1,g^-1/a,b/K^-1,b^-1/K,A,A^-1,B,B^-1`.

Charge both H coordinates. This gives **20** transformations.

Across the **41** unknown-page starts whose first physical line begins with at least two multi-rune fragments, require all of the following:

1. one charged transform maps the first fragment's endpoint pair exactly to the second;
2. applying it again predicts a third endpoint pair;
3. that predicted pair occurs somewhere on the same page.

There is exactly **one** hit:

```text
page p28
H difference coordinate
factor15 = b = K^-1
predicted endpoints [10,8]
recipient p28 line7 fragment3, length5
```

The output `THE` is read only after this numeric family is resolved.

## Broader adjacent-fragment control

Relax page-start selection and apply the same 20-member transform family to every physically adjacent pair of multi-rune fragments in the unknown manuscript.

There are **2,367** eligible adjacent pairs.

Require the first-to-second recurrence and a same-page occurrence of the predicted third endpoint pair. Exactly two triples survive:

1. p28 line1 fragments1→2, difference×15, predicting p28 line7 fragment3 and H output `THE`;
2. p46 line10 fragments5→6, sum×8, predicting a p46 line1 fragment with H output `THEA`.

This control shows that the recurrence-plus-third-state condition is not globally unique without the already motivated page-start selector. Under the page-start condition fixed by `READ OUT HERE`, p28 is unique.

## The predicted receiver closes on the DH state

The target was selected first by its predicted **outer endpoints** `[10,8]`. Its interior then supplies independent local structure.

The exact five-rune source is

```text
[10,18,13,28,8].
```

Peeling it with the same fixed H map gives

```text
outer H  = [2,18]  = [K, p-g]
inner H  = [19,17] = [B, b+K]
center   = 13      = b-K
```

so its complete shell serialization is

```text
[K, p-g, B, b+K, b-K]
= [2,18,19,17,13].
```

Equivalently, the complete source fragment itself is exactly

```text
[A+K, p-g, b-K, p+g, A] mod29
= [10,18,13,28,8].
```

Across all **711** nontrivial manuscript-wide outer-H/count DH variants, predicting that complete five-rune vector and searching the same page gives exactly one match: the p28 target state and p28 line7 fragment3.

Three equivalent cross-field equalities help explain the closure:

```text
2A + K = p-g        (mod29)
-2g    = B          (mod29)
2p     = b+K        (mod29)
```

Within the 711-row nontrivial family, the individual equalities occur 22, 31, and 9 times. The first two together occur once, the first and third together once, the second and third together twice, and all three together once. The sole all-three hit is p28. These identities were recognized after the receiver was opened, so they are corroborative rather than a blind selection statistic.

## State-coordinate control

The predicted receiver also occupies a compact coordinate in the calibrated state:

```text
line = a+1 = 7
fragment = e = 3
fragment length = g = 5.
```

Charge this coordinate rule across all **289** invertible nontrivial DH variants from the independent manuscript-wide family:

- 110 variants have an in-range `(a+1,e)` fragment;
- 7 of those have recipient length `g`;
- exactly 1 has the predicted outer H pair;
- exactly 1 has the complete five-rune DH-state formula.

The sole hit is p28.

This coordinate relation was noticed after the endpoint prediction had already selected p28 line7 fragment3. It strengthens the local mechanism while remaining post-location evidence.

## Interpretation

The useful causal path is now:

1. the calibrated literal-DH line selects a typed DH23 state;
2. candidate `READ OUT` directs attention to the fixed outer-H readout;
3. p28's source-selected page start yields `HE | RE = HERE`;
4. the two H states expose one field-scaled transition, `A=8 -> 4`, with `p-g=18` fixed;
5. the pre-existing state scalar `b=K^-1=15` exactly implements that transition;
6. the same operation predicts `4 -> K=2`, hence `[K,p-g]=THE`;
7. H inversion predicts source endpoints `[10,8]`, selecting the p28 line7 fragment before its interior is used;
8. that recipient's source values and state coordinates close tightly on the same DH state.

This is materially stronger than obtaining `THE` by trying many keys against many fragments. The route still needs a prospective continuation or an independent first-party instruction that authenticates this H-coordinate recurrence. Applying the recurrence one more time predicts H `[1,18]`, and p28 contains no fragment with the corresponding endpoint pair. Do not repair that stop with a new scalar, skipped state, alternate coordinate, or fitted receiver.

## Decision

Preserve **`THE` as a serious local plaintext candidate following `READ OUT HERE`**. Keep the exact recurrence and the endpoint prediction as the primary evidence. Treat the receiver's `(a+1,e,length=g)` coordinate and full five-rune DH checksum as post-location corroboration.

No broader plaintext claim follows yet. The next useful test should be prospective: identify a source-visible rule that consumes the predicted `THE` receiver or specifies the next operation before another output is opened.

## Reproduction

Run:

```text
node sims/lp2_p28_here_borbit_the_sft.cjs
```

The SFT rebuilds the full outer-H/count DH family, charges the field/inverse-scalar and coordinate alternatives, verifies the p28 endpoint prediction, runs the broader adjacent-fragment control, and asserts the state-coordinate and full-receiver uniqueness checks.
