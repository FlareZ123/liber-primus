# Eight original table columns as historical 256-bit Shamir shares

**Classification:** one new, source-constrained and negative **whole-field SSSS v0.5 original-data gate**. Agent 1, 12 November 2026. It excludes the **literal natural-ID 5-of-8 share interpretation** of the complete pp49–51 byte table. It produces **no authenticated key, unknown LP2 plaintext or destination**.

## Player-visible clues and the precise upstream premise

The actual LP2 printed table occupies physical pp49–51 (archive `66.jpg`–`68.jpg`). It has **32 rows × eight columns** and is conventionally parsed as **256 original radix-60 byte values** in printed row-major order. Its exact byte-stream SHA256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290` ([source array](../resources/liber-primus/lp2-grid-256.json)).

The original **2013 Cicada poster/phone continuation** demonstrably used a **five-of-ten `ssss` v0.5 Shamir scheme**. A 2014 solver aware of that step might recognize the **eight vertical 32-byte columns** as eight complete 256-bit candidate shares of one key. This is a meaningful route to a possible **32-byte original key**, as distinct from guessing a cipher on LP2 ciphertext. The manuscript does not label the eight columns with share IDs, identify the table as Shamir shares, or specify the target use of a recovered key. Those are still hypothetical inputs.

The original [`ssss` v0.5 source](https://github.com/osresearch/ssss/blob/master/ssss.c), in `field_init`, supplies the **exact 256-bit irreducible polynomial**: `x^256 + x^10 + x^5 + x^2 + 1`. It applies polynomial arithmetic over **the whole 32-byte GF(2^256) element**, not independently to each byte. The historical threshold-five output from `horner` is a **monic degree-five** polynomial

\[
Y(x)=x^5+c_4x^4+c_3x^3+c_2x^2+c_1x+c_0
\]

over GF(2^256), and source IDs are one-based decimal values. Actual 2013 shares were shorter 176-bit elements, but `ssss` supports arbitrary byte-multiple field sizes including 256 bits; no imaginary change of its mathematical scheme is needed. [Previously reconstructed authenticated 2013 whole-field usage](lp2-p23-26-ssss201-original-format-gate.md#why-the-exact-historical-protocol-matters).

## Frozen original-input decoder and decisive withheld checks

Take the source **32 bytes from each printed column, top to bottom**, as an unsigned big-endian 256-bit field element. Assign columns left to right to the natural IDs **1 through 8**. Derive the first five adjusted values `Z_i=Y(i) XOR i^5`; interpolate exactly one degree-four field polynomial from them, and predict the complete original columns **6, 7, 8**. This is a 256-bit equality for each withheld column. No manual phases, alternative table code, hash hunting, share permutation, missing columns, XTEA key fitting or secret inspection is permitted.

| Withheld column | Exact 256-bit prediction matches original? | Bits matching out of 256 |
| --- | --- | ---: |
| Share ID 6 | **No** | 125 |
| Share ID 7 | **No** | 132 |
| Share ID 8 | **No** | 135 |

All three are near the unrelated-byte baseline of 128 matches, and none of the **three required full-field equalities** holds. The candidate 256-bit constant from the first five columns is `d54d8a2748e2b2efbc50f95354cb807c9052d96b26d4102a909c60033e17214c`; it is a **fitted value to five inputs**, immediately contradicted by the independent last three shares. It must **not** be treated as a decrypted key or used to generate new LP2 candidates.

A planted source-native **32-byte ASCII secret** and four independently constructed deterministic 256-bit coefficients are encoded through the *exact* monic degree-five protocol at IDs 1–8. The same five-point decoder predicts **all eight** planted shares and reproduces the original c0 exactly. Thus the original failure is a real reproducible constraint rather than an implementation incapacity. The historical XTEA diffusion would apply after reconstructing `c0`; it cannot repair failures of three full-field shares to lie on a single monic quintic.

## Decision and boundaries

The specific **original table as natural left-to-right 01..08 SSSS shares of a 32-byte key** is false. Do not spend compute applying the spurious fitted `c0` to AES, LP2 rune indices or any 2014 file. This original-input consistency test does not exhaust unlabeled historical ID permutations (2013 share IDs can range 01..10), an unknown table transpose or byte serialization, a different threshold, other sharing fields, or a source-independent pad. None of these changes is selected by an original Cicada instruction, and they should not be added to salvage a failed candidate.

The next relevant research decision is **whether an authenticated, contemporaneous LP2 source actually labels the eight columns as `ssss` shares and specifies their IDs**. Until then, this link is a bounded negative, with no evidence of a hidden AES-256 key. The exact original-input single-file implementation is [`sims/lp2_p50_ssss256_eight_column_sft.cjs`](../sims/lp2_p50_ssss256_eight_column_sft.cjs), Node.js22 and built-ins only.
