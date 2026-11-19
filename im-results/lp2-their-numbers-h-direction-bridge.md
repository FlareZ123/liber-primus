# “THEIR NUMBERS ARE THE DIRECTION” becomes a literal H bridge into p39 and the two IS ciphertexts

**Agent45, 19 November 2026. Classification: source-to-ciphertext mechanism convergence, discovered retrospectively.** The authenticated 2016 message already reconstructs the full DH23 state from zero-based source word positions under the independently established source-only audit. A new ciphertext-facing interpretation makes its sentence

```text
ITS WORDS ARE THE MAP
THEIR MEANING IS THE ROAD
AND THEIR NUMBERS ARE THE DIRECTION
```

mechanically literal under the same frozen H transform used throughout the current LP2 route.

Two linked facts emerge:

1. the two source positions of the word `THEIR` are exactly `[19,25]`; p39's already frozen repeated-H red-title chain passes through `[19,25]` and the next H image is `[23,15]=[p,b]`;
2. the authenticated plaintext word `IS` satisfies `H(IS)=[24,25]=[AND,THEIR]`. Extending that adjacent source phrase by its immediate outer words `ROAD=23` and `NUMBERS=26` creates the two H pairs `[23,25]` and `[26,25]`; their exact H inverses are the manuscript-unique p21 and p11 ciphertext receivers.

Thus the source phrase itself predicts the unordered ciphertext pair:

```text
ROAD / THEIR    [23,25] -> H^-1 -> [24,1]  = p21 receiver
NUMBERS / THEIR [26,25] -> H^-1 -> [11,14] = p11 receiver
```

and the shared plaintext center is:

```text
AND / THEIR     [24,25] -> H^-1 -> [10,15] = IS.
```

The union reconstructs the contiguous authenticated span:

```text
ROAD AND THEIR NUMBERS
23   24  25    26
```

immediately before `ARE THE DIRECTION`.

## 1. Source-only baseline

The independent source audit already established the zero-based DH state directly from authenticated word positions:

```text
PATH=2       -> K
LIES=3       -> e
EMPTY=4      -> q
EPIPHANY=5   -> g
SEEKS=6      -> a
DEVOTED=8    -> A
WORDS=15     -> b
first THEIR=19 -> B
ROAD=23      -> p
DIRECTION=29 -> GP modulus marker
```

across a 69,120-case sentence-structured role family. This report does not re-establish that result; it uses the independently fixed values only as labels for newly observed source/H/ciphertext relations.

## 2. THEIR occurs at exactly 19 and 25

The authenticated 43-word source has five repeated word types:

```text
THE   -> [1,7,12,17,22,28]
IS    -> [11,21]
ARE   -> [16,27]
THEIR -> [19,25]
AND   -> [24,31]
```

Among words occurring exactly twice:

```text
IS    [11,21] -> H = [19,3] = [B,e]
ARE   [16,27] -> H = [18,14]
THEIR [19,25] -> H = [23,15] = [p,b]
AND   [24,31] -> H = [22,26]
```

Only `IS` and `THEIR` map both coordinates directly onto the independently fixed DH state values.

The literal phrase “THEIR NUMBERS” therefore has an exact source-native object:

```text
THEIR positions = [19,25].
```

Applying frozen H gives:

```text
H([19,25])
= [19-25,19+25] mod29
= [23,15]
= [p,b].
```

## 3. P39 already traverses THEIR numbers

The independently selected p39 red title is:

```text
[27,5,15]=[-K,g,b].
```

Repeated H on its first two runes was already frozen before the new source-position interpretation:

```text
[27,5]
 -> [22,3]
 -> [19,25]
 -> [23,15].
```

The middle and final states now have a literal source reading:

```text
[19,25] = the two source positions of THEIR
[23,15] = H(THEIR positions) = [p,b].
```

So p39 does not merely happen to contain the numeric pair `[19,25]`. Its repeated-H state transition performs exactly:

```text
THEIR NUMBERS
 -> [p,b]
```

inside a page already selected by the solved circumference route.

This gives a direct mechanical realization of the signed instruction that their numbers are the direction.

## 4. IS maps to the middle of ROAD AND THEIR NUMBERS

Canonical GP29 values give:

```text
IS=[10,15]
H(IS)
=[10-15,10+15] mod29
=[24,25].
```

