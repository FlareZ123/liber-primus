# P33 [e,q]=[3,4] ternary four-axis map gate

**Agent11, 19 November 2026. Classification: bounded source-selected negative. No unknown plaintext, reusable key stream, or whole-body inverse is recovered.**

## Question

The current source route reaches physical p33 without using its body ciphertext, recovers **WORDS ARE THE MAP**, and reconstructs the fixed state pair

```text
[e,q] = [3,4].
```

The upper p33 black body contains exactly

```text
e^q = 3^4 = 81
```

runes. This suggests one finite reading that had not been charged in the existing p33 decoder gates: treat the 81 cells as a four-axis ternary map.

The direct family has no fitted phase or key:

- four ternary axes of length3;
- every axis permutation, `4! = 24`;
- every independent axis reflection, `2^4 = 16`;
- total `24 * 16 = 384` reversible coordinate readings.

A second family applies the independently selected p28 word operation

```text
x -> x^27 mod29
```

uniformly to all 81 runes before the same 384 coordinate readings. The exponent is already active on the source-selected p33 nine-rune object whose center becomes `READ`; it is not tuned from this 81-rune test.

## Fixed language control

Use the same native-GP trigram model as the existing p33 layout decoder gate, trained on published solved plaintext while excluding p56.

For solved training sections of length at least50 runes:

```text
worst solved score = -7.786288011034111
best solved score  = -7.124207545871312
```

The unchanged p33 upper body scores:

```text
raw = -10.72488684315568
```

## Direct 3^4 coordinate result

All 384 coordinate readings remain below the solved range.

Best member:

```text
axis permutation = 3201
reflection mask  = 0
score            = -10.445631687550863
```

Preview:

```text
EOSIARHTEAWHTEAXHIANAIAIEAAEDIATLGWGOEGMUSOWDWENMAELWJESARBNGISYEJFYWJFUJPNGOETHYOETHMAEJAEIAOTWWTHMUL
```

Number of candidates reaching even the worst long solved-text score:

```text
0 / 384
```

The best score improves over raw ciphertext by about0.2793 log units, while remaining about2.6593 below the worst solved control.

## Uniform ^27 then 3^4 coordinate result

The unchanged uniformly powered body scores:

```text
x^27 raw = -10.820524589285302
```

All 384 coordinate readings again remain below the solved range.

Best member:

```text
axis permutation = 3102
reflection mask  = 9
score            = -10.47360512048177
```

Preview:

```text
XRFAERHYWHISMAESFUHNLMAESYUTWEDNGREWUMHAEOEPCOTTHNGNGAEOYYTHAEIHTHAEEALBXJOECDEAWEATHLXJAEXAEAIAXTPLCOJ
```

Number reaching the worst solved score:

```text
0 / 384
```

## Decision

Retire these two exact p33 upper-body consumers:

1. `3^4` four-axis ternary coordinate permutation/reflection as a direct transposition;
2. the same coordinate family after uniform `x^27 mod29`.

The source relation `WORDS ARE THE MAP -> [e,q]=[3,4] -> 81=e^q` remains useful. The conditional nine-rune `READ` object also remains intact. These results only exclude whole-body readouts that use the most literal four-axis ternary geometry with either identity values or the already selected exponent27 value operation.

A future 81-rune consumer needs an additional source-visible instruction that changes the operation itself. Reordering axes, flipping ternary coordinates, or adding `^27` to this family should not be repeated.

## Reproduction

```text
node sims/lp2_p33_ternary4d_map_gate_sft.cjs
```
