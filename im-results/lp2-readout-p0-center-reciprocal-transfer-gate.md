# READ OUT p0 receiver: center-cube / outer-reciprocal transfer gate

**Agent34, 19 November 2026. Classification: exact source-linked operator-transfer rejection. No plaintext or new key recovered.**

## Why this is the cheapest direct consumer

The current p28 route supplies an ordered GP29 power pair:

```text
[3,27]
```

On the p28 source object, exponent3 is applied to the distinguished singleton and exponent27 to the adjacent object. Since the nonzero elements of GP29 have order28,

```text
x^27 = x^-1 mod29
```

for every nonzero rune value.

The candidate instruction `READ OUT` independently selects p0 offsets80..102. That receiver has three exact properties already established before this test:

- 23 runes, equal to the reconstructed DH modulus;
- four complete printed words;
- exactly one `F=0`, at the exact center offset91.

This gives one direct, parameter-free transfer of the p28 power roles to the receiver geometry: cube the distinguished center singleton and reciprocal-invert every rune around it. No key schedule, rotation, modulus, word permutation, sign, or language score is introduced.

## Positive control

The implementation first reproduces the p28 source transform:

```text
input  [9,28,24,10,1,20]
power  [3,27,27,27,27,27]
output [4,28,23,3,1,16]
       READOUT
```

## Untouched p0 receiver

The selected p0 ciphertext is:

```text
[21,25,2,10,25,8,14,2,13,6,26,0,21,5,11,2,24,19,10,21,10,27,26]
```

Its sole zero is at the center, so every outer exponent27 operation is a genuine multiplicative reciprocal.

Applying the fixed source order gives:

```text
[18,7,15,3,7,11,27,15,9,5,19,0,18,6,8,15,23,26,3,18,3,14,19]
```

Canonical transliteration:

```text
EWSOWJIASNCMFEGHSDYOEOXM
```

Preserving the already printed word boundaries `3/7/5/8` yields:

```text
EWS / OWJIASNC / MFEGH / SDYOEOXM
```

None is an authenticated 2016 source word, and the complete output is not readable GP text.

## Decision

Reject this exact consumer:

```text
READ OUT -> p0 80..102
          -> center^3
          -> every outer nonzero rune^27
```

The source-supported `[3,27]` pair remains valid for the p28 READ OUT reconstruction. The selected p0 receiver remains a strong structural object. This exact center-versus-around transfer fails.

Do not rescue this branch with alternate exponent order, rotations, added H layers, fitted wordwise resets, or other schedules unless a new first-party clue selects them.

## Reproduction

```text
node sims/lp2_readout_p0_center_reciprocal_transfer_sft.cjs
```

Windows/Node22 PASS: run **44461903447**.
