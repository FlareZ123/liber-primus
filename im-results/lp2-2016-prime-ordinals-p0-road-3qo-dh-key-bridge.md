# Signed-2016 prime ordinals select p0 THE and expose the DH 6/23 additive key

**Agent30, 18 November 2026. Classification: source-constrained cross-artifact navigation and a two-rune value-changing cryptographic holdout. The exact p0 receiver had already been selected as `THE ROAD` before this DH-key relationship was noticed. The result authenticates a local two-rune handoff; it does not yet define the state update needed to decrypt `ROAD` or the rest of p0.**

## Decision

Retain the signed 2016 image prime ordinals **103/104** as an unusually strong receiver selector.

Three independently developed routes now meet at the same two p0 rune positions:

1. the authenticated 2016 carrier is **563×569**, i.e. primes **#103/#104**, and p32's source-selected 11×11 prime matrix independently reproduces those dimensions as its first row and first column sums;
2. the signed-message GP0 → p50 pointer census independently predicts p0 offsets **103..108 = THE ROAD**, with the complete native-GP word **THE** occupying exactly offsets **103..104**;
3. the existing p50 prime-ordinal route uses one-based cells **103/104** to reconstruct the signed 2013 BASE29 example **3QO = 3301**.

At the same image-selected p0 word, a fourth relation is value-changing rather than positional:

```text
predicted plaintext THE = [TH,E] = [2,18]
original ciphertext     = [ H,EO] = [8,12]
C - P mod29             = [6,23]
```

The independent p28 center-line DH selector gives:

```text
a = line number = 6
p = line length = 23
```

so the local additive key is exactly:

```text
[6,23] = [a,p]
```

This is a concrete cryptographic receiver. It explains why the ciphertext word and plaintext word have the same GP0 sum: the two key increments total 29.

The next unresolved decision is narrow: identify a source-visible state update after `[a,p]` that predicts the four key increments for `ROAD` without fitting them. Until that update is found, do not extrapolate a DH-derived keystream.

## The signed image supplies prime ordinals 103 and 104

The preserved 2016 JPEG is exactly:

```text
width  = 563 = prime(103)
height = 569 = prime(104)
```

The tree-selected physical p32 has 121 = 11² runes. Under the source-fixed row-major orientation and GP-prime weights:

```text
sum(first row)    = 563
sum(first column) = 569
```

This relation predates the p0 receiver test and supplies the ordinal pair without reading p0 plaintext.

The earlier 2012 image provides a fixed control:

```text
503 = prime(96)
509 = prime(97)
```

Those ordinals do not isolate a complete two-rune p0 word: offsets96–97 lie inside one eight-rune ciphertext word spanning95–102.

## Independent signed-message pointer census selects THE ROAD

The authenticated 2016 cleartext is parsed into its 43 alphabetic words with ordinary native-GP longest matching.

Two consecutive signed words give:

```text
GP0(SEEKS) = 71 -> p50 byte[71] = 108
GP0(THE)   = 20 -> p50 byte[20] = 102
```

Treat the ordered byte values as boundaries. Original p0 complete words strictly after102 and ending by108 have rune lengths:

```text
offset103..104 : length2
offset105..108 : length4
```

Across the fixed 43-word signed message, the only consecutive phrase with native-GP lengths `[2,4]` is:

```text
THE ROAD
```

Thus the source-selected prediction is:

```text
p0[103..104] = THE
p0[105..108] = ROAD
```

The prime-ordinal relationship was recognized after this pointer census had already selected those offsets.

## The selected two-rune ciphertext is manuscript-unique at word level

Original p0 ciphertext at103..104 is:

```text
H EO = [8,12]
```

Across all **473 complete two-rune words** on unsolved p0..p55, `[8,12]` occurs exactly once:

```text
p0 offset103..104
```

The same adjacent pair occurs at other positions when word boundaries are ignored, so the discriminator is the source-visible complete-word boundary selected by the signed pointer route.

This is stronger than asking whether some arbitrary two-symbol window can be made to equal `THE`.

## The additive inverse is exactly the manuscript-derived DH a/p pair

Canonical native-GP encoding gives:

```text
THE = TH,E = [2,18]
```

Subtract from the original ciphertext:

```text
8  - 2  = 6
12 - 18 = -6 = 23 (mod29)
```

Therefore:

```text
key = [6,23]
```

Separately, solved p57 `FIND` routes to p28. The already established physical p28 center-word selector lands on the unique manuscript line whose first visible fragment is `DH`. That source object gives a standard DH instance directly from layout:

```text
line length = 23 -> p
word length = 5  -> g
line number = 6  -> a
word start  = 19 -> B
```

The remaining standard values are uniquely recovered as `b=15, A=8, K=2`.

The two values needed to invert the image-selected `THE` are therefore the independently source-derived DH fields **a then p**.

This is a cryptographic equality on original ciphertext, rather than a table-address or checksum coincidence.

## Same ordinal pair also participates in the existing 3301 route

Read the image ordinals as the existing one-based p50 cells:

```text
cell103 = 0W ; byte32
cell104 = 3Q ; byte206
```

The established two-cell extraction uses:

```text
cell104 literal = 3Q
byte(cell103) mod29 = 32 mod29 = 3 = GP rune O
3Q + O = 3QO
BASE29(3QO) = 3301
```

So the single signed-image ordinal pair103/104 now has two separately useful receivers:

```text
p0 zero-based offsets103/104 -> THE, with additive key [a,p]=[6,23]
p50 one-based cells103/104   -> 3QO = 3301
```

The difference in origins must remain explicit. The manuscript does not currently contain an instruction saying “use zero-based on p0 and one-based on p50.” The value of the convergence is that both readings were independently fixed by earlier source-specific routes.

## Why this changes the frontier

Before this result, the p0 `THE ROAD` placement was a navigation prediction whose value-changing cipher remained unspecified.

Now the first complete word of that prediction has a concise independently derived inverse:

```text
cipher H,EO
  minus DH [a,p] = [6,23]
  gives TH,E
  gives THE
```

The equality also explains the earlier GP0 checksum preservation at this word:

```text
GP0(cipher H,EO) = 20
GP0(plain THE)   = 20
6 + 23           = 29 = 0 mod29
```

The strongest remaining objection is temporal: both the p0 crib and the DH tuple existed before this connection was recognized, so this is a cross-artifact holdout rather than a blinded decryption trial.

The correct next experiment is prospective. Freeze `[a,p]` as the two-rune receiver state and derive one human-motivated update from the same source object. That update must predict the next four key increments at offsets105..108 before evaluating whether they spell `ROAD`. Generic PRNG, affine, or key-family searches would erase the discriminating value of this result.

## Reproduction

Run:

```text
node sims/lp2_2016_prime_ordinals_p0_road_3qo_bridge_sft.cjs
node sims/lp2_p28_centerline_dh23_sft.cjs
```

The first SFT reads the preserved JPEG bytes, authenticated signed message, canonical p0 transcription and p50 grid. It reproduces the image dimensions, prime ordinals, p32 sums, signed pointer census, unique `THE ROAD` length match, the p0 complete-word receiver, manuscript-wide two-rune-word control, additive `[6,23]` inverse, 2012 ordinal control, and p50 `3QO=3301` reconstruction. The second independently derives the complete DH23 tuple from the selected p28 physical line.
