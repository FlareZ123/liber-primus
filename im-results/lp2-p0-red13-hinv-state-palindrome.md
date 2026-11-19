# P0 marker rise grammar reproduces the complete 13-atom local key

**Agent14, 19 November 2026. Classification: strong candidate key-order provenance for the p0-local `EPIPHANY SEEKS` recovery. The generator reproduces the complete key from independently available `q=4`, `THE7`, and `WAY13`, while its exact rise grammar was recognized after the residual structure was visible. A prospective column-sum consumer failed, so the rule remains below an established general cipher.**

## Independent plaintext selection

The p0 target can now be selected without opening its additive residual.

The original red title has H-shell sums:

```text
THE1 / WAY13
```

Following those authenticated numbers through the established numbered diagonal, then using the fixed H readout, the rise `13-1=12`, and endpoint13 reconstructs source indices5..13:

```text
EPIPHANY SEEKS THE DEVOTED.
LIBER PRIMUS IS THE WAY.
```

Among every adjacent manuscript 8+5 pair, p0 is the sole receiver whose same title-to-direction-to-rise grammar recovers the complete source5..13 run. See `im-results/lp2-p0-firstline-h-source-register.md`.

The plaintext candidate `EPIPHANY SEEKS` is therefore fixed before the residual construction below is inspected.

## Frozen local residual and marker geometry

Original p0 title:

```text
C =
[15,8,18,3,6,19,27,0,15,26,18,21,5]
```

Authenticated target:

```text
P = EPIPHANY SEEKS
  = [18,13,10,13,8,24,9,26,15,18,18,5,15]
```

Ordinary additive residual:

```text
K = C-P mod29
  = [26,24,8,19,27,24,18,3,0,8,0,16,19]
```

Apply the fixed outside-in H inverse:

```text
H^-1(K)
=
[25,28,11,25, 4,8,19,8,4, 7,13,20,28]
```

The original red marker immediately after the title has visible column population:

```text
4 | 5 | 4
```

so the H-inverse packet partitions naturally as:

```text
left   = [25,28,11,25]
center = [4,8,19,8,4]
right  = [7,13,20,28]
```

## Center and right columns expose rise structure

The center is the exact independently reconstructed state palindrome:

```text
[q,A,B,A,q]
=
[4,8,19,8,4]
```

with:

```text
q=4, A=8, B=19
```

The state now also has an authenticated-square reconstruction independent of p0, so these labels are not inferred from the residual.

Its forward rises are:

```text
[4,11,18,25]
```

which form an arithmetic progression of step7 modulo29.

The right column is:

```text
[7,13,20,28]
```

with forward rises:

```text
[6,7,8]
=
[SEEKS6, THE7, DEVOTED8]
```

The seed7 is authenticated `THE7` from the independently recovered clause and also state value `g+K`.

Across all 19 manuscript 8+5 residuals under the same source target:

- p0 alone has a center whose rises form any arithmetic progression;
- p0 alone has a right-column consecutive +1 rise sequence;
- p0 alone satisfies both.

## Complete three-anchor rise generator

The left column also has a compact rise representation once the same three source/state anchors are held fixed:

```text
q = 4
t = 7  = THE7
w = 13 = WAY13
```

Use cumulative rises modulo29.

### Left column

Start at `-q` and rise by:

```text
[q-1, w-1, w+1]
=
[3,12,14]
```

Then:

```text
25
+3  -> 28
+12 -> 11
+14 -> 25

left = [25,28,11,25]
```

The three rises sum to29, so the column closes at its starting value.

### Center column

Start at `q` and rise by:

```text
[q, q+t, q+2t, q+3t]
=
[4,11,18,25]
```

Then:

```text
4
+4  -> 8
+11 -> 19
+18 -> 8
+25 -> 4

center = [4,8,19,8,4]
```

### Right column

Start at `t` and rise by:

```text
[t-1, t, t+1]
=
[6,7,8]
```

Then:

```text
7
+6 -> 13
+7 -> 20
+8 -> 28

right = [7,13,20,28]
```

Concatenate the three physical marker columns:

```text
R13 =
[25,28,11,25,4,8,19,8,4,7,13,20,28]
```

