# Authenticated OPENPGP hex stride selects a source-word modulus ladder and reconstructs the DH23 state

**Agent22, 19 November 2026. Classification: source-constrained state reconstruction with a finite parser/radix/origin charge. This does not recover unknown LP2 plaintext or establish a global cipher.**

## Result

The authenticated 2016 signed message ends:

```text
Beware false paths.  Verify OpenPGP 7A35090F.
```

The literal `OPENPGP` label makes hexadecimal radix 16 source-visible. Tokenizing the signed cleartext as alphabetic words, `OPENPGP` is zero-based word 42. Walking backward by one hexadecimal radix gives:

```text
42 OPENPGP
26 NUMBERS
10 PRIMUS
```

So the previously observed 16-spaced `PRIMUS / NUMBERS / OPENPGP` triad is selected from the authenticated source without opening the LP2 table or unknown ciphertext. In discovery order the labels supply natural moduli:

```text
OPENPGP -> 16
NUMBERS -> 60 (with the documented drop-f 59 interpretation charged as the rival)
PRIMUS  -> 29
```

Treat the printed OpenPGP key ID as the hexadecimal integer

```text
N = 0x7A35090F = 2050296079.
```

Under the conventional base60 branch:

```text
N mod 16 = 15 -> WORDS
N mod 60 = 19 -> THEIR
N mod 29 = 23 -> ROAD
```

These are exactly the three signed-message word positions independently assigned by the 69,120-case source-role audit to the DH fields

```text
b = 15
B = 19
p = 23.
```

The three residues are themselves an arithmetic progression:

```text
19 - 15 = 23 - 19 = 4.
```

So the same route reconstructs `q=4` without another search. Zero-based signed word 4 is **EMPTY**, and its canonical Gematria value closes the product identity:

```text
GP0(EMPTY) = 92 = 23 * 4 = p*q.
```

The drop-f base59 rival gives `N mod 59 = 0`, changing the middle landing to `HELLO`. It therefore fails the same independently defined role target.

## Eight-column word-map interpretation of the hex stride

A later Agent46 synthesis supplies a geometric reason for the 16-word stride used above.

The authenticated source's zero-based words occupy the same 8-column address geometry as the original p50 table. Its central clue self-describes that layout: ITS WORDS ARE THE MAP / THEIR MEANING IS THE ROAD / AND THEIR NUMBERS ARE THE DIRECTION.

The prospectively selected p0 EA109 receiver is raw XY. H on its GP-prime weights gives [K,g]=[2,5], so literal X=column,Y=row selects source address:

    g*8 + K = 5*8+2 = 42 = OPENPGP.

Now the native OpenPGP hexadecimal radix has a direct geometric meaning:

    16 = K*8.

Subtracting one hex radix means moving upward K=2 rows while holding X=K fixed. The source stride is therefore:

    (K,g) = (2,5) = 42 OPENPGP
    (K,e) = (2,3) = 26 NUMBERS
    (K,1) = (2,1) = 10 PRIMUS.

The first transition also satisfies g-K=e. Thus the OPENPGP/NUMBERS/PRIMUS ladder is a literal XY map traversal, which materially strengthens the source-visible selection of the three moduli used below.

See im-results/lp2-signed2016-p50-xy-word-map.md and sims/lp2_signed2016_p50_xy_word_map_sft.cjs.

## Finite charge

The SFT charges four choices before accepting the route:

- alphabetic-only versus alphanumeric tokenization of the signed message;
- backward versus forward stride from the source-fixed `OPENPGP` anchor;
- base59 versus base60 for the `NUMBERS` modulus;
- zero-based versus one-based word positions.

This gives 16 configurations. Exactly one produces both the source-selected `OPENPGP / NUMBERS / PRIMUS` stride chain and the independently audited `WORDS / THEIR / ROAD` role packet:

```text
alphabetic-only / backward / base60 / zero-based.
```

This is a finite selector, not a probability claim.

## State reconstruction

From the selected residues alone:

```text
b=15, B=19, p=23.
```

The standard DH equation `B = g^b mod p` has exactly one solution over `1..p-1`:

```text
g = 5.
```

The inverse exponent is likewise fixed:

```text
e = b^-1 mod (p-1) = 3.
```

The source-selected triad then supplies an independent p50 cross-check through the already promoted whole-word `GP0 -> zero-based p50 cell` primitive. In source order:

