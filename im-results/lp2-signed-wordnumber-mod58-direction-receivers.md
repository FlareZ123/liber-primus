# Signed word numbers route to p54, p15, and p25 under the physical 58-page LP2 inventory

**Agent49, 19 November 2026. Classification: source-constrained navigation grammar candidate with two independently established receivers and one historical corroborator. No p54 plaintext is claimed.**

## Source instruction

The authenticated 2016 message states:

```text
their numbers are the direction
```

LP1 independently warns that the book's **words or their numbers** are sacred.

The current route has already produced three first-party words by frozen mechanisms:

```text
DIRECTION       GP0 112
CIRCUMFERENCES  GP0 131
EMERGE          GP0  83
```

The original LP2 release is a contiguous physical inventory `0.jpg ... 57.jpg`, exactly **58 images**. Interpreting each word's GP0 number as a cyclic direction in that source-visible page-label space gives:

```text
112 mod58 = 54
131 mod58 = 15
 83 mod58 = 25
```

These destinations were frozen before their receiver evidence was compared.

## DIRECTION112 -> physical p54

Physical p54 begins with the red heading:

```text
A / M-NG-D-IA-TH-X-I-M
```

The second red word has exactly eight GP symbols.

A recovered original 2 July 2014 solver discussion, more than twelve years before this route was assembled, explicitly proposed **DIRECTION** for that eight-rune red title. The contemporaneous constant-modulus cipher attempt fails and remains retired; the crib is unverified.

The useful fact here is historical receiver corroboration:

```text
DIRECTION number112
 -> 112 mod58
 -> p54
 -> eight-rune red title independently guessed as DIRECTION in 2014
```

This does **not** promote DIRECTION as p54 plaintext. DECEPTION and an eight-symbol BEGINNING spelling also fit the length.

## CIRCUMFERENCES131 -> physical p15

Physical p15 already has a complete source-exact numerical decoding from its original image. Its printed 4x4 grid is:

```text
3258  3222  3152  3038
3278  3299  3298  2838
3288  3294  3296  2472
4516  1206   708  1820
```

The existing SFT proves that the cells are generated in the printed spiral by:

```text
abs(3301 - prime(distinctFibonacci[n] + 1))
```

Now apply the literal word selected by the route:

```text
CIRCUMFERENCES131
 -> 131 mod58
 -> p15
 -> shed the 4x4 outer circumference
```

The remaining 2x2 core is exactly spiral steps0-3:

```text
3299 3298
3294 3296
```

in source-fixed spiral order:

```text
3299, 3298, 3296, 3294
```

Their offsets from3301 are:

```text
2, 3, 5, 7
```

the first four primes.

LP1 explicitly states:

```text
THE PRIMES ARE SACRED
```

So this receiver has a literal human-readable consequence:

```text
CIRCUMFERENCES -> p15 -> shed circumference -> prime core
```

The older p15 318-degree image route remains conditional and is not used.

## EMERGE83 / NUMBERS83 -> physical p25

The p22 source-linked square mechanism yields:

```text
center809
 -> p50/base59 83
 -> GP0(EMERGE)
 -> GP0(NUMBERS)
```

The signed source supplies the second identity directly: **NUMBERS=83**.

The word-number rule gives:

```text
83 mod58 = 25
```

Physical p25 was independently selected before the square result by the authenticated 2013 sentence **GOOD LUCK**:

```text
GP0(GOOD LUCK)=66
p50[66]=0P
0P=25
 -> physical p25
```

After that independent page selection, p25 contains the unique one of **627** charged five-rune side objects whose outer H state is `[K,g]=[2,5]`. That state fixes the existing cube cut5, and its unchanged low-digit pointer reaches physical p28 **READ OUT**.

Thus the new direction rule predicts an already source-selected receiver:

```text
EMERGE / NUMBERS83
 -> 83 mod58
 -> p25
 -> unique [K,g] object
 -> p28 READ OUT
```

This is the strongest of the three prospective receiver checks because p25's independent selector and unique local state predate the square discovery.

## Why 58 is the relevant page modulus

The literal page-label inventory supplied to 2014 players is contiguous:

```text
0.jpg ... 57.jpg
```

so modulo58 preserves the published physical page labels.

The SFT also records nearby numerical inventories as controls:

```text
55 rune-bearing unknown pages
56 physical p0-p55 slots
75 combined LP1+LP2 images
```

Those counts do not provide the same direct contiguous LP2 page-label space. In particular, the 55 rune-bearing count omits runeless p50, so a remainder cannot be interpreted as the original physical page label without an extra remapping rule.

The 58-page convention is therefore the simplest source-visible cyclic page namespace. It remains a routing hypothesis until another untouched word-number prediction succeeds.

## Relationship to the earlier raw809 mod58 loop

An earlier exploratory result observed:

```text
809 mod58 = 55
```

and therefore proposed a p22-center809 -> p55 return loop.

The signed instruction is more literal when applied to the **word's number**:

```text
their numbers are the direction
```

The square gives `83=EMERGE=NUMBERS`, so the preferred interpretation is:

```text
83 mod58 = p25
```

rather than treating raw809 itself as the signed word number.

Preserve the exact `809 mod58=55` arithmetic as secondary corroboration only. Do not use it as the primary navigation grammar unless an independent source explicitly selects the raw square integer.

## Reproduction

```text
node sims/lp2_signed_wordnumber_mod58_direction_receivers_sft.cjs
```

Windows Node22 PASS:

```text
44474311091
```

Supporting commits:

```text
144150d04a297c255b4cf7a5670d12943bd11f03  initial SFT
61e81dfcf441ee37ece8e0b8931cef938792b68f  composition-field fix
8a72738c52fb6cbff52fb99134f1fb398765db24  workflow
```
