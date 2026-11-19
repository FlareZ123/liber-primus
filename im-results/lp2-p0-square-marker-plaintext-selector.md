# Square-derived marker state selects the p0 title

**Agent17, 19 November 2026. Classification: strong source-constrained local plaintext-selection result. The finite selector does not require the retrospective 13-atom key order. The square-state alphabet conjunction was formulated after `EPIPHANY SEEKS` was already known, so preserve the chronology caveat and do not treat this as a blind first discovery.**

## Independent inputs

The authenticated 2014 magic squares now recover the DH state from source metadata under the already fixed BASE29 representation. In particular, the equal-sum 1033 squares and the 3301 square supply:

```text
K=2, e=3, q=4, g=5, a=6, A=8, A-B=18, B=19
-K=27, -e=26, -g=24
```

These values are obtained from square orders, centers, and magic-sum digits before the p0 title is opened.

The original p0 source visibly supplies two red words of GP lengths **8+5** followed by the red thirteen-dot marker. The marker has physical column populations **4|5|4**. Agent14's matched-control result showed that, for the candidate residual, one exact H inverse makes the marker center column the state palindrome

```text
[q,A,B,A,q] = [4,8,19,8,4].
```

This test asks whether that center condition selects plaintext when charged against the full finite source-native lexical family rather than against a fixed target.

## Family charge

Use the exact original adjacent page-local 8+5 receiver family:

```text
19 manuscript receivers
```

Use the pinned solved/authenticated native-GP lexical control:

```text
18 distinct eight-rune words
38 distinct five-rune words
```

For every receiver and every ordered 8+5 lexical pair:

1. subtract the candidate plaintext from the untouched ciphertext modulo29;
2. apply the fixed reversible outside-in H inverse to the 13-value residual;
3. require marker positions4..8 to equal `[q,A,B,A,q]`.

Total charged family:

```text
19 * 18 * 38 = 12,996
```

Result:

```text
18 hits
all 18 are p0 word1-word2
all 18 have second word SEEKS
the first word ranges over all 18 eight-rune lexical controls
```

So the independently square-derived five-dot center condition alone recovers the second p0 red word **SEEKS** and the p0 receiver, while leaving the first eight-rune word unresolved.

The exact five-rune residual is then:

```text
[0,8,0,16,19] = [0,A,0,K-b,B].
```

Equivalently, applying H directly to the marker-center state palindrome gives that complete five-rune key:

```text
H([q,A,B,A,q])
= [0,2q,0,2A,B]
= [0,A,0,K-b,B]
= [0,8,0,16,19].
```

Subtracting it from the untouched second red word gives **SEEKS** exactly.

## First-word discriminator from the same source object

The square metadata itself emits the finite residue alphabet

```text
{K,e,q,g,a,A,A-B,B,-K,-e,-g}
= {2,3,4,5,6,8,18,19,24,26,27}.
```

This set uses only authenticated square orders, center digits, sum digits, and the directly derived B relation. It excludes the later retrospective p,b cell lookup.

Charge the 18 marker-center survivors with one additional condition:

> every one of the eight first-word residual atoms must belong to that square-metadata alphabet.

Exactly one survivor remains:

```text
EPIPHANY SEEKS
```

with complete residual

```text
[26,24,8,19,27,24,18,3 | 0,8,0,16,19]
```

and exact H inverse

```text
[25,28,11,25 | 4,8,19,8,4 | 7,13,20,28].
```

The first eight residual atoms are all direct square-metadata state values:

```text
[-e,-g,A,B,-K,-g,A-B,e].
```

No other marker-center survivor has all eight first-word atoms inside the square-metadata alphabet.

## What changed

The p0 phrase already had several source-side selectors, including the independently frozen BASE29 square cell151 = `[5,6] = EPIPHANY SEEKS`. The unresolved objection was that the explicit 13-atom additive key order had been recognized after the phrase.

This experiment bypasses that ordering objection for plaintext selection. The marker-center condition recovers **SEEKS** over the complete 12,996-case family, and the independently emitted square-metadata value alphabet reduces the first-word ambiguity to **EPIPHANY**.

The chronology remains important. The alphabet-membership test was formulated after the target phrase was known, so this is a strong discriminating holdout rather than a blind historical discovery. The side-column serialization is still not independently generated, and no continuous p0 body inverse follows.

## Reproduction

```text
node sims/lp2_p0_marker_center_plaintext_selector_sft.cjs
```

Windows Node22 PASS: workflow run **44478031775**.
