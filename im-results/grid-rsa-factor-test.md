# Direct cryptographic-key interpretations of the LP2 256-byte base-60 table

**Classification:** Two source-constrained, fully tested direct key-recovery hypotheses are excluded. Neither original LP2 plaintext, a private key nor a key schedule was recovered. Agent 9, 10 November 2026.

## Source data and motivation

The original LP2 numeric grid, spanning physical pages 49–51, forms a **32×8-byte** table when decoded using its transcribed base-60 alphabet. This is enough material to represent either one roughly 2048-bit RSA private prime factor or a complete, 240-byte AES-256 expanded round-key schedule with a 16-byte header/trailer. Both interpretations would provide immediate, independently checkable cryptographic key material without guessing manuscript plaintext. The input is `resources/liber-primus/base60-grid.json`; derived numeric transcription must be distinguished from original scans, but its cell values are used exactly as currently checked in the shared corpus.

## Authentic Cicada RSA private-factor test

Cicada 3301's signed public OpenPGP key contains **two 4096-bit RSA moduli** with exponent 65537, while a balanced 4096-bit private key has two approximately **2048-bit, 256-byte prime factors**. For any candidate factor `p` in the numeric grid, exact `gcd(p,N)` with the known public modulus `N` reveals the factor if it is genuine.

Using `resources/control/cicada-3301-public-key.asc`, test the **row-major and column-major** 256-byte source readings, each under full forward, full reverse, and bytewise-complemented order, against *both* authentic RSA moduli. The **twelve** resulting exact BigInt GCD values are all **1**. All 12 candidate factors do not divide either modulus. The authentic PGP fingerprint is `6D854CD7933322A601C3286D181F01E57A35090F`, both original moduli are 4096-bit, and both public exponents are 65537. A deliberately constructed positive factor control proves the exact arithmetic and distinguishes failure to factor from an implementation defect.

This test only excludes those literal private-prime readings, not an encrypted factor, partial private-prime disclosure or an unknown different public key.

## Standard AES expanded-key necessary-condition test

Under the [official NIST AES standard FIPS 197](https://csrc.nist.gov/pubs/fips/197/final), AES-128, AES-192 and AES-256 expanded encryption key schedules contain respectively **176, 208 and 240 bytes**. The 256-byte source can therefore contain any complete AES round-key schedule beginning within its first 81, 49 or 17 byte positions respectively. An expanded AES schedule is not an arbitrary high-entropy byte string: for any **linear** step in its word recurrence, a new four-byte word must satisfy

```text
W[i] = W[i-1] XOR W[i-Nk]
Nk = 4 for AES-128; Nk = 6 for AES-192; Nk = 8 for AES-256.
Skip i divisible by Nk and AES-256 i mod 8 = 4,
because these particular words also require the AES SubWord/Rcon logic.
```

The equality is a *necessary condition*, regardless of the S-box or the unknown original master key. A complete schedule has respectively **30, 38, or 39** such word equalities. `sims/base60_aes_schedule_necessary.cjs` exhaustively checks all source-aligned byte starts under four table readings: row-major, reverse-row-major, column-major and reverse-column-major, at all three AES key sizes. That covers **588** complete candidate schedule placements and **19,820** exact four-byte recurrence checks.

**Result: zero of the 19,820 linear word recurrences matched**, with zero complete schedules. Thus none of the four source byte orientations/starting positions directly contains a standard AES-128/192/256 expanded key schedule. An independently published NIST FIPS 197 Appendix A AES-128 round-key example validates all three of its applicable successive linear recurrences, and an intentional one-byte corruption fails that control. No AES S-box implementation or plaintext-language scorer was needed.

This result excludes only fully expanded standard AES keys stored literally, byte-for-byte, in one of the four source orientations. It does not exclude a **master key**, encrypted schedule, an unknown byte shuffle, another keyed cipher, an incomplete schedule or a key derived using the source grid.

## Reproduce and research conclusion

Both executable tests are built-in-library-only CommonJS for Node.js 22:

- [Direct OpenPGP RSA factor test](../sims/grid_rsa_crt_factor.cjs), verified in [CI 42781495472](https://github.com/FlareZ123/liber-primus/actions/runs/42781495472)
- [Direct AES-128/192/256 expanded-key test](../sims/base60_aes_schedule_necessary.cjs), verified together with the RSA tests in [CI 42786189321](https://github.com/FlareZ123/liber-primus/actions/runs/42786189321)

Both share the already present [.github/workflows/grid-rsa-pgp.yml](../.github/workflows/grid-rsa-pgp.yml) manual workflow. The original source keys, exact exhaustive branches, checks and positive controls are preserved for independent reruns.

**Implication:** the source grid has exact lengths associated with important cryptographic secret material, yet neither a direct RSA private factor nor any literal standard AES expanded key appears in the tested source readings. These bounded exclusions do not establish the actual grid's role. A productive next candidate must specify its independently justified key derivation and recover previously unknown LP2 plaintext with an exact forward ciphertext reproduction. 
