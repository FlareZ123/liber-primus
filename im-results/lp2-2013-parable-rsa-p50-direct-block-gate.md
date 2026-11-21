# Historical 2013 PARABLE modulus and 761 exponent: direct p50 RSA block feasibility

**Agent47, 21 November 2026. Status: exact original-byte obstruction for the four direct, contiguous-block interpretations. No unknown plaintext or author-specified RSA instruction.**

## Why this is an author-number-driven candidate

The original Cicada OS `audio/761.mp3` (2013) is named with the **prime-weight sum of its metadata title**. Its metadata independently labels the *Parable* `1,595,277,641`, the exact **product** of the three authentic LP2 p57 clause prime sums **1259×1031×1229**, all prime. Both source-era arithmetic relationships are established in [the separate historical finding](../results/2013-761-parable-prime-products.md).

These *two literal author-associated source numbers* yield a mathematically complete, small but perfectly legal **three-prime RSA key pair** if, conditionally, the author intended RSA:

```
n = 1259 * 1031 * 1229 = 1595277641 = 0x5F160149
e = 761
phi(n) = 1591168720
gcd(e, phi(n)) = 1
d = inverse(761 mod 1591168720) = 190271161
e*d mod phi(n) = 1
```

The 2014 LP2 p50 numerical table prints exactly **256 working base60 bytes** in **32 original rows of eight**. Eight-byte rows allow two contiguous four-byte RSA ciphertext blocks per row, hence **64** blocks from the complete table, with no padding guess. An RSA ciphertext representative of `n` must satisfy **0 <= c < n**. This key-independent necessary condition can decisively test the literal direct receiver before any plaintext scoring.

The manuscript and the original MP3 **do not tell a solver to apply RSA**. This operation is an investigator hypothesis motivated by the unusual pre-published factorization and prime title, not yet a human solve instruction. We test only the four source-natural byte readings, without rescuing a failing codeword by hidden remapping, modulo reduction or skipping bytes.

## Exact original-input obstruction

| Printed traversal | Four-byte endian | Valid ciphertext blocks | Blocks outside RSA modulus |
| --- | --- | ---: | ---: |
| Row-major (source print) | Big | **19/64** | **45/64** |
| Row-major (source print) | Little | **32/64** | **32/64** |
| Column-major | Big | **21/64** | **43/64** |
| Column-major | Little | **26/64** | **38/64** |

Even the most forgiving tested original-byte order yields **32 invalid RSA ciphertext representatives**. For example the first printed four bytes `3N 3p 2l 36` as big-endian have value **3,420,956,602**, greater than `n=1,595,277,641`. Since RSA always emits a residue below `n`, the literal 2014 byte object cannot be 64 contiguous 4-byte RSA ciphertext blocks using this historically sourced modulus, in any of these four fixed source-natural formats. No decryption result exists to score.

A positive control derives 64 valid plaintext representatives directly from the clear p57 original runes by fixed six-rune base29 windows, encrypts with e=761, and checks the full 64/64 round-trip with mathematically derived private d. This confirms the RSA implementation can recover genuine source-native data when its input is actually RSA-encoded.

## Fork and limits

**Retire direct p50 256-byte-as-contiguous-RSA-blocks with `n=1595277641,e=761`**. The earlier 2013 arithmetic is independently established and remains relevant as historical author behavior. This does not rule out a different artifact or a separately instructed RSA ciphertext format. A new author-side block encoding, target, or RSA opcode would need independent first-party evidence; silent modulo-n normalization loses information and cannot repair this exact model.

Reproduce: [standalone Node22 CJS with all original data, exact bounds and 64 native controls](../sims/lp2_2013_parable_rsa_p50_direct_sft.cjs). [Manual Windows run workflow](../.github/workflows/agent47-parable-rsa-manual.yml).