Authenticated source words24 and25 are:

```text
24 AND
25 THEIR.
```

So the target word `IS` itself maps under H to the adjacent phrase `AND THEIR`.

Among distinct authenticated source words whose GP encoding has exactly two runes, the complete set is:

```text
THE -> H = [13,20]
IS  -> H = [24,25]
BE  -> H = [28,6]
```

`IS` is the only one whose two H coordinates are adjacent authenticated source positions.

The immediate source context is:

```text
23 ROAD
24 AND
25 THEIR
26 NUMBERS
27 ARE
28 THE
29 DIRECTION.
```

Holding the second H coordinate `THEIR=25` fixed, replace `AND=24` by the immediate outer words of the adjacent phrase:

```text
left  boundary pair = [ROAD,THEIR]    = [23,25]
right boundary pair = [NUMBERS,THEIR] = [26,25].
```

Frozen H inverse gives:

```text
H^-1([23,25]) = [24,1]
H^-1([26,25]) = [11,14].
```

These are exact unknown-ciphertext words.

## 5. The predicted ciphertexts are manuscript-unique

Across all **465** complete two-rune words on unknown LP2 pages:

```text
[24,1] occurs once:
  p21 zero-based word33, offsets170..171

[11,14] occurs once:
  p11 zero-based word11, offsets49..50.
```

Those are exactly the two existing source-selected `IS` receivers.

Charge the two possible assignments of the source-predicted ciphertext pair to the two source-number pages p11 and p21:

```text
assignment A:
p11=[24,1], p21=[11,14] -> 0/2 hits

assignment B:
p11=[11,14], p21=[24,1] -> 2/2 hits.
```

Only the observed assignment matches either selected page.

Equivalently in H space:

```text
p21 C=[24,1]  -> H(C)=[23,25]=[ROAD,THEIR]
IS   P=[10,15] -> H(P)=[24,25]=[AND,THEIR]
p11 C=[11,14] -> H(C)=[26,25]=[NUMBERS,THEIR].
```

Reading the varying first coordinate around the fixed `THEIR` coordinate reconstructs:

```text
ROAD -> AND -> NUMBERS
 23      24       26
```

while the invariant second coordinate supplies `THEIR=25`, giving the exact contiguous source phrase:

```text
ROAD AND THEIR NUMBERS.
```

## 6. Relation to the two local keys

The same source geometry explains the H shells of both local decryption keys.

For p21:

```text
H(C)-H(P)
=[23,25]-[24,25]
=[28,0]
=[-1,0].
```

For p11:

```text
H(C)-H(P)
=[26,25]-[24,25]
=[2,0].
```

Thus the previously recovered H scalars `28=-1` and `2=K` are exactly the source-index displacements from `AND=24` to the two outer boundary words:

```text
24 -> 23 ROAD     displacement -1 = 28 mod29
24 -> 26 NUMBERS  displacement +2.
```

The key shells are therefore source-phrase offsets, not free constants.

The independent helper-page architecture remains useful corroboration because it recovers the same scalars through p57 and p25. The boundary construction is simpler as an intended human operation once `IS`, H, and the authenticated sentence are in view.

## 7. Evidence boundary

This pattern was recognized after both p11 and p21 local `IS` candidates were known, so it is not a blind ciphertext prediction in repository chronology. The finite family charge is nevertheless sharp:

- `IS` is uniquely adjacent under H among authenticated two-GP-rune words;
- its source context uniquely fixes `ROAD AND THEIR NUMBERS`;
- H inverse of the two boundary pairs fixes two exact ciphertext words with no key search;
- both predicted words occur exactly once among 465 complete two-rune unknown words;
- the two possible p11/p21 assignments have hit counts 0 and2;
- p39 independently traverses the literal `THEIR` position pair and its H image `[p,b]`.

Preserve this as a **source-derived reconstruction of the two IS key shells and a literal p39 interpretation of “THEIR NUMBERS ARE THE DIRECTION.”** A future untouched source-selected two-rune target would be needed to upgrade the boundary rule from retrospective reconstruction to prospective cipher law.

## Reproduction

```text
node sims/lp2_their_numbers_h_direction_bridge_sft.cjs
```

Upstream source-only state audit:
`im-results/lp2-signed2016-word-position-dh.md`.
