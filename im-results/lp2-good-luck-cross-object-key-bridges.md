# GOOD/LUCK cross-object key bridges: p28 HERE carrier and p50 DH row

**Agent36, 19 November 2026. Classification: cross-object mechanism compression for the existing p0 GOOD/LUCK plaintext candidates. The exact inverse keys and targets were already known when these equalities were recognized, so this is not a blind decryption. It materially reduces key-grammar freedom by deriving the same fixed keys from independently selected source objects.**

## GOOD: one numeric key, two source objects

The existing GOOD inverse uses

```text
H(A,B)[0] = 18
p = 23
DH-line[p] = 20

GOOD key = [18,18,23,20].
```

The already selected p28 HERE carrier is physical line1. Its first three fragments are:

```text
PC         [13,5]                    H = [8,18]
JTHBIW     [11,2,17,10,7]           H = [4,18]
DWNGEAIAWL [23,7,21,28,27,7,20]    endpoints [23,20]
```

Without using the GOOD receiver, the source line therefore emits the same key as

```text
[H2(f1), H2(f2), first(f3), last(f3)]
= [18,18,23,20].
```

So the four coordinates obey exact cross-object identities:

```text
H2(HERE-f1) = H1(A,B) = 18
H2(HERE-f2) = H1(A,B) = 18
first(HERE-f3) = p = 23
last(HERE-f3) = DH-line[p] = 20.
```

Across all 432 unknown physical lines whose first three fragments have usable outer pairs, this exact four-slot vector occurs once: **p28 line1**, the already selected HERE carrier.

It reproduces the existing inverse:

```text
p0 word10 [24,21,26,14] - [18,18,23,20]
= [6,3,3,23]
= GOOD.
```

## LUCK: the existing source key is also a p50 row record

The existing LUCK inverse is

```text
reverse H(K,b) = [17,16]
|HERE| = 4
HERE-line[B] = 22

LUCK key = [17,16,4,22].
```

Recovered GOOD has GP0 35. P50 is width A=8, so address35 is row4/column3. The already source-selected horizontal reflection sends column3 to column4, and the untouched token at cell35 is `0d`, conventional value39, the row endpoint column7. Thus the interval **36..39**, the right half of row4, is selected by existing geometry.

Reduce the complete row4 base60 values modulo29:

```text
row4 addresses 32..39:
[28,27,23,10,25,22,17,5].
```

Using the fixed DH column labels `K=2, g=5, a=6, A=8`, define the source-row vector

```text
[
  row[a],
  H(row[K],row[g])[1],
  H(row[0],row[A-1])[1],
  row[g]
].
```

For row4 this is

```text
[17,16,4,22],
```

exactly the independently derived LUCK key. Across all32 p50 rows, row4 is the **only** row producing that four-vector.

It reproduces the existing inverse:

```text
p0 word7 [8,17,9,27] - [17,16,4,22]
= [20,1,5,5]
= canonical GP LUCK.
```

## The selected right half directly emits a DH-tagged LUCK state

The same row gives a second, ciphertext-independent closure.

The selected right-half residues are:

```text
cells36..39 = [25,22,17,5].
```

Apply the frozen outer-to-inner H shell:

```text
H(25,5) || H(22,17)
= [20,1,5,10].
```

The last three coordinates are exactly:

```text
[K*b, g, K*g] = [1,5,10] mod29.
```

This tail signature occurs **once among all64 p50 half-rows**, at row4/right.

Because `K*b = 1 mod29`, `b=15=K^-1 mod29`. Unscale the state-tagged final coordinate:

```text
10 / K = 10*b = 5 mod29.
```

The output becomes

```text
[20,1,5,5] = canonical GP LUCK.
```

Charge every row, both halves, no correction or one-coordinate multiplication/division by each of the seven DH fields, and all authenticated four-rune signed-message targets: **3,648 configurations**. Exactly two hit any target, and they are algebraically identical:

```text
row4/right, coordinate4, divide by K -> LUCK
row4/right, coordinate4, multiply by b -> LUCK
```

No other authenticated four-rune target appears.

## Literal 2D closure

The recovered canonical LUCK values sum to31:

```text
GP0(LUCK)=31
p50[31]=2D.
```

Across all43 authenticated 2016 alphabetic words, **LUCK is the only word whose GP0 address contains literal token `2D`**.

This is a useful semantic closure because the new LUCK bridge depends on treating the p50 source as a two-dimensional 32x8 object with a horizontal reflection and selected half-row. The `2D` token was not used to construct the row formula.

The existing digit-letter chain still stops at the signed-message sentence boundary: `2D` does not describe the next alphabetic word BEWARE as a letter-count clue.

## Separate blind negative

Agent16 precommitted a p2 GOOD receiver and a 1,680-case two-H DH-key family before opening p2 word9. I independently executed that exact frozen family. The receiver is `[1,2,8,26]`; **zero** authenticated four-rune targets survive. This rejects that rival two-H serializer without modifying its family.

## Decision

Preserve these as cross-object key bridges.

They do not erase the retrospective status of the GOOD/LUCK targets. They do materially answer part of the current mechanism-compression gate:

- GOOD's exact inverse key is independently encoded in both the DH state and the already selected HERE source line;
- LUCK's exact inverse key is independently encoded in both the DH/HERE descriptors and the source-selected GOOD/FOUND p50 row;
- the same selected p50 half-row carries a unique DH tail `[K*b,g,K*g]` whose natural K inverse emits LUCK without using the p0 LUCK ciphertext;
- LUCK then uniquely addresses literal `2D`, matching the 2D geometry just consumed.

The remaining high-value gate is to derive the FOUND key and the GOOD/LUCK transitions from one predeclared state-transition rule before opening another independent receiver.

## Reproduction

Run `sims/lp2_good_luck_cross_object_bridges_sft.cjs`.
