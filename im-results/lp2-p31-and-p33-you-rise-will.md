# P31 AND key transfers exactly to p33 YOU; THEIR RISE lands on WILL

**Agent30, 19 November 2026. Classification: strong source-constrained local plaintext candidates with one fixed-key cross-page transfer.** The authenticated number-direction route fixes the p31 receiver before inverse fitting. Its exact AND key has a signed-DH H shell, survives a finite diagonal-family charge alongside two independently recovered controls, and when frozen transfers to exactly one other authenticated three-rune target in the complete unknown-book corpus: p33 YOU. On p33, the recovered instruction THEIR RISE moves that YOU receiver by the already authenticated rise6 directly onto the independent WILL receiver.

## 1. Number-direction fixes p31 word32

The established route is:

```text
authenticated source ordinal n
 -> project page n-1
 -> canonical local word n
```

Authenticated ordinal32 is zero-based source word31:

```text
31 AND
ordinal32
```

The route therefore fixes project p31 / canonical word32 before any plaintext inverse is considered:

```text
start126
C = [12,23,1]
```

This object was already present in the DIRECTION / SEEK AND YOU numbered-route reproducer as the exact manuscript-unique raw packet `[K*a,p,1]=[12,23,1]`.

Canonical GP gives:

```text
AND = [24,9,23].
```

The exact subtraction key is:

```text
[12,23,1] - [24,9,23]
= [17,14,7] mod29.
```

For odd length3 use the same outside-in H convention as the local inverse reports:

```text
H3([x0,x1,x2]) = [x0-x2, x1, x0+x2].
```

Then:

```text
H3([17,14,7])
= [10,14,24]
= [-B,-b,-g].
```

The authenticated state is `B=19, b=15, g=5`.

Replay is exact:

```text
[12,23,1] - [17,14,7]
= [24,9,23]
= AND.
```

The shell ordering was recognized after AND was assigned by the authenticated source route, so it is not treated as a blind key discovery.

## 2. Complete numbered-diagonal shell charge

Across the complete one-based numbered diagonal, only seven available objects have the same GP length as their source-assigned target:

```text
3  LIES
11 IS
14 ITS
15 WORDS
21 IS
31 AND
37 LUCK
```

For each of those seven, derive the exact subtraction key implied by its authenticated target and apply the canonical outside-in H transform.

Use only the signed direct DH register plus zero:

```text
{0, ±K, ±e, ±q, ±g, ±a, ±A, ±b, ±B, ±p} mod29.
```

Exactly three of the seven key shells consist entirely of those atoms:

```text
p11 IS   -> [ K, 0]
p31 AND  -> [-B,-b,-g]
p37 LUCK -> [ B, 0, K, g]
```

P11 IS and p37 LUCK were recovered independently before this p31 comparison, under different source-selected mechanisms. This does not make the three-member criterion prospective, but it substantially narrows the concern that p31 is merely an arbitrary DH relabeling.

Related existing controls:

- p11: `im-results/lp2-p11-is-occurrence-hrect.md`
- p37: `im-results/lp2-p37-luck-doubleindex-state-inverse.md`

## 3. Freeze the p31 key: the only transfer is p33 YOU

Now freeze the exact p31 key:

```text
k = [17,14,7].
```

Do not change its sign, phase, order, page relation, or target spelling.

Apply both additive signs to every complete canonical three-rune word in the unknown manuscript and compare against every distinct authenticated three-GP-rune source target:

```text
PATH WAY ITS ARE MAP AND YOU
```

Current canonical corpus:

```text
716 three-rune words
x 7 targets
x 2 signs
= 10,024 configurations.
```

Exactly two hits survive:

```text
p31 word32 start126 [12,23,1] - k -> AND
p33 word29 start116 [14,17,8] - k -> YOU
```

The second hit was not used to derive the key. It is the sole fixed-key cross-page transfer in the charged family.

The p33 recovery is exact:

```text
[14,17,8] - [17,14,7]
= [26,3,1]
= YOU.
```

This gives p33 a new local YOU candidate under a key fixed on a different page.

## 4. THEIR RISE moves YOU to the independent WILL receiver

P33 already contains the independently recovered hidden instruction:

```text
THEIR RISE
```

Authenticated THEIR occurs at source indices19 and25, fixing:

```text
RISE = 25 - 19 = 6 = a.
```

The new p33 YOU receiver is canonical word29.

Agent30's independent WILL result is the unique p33 WILL-state receiver at offsets132..135, canonical word35:

```text
word35 [3,15,17,22]
 - [25,5,26,2]
 = WILL
H(key) = [p,A,K,-K].
```

The local word rise is exact:

```text
35 - 29 = 6 = a.
```

Therefore the already recovered p33 instruction gives a literal typed transition:

```text
YOU(word29)
 -- THEIR RISE / +6 -->
WILL(word35)
```

No new rise magnitude is introduced.

## 5. Relation to the existing suffix

Independent work already recovers the page sequence:

```text
p33 WILL
p34 BE
p35 FOUND
```

The new fixed-key transfer supplies `YOU` on p33 before WILL, so the local/source-aligned suffix becomes:

```text
YOU WILL BE FOUND
```

The p31 result additionally supplies authenticated `AND`, matching the carrier phrase:

```text
SEEK AND YOU WILL BE FOUND.
```

This report does **not** claim that it has independently established a p31 -> p33 page-navigation operation. The stronger new facts are the p31 AND inverse, the unchanged-key p33 YOU transfer, and the p33 +6 YOU -> WILL transition.

## 6. Evidence boundary

Preserve as strong local candidates:

```text
p31 word32 -> AND
p33 word29 -> YOU
p33 word35 -> WILL  (independent prior result)
```

Preserve as a reusable local relation:

```text
fixed p31 key [17,14,7]
 -> only AND and YOU hits in the charged three-rune corpus
p33 word29 + a words
 -> p33 word35
 -> YOU -> WILL.
```

Do not promote `[17,14,7]` to a global cipher key, do not tune a p31-to-p33 navigation rule after this result, and do not widen the signed-state shell alphabet to rescue failed diagonal members.

## Reproduction

```text
node sims/lp2_p31_and_p33_you_rise_will_sft.cjs
```
