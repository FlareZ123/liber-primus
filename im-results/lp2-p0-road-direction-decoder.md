# P0 ROAD: the p50 number-direction ray generates the exact four-rune inverse

**Agent48, 19 November 2026. Classification: source-derived exact local inverse and strong retrospective cryptographic closure.** The receiver and plaintext word `ROAD` at p0 offsets105..108 were independently selected before the transform below was recognized. The transform now generates the exact additive key from original p50 material without subtracting the candidate plaintext. This closes the former local state-update gap. It does not establish a page-wide key schedule or recover an unseen arbitrary LP2 word.

## Frozen upstream receiver

Existing independent navigation fixes:

```text
p0 offsets103..104 = THE
p0 offsets105..108 = ROAD
```

For the second word the untouched ciphertext is:

```text
C = [16,8,25,27]
```

and canonical native GP29 ROAD is:

```text
ROAD = [4,3,24,23].
```

The same established route already tells us to read the four ROAD offset numbers as one-based p50 cells105..108. Their original printed tokens and base60 integers are:

| p50 cell | token | base60 | mod29 | floor(/29) |
|---:|---|---:|---:|---:|
|105|22|122|6|4|
|106|13|63|5|2|
|107|0V|31|2|1|
|108|3c|218|15|7|

Thus the residue lane is the independently reconstructed DH23 state packet:

```text
R = [6,5,2,15] = [a,g,K,b].
```

The base29 quotient lane is also state-shaped:

```text
Q = [4,2,1,7] = [q,K,1,g+K].
```

The crucial new clue is in the printed numbers themselves.

## Their numbers are the direction

Interpret each token's first printed base60 character as a small integer:

```text
22  13  0V  3c
 2   1   0   3
```

This gives:

```text
P = [2,1,0,3].
```

It is a complete permutation of the four positions and is self-inverse. That makes the authenticated instruction `THEIR NUMBERS ARE THE DIRECTION` operational on the already selected ROAD ray: the visible leading numbers specify how to reorder the four state values.

Use the already fixed reversible outside-in map:

```text
H([x0,x1,x2,x3])
= [x0-x3, x0+x3, x1-x2, x1+x2] mod29.
```

Apply the visible direction before and after H:

```text
P(R)
= [2,5,6,15]
= [K,g,a,b]

H(P(R))
= [16,17,28,11]

P(H(P(R)))
= [28,17,16,11]
= [-1, B-K, B-e, B-A].
```

The first coordinate is the unique boundary marker `-1 mod29`. The independently recovered DH23 state satisfies:

```text
29 = p + g + 1.
```

Therefore the state transition selected by that marker is:

```text
-1 - g = p  (mod29)
28 - 5 = 23.
```

Replace only that marked coordinate:

```text
T = [23,17,16,11]
  = [p, B-K, B-e, B-A].
```

Apply H once more:

```text
H(T)
= [12,5,1,4].
```

This is the exact additive key. The original ciphertext now decrypts directly:

```text
[16,8,25,27] - [12,5,1,4] mod29
= [4,3,24,23]
= R,O,A,D.
```

Forward reconstruction is exact.

## The same ray explains the signed source clause

The selected ray also compresses the authenticated source interval that names its role. From the independently fixed state:

```text
B          = 19
H([a,b])   = [20,21]
H([A,b])   = [22,23]
-g         = 24
```

so:

```text
[19,20,21,22,23,24]
= THEIR MEANING IS THE ROAD AND.
```

This is supporting semantic evidence rather than an extra key-generation step. The same source interval is independently exposed by the adjacent p0 DEVOTED receiver's physical 2|5 H readout.

## Bounded controls

### Four-layer inward rays

The 32x8 p50 rectangle has 56 straight inward four-layer normals. Exactly six have first characters forming any permutation of `0,1,2,3`.

Apply the frozen `P -> H -> P` construction to every such ray's base60 residue lane. Only cells105..108 produce a leading `-1` marker:

```text
[28,17,16,11].
```

The ROAD ray is also the only one of all56 whose four residues are all members of the independently reconstructed DH23 state set.

### Index/radix convention charge

At the fixed receiver numbers105..108:

- one-based base60 gives `P=[2,1,0,3]`, `R=[6,5,2,15]`, the `-1` marker, and ROAD;
- one-based base59 preserves the small permutation but gives `R=[4,4,2,12]` and no marker;
- the zero-based cells106..109 begin with `[1,0,3,0]`, so there is no direction permutation under either radix.

The decoder therefore selects the already established one-based base60 convention inside this charged family.

### P0 and manuscript-wide receiver controls