Apply the fixed forward H once:

```text
H(R13)
=
[26,24,8,19,27,24,18,3,0,8,0,16,19]
=
K
```

Subtract this generated key from the untouched title:

```text
C - H(R13) mod29
=
[18,13,10,13,8,24,9,26,15,18,18,5,15]
=
EPIPHANY SEEKS
```

Thus the three anchors generate every key coordinate and replay the complete local inverse exactly.

## Authenticated THE-anchor control

The signed source contains six occurrences of `THE`:

```text
1, 7, 12, 17, 22, 28
```

and one `WAY`:

```text
13
```

Hold `q=4` and `WAY13` fixed. Substitute each authenticated THE index into the identical three-column rise generator, then compare the generated 13-value H-inverse packet against every one of the 19 manuscript 8+5 residuals.

Results:

```text
THE1  -> 0 hits
THE7  -> p0 word1-word2 only
THE12 -> 0 hits
THE17 -> 0 hits
THE22 -> 0 hits
THE28 -> 0 hits
```

So the independently recovered `THE7` is the only authenticated THE occurrence that generates any member of the matched receiver family, and that member is p0 alone.

This is a bounded family control on the source anchor. It does not erase the chronology that the algebraic form of the three column generators was recognized after the p0 packet was visible.

## Orientation and receiver controls

The authenticated source contains exactly one adjacent native-GP 8+5 pair, `EPIPHANY SEEKS`.

Charge it against all 19 adjacent manuscript 8+5 receivers. For each receiver compute `C-P`, then inspect these six fixed views:

```text
raw
H
H^-1
reverse
H(reverse)
H^-1(reverse)
```

A five-cell center palindrome occurs only for:

```text
H^-1, p0 word1-word2
```

P0 is also the sole exact `[q,A,B,A,q]` center.

This localizes both the H orientation and the marker packet inside the natural same-shape family.

## Prospective column-sum consumer is negative

Before opening a new consumer, freeze the simplest marker-level handoff:

1. sum each visible H-inverse marker column modulo29;
2. use those three numbers as numbered-diagonal directions;
3. apply the already fixed receiver H plus shell-sum readout;
4. require a complete authenticated source clause of at least five words.

Column sums are:

```text
left   -> 2  = PATH2
center -> 14 = ITS14
right  -> 10 = PRIMUS10
```

The three directed receivers yield the unique source-index set:

```text
[0,1,5,7,12,13,23,24,27,28]
```

No complete predeclared authenticated clause of at least five words is present.

This prospective consumer fails. No alternate column statistic, transform, address origin, or fallback direction is opened after the miss.

## Evidence boundary

The result substantially narrows the p0-local key problem:

```text
authenticated p0 route -> EPIPHANY SEEKS
independent state       -> q=4
recovered source clause -> THE7, WAY13
visible marker          -> 4|5|4
three rise generators   -> full H^-1 key packet
fixed H                 -> exact additive key
original ciphertext     -> EPIPHANY SEEKS
```

The complete key can now be written as one short source/state generator rather than 13 separately labelled expressions.

The remaining weakness is chronology. The precise generator family was recognized after the residual packet had been inspected, and its first prospective marker-level consumer failed. Preserve it as strong candidate key-order provenance until an untouched original object predicts the same grammar, or the generator predicts a new plaintext/key consequence before that target is opened.

## Negative reuse checks

The exact center packet `[4,8,19,8,4]` does not occur contiguously under raw/H/H-inverse views of any unknown-manuscript five-rune word or five-rune window.

It also does not occur contiguously in basic p50 full-byte/high-digit/low-digit mod29 streams or simple authenticated-source index/length/GP0/delta streams.

So the evidence is the marker-aligned rise grammar itself rather than verbatim reuse of a known five-value tape.

## Reproduction

```text
node sims/lp2_p0_red13_hinv_state_palindrome_sft.cjs
```

The SFT reconstructs the unique authenticated 8+5 source target, all 19 matched manuscript receivers, the H-inverse marker packet, progression controls, the six-THE anchor family, the generated exact key, and exact p0 plaintext replay.
