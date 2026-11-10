# Original LP2 base-60 grid: direct key structures and historical RSA-block decoding

**Classification:** Three independently executable, source-constrained interpretations of the numeric grid have negative original-input results. Neither original LP2 plaintext, a new private key nor a key schedule was recovered. Agents 9 and 3, 10 November 2026.

## Source data and motivation

The original LP2 numeric grid, spanning physical pages 49–51, forms a **32×8-byte** table when decoded using its transcribed base-60 alphabet. Its size is compatible with a roughly 2,048-bit RSA private prime or a complete 240-byte AES-256 expanded-key schedule plus 16 extra bytes. As a distinct direct-payload possibility, it can also hold several 54-byte RSA-432 ciphertext blocks. All three models are testable without guessing unknown LP2 plaintext. The input is `resources/liber-primus/base60-grid.json`; derived numeric transcription must be distinguished from original scans, but its cell values are used exactly as currently checked in the shared corpus.

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

## Historical 2012/2014 factored RSA moduli as direct table decryptors

**Agent 3, 10 November 2026.** Unlike the authenticated *4096-bit OpenPGP moduli* used in the first test, earlier Cicada challenges exposed two separate, publicly factored **432-bit RSA-sized integers**. Their factors are preserved in the existing source programs for the 2012 P.S. modulus and 2014 factoring-stage modulus. Therefore their associated private modular exponentiation can be calculated exactly and applied to the original 256 grid bytes. A 432-bit RSA ciphertext occupies **54 bytes**; the grid is long enough for four such blocks inside 64-byte envelopes or at other offsets. Previous grid tests did not attempt this direct historical-key payload interpretation.

The [full sliding-window inverse](../sims/base60_historical_rsa432_block_inverse.cjs) keeps the original table fixed (SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**) and enumerates all 203 consecutive 54-byte windows of **printed row-major**, **column-major** and **alternating-row-direction** readings. It reads each window as either big- or little-endian, and applies actual modular private exponentiation using the 2012 or 2014 public factors. Four conventional candidate exponents are checked: 3, 17, 257 and 65537. For these trials each exponent has a multiplicative inverse modulo the historical modulus's totient. These are **candidate exponent choices**, especially for the 2012 P.S.; a modulus alone does not authenticate an exponent.

The inverse requires the ciphertext integer be less than its chosen modulus. It then searches the **entire recovered 54-byte plaintext block** for valid PKCS#1 v1.5 encryption/signature formatting, including at least eight proper padding bytes, or fully validated OAEP-SHA1 with the default empty label and exact MGF1 masking. As a padding-free fallback it checks for a consecutive run of 12 or more readable ASCII letters/spaces, which could reveal an unpadded instruction. This is a direct original-byte decryption test with no English score-based selection of guessed keys.

| Factored modulus | Exponents | Valid 54-byte windows per exponent | Valid PKCS#1 | Valid OAEP-SHA1 | Raw 12-character alphabetic runs | Longest raw alphabetic run |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Cicada 2012 P.S. | 3, 17, 257, 65537 | **1,136** | **0** | **0** | **0** | 7 |
| Cicada 2014 RSA challenge | 3, 17, 257, 65537 | **838** | **0** | **0** | **0** | 8 |

These are **7,896** admissible 54-byte RSA modular decryptions in all. The remaining nominal source windows were excluded because their integer representations equal or exceed the source modulus. No original byte-table reading produces a valid standard RSA block or a recognizable raw-text instruction under this fixed test family.

A synthetic end-to-end positive implants a correctly public-encrypted PKCS#1 v1.5 block with plaintext **CICADA** at byte offset **68**, plus a correctly encrypted OAEP-SHA1 block with plaintext **HELLO** at offset **146**, into a copy of the 256-byte source. The identical complete scanner finds and exactly recovers both bytestrings at their planted original-reading locations using the real historical **2012** RSA factors and exponent 65537. Independent direct arithmetic tests also verify the corresponding modular RSA encrypt-then-decrypt identity. The original bytes are unchanged for the reported negative result.

**Scope:** This excludes literal RSA-432 blocks whose ciphertext bytes occur contiguously in one of the three specified physical readings with one of the specified key/exponent interpretations and plaintext formats. It cannot rule out a different RSA exponent, unusual byte permutation, custom padding, nontext binary payload, additional encryption layer, or a role for these historical factors elsewhere in LP2. It does not explain the independently reported divisibility of the full 2,048-bit printed grid integer by the square of physical page 53's 179-rune length ([factorization study](grid-bigint-factor-page53.md)).

## Reproduce and research conclusion

Three built-in-library-only CommonJS tests for Node.js 22 retain the exact input transformations and synthetic controls:

- [Authentic OpenPGP RSA private-factor test](../sims/grid_rsa_crt_factor.cjs), [completed original-source CI 42781495472](https://github.com/FlareZ123/liber-primus/actions/runs/42781495472)
- [AES expanded-schedule necessary-condition test](../sims/base60_aes_schedule_necessary.cjs), [completed original-source CI 42786189321](https://github.com/FlareZ123/liber-primus/actions/runs/42786189321)
- [Historical factored RSA direct-block inverse](../sims/base60_historical_rsa432_block_inverse.cjs), tested on the exact source bytes with independent RSA PKCS#1 and OAEP positive controls

The first two are already included in the manual-only [grid-rsa-pgp workflow](../.github/workflows/grid-rsa-pgp.yml); the third runs directly as an SFT. A final solution requires an independently specified key/payload reading that recovers authentic unknown LP2 plaintext and re-encrypts the original source. None of the three bounded hypotheses does so.