P0 has ten addressable complete four-rune words. Only the independently selected ROAD word at local start105 has a valid first-digit `0..3` permutation, and it is the sole marker hit.

Across all unknown p0..p55:

```text
complete four-rune words          514
page-local starts addressable     491
valid first-digit permutations     25
leading -1 marker hits              4
```

The four marker hits are local start105 on p0, p3, p20, and p31 because that start reads the same p50 ray and therefore generates the same key. Applying the generated key to all four original ciphertext words yields a source-native known word only once: p0 gives ROAD. The other three outputs are absent from the fixed solved-plus-authenticated source vocabulary.

### Marker correction freedom

Freeze the source-derived pre-correction packet:

```text
W = [28,17,16,11].
```

Charge both signs of every authenticated state scalar:

```text
{p,g,a,b,A,B,K,e,q,1}.
```

For each choice, alter only the marked coordinate, apply final H, decrypt the fixed original ROAD receiver, and compare with the finite solved-plus-authenticated four-rune vocabulary.

Exactly one case yields any known source-native word:

```text
step = -g
plaintext = ROAD.
```

### Operation-order freedom

Charge the natural finite family around the visible direction and fixed reversible map:

- optional pre-direction permutation;
- core `H` or `H^-1`;
- optional post-direction permutation;
- any coordinate equal to the boundary marker `-1`;
- either sign of every authenticated state scalar above;
- final `H` or `H^-1`.

Exactly one configuration produces any source-native four-rune word:

```text
pre P -> H -> post P -> marker0 - g -> H
```

and that word is ROAD.

## Five-rune direction extension (negative)

The p57 terminal red stencil has five columns, while the p50 table's leading base-60 digits range over `0..4`. This motivates one bounded question: does the exact ROAD receiver mechanism extend to five-rune words whose five corresponding p50 cells have a first-digit permutation of `0,1,2,3,4`?

The scan preserves the ROAD cell convention: a word at page-local rune offset *s* uses one-based p50 cells *s* through *s+4*. Across pages 0–55 there are **355** five-rune words, **348** addressable against the 256-cell table, and only **six** with the required five-digit permutation. They collapse to three repeated table windows:

| First cell | p50 tokens | Direction digits | Residues mod 29 | Quotients by 29 |
|---:|---|---|---|---|
| 113 | `1D 2N 3H 47 0s` | `[1,2,3,4,0]` | `[15,27,23,15,25]` | `[2,4,6,8,1]` |
| 170 | `3m 4E 0s 2S 1v` | `[3,4,0,2,1]` | `[25,22,25,3,1]` | `[7,8,1,5,4]` |
| 171 | `4E 0s 2S 1v 3T` | `[4,0,2,1,3]` | `[22,25,3,1,6]` | `[8,1,5,4,7]` |

For the minimal embedding of the frozen ROAD rule, omit the position whose direction digit is `4`, order the remaining four residues by direction digits `0..3`, apply the same `H4`, and return the four outputs to their original positions. **None** of the six candidates produces the boundary marker `28` (`-1 mod 29`), so the authenticated `-g` correction cannot even be invoked. The six rune-word transliterations are `LEIAHL`, `IATJM`, `JNGYEOA`, `HJLEAOE`, `FDREAG`, and `HDOTC`; none is a source-native plaintext.

This rejects only the simple five-cell embedding of the four-point ROAD decoder. It does **not** establish a five-symbol cipher, and it is not grounds for inventing an unconstrained `H5` or other transform. Keep the exact ROAD inverse local unless an independent clue selects a different receiver and operation.

## Decision

Promote p0 offsets105..108 from a source-selected ROAD receiver with a crib-implied key to a **source-derived exact local ROAD inverse**. The key is generated from original p50 cells105..108, their visible numeric direction permutation, the independently recovered DH23 state, and the fixed reversible H map.

Chronology still matters. ROAD was already selected when this transform was recognized, so this is strong retrospective cryptographic closure rather than a blinded plaintext discovery. The first frozen transfer was applied immediately to the independently selected p0 DEVOTED receiver at offsets237..243. Its one-based p50 cells print `3w 0W 29 2r 2O 2L 0g`, whose first digits are `[3,0,2,2,2,2,0]`; they do not form a seven-position direction permutation, so the ROAD rule does **not** transfer mechanically. Keep the decoder local. A bounded five-rune extension was also tested and failed to produce the boundary marker; do not generalize to an arbitrary five-symbol transform. A future promotion requires a different clue-selected receiver that independently supplies a compatible direction object.

## Reproduction

```text
node sims/lp2_p0_road_direction_decoder_sft.cjs
```


## Validation

Windows Node22 CI: **PASS, run 44478623548**.
