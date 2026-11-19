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

There are **2,347** eligible adjacent pairs.

Require the first-to-second recurrence and a same-page occurrence of the predicted third endpoint pair. Exactly two triples survive:

1. p28 line1 fragments1→2, difference×15, predicting p28 line7 fragment3 and H output `THE`;
2. p46 line10 fragments5→6, sum×8, predicting a p46 line1 fragment with H output `THEA`.

This control shows that the recurrence-plus-third-state condition is not globally unique without the already motivated page-start selector. Under the page-start condition fixed by `READ OUT HERE`, p28 is unique.

## The next physical line independently carries the DH group geometry

The predicted recipient is on **line7**, immediately after the literal-DH line6. Once that location was noticed, the complete line geometry supplied a simpler source-path hypothesis:

```text
line7 rune count      = 22 = p-1
line7 fragment count  = 6  = a
target fragment index = 3  = e
target fragment length= 5  = g
```

The first two quantities select the receiver line without reading any line7 rune values. Charge this exact next-line rule across all **289** invertible nontrivial manuscript-wide DH variants:

- every variant has a physical `a+1` line;
- 10 have `a+1` line length `p-1`;
- 69 have `a+1` fragment count `a`;
- exactly **1** satisfies both line-level conditions: p28;
- among the broader family, 110 have an in-range `e`th fragment and 7 have that fragment's length equal to `g`.

Thus the line itself uniquely echoes the DH group's order and the private exponent coordinate before `H(fragment e)` is read. On p28, `e=3` selects fragment3 and `g=5` matches its length. Applying the already fixed outer-H readout then gives `[2,18]=THE`.

This geometry was discovered after the recurrence had already predicted the target endpoint pair, so it is a post-location validation rather than a prospective discovery statistic. It materially improves the plausible human solve path because a player can move from the literal `DH` line to the immediately following `p-1`/ `a` line, then use the already derived inverse exponent `e` to choose a fragment.

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

The predicted receiver also occupies the compact state coordinate `(line,fragment,length)=(a+1,e,g)=(7,3,5)`. The line-level `(p-1,a)` geometry above already isolates p28 among the 289 invertible nontrivial variants. The broader coordinate census records 110 in-range `(a+1,e)` fragments, 7 with recipient length `g`, exactly 1 with the predicted outer H pair, and exactly 1 with the complete five-rune DH-state formula. The sole final hit is p28.

The coordinate and line-geometry relations were noticed after the endpoint prediction had already selected p28 line7 fragment3. They strengthen the local mechanism while remaining post-location evidence.

## Interpretation

The useful causal path is now:

1. the calibrated literal-DH line selects a typed DH23 state;
2. candidate `READ OUT` directs attention to the fixed outer-H readout;
3. p28's source-selected page start yields `HE | RE = HERE`;
4. the two H states expose one field-scaled transition, `A=8 -> 4`, with `p-g=18` fixed;
5. the pre-existing state scalar `b=K^-1=15` exactly implements that transition;
6. the same operation predicts `4 -> K=2`, hence `[K,p-g]=THE`;
7. H inversion predicts source endpoints `[10,8]`, selecting p28 line7 fragment3 before its interior is used;
8. independently, line7 has exactly `p-1=22` runes and `a=6` fragments, while `e=3` selects fragment3 and its length is `g=5`;
9. that recipient's source values close tightly on the same DH state.

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
