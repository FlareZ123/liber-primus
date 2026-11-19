# Signed OpenPGP key ID independently reconstructs the p28 DH state

**Agent22, 19 November 2026. Classification: authenticated-source state reconstruction. This uses the signed 2016 message, the already frozen H transform, the original p50 table, and the independently selected PRIMUS/NUMBERS/OPENPGP dual-radix source triad. It does not use p28 ciphertext values to recover the state.**

## 0. The raw nibbles already serialize the private state

Before applying H, the printed hex nibbles themselves are:

```text
[7,10,3,5,0,9,0,15]
=
[g+K, K*g, e, g, F, b-a, F, b].
```

They reconstruct:

```text
g = 5
b = 15
e = 3
K = 10 / 5 mod29 = 2
a = b - 9 mod29 = 6
```

with the independent raw checks `7=g+K` and the two literal zero fields.

The H shell then contributes `p=23` and independently re-encodes the same `g,K,a`. Thus the **key ID alone** already determines:

```text
p=23,g=5,a=6,b=15,K=2,e=3
A=g^a mod p=8
B=g^b mod p=19.
```

The PRIMUS/NUMBERS/OPENPGP triad described below is therefore an independent cross-check, not a required input for completing the state.

## 1. The signed key ID is an exact H-state packet

The authenticated 2016 message explicitly says:

```text
Verify OpenPGP 7A35090F.
```

Interpret the eight hexadecimal digits as nibbles:

```text
7 A 3 5 0 9 0 F
=
[7,10,3,5,0,9,0,15].
```

Apply the same outside-in H transform already established elsewhere:

```text
H(x,y) = (x-y, x+y) mod29.
```

The full shell is:

```text
H(7,15)  = [21,22]
H(10,0)  = [10,10]
H(3,9)   = [23,12]
H(5,0)   = [5,5]

=> [21,22,10,10,23,12,5,5].
```

This has the exact structural form:

```text
[p-K, p-1, K*g, K*g, p, K*a, g, g].
```

The values reconstruct themselves:

```text
p = 23
g = 5
K = 10 / g mod29 = 2
a = 12 / K mod29 = 6
```

and the first two coordinates validate:

```text
p-K = 21
p-1 = 22.
```

Then the DH public value is:

```text
A = g^a mod p = 5^6 mod23 = 8.
```

### Orientation control

Charge the same structural template across all 16 dihedral presentations of the eight printed nibbles: eight cyclic rotations in the printed direction and eight cyclic rotations after reversal.

Only the **printed, unrotated orientation** satisfies the packet constraints and reconstructs a valid `p,g,K,a` tuple.

## 2. The dual-radix source triad independently cross-checks A, B, and e

Independently, the complete authenticated-source p50/dual-radix word-boundary charge selects exactly:

```text
signed word index 10: PRIMUS
signed word index 26: NUMBERS
signed word index 42: OPENPGP
```

The indices are exactly 16 words apart.

Their raw p50 base60 outputs reduce mod29 to:

```text
PRIMUS  -> 8
NUMBERS -> 19
OPENPGP -> 3
```

The values exactly reproduce the state already reconstructed from the key ID:

```text
[A,B,e] = [8,19,3].
```

The base59 outputs independently reduce to:

```text
[6,16,0]
= [a, H(K,b)[0], F].
```

This is a second state channel produced by the same three source anchors.

## 3. The triad independently verifies b and the GCD inverse

Using the triad's independently supplied `B=19` with the key-ID values `p=23,g=5`, the unique exponent in `0..21` satisfying:

```text
g^b mod p = B
```

is:

```text
b = 15.
```

The triad's `e=3` then verifies:

```text
b*e mod(p-1)
= 15*3 mod22
= 1.
```

The base59 NUMBERS residue also checks:

```text
H(K,b)[0]
= 2-15 mod29
= 16.
```

So the authenticated 2016 material independently reconstructs the complete state:

```text
p=23
g=5
a=6
b=15
A=8
B=19
K=2
e=3.
```

This is exactly the state previously recovered through the p28 HERE/DH/GCD route.

## Why this matters

The signed OpenPGP key ID by itself is a materially different route to the same state, and the p50 triad independently cross-checks it.

The p28 branch had already supplied a coherent DH/GCD interpretation. The 2016 signed source now independently rebuilds the same parameters through:

1. a literal historical OpenPGP key ID;
2. the already established H operation;
3. a finite orientation charge;
4. the independently selected 16-word-spaced PRIMUS/NUMBERS/OPENPGP p50 triad.

That materially reduces the chance that the p28 state was a synthetic fit. It also gives a human-facing reason to treat **“Verify OpenPGP 7A35090F”** as cryptographic state material rather than only a signature-verification instruction.

The next high-value question is whether this source-reconstructed state determines the remaining local key-order rules, especially the NUMBERS-derived THEIR family and the PRIMUS-local WAY key, before another ciphertext target is opened.

## Reproduction

- `sims/lp2_openpgp_keyid_dh_state_reconstruction_sft.cjs`
