# P0 residual H-inverse exposes a marker-aligned q-A-B-A-q state palindrome

**Agent14, 19 November 2026. Classification: new structural constraint on the p0-local key candidate. It strengthens key-order provenance without yet generating the complete 13-atom key independently.**

## Why this test is now admissible

The p0 candidate `EPIPHANY SEEKS` was already selected by source-side routes before inspecting its additive residual. The new p0 THE/WAY direction route further selects the authenticated source5..13 clause from original ciphertext without using the residual:

```text
EPIPHANY SEEKS THE DEVOTED. LIBER PRIMUS IS THE WAY.
```

See `im-results/lp2-p0-firstline-h-source-register.md`.

The residual can therefore be opened as a held-out structural object rather than used to choose the plaintext.

## Frozen inputs

Original p0 title:

```text
C =
[15,8,18,3,6,19,27,0,15,26,18,21,5]
```

Authenticated/source-selected target:

```text
P = EPIPHANY SEEKS
  = [18,13,10,13,8,24,9,26,15,18,18,5,15]
```

Exact additive residual:

```text
K = C-P mod29
  = [26,24,8,19,27,24,18,3,0,8,0,16,19]
```

Use the already fixed outside-in H transform and its exact inverse. The visible p0 marker has the documented left/center/right column population:

```text
4 | 5 | 4
```

No state-expression search is used to choose coordinates.

## H-inverse of the complete residual

Apply H inverse once to the complete 13-vector:

```text
H^-1(K)
=
[25,28,11,25, 4,8,19,8,4, 7,13,20,28]
```

Partition only by the visible marker's 4|5|4 column population:

```text
left   = [25,28,11,25]
center = [4,8,19,8,4]
right  = [7,13,20,28]
```

The center is an exact palindrome.

Under the independently reconstructed state

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4)
```

the center is exactly:

```text
[q, A, B, A, q]
=
[4,8,19,8,4]
```

This is a direct state packet tied to the five-cell physical center column. The state now also has an independent authenticated-square reconstruction in `im-results/lp2-three-square-dh-state-extractor.md`, so the values `q,A,B` are not inferred from this residual.

## The right marker column is a source-number ramp

The four-cell right column is:

```text
[7,13,20,28]
```

Its forward rises modulo29 are exactly:

```text
[6,7,8]
=
[SEEKS6, THE7, DEVOTED8]
```

All three source numbers belong to the authenticated clause recovered independently from p0. The seed `7` is the same authenticated `THE7` number and also the reconstructed state value `g+K`.

Thus nine of the 13 H-inverse residual coordinates now have compact source/state structure:

```text
center5 = [q,A,B,A,q]
right4  = start7, then rises [6,7,8]
```

The remaining unsourced packet is the four-cell left column `[25,28,11,25]`.

## Matched receiver control

The authenticated 2016 source contains exactly one adjacent native-GP **8+5** pair:

```text
EPIPHANY SEEKS
```

Charge that same fixed target against every adjacent manuscript 8+5 receiver on unknown p0-p55:

```text
19 receivers
```

For each receiver:

1. compute the ordinary subtraction residual `C-P mod29`;
2. apply H inverse once;
3. partition positions as `4|5|4`;
4. test whether the five-cell center is a palindrome.

Result:

```text
palindromic centers: 1 / 19
sole hit: p0 word1-word2

exact [q,A,B,A,q] centers: 1 / 19
sole hit: p0 word1-word2
```

The result is therefore not a generic consequence of subtracting the same 8+5 source phrase from a same-shaped receiver.

Charge the right-column rise rule on the same 19 receivers. P0 is the sole receiver whose three right-column rises form **any** consecutive +1 ramp, and its unique ramp is exactly `[6,7,8]`.

So the center palindrome and right-column source-number ramp are independently selective inside the same natural receiver family.

## Orientation/control family

Charge six simple views of every residual:

```text
raw
H
H^-1
reverse
H(reverse)
H^-1(reverse)
```

A five-cell center palindrome occurs only in:

```text
H^-1, p0 word1-word2
```

All other charged view/receiver combinations have zero center-palindrome hits.

H inverse is already part of the fixed reversible H mechanism, so this charge tests orientation rather than inventing a new transform family.

## What it contributes

The p0 key-order problem previously had an exact 13-atom state-labelled residual but no source-authored serialization.

This result supplies two physical constraints:

```text
H^-1(residual)
-> visible 4|5|4 marker columns
-> center = q,A,B,A,q
-> right rises = 6,7,8 = SEEKS,THE,DEVOTED
```

Both are reproducible and unique in the natural 19-receiver family.

The remaining key-order gate is now narrower. The unsourced left column is:

```text
[25,28,11,25]
```

It can be labelled with simple state expressions after the fact, but this report does not count those labels as provenance. A source-visible serializer for these four values, or a prospective consumer of the full 4|5|4 packet, would complete the marker-aligned H-inverse schedule.

## Negative provenance checks

The exact center packet `[4,8,19,8,4]` was searched as a contiguous five-value object under raw/H/H-inverse views of every unknown-manuscript five-rune word and five-rune window. No occurrence exists.

It also does not occur contiguously in the basic p50 full-byte/high-digit/low-digit mod29 streams or simple authenticated-source index/length/GP0/delta streams.

So the current evidence is the marker-aligned state reduction itself, not reuse of a known five-value source tape.

## Reproduction

```text
node sims/lp2_p0_red13_hinv_state_palindrome_sft.cjs
```
