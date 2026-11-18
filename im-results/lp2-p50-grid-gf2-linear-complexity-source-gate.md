# LP2 p50 256-value table: binary linear-generation and AES expanded-key gates

**Status, 18 November 2026: two finite original-source negatives, no plaintext or recovered key.** The unchanged 32×8 table's 256 printed base60 tokens decode under the repository's documented, still-conditional radix60 reading into **256 distinct positions whose values all lie in the byte range 0–255** (161 different values; two zeros). This invites searching for an exact byte-typed operation before brute-forcing any secret keys. The printed geometry independently suggests the two natural row-major/column-major traversals. Neither an LFSR nor AES is specified by the manuscript, so these are finite candidate checks, **not** claims of intended cryptography.

Original input: [\`resources/liber-primus/lp2-grid-256.json\`](../resources/liber-primus/lp2-grid-256.json), including verified original-image corrections of eleven disputed glyph cells. Exact read-only [CommonJS SFT](../sims/lp2_p50_grid_gf2_linear_complexity_sft.cjs).

## Original-input decision A: direct GF(2) linear generator

Under each literal-byte sequence, Berlekamp–Massey computes the exact minimal binary linear recurrence needed for *consecutive, unmasked* bits:

| Literal readout | Observations | Minimum GF(2) linear recurrence order |
|---|---:|---:|
| Printed row-major, most-significant bit first | 2,048 | **1,024** |
| Printed row-major, least-significant bit first | 2,048 | **1,024** |
| Column-major, most-significant bit first | 2,048 | **1,022** |
| Column-major, least-significant bit first | 2,048 | **1,025** |
| Byte order as printed, eight separate fixed bit positions LSB→MSB | 256 per plane | **128, 130, 129, 128, 128, 128, 128, 128** |

A direct bit-per-clock GF(2)-linear stream in these serializations cannot have a shorter state than the listed degree. Independently, for byte-per-clock linear machines exposing eight fixed linear output projections, the original per-bit planes require state dimension at least **130**. Direct, unscrambled xorshift32 and xorshift64 output bytes fail under the printed order. Nonlinear output functions, interspersed/whitened bits, different traversal rules, a longer linear generator or a cryptographic PRNG remain possible. A 2,048-bit planted 32-register GF(2) recurrence seeded at 0x3301 is correctly identified with complexity **30**; its eight 256-sample bit planes have degree ≤32.

## Original-input decision B: complete NIST AES expanded-round-key schedule

[NIST FIPS 197 (2023)](https://csrc.nist.gov/pubs/fips/197/final) specifies expanded key schedules of **176, 208, and 240 bytes** for AES-128, AES-192 and AES-256. The full 256-byte original table could in principle supply one expanded schedule plus spare bytes (notably AES-256's 240+16), and the 32×8 layout suggests a 32-byte key scale. This is a new *typed receiver possibility*, rather than an authored AES clue.

For any AES schedule, word 32-bit indices \(i\) at which neither a rotation/S-box nor AES-256's extra S-box is applied satisfy the **key-independent** equality

\[
w_i = w_{i-N_k} \oplus w_{i-1},
\quad N_k \in \{4,6,8\}.
\]

The direct original-source test scans **every contiguous window** of the required schedule length in each of four natural byte sequences: printed rows, their reverse, columns, and their reverse. Per byte order, that is 81 AES-128, 49 AES-192 and 17 AES-256 candidates, **588 windows across all four orders**. The required unchanged-word equalities number respectively **30/38/39**. On the literal source, the **maximum satisfied by any candidate is zero** in every family and order. The best full AES schedule score is therefore 0/30, 0/38 or 0/39. The S-box is not needed to reject candidates: the xor-only equality is a necessary condition for every possible secret key. As a true positive, a complete original-code AES-256 expansion with the published FIPS A.3 32-byte key yields the expected first derived 16 bytes \`9ba354118e6925afa51a8b5f2067fcde\` and passes **39/39** required ordinary-word equalities.

Thus the literal original 256 bytes contain **no complete contiguous AES-128/192/256 expanded key schedule** in these orders. This does not reject a mere AES key, 16-byte IV, encrypted/obfuscated schedule, noncontiguous indices, a nonlinear KDF, or another role for the table.

## Research decision

These tests close two concrete untyped generator/key-schedule avenues without a secret-key hunt. Neither yields an authenticated original-cipher inverse, a new LP2 plaintext rune, or the final Cicada address. Do not extrapolate 12,956 unknown rune keys by guessing a 32/64-bit raw linear state from the printed table, and do not treat its 240 bytes as a complete ordinary AES schedule. A new table attack needs a historically motivated byte order, typed receiver, plaintext/key provenance, and an independently held-out original-cipher prediction.

The SFT fixes the original 256-byte prefix, all eight bit planes, both traversals/bit orders, every contiguous AES key-schedule window under the four orientations, and exact planted positives. These are algebraic source-input exclusions, not ciphertext decryptions.
