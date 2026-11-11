# Cicada PGP RSA tests of the 256-byte base-60 grid

**Classification:** three exact bounded negatives on distinct cryptographic interpretations; no LP2 plaintext or private key recovered. The direct signature-style, direct 2048-bit factor, and direct private-exponent readings tested here are all rejected.

## Source and signature-style hypothesis

The 32×8 base-60 grid spanning LP2 pages 49–51 supplies exactly 256 bytes. A previous independent investigation, Dukotah's analysis/round16/zeroFP/zerofp_tests.py (E-01), proposed checking the grid against Cicada's authentic OpenPGP RSA public key but left that check unperformed because the 4096-bit moduli were not loaded. Its prose incorrectly suggested that applying exponent 65537 to a 2048-bit input under a 4096-bit modulus would leave the input unchanged. Modular exponentiation does apply; that omission is now closed.

The narrow signature-style construction treats the 256 bytes as an unsigned integer s and computes m=s^65537 mod n using Cicada's published signing RSA modulus or encryption-subkey RSA modulus, then checks for PKCS#1 v1.5 DigestInfo or the RSA-PSS BC trailer. Tested directions are original or reversed bytes, in low or high half of a 512-byte input. High-half readings exceeding n are invalid and explicitly skipped.

The source public key is the Cicada 3301 PGP public key with independently published fingerprint **6D854CD7933322A601C3286D181F01E57A35090F**. The parser verifies this SHA-1 OpenPGP v4 fingerprint and identifies two 4096-bit RSA moduli, each with exponent 65537.

Eight input/key-direction/alignment combinations exist, of which two (high-half forward in either modulus) exceed the modulus. All six valid exponentiations fail the PKCS#1 v1.5 signature prefix and DigestInfo check. All six also fail the RSA-PSS BC final-byte requirement and the leading-zero condition associated with OAEP-style encoded messages. Initial 16-byte exponentiation results:

| Key | Direction | Half | First 16 output bytes |
| --- | --- | --- | --- |
| primary | forward | low | 38f13391b19e450a017f901a10c80937 |
| primary | reversed | low | 5178322ade8101b5a8e78f52d87bd10b |
| primary | reversed | high | 9cfea28c6cb23fcbb17e2e40a8f22375 |
| subkey | forward | low | 311f728a92cf99c07fcf84504e5603ae |
| subkey | reversed | low | 0690b52fa0d8153d38d448d5e6b79983 |
| subkey | reversed | high | 82087862f2da616feb87de3f102755b9 |

## Direct 2048-bit RSA-factor interpretation

A separate, source-size-motivated possibility is that the 256-byte grid is one of the two approximately 2048-bit prime factors of Cicada's 4096-bit public modulus. This is distinct from interpreting the grid as an RSA signature. Only four natural byte traversals are admitted: row-major, reversed row-major, column-major, and reversed column-major. No arbitrary permutation or fitted transform is allowed.

The current control key contains two 4096-bit RSA moduli. The historical 2012 public-key armor in resources/historical/cicada-3301-2012-public-key.asc is byte-identical to resources/control/cicada-3301-public-key.asc, so it supplies no additional distinct modulus. For each of the four traversals, compute the unsigned 256-byte integer and its exact GCD with each of the two moduli.

| Traversal | Candidate bits | Parity | GCD with either modulus |
| --- | ---: | --- | ---: |
| row-major | 2048 | even | 1 |
| reversed row-major | 2047 | odd | 1 |
| column-major | 2048 | even | 1 |
| reversed column-major | 2047 | odd | 1 |

All eight unique comparisons give GCD 1; none divides either modulus. The forward row- and column-major candidates are even and therefore cannot themselves be RSA prime factors of an odd modulus. The reversed candidates are odd but share no factor with either modulus. A synthetic positive GCD control passes.

**Decision:** the direct table-as-RSA-factor interpretation is excluded under these four natural traversals. This does not exclude a transformed table, a different key, or another role for the 256 bytes. It is not a reason to launch arbitrary byte permutations.

## Direct RSA private-exponent interpretation

The same four natural traversals were also tested as candidate private exponent d for each of the two 4096-bit public moduli. For each candidate, test the RSA round trip m → m^d mod n → (m^d)^e mod n for five small coprime bases (2, 3, 5, 17, 257). All 40 candidate/modulus/base checks fail. A synthetic 3233 = 61×53, e = 17, d = 2753 positive control passes the same round-trip test.

This excludes the direct grid-as-d interpretation under the four natural traversals. It does not test CRT exponents, another recipient key, or a transformed table.

## Scope and reproducibility

- Signature-style test: node sims/grid_rsa_pgp_signature.cjs.
- Direct factor and private-exponent tests: node sims/grid_rsa_factor_gcd.cjs.
- Inputs: resources/liber-primus/base60-grid.json and resources/control/cicada-3301-public-key.asc. The base60-grid bytes match the 256-byte canonical table in resources/liber-primus/lp2-grid-256.json.
- The direct-key script reuses the exact OpenPGP parser and key fingerprint check from the signature SFT, verifies both 4096-bit moduli and exponent 65537, asserts all eight GCDs are 1, and asserts all 40 private-exponent round trips fail.

The table might still be ciphertext encrypted to an RSA public key, a KDF input, a partially transcribed cipher block, a modular transform, a nonlinear byte mapping, a split-field encoding or another recipient key. Those are different hypotheses and are not tested here. This report does not supersede established results in results/README.md.