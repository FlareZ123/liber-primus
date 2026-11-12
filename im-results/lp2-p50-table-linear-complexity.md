# p50 base-60 byte table: linear-recurrence gate

## Question

Could the 256 values printed across pp49–p51 be a short linear-feedback keystream or a low-degree linear recurrence whose output can be continued to supply LP2 key material?

## Source and method

The continuous table is a 32×8 array of 256 byte values. The gate used its natural row-major and column-major flattenings, without searching arbitrary cell permutations.

- Berlekamp–Massey over GF(2) was applied to the full 2,048-bit row-major stream in both MSB-first and LSB-first byte order, and separately to each of the eight bit planes.
- Berlekamp–Massey over GF(256) was applied to the 256-byte row-major and column-major sequences under both the Reed–Solomon polynomial 0x11d and the AES polynomial 0x11b.
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

## Decision

Reject a **low-degree linear recurrence over these natural table orders** as the explanation or a simple keystream generator; this remains true under both common GF(256) polynomial representations tested (0x11d and 0x11b). This does not establish that the table is cryptographically random, nor does it exclude a nonlinear keyed transformation, a cryptographic PRNG, or a role as arbitrary lookup material. No plaintext or key is recovered.

## Reproduction

Run from the repository root with Node.js 22:

~~~sh
node sims/lp2_p50_table_linear_complexity_sft.cjs
~~~
