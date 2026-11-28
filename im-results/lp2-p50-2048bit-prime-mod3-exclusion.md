# P50 256-byte object: all-order 2048-bit prime / DH-modulus exclusion

## Classification

**Exact finite exclusion for the two surviving byte codecs.**

The p49–51 numerical object contains exactly 256 cells. A natural
cryptographic interpretation is therefore one 2048-bit integer, for example a
Diffie–Hellman prime/modulus, after choosing a byte serialization.

This report closes that interpretation for both live source codecs without
searching byte orders.

## Inputs

Canonical table: `resources/liber-primus/lp2-grid-256.json`.

Two byte codecs remain relevant in repository work:

- full base60 alphabet
  `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`;
- the source-motivated base59 variant obtained by omitting `f`.

Both decode all 256 printed tokens to values in 0..255.

Exact multiset statistics:

| codec | min | max | sum | sum mod3 |
|---|---:|---:|---:|---:|
| base60 | 0 | 255 | 33,006 | 0 |
| base59 | 0 | 251 | 32,499 | 0 |

Each has 161 distinct decoded values.

## All-order theorem

Let the 256 decoded bytes be `b_0,...,b_255` in **any** permutation, and
interpret them as a base-256 integer

`N = Σ b_i 256^i`.

Because

`256 ≡ 1 (mod 3)`,

every power `256^i ≡ 1 (mod3)`, hence

`N ≡ Σ b_i (mod3)`.

The byte sum is invariant under every row/column traversal, reversal,
transpose, snake, arbitrary permutation, or endian choice.

For both source codecs the sum is 0 mod3. Therefore **every possible ordering
of all 256 decoded bytes produces an integer divisible by 3**.

The object is vastly larger than 3 under either codec, so no such integer is
prime. In particular it cannot be a 2048-bit DH prime or safe prime under the
ordinary byte-string interpretation.

## Scope

This does not exclude:

- treating only a subset of cells as an integer;
- transforming individual bytes before integer assembly;
- interpreting the object as an RSA-like composite modulus (although an
  intended cryptographic modulus with the trivial factor3 would be degenerate);
- non-byte token arithmetic.

It does eliminate the whole family “choose a clever traversal/endian order so
the 256 decoded bytes themselves become a prime modulus” simultaneously for
base59 and base60.

## Reproduction

Run:

`node sims/lp2_p50_2048bit_prime_mod3_exclusion_sft.cjs`.
