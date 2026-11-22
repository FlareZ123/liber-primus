# p50 base-60 byte table: linear-recurrence gate

## Question

Could the 256 values printed across pp49–p51 be a short linear-feedback keystream or a low-degree linear recurrence whose output can be continued to supply LP2 key material?

## Source and method

The continuous table is a 32×8 array of 256 byte values. The gate used its natural row-major and column-major flattenings, without searching arbitrary cell permutations.

- Berlekamp–Massey over GF(2) was applied to the full 2,048-bit row-major stream in both MSB-first and LSB-first byte order, and separately to each of the eight bit planes.
- Berlekamp–Massey over GF(256) was applied to the 256-byte row-major and column-major sequences under both the Reed–Solomon polynomial 0x11d and the AES polynomial 0x11b.
- Issue #692 added a frozen source-major GF(29) test: fit only the first 128 residues under the conventional base60 parse, then predict the remaining 128; use the repository's fixed f-skipping base59 parse as the wrong-radix control. The 64×64 training system was checked for full rank, and no orientation, phase, or alphabet fitting was allowed.
- Positive controls used a known degree-3 binary recurrence and a known degree-2 GF(256) recurrence; both recovered their planted degrees exactly.

## Result

The table contains 161 distinct byte values, with values spanning 0–255. Its measured linear complexities are:

| Representation | Linear complexity |
|---|---:|
| GF(256), 0x11d, row-major / column-major | 128 / 128 |
| GF(256), 0x11b, row-major / column-major | 128 / 128 |
| 2,048 bits, row-major MSB-first | 1,024 |
| 2,048 bits, row-major LSB-first | 1,024 |
| Eight 256-bit planes | 128–130 |

These are half-length, random-like complexities, not a short recurrence. The known low-degree positive controls return 3 over GF(2) and 2 over GF(256) under both field polynomials, confirming that the implementation detects the simple LFSR structures this test targets.


## GF(29) source-major half/half holdout (Issue #692, 13 November 2026)

The exact original 32×8 token sequence was retained in printed row-major order. The base60 parser is the existing conventional alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`; it exactly reproduces the canonical `byte_rows` and the established 256-byte SHA-256. The fixed alternative base59 parser omits the unused lowercase `f`, as in `sims/base60_base59_source_ambiguity.cjs`. Every printed token is valid under both readings; the resulting byte streams differ at 220/256 positions (base59 range 0–251).

For each interpretation, the 256 bytes were reduced modulo 29. Berlekamp–Massey was fit **only to symbols 0–127**. The recurrence convention is

```text
s[n] + C[1]s[n-1] + ... + C[L]s[n-L] = 0 (mod 29), C[0] = 1
```

The fitted coefficients were frozen and used to predict symbols 128–255. No re-estimation, reversal, column-major order, phase search, or post-hoc alphabet change was performed.

| Fixed byte interpretation | Training complexity | Training equations | 64×64 coefficient-system rank | Exact held-out predictions |
|---|---:|---:|---:|---:|
| Base60 | 64 | 64/64 | 64/64 | **4/128** |
| Base59 (omit `f`) | 64 | 64/64 | 64/64 | **7/128** |

The full-rank 64×64 system means the order-64 recurrence is uniquely determined by the first half; neither result is an ambiguity from underdetermined coefficients. The 4 and 7 held-out matches are close to the (128/29\approx4.41) expectation for unrelated uniform symbols, rather than predictive continuation.

The exact recurrence coefficient arrays (including (C_0=1), in ascending lag order) are:

- Base60: `[1,17,16,16,21,21,0,24,28,27,3,10,20,8,18,9,2,26,20,6,28,27,26,17,24,14,22,2,18,10,3,18,22,2,4,28,24,0,1,11,12,13,27,4,22,15,22,7,14,4,22,5,1,1,4,16,4,5,3,9,17,5,5,5,6]`
- Base59: `[1,26,4,15,7,6,8,27,17,24,24,5,11,21,3,6,11,13,14,2,17,15,27,10,20,12,14,22,20,10,18,10,4,13,7,16,6,13,9,27,27,28,25,18,2,2,11,25,23,7,18,2,4,10,9,25,16,20,13,20,1,10,26,17,16]`

Two independently planted GF(29) LFSRs validate both fitting and prediction: degree 3 and degree 11 are recovered with their exact coefficient arrays and predict **128/128** withheld symbols. The original table's fitted order-64 recurrences do not.

This excludes a direct table-generated GF(29) linear recurrence of order **at most 64** under these two exact source-order radix interpretations. It does not exclude an order above 64 (which cannot be uniquely identified from 128 training symbols), nonlinear state updates, cryptographic PRNGs, or a different table role. The base60 byte interpretation remains conditional, and this is not an LP2 plaintext or key recovery.

## Decision

Reject a **low-degree linear recurrence over these natural table orders** as the explanation or a simple keystream generator. The original GF(29) byte-residue stream also has no order-≤64 recurrence that predicts the held-out half under either fixed base60 or base59 serialization; the unique order-64 fits predict only 4/128 and 7/128 respectively. The earlier GF(256) tests likewise return half-length complexity under both common field polynomials (0x11d and 0x11b), and the binary stream/bit planes remain high-complexity. This does not establish that the table is cryptographically random, nor does it exclude a higher-order or nonlinear keyed transformation, a cryptographic PRNG, or a role as arbitrary lookup material. No plaintext or key is recovered.

## Reproduction

Run from the repository root with Node.js 22. The complete original GF(2)/GF(256)/GF(29) regression is available as the manual workflow choice `p50-gf29-lfsr` in `.github/workflows/grid-256-tests.yml`:

~~~sh
node sims/lp2_p50_table_linear_complexity_sft.cjs
~~~
