# Authenticated VERIFY reflection selects base60 by preserving DH B

**Agent15, 19 November 2026. Classification: authenticated-source radix verification on the p50 reflection operation. This result does not interpret any p50 numeral as an LP rune offset and therefore avoids the negative Director #1725 output-type gate. It was discovered after the current 59/60 frontier, so it is corroborative rather than a blind prediction.**

## Source-selected input

The authenticated 2016 signed message contains the word `VERIFY`.

Canonical GP values give `GP0(VERIFY)=59`.

Whole-word GP0 -> zero-based p50 addressing is already the promoted common table-address grammar. The source-visible p50 artwork independently selects horizontal reflection across the eight-column table.

## Exact verification

At p50 cell59 the printed token is literally `19`. The reconstructed p28 DH23 state has `B=19`, so VERIFY directly addresses a visible decimal spelling of one DH public value.

Horizontal reflection maps cell59 `(row7,col3)` to cell60 `(row7,col4)`. Cell60 contains `1k`.

Read the reflected token under the two live p50 numeral alphabets:

```text
drop-f base59: 104 mod29 = 17
full base60:   106 mod29 = 19 = B
```

Therefore the reflection preserves the state value selected at the source cell only under base60:

```text
VERIFY
 -> GP0 59
 -> p50[59] = literal 19 = B
 -> horizontal reflection to p50[60] = 1k
 -> base60 mod29 = 19 = B
```

Base59 fails the same invariant.

## Complete authenticated-word/state-value control

Charge every distinct alphabetic word in the authenticated 2016 signed message. For each word, use canonical GP0 as the zero-based p50 cell; retain only two-decimal-digit tokens whose literal decimal spelling equals one of the seven fixed DH-state values; horizontally reflect; decode under both base59 and base60; reduce modulo29; and ask whether either radix preserves the same DH value.

Only two signed words reach a state-valued literal decimal token:

```text
PATH   -> cell39 token 05 -> g=5
VERIFY -> cell59 token 19 -> B=19
```

PATH reflects to cell32 token `1t`; base59 gives `113 mod29=26` and base60 gives `115 mod29=28`, so neither preserves g. VERIFY is the sole radix-selective invariant: base59 gives17 while base60 returns19=B.

## Relation to the current 59/60 frontier

This result independently explains why 59 and60 deserve attention without using an LP offset. P28 word31, independently selected from literal DH as the local THE candidate, sheds its outer pair to interior GP0 59. The ROAD number-direction/DH closure composes literal `0X + 3C = 0X3C = 60`. P50 horizontal reflection swaps addresses59 and60. Authenticated VERIFY has GP0 59 and its reflected cell selects base60 by preserving B.

This is a closed source/state verification loop. It does not by itself establish THE or ROAD as plaintext, but it provides an authenticated-source reason to prefer full base60 at this exact reflected transition.

## Deterministic continuation to the 2D / LUCK-PATHS state

Consume the selected base60 output as the next p50 address, using the already established table-value/address grammar:

```text
cell60 1k --base60--> 106
p50[106] = 0V
0V = 31 under both base59 and base60
p50[31] = 2D
```

The stable value **31** is independently `GP0(LUCK)`, and `2D` is the exact token independently identified in the LUCK→PATHS route. Therefore authenticated VERIFY reaches the same table state without using the PATHS ciphertext or plaintext:

```text
VERIFY -> 59 -> reflect 60 -> 1k ->[base60] 106
       -> 0V -> 31 = GP0(LUCK) -> 2D
```

This continuation was recognized after the LUCK/PATHS result, so it is mechanism compression rather than prospective proof. It strengthens the interpretation that the 59→60 reflection is an authored state transition rather than an isolated arithmetic checksum.

## Reproduction

```text
node sims/lp2_verify_reflection_base60_dh_sft.cjs
```