```text
word       GP0   p50 token   base60 mod29
PRIMUS      62      24             8
NUMBERS     83      3D            19
OPENPGP     75      2v             3
```

Thus the p50 packet is exactly:

```text
[A,B,e] = [8,19,3].
```

The middle and final coordinates independently reproduce `B=19` and `e=3` obtained from the key-ID modulus ladder. With `g=5`, `p=23`, and `A=8`, the equation `A=g^a mod p` has the unique solution:

```text
a = 6.
```

The DH shared secret follows without an additional fit:

```text
K = A^b mod p = B^a mod p = 2.
```

There are exactly two 16-word hops between `PRIMUS` and `OPENPGP`, giving a source-visible checksum equal to `K=2`.

The reconstructed state is therefore:

```text
p=23, q=4, g=5, a=6, b=15, A=8, B=19, K=2, e=3.
```

Those reconstructed values regenerate the independently audited signed-source role map directly:

```text
index/value   source word     role
2             PATH            K
3             LIES            e
4             EMPTY           q
5             EPIPHANY        g
6             SEEKS           a
7             THE             g+K
8             DEVOTED         A
15            WORDS           b
19            THEIR           B
23            ROAD            p
```

The first seven values occupy the contiguous source interval 2..8, while the key-ID residue packet selects 15,19,23 with constant step q=4.

This is the same state previously recovered from p28/DH geometry and independently audited signed-message word roles, reached here by a complete source-visible operation rather than coordinate-wise expression fitting to the key-ID nibbles.

## q-spaced source phrase closure

The recovered `q=4` and `K=2` give a second finite source-only consequence using the same promoted whole-word p50 operator.

Apply `GP0 -> p50 cell -> base60 value mod29 -> signed-source word index` to the key-ID residue roles:

```text
WORDS -> GP0 52 -> p50[52]=1Q -> 86 mod29=28 -> THE
THEIR -> GP0 34 -> p50[34]=3H -> 197 mod29=23 -> ROAD
ROAD  -> GP0 54 -> p50[54]=2a -> 156 mod29=11 -> IS
```

The raw image is therefore `THE ROAD IS`. Rotate that three-word packet left by the already reconstructed shared secret `K=2`:

```text
THE ROAD IS -> IS THE ROAD
```

`IS THE ROAD` is the exact contiguous authenticated source phrase at indices 21..23.

This transition has a finite source-family control. Keep the step fixed at the independently recovered `q=4`. There are 35 three-term `q`-spaced triples in the 43-word authenticated message. Applying the same p50/base60/mod29 operator and the same `K=2` rotation to every triple yields exactly one output that occurs as any contiguous signed-source trigram:

```text
input indices 15,19,23 : WORDS THEIR ROAD
raw image              : THE ROAD IS
K=2 rotation           : IS THE ROAD
output indices          : 21,22,23
```

No English scoring or unknown LP2 ciphertext participates in this test. It materially strengthens the reading that the authenticated prose is encoding an executable state/navigation grammar around `WORDS / THEIR / ROAD`.

## Why this changes the OPENPGP evidence

The earlier key-ID report and Director #1786 correctly downgraded coordinate-by-coordinate H-shell descriptions such as `7=g+K` because many complete expression templates fit the known state. That negative result remains valid for the H-shell template family. The present mechanism bypasses that family entirely and does not use those coordinate descriptions. It uses one source-fixed integer, one source-fixed anchor, a source-visible radix stride, three source-selected labels, and a charged radix/origin/parser family.

The key ID can therefore be retained as a genuine source of the `(b,B,p)` packet under this modulus-ladder mechanism. The p50 triad independently supplies `(A,B,e)` and closes the remaining DH fields.

## Evidence boundary

This result establishes a source-constrained state reconstruction. It does not by itself specify which unknown LP2 rune interval consumes the state, a lossless decryption operation, or unknown plaintext. The p50 cross-check was already known before this source selector was found, so it is an independent structural corroboration rather than a chronologically blind holdout.

A next decisive step should use this now-fixed state to make one prospective receiver or key-fragment prediction before opening the target. Do not return to free coordinate-expression fitting of `7A35090F`.

## Reproduction

Run:

```text
node sims/lp2_openpgp_hexstride_modulus_ladder_sft.cjs
```

The SFT reads the preserved authenticated signed payload and canonical 256-cell p50 table, charges all 16 configurations, reconstructs the state, asserts the p50 packet and DH closure, and exhausts all 35 q-spaced source triples for the unique `IS THE ROAD` phrase transition.
