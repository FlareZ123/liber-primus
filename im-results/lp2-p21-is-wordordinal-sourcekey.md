# P21 same-index receiver recovers IS from its source-word ordinal

**Agent45, 19 November 2026. Classification: strong local plaintext candidate with a second independent family hit.** The authenticated source-number route selects physical p21 and target `IS`. The already defined same-index `(GP length, GP0)` receiver class selects one p21 ciphertext word before any key fit. That receiver's own zero-based printed-word ordinal is 33; authenticated source word33 is `WILL`, whose GP0 modulo29 supplies the exact H-rectangle scalar needed to recover `IS`. The same rule independently reproduces the existing p34 `BE` candidate and no other member of the complete receiver family.

## Source-selected receiver

The authenticated 2016 source fixes:

```text
index21 = IS
IS = [10,15]
GP length = 2
GP0 = 25
```

Under the established number-as-page convention, select physical p21. Among complete canonical p21 words, exactly one has the same GP length and GP0:

```text
p21 zero-based word33
offsets170..171
C = [24,1]
length = 2
GP0 = 25
```

This receiver was already part of the finite same-index state census reported by the p6 SEEKS work. No key property is used to select it.

The raw ciphertext has a second target-independent property:

```text
H([24,1])
= [24-1,24+1] mod29
= [23,25]
= [p,p+K].
```

Across all **465** complete two-rune words on unknown LP2 pages, the exact raw packet `[24,1]` occurs once and the exact H-shell `[23,25]` occurs once: this p21 receiver.

## Receiver ordinal selects the source key scalar

The selected receiver is zero-based printed word33.

Use that ordinal directly in the already authenticated 43-word source:

```text
source word33 = WILL
WILL = [7,10,20,20]
GP0(WILL) = 57
57 mod29 = 28 = -1.
```

Reuse the established two-rune H-rectangle key grammar:

```text
H(key) = [s,0]
key = H^-1([s,0]).
```

With `s=28`:

```text
key = H^-1([28,0])
    = [14,15].
```

Subtract once:

```text
[24,1] - [14,15] mod29
= [10,15]
= IS.
```

Forward reconstruction is exact:

```text
IS + [14,15]
= [24,1].
```

The scalar is obtained from the source word chosen by the receiver's printed ordinal. There is no scan over state values, GP0 values, neighboring source words, or key coordinates.

## Complete same-index receiver-family charge

The finite source-index receiver class is:

1. authenticated source index `i` selects physical page `i`;
2. target is authenticated source word `i`;
3. on page `i`, admit every complete word whose GP length and GP0 equal the target's.

Across indices0..42 this produces eight receivers on seven pages:

```text
p6  SEEKS   one receiver
p11 IS      one receiver
p21 IS      one receiver
p33 WILL    one receiver
p34 BE      two receivers
p38 BEWARE  one receiver
p40 PATHS   one receiver
```

For every receiver whose word ordinal can address the 43-word source, charge:

- receiver ordinal interpreted zero-based or one-based;
- source word at that ordinal;
- scalar = that source word's GP0 mod29;
- key = `H^-1([scalar,0])`;
- both additive signs.

The full charge contains 28 executable configurations.

Exactly two recover their source-assigned target:

```text
p21 start170, ordinal0=33
source[33] = WILL
scalar=28
key=[14,15]
subtract -> IS

p34 start4, ordinal0=2
source[2] = PATH
scalar=10
key=[5,24]
add -> BE
```

Both hits use the already established zero-based source convention. The one-based ordinal rival produces zero hits.

## Independent p34 convergence

The p34 hit is useful because `BE` was recovered independently before this p21 rule was noticed.

For p34:

```text
C = [12,23]
source ordinal2 = PATH
GP0(PATH) = 39 = 10 mod29
H^-1([10,0]) = [5,24].
```

The family rule uses addition:

```text
[12,23] + [5,24]
= [17,18]
= BE.
```

Equivalently, subtraction uses the negated key:

```text
-[5,24] = [24,5] mod29.
```

That is exactly the p34 subtraction key previously obtained independently from the `THEIR RISE` scalar `B=19`:

```text
H^-1([B,0])
= H^-1([19,0])
= [24,5].
```

So the new word-ordinal/source-GP0 rule reconstructs the existing p34 numeric inverse through an independent source selector.

## Fixed-key control

The p21 key alone is not selective enough to carry the claim.

Hold `[14,15]` fixed over all 465 complete two-rune unknown words, the three distinct authenticated two-GP-rune targets `THE / IS / BE`, and both signs:

```text
465 x 3 x 2 = 2,790 configurations.
```

There are five lexical hits, including p21. Therefore the **source-selected receiver and receiver-ordinal key selector are essential**. The claim is not that `[14,15]` is a unique manuscript-wide key.

## Evidence boundary

Preserve p21 `IS` as a **strong local plaintext candidate**:

```text
signed index21 IS
-> physical p21
-> unique p21 length2 / GP0=25 receiver
-> receiver zero-based word33
-> authenticated source word33 WILL
-> GP0(WILL) mod29 = 28
-> H^-1([28,0]) = [14,15]
-> exact IS.
```

The complete receiver-family charge gives one second hit, p34 `BE`, and that hit exactly agrees with a previously independent p34 inverse.

The remaining chronology caveat is important: the word-ordinal/source-GP0 key rule was recognized after p21's source target and receiver were visible. No untouched equal-type receiver remains in the current seven-page family. Do not widen the rule to arbitrary page words, modulo source indices, neighboring ordinals, or other key shells. Promotion to authenticated unknown plaintext should wait for a new source-selected receiver that can be frozen prospectively.

## Reproduction

```text
node sims/lp2_p21_is_wordordinal_sourcekey_sft.cjs
```

The SFT reconstructs the signed source, canonical printed-word parsing, all same-index length/GP0 receivers, both ordinal origins, both signs, p21 raw-packet/shell uniqueness, and the p34 independent convergence.
